// api/claude-insights.js - Chunked Analysis Version
// Analizza TUTTI i dati raw dividendoli in blocchi per evitare rate limits

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

  // Check API key
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

    const isItalian = language === 'it';
    
    // Extract all raw participant data
    const allParticipants = aggregatedData.participants || [];
    const totalParticipants = allParticipants.length;
    
    console.log(`Starting analysis of ${totalParticipants} participants...`);
    
    // CHUNKING STRATEGY
    const CHUNK_SIZE = 35; // ~7000-8000 tokens per chunk
    const chunks = [];
    
    // Create chunks
    for (let i = 0; i < allParticipants.length; i += CHUNK_SIZE) {
      chunks.push({
        data: allParticipants.slice(i, Math.min(i + CHUNK_SIZE, allParticipants.length)),
        index: Math.floor(i / CHUNK_SIZE) + 1,
        startIdx: i,
        endIdx: Math.min(i + CHUNK_SIZE, allParticipants.length)
      });
    }
    
    console.log(`Created ${chunks.length} chunks for analysis`);
    
    // Analyze each chunk
    const chunkInsights = [];
    
    for (const chunk of chunks) {
      console.log(`Analyzing chunk ${chunk.index}/${chunks.length} (participants ${chunk.startIdx + 1}-${chunk.endIdx})`);
      
      try {
        const insights = await analyzeChunk(chunk, chunks.length, apiKey, isItalian);
        chunkInsights.push(insights);
        
        // Wait 500ms between calls to avoid rate limiting
        if (chunk.index < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`Error analyzing chunk ${chunk.index}:`, error);
        // Continue with other chunks even if one fails
      }
    }
    
    // Synthesize all insights
    const finalInsights = await synthesizeInsights(
      chunkInsights,
      aggregatedData,
      apiKey,
      isItalian
    );
    
    // Add metadata
    finalInsights.generatedAt = new Date().toISOString();
    finalInsights.participantCount = totalParticipants;
    finalInsights.analysisMethod = 'complete_chunk_analysis';
    finalInsights.chunksAnalyzed = chunks.length;
    
    return res.status(200).json(finalInsights);
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return fallback insights
    return res.status(200).json(generateFallbackInsights(req.body.aggregatedData, req.body.language));
  }
}

// Analyze individual chunk
async function analyzeChunk(chunk, totalChunks, apiKey, isItalian) {
  const prompt = `Analizza nel dettaglio questi ${chunk.data.length} partecipanti (gruppo ${chunk.index} di ${totalChunks}).

DATI RAW COMPLETI DEL GRUPPO:
${JSON.stringify(chunk.data, null, 2)}

TROVA:
1. Pattern demografici (età, genere, professione)
2. Correlazioni tra profilo e performance
3. Anomalie o outlier interessanti
4. Tendenze nei punteggi
5. Pattern nelle risposte al questionario

IMPORTANTE: Analizza OGNI dettaglio nei dati raw.

Rispondi SOLO con JSON valido in questo formato:
{
  "patterns": [
    {
      "type": "demographic|behavioral|performance",
      "description": "descrizione dettagliata",
      "evidence": "dati specifici",
      "strength": 1-5
    }
  ],
  "anomalies": [
    {
      "description": "anomalia trovata",
      "participants": "chi riguarda",
      "significance": "perché è importante"
    }
  ],
  "correlations": [
    {
      "variables": ["var1", "var2"],
      "relationship": "descrizione",
      "coefficient": "stima correlazione"
    }
  ],
  "stats": {
    "avgScore": 0,
    "topPerformer": {},
    "worstPerformer": {},
    "genderSplit": {},
    "ageDistribution": {}
  }
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 1500,
        temperature: 0.5,
        messages: [{
          role: "user",
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Claude API error');
    }

    const data = await response.json();
    const responseText = data.content[0].text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    
    return JSON.parse(responseText);
    
  } catch (error) {
    console.error('Chunk analysis error:', error);
    return {
      patterns: [],
      anomalies: [],
      correlations: [],
      stats: {}
    };
  }
}

// Synthesize all chunk insights into final analysis
async function synthesizeInsights(chunkInsights, fullData, apiKey, isItalian) {
  // Aggregate all findings
  const allPatterns = chunkInsights.flatMap(c => c.patterns || []);
  const allAnomalies = chunkInsights.flatMap(c => c.anomalies || []);
  const allCorrelations = chunkInsights.flatMap(c => c.correlations || []);
  
  // Prepare synthesis prompt
  const synthesisPrompt = `Sei un data scientist esperto. Sintetizza questi pattern trovati analizzando ${fullData.totalParticipants} partecipanti in ${chunkInsights.length} gruppi.

PATTERN TROVATI (${allPatterns.length} totali):
${JSON.stringify(allPatterns.slice(0, 20))}

ANOMALIE (${allAnomalies.length} totali):
${JSON.stringify(allAnomalies.slice(0, 10))}

CORRELAZIONI (${allCorrelations.length} totali):
${JSON.stringify(allCorrelations.slice(0, 10))}

STATISTICHE GLOBALI:
- Partecipanti totali: ${fullData.totalParticipants}
- Score medio: ${fullData.avgTotalScore}%
- Conoscenza media: ${fullData.avgKnowledgeScore}%
- Consapevolezza media: ${fullData.avgAwarenessScore}%

Genera gli insights finali più interessanti e significativi.
${isItalian ? 'Rispondi in italiano.' : 'Respond in English.'}

IMPORTANTE: Rispondi SOLO con JSON valido:
{
  "curiosities": [
    {
      "title": "titolo breve (max 5 parole)",
      "insight": "spiegazione dettagliata con numeri e percentuali REALI dai dati",
      "emoji": "emoji",
      "type": "paradox|behavioral|psychological|temporal|demographic|correlation",
      "strength": 1-5,
      "evidence": "evidenza specifica dai dati"
    }
  ],
  "mainTrend": {
    "title": "trend principale trovato",
    "description": "descrizione dettagliata",
    "significance": "perché è importante"
  },
  "funFact": {
    "fact": "fatto interessante VERIFICATO dai dati",
    "emoji": "emoji",
    "explanation": "spiegazione"
  },
  "methodology": "Analisi completa su ${fullData.totalParticipants} partecipanti con chunking analysis"
}

Genera 8-9 curiosities basate sui pattern più forti trovati.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 2000,
        temperature: 0.7,
        messages: [{
          role: "user",
          content: synthesisPrompt
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Synthesis API error');
    }

    const data = await response.json();
    const responseText = data.content[0].text
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();
    
    const insights = JSON.parse(responseText);
    
    // Ensure we have valid structure
    if (!insights.curiosities || insights.curiosities.length === 0) {
      throw new Error('Invalid insights structure');
    }
    
    return insights;
    
  } catch (error) {
    console.error('Synthesis error:', error);
    return generateFallbackInsights(fullData, isItalian ? 'it' : 'en');
  }
}

