// api/claude-chat.js - Chat endpoint for Claude conversations
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if API key is configured in environment
  const apiKey = process.env.CLAUDE_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'Claude API key not configured',
      message: 'Please set CLAUDE_API_KEY in Vercel environment variables'
    });
  }

  try {
    const { message, context, language, conversationHistory } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    // Build system prompt
    const systemPrompt = `Sei un esperto data scientist che sta analizzando i dati di un esperimento sulla percezione del contenuto di zucchero in frutta e verdura. 

CONTESTO DATI:
- Totale partecipanti validi: ${context.totalParticipants} (i dati di giovedì sono stati esclusi perché erano test)
- Distribuzione demografica: ${JSON.stringify(context.demographics, null, 2)}
- Pattern rilevati: ${JSON.stringify(context.patterns, null, 2)}
- Insights già generati: ${JSON.stringify(context.currentInsights?.curiosities?.slice(0, 3), null, 2)}

Rispondi alle domande dell'utente basandoti su questi dati. Sii specifico e usa percentuali precise. Se l'utente chiede ulteriori analisi o correlazioni, cerca pattern interessanti e non ovvi nei dati.

IMPORTANTE:
- I dati di giovedì sono stati esclusi dall'analisi perché erano solo test
- Rispondi in ${language === 'it' ? 'italiano' : 'inglese'}
- Sii conciso ma informativo
- Se trovi pattern curiosi, evidenziali
- Usa emoji per rendere la risposta più friendly`;

    // Build messages array with conversation history (no system role in messages)
    const messages = [];

    // Add conversation history if available
    if (conversationHistory && conversationHistory.length > 0) {
      conversationHistory.forEach(msg => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Add current message
    messages.push({ role: "user", content: message });

    // Call Claude API with system as a separate parameter
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1000,
        system: systemPrompt,  // System prompt as a separate parameter
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: { message: errorText } };
      }
      console.error('Claude API error details:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        requestBody: { model: "claude-3-5-sonnet-20240620", messageCount: messages.length }
      });
      throw new Error(errorData.error?.message || `Claude API call failed with status ${response.status}`);
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      response: data.content[0].text
    });
    
  } catch (error) {
    console.error('Claude Chat Error:', error);
    return res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message
    });
  }
}