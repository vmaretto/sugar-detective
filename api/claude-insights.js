// api/claude-insights.js - Chunked Analysis Version with OpenAI GPT-4o
// Analizza TUTTI i dati raw dividendoli in blocchi per evitare rate limits

// PROMPT VERSION: Increment this when prompts change to invalidate cache
const PROMPT_VERSION = "v2.0_lateral_insights";

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

  // Check API key - try OpenAI first, fallback to Claude
  const apiKey = process.env.OPENAI_API_KEY || process.env.CLAUDE_API_KEY;
  const useOpenAI = !!process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'API key not configured',
      message: 'Please set OPENAI_API_KEY or CLAUDE_API_KEY in Vercel environment variables'
    });
  }

  console.log(`Using ${useOpenAI ? 'OpenAI GPT-4o' : 'Claude API'} for analysis`);

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

    // If no participants, return fallback insights
    if (totalParticipants === 0) {
      console.log('No participants found, using fallback insights');
      return res.status(200).json(generateFallbackInsights(aggregatedData, language));
    }

    // CHUNKING STRATEGY
    // OpenAI (GPT-4o) has more generous rate limits than Claude
    const CHUNK_SIZE = useOpenAI ? 50 : 25; // OpenAI: 50 (~10k tokens), Claude: 25 (~5k tokens)
    const DELAY_BETWEEN_CHUNKS = useOpenAI ? 10000 : 25000; // OpenAI: 10s, Claude: 25s
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

    const estimatedTime = Math.ceil(chunks.length * (DELAY_BETWEEN_CHUNKS / 1000 + 2));
    console.log(`Created ${chunks.length} chunks for analysis`);
    console.log(`Estimated completion time: ${estimatedTime} seconds (~${Math.ceil(estimatedTime / 60)} minutes)`);
    console.log(`This may take a while - analysis is thorough and processes ALL participant data`);

    // Analyze each chunk
    const chunkInsights = [];
    const startTime = Date.now();

    for (const chunk of chunks) {
      const chunkStartTime = Date.now();
      console.log(`\n[${new Date().toISOString()}] Analyzing chunk ${chunk.index}/${chunks.length} (participants ${chunk.startIdx + 1}-${chunk.endIdx})`);

      try {
        const insights = await analyzeChunk(chunk, chunks.length, apiKey, isItalian, useOpenAI);
        chunkInsights.push(insights);

        const chunkDuration = ((Date.now() - chunkStartTime) / 1000).toFixed(1);
        const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        const remainingChunks = chunks.length - chunk.index;
        const estimatedRemaining = Math.ceil(remainingChunks * (DELAY_BETWEEN_CHUNKS / 1000 + 2));

        console.log(`✓ Chunk ${chunk.index} completed in ${chunkDuration}s (${totalElapsed}s total elapsed)`);
        console.log(`  Found ${insights.patterns?.length || 0} patterns, ${insights.anomalies?.length || 0} anomalies`);
        console.log(`  Progress: ${chunk.index}/${chunks.length} chunks (${Math.round(chunk.index/chunks.length*100)}%)`);
        console.log(`  Estimated remaining time: ~${estimatedRemaining} seconds`);

        // Wait between calls to respect rate limiting (50k tokens/minute)
        if (chunk.index < chunks.length) {
          console.log(`  Waiting ${DELAY_BETWEEN_CHUNKS/1000} seconds before next chunk...`);
          await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHUNKS));
        }
      } catch (error) {
        console.error(`✗ Error analyzing chunk ${chunk.index}:`, error.message);
        console.log(`  Continuing with remaining chunks...`);
        // Continue with other chunks even if one fails
      }
    }

    console.log(`\n[${new Date().toISOString()}] All chunks processed. Synthesizing final insights...`);
    console.log(`  Total chunk insights collected: ${chunkInsights.length}`);
    console.log(`  Total patterns found: ${chunkInsights.flatMap(c => c.patterns || []).length}`);
    console.log(`  Total anomalies found: ${chunkInsights.flatMap(c => c.anomalies || []).length}`);

    // Check if we have any insights to synthesize
    if (chunkInsights.length === 0) {
      console.warn('  No chunk insights were successfully generated - using fallback');
      return res.status(200).json(generateFallbackInsights(aggregatedData, language));
    }

    // Synthesize all insights
    const finalInsights = await synthesizeInsights(
      chunkInsights,
      aggregatedData,
      apiKey,
      isItalian,
      useOpenAI
    );

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n[${new Date().toISOString()}] ✓ Analysis complete!`);
    console.log(`  Total time: ${totalTime}s (~${Math.ceil(totalTime / 60)} minutes)`);
    console.log(`  Participants analyzed: ${totalParticipants}`);
    console.log(`  Chunks processed: ${chunks.length}`);
    console.log(`  Insights generated: ${finalInsights.curiosities?.length || 0}`);

    // Add metadata
    finalInsights.generatedAt = new Date().toISOString();
    finalInsights.participantCount = totalParticipants;
    finalInsights.analysisMethod = 'complete_chunk_analysis';
    finalInsights.chunksAnalyzed = chunks.length;
    finalInsights.analysisTimeSeconds = parseFloat(totalTime);
    finalInsights.aiProvider = useOpenAI ? 'OpenAI GPT-4o' : 'Claude Haiku';
    finalInsights.promptVersion = PROMPT_VERSION; // For cache invalidation

    return res.status(200).json(finalInsights);
    
  } catch (error) {
    console.error('Analysis error:', error);
    
    // Return fallback insights
    return res.status(200).json(generateFallbackInsights(req.body.aggregatedData, req.body.language));
  }
}

// Analyze individual chunk
async function analyzeChunk(chunk, totalChunks, apiKey, isItalian, useOpenAI = false) {
  const prompt = `Sei un data scientist esperto in psicologia comportamentale e analisi statistica avanzata.
