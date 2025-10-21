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

IMPORTANTE - REGOLE CRITICHE:
1. ANALIZZA SOLO I DATI FORNITI - Non inventare dati che non esistono
2. Se non ci sono partecipanti in un determinato orario/giorno, NON dire che ci sono
3. Verifica sempre che i pattern che identifichi siano supportati dai dati reali
4. Se un dato è zero o mancante, non inventare statistiche su quel gruppo
5. Per il "funFact", usa SOLO informazioni verificabili dai dati

OBIETTIVO: Trova correlazioni REALI e VERIFICABILI nei dati. Cerca pattern che esistono davvero, non inventarli.

Esempi di insights validi (se supportati dai dati):
- Differenze reali tra gruppi demografici
- Pattern temporali effettivamente presenti
- Correlazioni tra variabili misurate
- Paradossi comportamentali osservati

NON creare insights su:
- Orari o giorni senza partecipanti
- Gruppi demografici non rappresentati
- Correlazioni non supportate dai dati
- Fatti non verificabili

IMPORTANTE: Devi rispondere SOLO con un JSON valido, senza backtick o altro testo. Il JSON deve avere questa struttura esatta:

{
  "curiosities": [
    {
      "title": "titolo breve e accattivante (max 5 parole)",
      "insight": "spiegazione dettagliata BASATA SUI DATI REALI con numeri e percentuali specifiche",
      "emoji": "emoji appropriata",
      "type": "paradox|behavioral|psychological|temporal|demographic|correlation",
      "strength": numero da 1 a 5,
      "evidence": "dati specifici che supportano questo insight"
    }
  ],
  "mainTrend": {
    "title": "il pattern più significativo REALMENTE trovato",
    "description": "spiegazione dettagliata con percentuali VERE",
    "significance": "perché questo è importante"
  },
  "funFact": {
    "fact": "fatto VERIFICABILE e PRESENTE NEI DATI",
    "emoji": "emoji",
    "explanation": "spiegazione basata sui dati reali"
  },
  "methodology": "breve nota su come hai analizzato i dati"
}

Trova almeno 8 curiosità REALI. Usa percentuali precise dai dati forniti.
Se non hai abbastanza dati per 9 insights, creane meno ma TUTTI VERI.
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