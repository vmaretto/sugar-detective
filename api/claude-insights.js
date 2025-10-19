// api/claude-insights.js - Server-side Claude API integration
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
    const { aggregatedData, language } = req.body;
    
    if (!aggregatedData) {
      return res.status(400).json({ error: 'Missing aggregated data' });
    }

    // Call Claude API with server-side key - Using correct model name
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022", // Fixed model name
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: `Sei un data scientist esperto in psicologia comportamentale e nutrizione. Analizza questi dati di ${aggregatedData.totalParticipants} partecipanti a un esperimento sulla percezione del contenuto di zucchero in frutta e verdura.

DATI AGGREGATI:
${JSON.stringify(aggregatedData, null, 2)}

OBIETTIVO: Trova correlazioni MOLTO CURIOSE, LATERALI e NON OVVIE. Pensa fuori dagli schemi! Cerca pattern nascosti che nessuno si aspetterebbe.

Esempi del tipo di insights che voglio (ma trova altri ancora più curiosi):
- Correlazioni tra orario di partecipazione e precisione
- Pattern legati a combinazioni inaspettate (es. età + professione)
- Paradossi comportamentali (es. chi sa meno è più preciso)
- Effetti psicologici nascosti (es. effetto Dunning-Kruger)
- Correlazioni con giorni della settimana o momenti della giornata
- Pattern legati a bias cognitivi
- Differenze controintuitive tra gruppi

IMPORTANTE: Devi rispondere SOLO con un JSON valido, senza backtick o altro testo. Il JSON deve avere questa struttura esatta:

{
  "curiosities": [
    {
      "title": "titolo breve e accattivante (max 5 parole)",
      "insight": "spiegazione dettagliata della scoperta con numeri e percentuali specifiche",
      "emoji": "emoji appropriata",
      "type": "paradox|behavioral|psychological|temporal|demographic|correlation",
      "strength": numero da 1 a 5,
      "evidence": "dati specifici che supportano questo insight"
    }
  ],
  "mainTrend": {
    "title": "il pattern più sorprendente trovato",
    "description": "spiegazione dettagliata con percentuali",
    "significance": "perché questo è importante o interessante"
  },
  "funFact": {
    "fact": "il fatto più divertente o controintuitivo trovato",
    "emoji": "emoji",
    "explanation": "breve spiegazione del perché è sorprendente"
  },
  "methodology": "breve nota su come hai analizzato i dati"
}

Trova almeno 8 curiosità molto originali. Usa percentuali precise, non arrotondate. 
Sii specifico e quantitativo. Non essere generico.
RISPONDI SOLO CON IL JSON, NIENT'ALTRO.`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', errorData);
      throw new Error(errorData.error?.message || 'Claude API call failed');
    }

    const data = await response.json();
    
    // Parse Claude's response
    let claudeInsights;
    try {
      let responseText = data.content[0].text;
      // Remove any markdown code blocks if present
      responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      claudeInsights = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Error parsing Claude response:', parseError);
      throw new Error('Failed to parse Claude response');
    }
    
    // Add metadata
    claudeInsights.generatedAt = new Date().toISOString();
    claudeInsights.participantCount = aggregatedData.totalParticipants;
    
    return res.status(200).json({
      success: true,
      insights: claudeInsights
    });
    
  } catch (error) {
    console.error('Claude API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate insights',
      message: error.message
    });
  }
}