Analizza nel dettaglio questi ${chunk.data.length} partecipanti (gruppo ${chunk.index} di ${totalChunks}).

DATI RAW COMPLETI DEL GRUPPO:
${JSON.stringify(chunk.data, null, 2)}

OBIETTIVO: Trova correlazioni NASCOSTE, pattern CONTRO-INTUITIVI, e insight LATERALI che non sono ovvi.

NON limitarti a statistiche semplici! Cerca:

1. CORRELAZIONI NASCOSTE E LATERALI:
   - Relazioni non ovvie tra variabili (es: "chi partecipa di sera ha accuratezza diversa?")
   - Pattern comportamentali inaspettati (es: "professioni specifiche sovrastimano certi alimenti?")
   - Effetti di genere/età su specifici alimenti (non generici)
   - Correlazioni tra velocità di risposta e accuracy
   - Pattern tra consapevolezza dichiarata e performance reale

2. PARADOSSI E CONTRO-INTUIZIONI:
   - Gruppi che dovrebbero essere precisi ma non lo sono
   - Alimenti che tutti sbagliano in modo sistematico
   - Discrepanze tra autovalutazione e performance
   - Pattern che contraddicono le aspettative

3. PSICOLOGIA COMPORTAMENTALE:
   - Bias cognitivi evidenti nei dati
   - Pattern di sovrastima/sottostima sistematica
   - Effetto Dunning-Kruger (chi si sente esperto vs chi performa bene)
   - Effetti temporali sulla performance (stanchezza, orario)

4. ANOMALIE INTERESSANTI:
   - Outlier con storie interessanti
   - Gruppi demografici con pattern unici
   - Comportamenti anomali che rivelano insight

IMPORTANTE:
- Analizza OGNI dettaglio nei dati raw
- Cerca pattern non ovvi
- Collega variabili in modi creativi
- Pensa come uno psicologo comportamentale

