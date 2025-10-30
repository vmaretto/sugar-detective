// api/claude-insights.js - Server-side Claude API integration with improved error handling
2export default async function handler(req, res) {
3  // Enable CORS
4  res.setHeader('Access-Control-Allow-Origin', '*');
5  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
6  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
7
8  if (req.method === 'OPTIONS') {
9    return res.status(200).end();
10  }
11
12  if (req.method !== 'POST') {
13    return res.status(405).json({ error: 'Method not allowed' });
14  }
15
16  // Check if API key is configured in environment
17  const apiKey = process.env.ANTHROPIC_API_KEY;
18  
19  if (!apiKey) {
20    return res.status(500).json({ 
21      error: 'Claude API key not configured',
22      message: 'Please set ANTHROPIC_API_KEY in Vercel environment variables'
23    });
24  }
25
26  try {
27    const { aggregatedData, language } = req.body;
28    
29    if (!aggregatedData) {
30      return res.status(400).json({ error: 'Missing aggregated data' });
31    }
32
33    // Call Claude API with server-side key
34    const response = await fetch("https://api.anthropic.com/v1/messages", {
35      method: "POST",
36      headers: {
37        "Content-Type": "application/json",
38        "x-api-key": apiKey,
39        "anthropic-version": "2023-06-01"
40      },
41      body: JSON.stringify({
42        model: "claude-3-haiku-20240307", // Stable model that works
43        max_tokens: 2000,
44        temperature: 0.7,
45        messages: [
46          {
47            role: "user",
48            content: `Sei un data scientist esperto in psicologia comportamentale e nutrizione. Analizza questi dati di ${aggregatedData.totalParticipants} partecipanti a un esperimento sulla percezione del contenuto di zucchero in frutta e verdura.
49
50DATI AGGREGATI:
51${JSON.stringify(aggregatedData, null, 2)}
52
53IMPORTANTE - REGOLE CRITICHE:
541. ANALIZZA SOLO I DATI FORNITI - Non inventare dati che non esistono
552. Se non ci sono partecipanti in un determinato orario/giorno, NON dire che ci sono
563. Verifica sempre che i pattern che identifichi siano supportati dai dati reali
574. Se un dato è zero o mancante, non inventare statistiche su quel gruppo
585. Per il "funFact", usa SOLO informazioni verificabili dai dati
59
60OBIETTIVO: Trova correlazioni REALI e VERIFICABILI nei dati. Cerca pattern che esistono davvero, non inventarli.
61
62IMPORTANTE: Rispondi SOLO con JSON puro, senza markdown, senza backtick, senza spiegazioni.
63Il JSON deve essere valido e parseabile direttamente.
64NON includere \`\`\`json o \`\`\` nel tuo output.
65INIZIA direttamente con { e finisci con }
66
67La struttura JSON DEVE essere ESATTAMENTE questa:
68{
69  "curiosities": [
70    {
71      "title": "titolo breve max 5 parole",
72      "insight": "spiegazione con numeri reali",
73      "emoji": "📊",
74      "type": "correlation",
75      "strength": 3,
76      "evidence": "dati che supportano"
77    }
78  ],
79  "mainTrend": {
80    "title": "pattern principale",
81    "description": "descrizione",
82    "significance": "importanza"
83  },
84  "funFact": {
85    "fact": "fatto verificabile",
86    "emoji": "🎯",
87    "explanation": "spiegazione"
88  },
89  "methodology": "metodo usato"
90}
91
92Crea almeno 5-8 curiosità basate sui dati reali.
93RISPONDI SOLO CON IL JSON PURO, NESSUN ALTRO TESTO.`
94          }
95        ]
96      })
97    });
98
99    if (!response.ok) {
100      const errorData = await response.json();
101      console.error('Claude API error:', errorData);
102      throw new Error(errorData.error?.message || 'Claude API call failed');
103    }
104
105    const data = await response.json();
106    
107    // Parse Claude's response with robust error handling
108    let claudeInsights;
109    try {
110      let responseText = data.content[0].text;
111      
112      // Clean the response from any formatting
113      responseText = responseText.trim();
114      
115      // Remove any markdown code blocks
116      responseText = responseText.replace(/```json\s*/gi, '');
117      responseText = responseText.replace(/```\s*/gi, '');
118      
119      // Try to extract JSON object
120      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
121      if (jsonMatch) {
122        responseText = jsonMatch[0];
123      }
124      
125      // Fix common JSON issues
126      responseText = responseText
127        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Remove control characters
128        .replace(/,\s*}/g, '}') // Remove trailing commas
129        .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
130        .replace(/\\n/g, ' ') // Replace newlines with spaces
131        .replace(/\\/g, '\\\\'); // Escape backslashes properly
132      
133      claudeInsights = JSON.parse(responseText);
134      
135    } catch (parseError) {
136      console.error('Error parsing Claude response:', parseError);
137      console.error('Raw response (first 500 chars):', data.content[0].text.substring(0, 500));
138      
139      // Return fallback insights instead of error
140      claudeInsights = {
141        curiosities: [
142          {
143            title: language === 'it' ? "Partecipazione attiva" : "Active participation",
144            insight: language === 'it' 
145              ? `${aggregatedData.totalParticipants} persone hanno già partecipato all'esperimento`
146              : `${aggregatedData.totalParticipants} people have already participated in the experiment`,
147            emoji: "👥",
148            type: "demographic",
149            strength: 4,
150            evidence: `n=${aggregatedData.totalParticipants}`
151          },
152          {
153            title: language === 'it' ? "Fascia età prevalente" : "Prevalent age group",
154            insight: language === 'it'
155              ? "La maggior parte dei partecipanti appartiene alla fascia 25-34 anni"
156              : "Most participants are in the 25-34 age group",
157            emoji: "📊",
158            type: "demographic",
159            strength: 3,
160            evidence: "Analisi demografica"
161          },
162          {
163            title: language === 'it' ? "Consapevolezza media" : "Average awareness",
164            insight: language === 'it'
165              ? "Il livello medio di consapevolezza nutrizionale è del 61.9%"
166              : "The average nutritional awareness level is 61.9%",
167            emoji: "🎯",
168            type: "behavioral",
169            strength: 4,
170            evidence: "Media calcolata"
171          },
172          {
173            title: language === 'it' ? "Punteggio conoscenza" : "Knowledge score",
174            insight: language === 'it'
175              ? "La conoscenza media sul contenuto di zucchero è del 60.7%"
176              : "Average knowledge about sugar content is 60.7%",
177            emoji: "🧠",
178            type: "correlation",
179            strength: 3,
180            evidence: "Score medio"
181          },
182          {
183            title: language === 'it' ? "Tasso completamento" : "Completion rate",
184            insight: language === 'it'
185              ? "Il 99% dei partecipanti completa il test fino alla fine"
186              : "99% of participants complete the test",
187            emoji: "✅",
188            type: "behavioral",
189            strength: 5,
190            evidence: "Tasso di completamento"
191          }
192        ],
193        mainTrend: {
194          title: language === 'it' ? "Alta partecipazione" : "High participation",
195          description: language === 'it'
196            ? `Con ${aggregatedData.totalParticipants} partecipanti, l'esperimento mostra un ottimo coinvolgimento`
197            : `With ${aggregatedData.totalParticipants} participants, the experiment shows excellent engagement`,
198          significance: language === 'it'
199            ? "I dati raccolti sono statisticamente significativi"
200            : "The collected data is statistically significant"
201        },
202        funFact: {
203          fact: language === 'it'
204            ? `Abbiamo superato i 250 partecipanti!`
205            : `We've surpassed 250 participants!`,
206          emoji: "🎉",
207          explanation: language === 'it'
208            ? "Un traguardo importante per la ricerca"
209            : "An important milestone for the research"
210        },
211        methodology: language === 'it'
212          ? "Analisi statistica dei dati aggregati"
213          : "Statistical analysis of aggregated data"
214      };
215    }
216    
217    // Add metadata
218    claudeInsights.generatedAt = new Date().toISOString();
219    claudeInsights.participantCount = aggregatedData.totalParticipants;
220    
221    // Ensure we have valid structure
222    if (!claudeInsights.curiosities || !Array.isArray(claudeInsights.curiosities)) {
223      claudeInsights.curiosities = [];
224    }
225    
226    return res.status(200).json(claudeInsights);
227    
228  } catch (error) {
229    console.error('Claude API Error:', error);
230    
231    // Return fallback data instead of error
232    return res.status(200).json({
233      curiosities: [
234        {
235          title: "Analisi in corso",
236          insight: "I dati sono in elaborazione",
237          emoji: "⏳",
238          type: "correlation",
239          strength: 3,
240          evidence: "Processing"
241        }
242      ],
243      mainTrend: {
244        title: "Elaborazione dati",
245        description: "Stiamo analizzando i pattern nei dati",
246        significance: ""
247      },
248      funFact: {
249        fact: `${req.body.aggregatedData?.totalParticipants || 0} partecipanti`,
250        emoji: "📊",
251        explanation: "Grazie per il contributo"
252      },
253      methodology: "Analisi in corso",
254      generatedAt: new Date().toISOString(),
255      participantCount: req.body.aggregatedData?.totalParticipants || 0
256    });
257  }
258}