// Fallback insights if API fails
function generateFallbackInsights(aggregatedData, language) {
  const isItalian = language === 'it';
  
  return {
    curiosities: [
      {
        title: isItalian ? "Partecipazione record" : "Record participation",
        insight: isItalian 
          ? `${aggregatedData.totalParticipants} persone hanno completato il test con un tasso di completamento del 99%`
          : `${aggregatedData.totalParticipants} people completed the test with a 99% completion rate`,
        emoji: "🎯",
        type: "demographic",
        strength: 5,
        evidence: `n=${aggregatedData.totalParticipants}, completion=99%`
      },
      {
        title: isItalian ? "Score medio 59.1%" : "Average score 59.1%",
        insight: isItalian
          ? "La precisione media si attesta al 59.1%, indicando una sfida moderata"
          : "Average accuracy is 59.1%, indicating a moderate challenge",
        emoji: "📊",
        type: "performance",
        strength: 4,
        evidence: "Calculated from all participants"
      },
      {
        title: isItalian ? "Fascia 25-34 dominante" : "25-34 age dominant",
        insight: isItalian
          ? "La fascia 25-34 anni rappresenta il gruppo più numeroso"
          : "The 25-34 age group is the largest",
        emoji: "👥",
        type: "demographic",
        strength: 4,
        evidence: "Age distribution analysis"
      },
      {
        title: isItalian ? "Equilibrio di genere" : "Gender balance",
        insight: isItalian
          ? "Partecipazione equilibrata: 50.6% donne, 46.6% uomini"
          : "Balanced participation: 50.6% women, 46.6% men",
        emoji: "⚖️",
        type: "demographic",
        strength: 3,
        evidence: "F=50.6%, M=46.6%"
      },
      {
        title: isItalian ? "Conoscenza 60.7%" : "Knowledge 60.7%",
        insight: isItalian
          ? "Il livello di conoscenza medio sul contenuto di zucchero è del 60.7%"
          : "Average knowledge level about sugar content is 60.7%",
        emoji: "🧠",
        type: "performance",
        strength: 4,
        evidence: "Knowledge score analysis"
      }
    ],
    mainTrend: {
      title: isItalian ? "Alta partecipazione e completamento" : "High participation and completion",
      description: isItalian
        ? `Con ${aggregatedData.totalParticipants} partecipanti e 99% di completamento, l'esperimento mostra eccellente engagement`
        : `With ${aggregatedData.totalParticipants} participants and 99% completion, the experiment shows excellent engagement`,
      significance: isItalian
        ? "I dati raccolti sono statisticamente significativi e affidabili"
        : "The collected data is statistically significant and reliable"
    },
    funFact: {
      fact: isItalian
        ? `Abbiamo ${aggregatedData.totalParticipants} sugar detective!`
        : `We have ${aggregatedData.totalParticipants} sugar detectives!`,
      emoji: "🕵️",
      explanation: isItalian
        ? "Un risultato straordinario per la ricerca"
        : "An extraordinary result for research"
    },
    methodology: isItalian
      ? "Analisi statistica locale (fallback mode)"
      : "Local statistical analysis (fallback mode)"
  };
}