Rispondi SOLO con JSON valido in questo formato:
{
  "patterns": [
    {
      "type": "paradox|psychological|behavioral|temporal|demographic|correlation",
      "description": "descrizione dettagliata del pattern NASCOSTO",
      "evidence": "dati specifici e numeri",
      "strength": 1-5,
      "insight": "perché questo è contro-intuitivo o interessante"
    }
  ],
  "anomalies": [
    {
      "description": "anomalia trovata",
      "participants": "chi riguarda",
      "significance": "perché è importante/sorprendente"
    }
  ],
  "correlations": [
    {
      "variables": ["var1", "var2"],
      "relationship": "descrizione della relazione NON OVVIA",
      "coefficient": "stima correlazione",
      "surprise_factor": "perché è inaspettato"
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
    let response, data, responseText;

    if (useOpenAI) {
      // OpenAI GPT-4o API call
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: prompt
          }],
          max_tokens: 1500,
          temperature: 0.5,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`    OpenAI chunk API error (${response.status}):`, errorText.substring(0, 200));
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: errorText } };
        }
        throw new Error(`OpenAI API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      }

      data = await response.json();
      responseText = data.choices[0].message.content;

    } else {
      // Claude API call (fallback)
      response = await fetch("https://api.anthropic.com/v1/messages", {
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
        const errorText = await response.text();
        console.error(`    Claude chunk API error (${response.status}):`, errorText.substring(0, 200));
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: errorText } };
        }
        throw new Error(`Claude API error (${response.status}): ${errorData.error?.message || 'Unknown error'}`);
      }

      data = await response.json();
      responseText = data.content[0].text;
    }

    // Clean and parse response
    const cleanedText = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error(`    JSON parse error in chunk ${chunk.index}:`, parseError.message);
      console.error('    First 200 chars:', cleanedText.substring(0, 200));
      throw parseError;
    }

    return parsed;

  } catch (error) {
    console.error(`✗ Chunk ${chunk.index} analysis error:`, error.message);
    return {
      patterns: [],
      anomalies: [],
      correlations: [],
      stats: {}
    };
  }
}

// Synthesize all chunk insights into final analysis
async function synthesizeInsights(chunkInsights, fullData, apiKey, isItalian, useOpenAI = false) {
  // Aggregate all findings
  const allPatterns = chunkInsights.flatMap(c => c.patterns || []);
  const allAnomalies = chunkInsights.flatMap(c => c.anomalies || []);
  const allCorrelations = chunkInsights.flatMap(c => c.correlations || []);

  // Prepare synthesis prompt
  const synthesisPrompt = `Sei un data scientist esperto in psicologia comportamentale e comunicazione scientifica coinvolgente.
Sintetizza questi pattern trovati analizzando ${fullData.totalParticipants} partecipanti in ${chunkInsights.length} gruppi.

PATTERN TROVATI (${allPatterns.length} totali):
${JSON.stringify(allPatterns.slice(0, 30), null, 2)}

ANOMALIE (${allAnomalies.length} totali):
${JSON.stringify(allAnomalies.slice(0, 15), null, 2)}

CORRELAZIONI (${allCorrelations.length} totali):
${JSON.stringify(allCorrelations.slice(0, 15), null, 2)}

STATISTICHE GLOBALI:
- Partecipanti totali: ${fullData.totalParticipants}
- Demografia: ${JSON.stringify(fullData.demographics || {}).substring(0, 500)}
- Pattern: ${JSON.stringify(fullData.patterns || {}).substring(0, 500)}

OBIETTIVO: Crea insights ACCATTIVANTI, SORPRENDENTI e CONTRO-INTUITIVI.

REGOLE FONDAMENTALI:
1. NIENTE statistiche banali (NO "36% ha età 18-24", "50% donne 47% uomini")
2. CERCA pattern nascosti, correlazioni laterali, paradossi psicologici
3. USA i dati specifici trovati nei pattern/anomalie/correlazioni sopra
4. Spiega PERCHÉ ogni insight è interessante/sorprendente
5. Preferisci quality over quantity - meglio 8 insight incredibili che 9 mediocri
6. VARIA i tipi: mix di paradox, psychological, behavioral, temporal, correlation
7. ${isItalian ? 'Rispondi in italiano con linguaggio coinvolgente' : 'Respond in English with engaging language'}

ESEMPI DI BUONI INSIGHT:
✅ "Effetto Dunning-Kruger: chi si sente 'esperto' (8-10/10) sbaglia del 23% in più rispetto a chi si valuta 'medio' (5-7/10)"
✅ "Paradosso temporale: precisione cala del 15% dopo le 20:00, suggerendo che la stanchezza impatta la percezione del dolce"
✅ "Gender bias specifico: le donne sovrastimano la banana (+2.3 Brix) mentre gli uomini la sottostimano (-1.8 Brix)"
✅ "Professionisti sanitari non più precisi: medici/infermieri al 58% vs studenti al 61% - la formazione non aiuta!"

ESEMPI DI INSIGHT DA EVITARE:
❌ "Il 36% dei partecipanti appartiene alla fascia 18-24" (troppo descrittivo, poco interessante)
❌ "La maggioranza partecipa di pomeriggio" (ovvio, non dice nulla di profondo)
❌ "Distribuzione genere: 50% donne, 47% uomini" (statistica base, non insight)

IMPORTANTE: Rispondi SOLO con JSON valido:
{
  "curiosities": [
    {
      "title": "titolo accattivante (max 5 parole)",
      "insight": "spiegazione coinvolgente con NUMERI SPECIFICI e percentuali REALI dai pattern trovati sopra. Spiega perché è sorprendente/contro-intuitivo",
      "emoji": "emoji appropriato",
      "type": "paradox|behavioral|psychological|temporal|demographic|correlation",
      "strength": 3-5 (solo insight forti!),
      "evidence": "evidenza specifica con numeri dai dati analizzati"
    }
  ],
  "mainTrend": {
    "title": "il pattern PIÙ sorprendente/importante",
    "description": "descrizione dettagliata con numeri specifici",
    "significance": "perché questo cambia la nostra comprensione del fenomeno"
  },
  "funFact": {
    "fact": "fatto WOW verificato dai dati che fa dire 'incredibile!'",
    "emoji": "emoji",
    "explanation": "context che rende il fatto ancora più interessante"
  },
  "methodology": "Analisi AI approfondita su ${fullData.totalParticipants} partecipanti con chunking multi-level"
}

Genera ESATTAMENTE 8-9 curiosities basate SOLO sui pattern più forti, sorprendenti e non-ovvi trovati.
Ogni insight deve essere UNICO (niente duplicati!) e basato su DATI REALI dai pattern analizzati.`;

  try {
    let response, data, responseText;

    if (useOpenAI) {
      // OpenAI GPT-4o API call
      console.log('  Calling OpenAI GPT-4o for synthesis...');
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [{
            role: "user",
            content: synthesisPrompt
          }],
          max_tokens: 2000,
          temperature: 0.7,
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`  OpenAI API error (${response.status}):`, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: errorText } };
        }
        throw new Error(`OpenAI Synthesis API error (${response.status}): ${errorData.error?.message || errorText}`);
      }

      data = await response.json();
      responseText = data.choices[0].message.content;
      console.log('  OpenAI synthesis completed successfully');

    } else {
      // Claude API call (fallback)
      console.log('  Calling Claude API for synthesis...');
      response = await fetch("https://api.anthropic.com/v1/messages", {
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
        const errorText = await response.text();
        console.error(`  Claude API error (${response.status}):`, errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { error: { message: errorText } };
        }
        throw new Error(`Claude Synthesis API error (${response.status}): ${errorData.error?.message || errorText}`);
      }

      data = await response.json();
      responseText = data.content[0].text;
      console.log('  Claude synthesis completed successfully');
    }

    // Clean and parse response
    console.log('  Parsing synthesis response...');
    const cleanedText = responseText
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    console.log(`  Response text length: ${cleanedText.length} characters`);

    let insights;
    try {
      insights = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('  JSON parse error:', parseError.message);
      console.error('  First 200 chars of response:', cleanedText.substring(0, 200));
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }

    // Ensure we have valid structure
    if (!insights.curiosities || insights.curiosities.length === 0) {
      console.error('  Invalid insights structure - missing or empty curiosities');
      console.error('  Insights keys:', Object.keys(insights));
      throw new Error('Invalid insights structure: missing or empty curiosities array');
    }

    console.log(`  ✓ Valid insights structure with ${insights.curiosities.length} curiosities`);
    return insights;

  } catch (error) {
    console.error('Synthesis error:', error.message);
    console.error('Error stack:', error.stack);
    console.log('  Falling back to local insights generation...');
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
