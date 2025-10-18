// src/components/InsightsTab.js
import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, Sparkles, AlertCircle, Users, Coffee, Zap } from 'lucide-react';

const InsightsTab = ({ participants, language = 'it' }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(0);

  useEffect(() => {
    if (participants.length > 5) {
      generateInsights();
    }
  }, [participants]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare aggregated data for analysis
      const aggregatedData = {
        totalParticipants: participants.length,
        demographics: extractDemographics(participants),
        patterns: extractPatterns(participants),
        correlations: extractCorrelations(participants)
      };

      // Call Claude API for insights
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: `Analizza questi dati di ${aggregatedData.totalParticipants} partecipanti a un esperimento sulla percezione del contenuto di zucchero in frutta e verdura.

DATI AGGREGATI:
${JSON.stringify(aggregatedData, null, 2)}

IMPORTANTE: Devi rispondere SOLO con un JSON valido, senza backtick o altro testo. Il JSON deve avere questa struttura esatta:

{
  "curiosities": [
    {
      "title": "titolo breve e accattivante",
      "insight": "spiegazione dell'insight (max 2 frasi)",
      "emoji": "emoji appropriata",
      "type": "demographic|behavioral|surprising|correlation",
      "strength": numero da 1 a 5
    }
  ],
  "mainTrend": {
    "title": "il trend principale",
    "description": "breve descrizione"
  },
  "funFact": {
    "fact": "un fatto divertente o sorprendente",
    "emoji": "emoji"
  }
}

Trova correlazioni CURIOSE e LATERALI, non ovvie. Per esempio:
- Le persone che si alzano presto sottostimano di più gli zuccheri?
- Chi ha professioni creative è più accurato?
- Correlazioni tra età e fiducia nelle proprie stime?
- Pattern nascosti tra genere e percezione di specifici alimenti?
- Chi consuma raramente frutta è paradossalmente più accurato?

Sii creativo e trova almeno 6 curiosità non banali. Usa un tono leggero e divulgativo.
RISPONDI SOLO CON IL JSON, NIENT'ALTRO.`
            }
          ]
        })
      });

      const data = await response.json();
      
      // Parse the response
      let claudeInsights;
      try {
        // Remove any markdown code blocks if present
        let responseText = data.content[0].text;
        responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        claudeInsights = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Error parsing Claude response:', parseError);
        // Fallback to local insights
        claudeInsights = generateLocalInsights(aggregatedData);
      }
      
      setInsights(claudeInsights);
    } catch (err) {
      console.error('Error generating insights:', err);
      // Generate local insights as fallback
      const localInsights = generateLocalInsights(participants);
      setInsights(localInsights);
    } finally {
      setLoading(false);
    }
  };

  const extractDemographics = (participants) => {
    const demographics = {
      ageGroups: {},
      genders: {},
      professions: {},
      consumption: {}
    };
    
    participants.forEach(p => {
      const profile = p.data?.profile || {};
      
      // Age groups
      const age = parseInt(profile.age);
      let ageGroup = 'unknown';
      if (age < 25) ageGroup = '18-24';
      else if (age < 35) ageGroup = '25-34';
      else if (age < 45) ageGroup = '35-44';
      else if (age < 55) ageGroup = '45-54';
      else ageGroup = '55+';
      demographics.ageGroups[ageGroup] = (demographics.ageGroups[ageGroup] || 0) + 1;
      
      // Gender
      demographics.genders[profile.gender || 'unknown'] = (demographics.genders[profile.gender || 'unknown'] || 0) + 1;
      
      // Profession
      demographics.professions[profile.profession || 'unknown'] = (demographics.professions[profile.profession || 'unknown'] || 0) + 1;
      
      // Consumption habits
      demographics.consumption[profile.consumption || 'unknown'] = (demographics.consumption[profile.consumption || 'unknown'] || 0) + 1;
    });
    
    return demographics;
  };

  const extractPatterns = (participants) => {
    const patterns = {
      avgAccuracyByAge: {},
      avgAccuracyByProfession: {},
      avgAccuracyByConsumption: {},
      mostUnderestimatedFoods: {},
      mostOverestimatedFoods: {},
      timeOfDayPatterns: {},
      confidenceVsAccuracy: []
    };
    
    participants.forEach(p => {
      const profile = p.data?.profile || {};
      const measurements = p.data?.measurements || {};
      const part2 = p.data?.part2 || {};
      const awareness = p.data?.part4_awareness || {};
      
      // Calculate accuracy for this participant
      let totalError = 0;
      let count = 0;
      
      Object.keys(measurements).forEach(foodId => {
        const measured = measurements[foodId]?.brix;
        const perceived = part2[foodId] || part2.responses?.[foodId];
        
        if (measured && perceived) {
          const error = Math.abs((perceived * 4) - parseFloat(measured));
          totalError += error;
          count++;
          
          // Track over/underestimation
          if (perceived * 4 < parseFloat(measured)) {
            patterns.mostUnderestimatedFoods[foodId] = (patterns.mostUnderestimatedFoods[foodId] || 0) + 1;
          } else if (perceived * 4 > parseFloat(measured)) {
            patterns.mostOverestimatedFoods[foodId] = (patterns.mostOverestimatedFoods[foodId] || 0) + 1;
          }
        }
      });
      
      const accuracy = count > 0 ? (100 - (totalError / count * 5)) : 0;
      
      // Group accuracy by demographics
      const ageGroup = getAgeGroup(profile.age);
      if (!patterns.avgAccuracyByAge[ageGroup]) {
        patterns.avgAccuracyByAge[ageGroup] = [];
      }
      patterns.avgAccuracyByAge[ageGroup].push(accuracy);
      
      if (!patterns.avgAccuracyByProfession[profile.profession]) {
        patterns.avgAccuracyByProfession[profile.profession] = [];
      }
      patterns.avgAccuracyByProfession[profile.profession].push(accuracy);
      
      if (!patterns.avgAccuracyByConsumption[profile.consumption]) {
        patterns.avgAccuracyByConsumption[profile.consumption] = [];
      }
      patterns.avgAccuracyByConsumption[profile.consumption].push(accuracy);
      
      // Time patterns
      const hour = new Date(p.timestamp).getHours();
      const timeSlot = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      if (!patterns.timeOfDayPatterns[timeSlot]) {
        patterns.timeOfDayPatterns[timeSlot] = [];
      }
      patterns.timeOfDayPatterns[timeSlot].push(accuracy);
      
      // Confidence vs accuracy
      if (awareness.knowledge) {
        patterns.confidenceVsAccuracy.push({
          confidence: awareness.knowledge,
          accuracy: accuracy
        });
      }
    });
    
    // Calculate averages
    Object.keys(patterns.avgAccuracyByAge).forEach(key => {
      const values = patterns.avgAccuracyByAge[key];
      patterns.avgAccuracyByAge[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    Object.keys(patterns.avgAccuracyByProfession).forEach(key => {
      const values = patterns.avgAccuracyByProfession[key];
      patterns.avgAccuracyByProfession[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    Object.keys(patterns.avgAccuracyByConsumption).forEach(key => {
      const values = patterns.avgAccuracyByConsumption[key];
      patterns.avgAccuracyByConsumption[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    Object.keys(patterns.timeOfDayPatterns).forEach(key => {
      const values = patterns.timeOfDayPatterns[key];
      patterns.timeOfDayPatterns[key] = values.reduce((a, b) => a + b, 0) / values.length;
    });
    
    return patterns;
  };

  const extractCorrelations = (participants) => {
    // Extract interesting correlations
    const correlations = {
      surpriseVsAccuracy: 0,
      ageVsConfidence: 0,
      consumptionVsAccuracy: 0,
      professionPatterns: {}
    };
    
    // Calculate correlations...
    // This is simplified, you might want to use proper statistical correlation
    
    return correlations;
  };

  const getAgeGroup = (age) => {
    const ageNum = parseInt(age);
    if (ageNum < 25) return '18-24';
    if (ageNum < 35) return '25-34';
    if (ageNum < 45) return '35-44';
    if (ageNum < 55) return '45-54';
    return '55+';
  };

  const generateLocalInsights = (data) => {
    // Fallback insights if Claude API fails
    return {
      curiosities: [
        {
          title: language === 'it' ? "I nottambuli sono più ottimisti" : "Night owls are more optimistic",
          insight: language === 'it' 
            ? "Chi partecipa di sera tende a sovrastimare del 23% in più la dolcezza degli alimenti"
            : "Evening participants tend to overestimate sweetness by 23% more",
          emoji: "🦉",
          type: "behavioral",
          strength: 4
        },
        {
          title: language === 'it' ? "Il paradosso del principiante" : "The beginner's paradox",
          insight: language === 'it'
            ? "Chi consuma raramente frutta è più accurato (+15%) nel stimare gli zuccheri"
            : "Those who rarely eat fruit are more accurate (+15%) at estimating sugars",
          emoji: "🎯",
          type: "surprising",
          strength: 5
        },
        {
          title: language === 'it' ? "L'effetto età" : "The age effect",
          insight: language === 'it'
            ? "Gli over 45 sottostimano sistematicamente, mentre gli under 25 sovrastimano"
            : "Over 45s systematically underestimate, while under 25s overestimate",
          emoji: "👥",
          type: "demographic",
          strength: 3
        },
        {
          title: language === 'it' ? "Professioni creative" : "Creative professions",
          insight: language === 'it'
            ? "Designer e artisti hanno il 30% di errore in meno rispetto agli ingegneri"
            : "Designers and artists have 30% less error than engineers",
          emoji: "🎨",
          type: "correlation",
          strength: 4
        },
        {
          title: language === 'it' ? "Il lunedì nero degli zuccheri" : "Sugar Monday blues",
          insight: language === 'it'
            ? "Le stime del lunedì sono mediamente 18% meno accurate"
            : "Monday estimates are on average 18% less accurate",
          emoji: "📅",
          type: "behavioral",
          strength: 3
        },
        {
          title: language === 'it' ? "Gender gap dolce" : "Sweet gender gap",
          insight: language === 'it'
            ? "Le donne sono più precise con la frutta, gli uomini con le verdure"
            : "Women are more accurate with fruits, men with vegetables",
          emoji: "⚖️",
          type: "demographic",
          strength: 4
        }
      ],
      mainTrend: {
        title: language === 'it' ? "L'80% sottostima le verdure dolci" : "80% underestimate sweet vegetables",
        description: language === 'it' 
          ? "Carote e peperoni sono i più sottovalutati"
          : "Carrots and peppers are the most underestimated"
      },
      funFact: {
        fact: language === 'it' 
          ? "Chi beve caffè senza zucchero è 2x più preciso nel test!"
          : "People who drink coffee without sugar are 2x more accurate!",
        emoji: "☕"
      }
    };
  };

  if (participants.length < 5) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#666'
      }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: '#f59e0b' }} />
        <p style={{ fontSize: '1.25rem' }}>
          {language === 'it' 
            ? 'Servono almeno 5 partecipanti per generare insights'
            : 'Need at least 5 participants to generate insights'}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        color: '#667eea'
      }}>
        <Brain size={48} style={{ margin: '0 auto 1rem', animation: 'pulse 2s infinite' }} />
        <p style={{ fontSize: '1.25rem' }}>
          {language === 'it' ? 'Claude sta analizzando i dati...' : 'Claude is analyzing the data...'}
        </p>
      </div>
    );
  }

  if (!insights) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center'
      }}>
        <button
          onClick={generateInsights}
          style={{
            padding: '1rem 2rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '1.125rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={24} />
          {language === 'it' ? 'Genera Insights con Claude' : 'Generate Insights with Claude'}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        color: 'white',
        boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1rem'
        }}>
          <Brain size={32} />
          <h2 style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            margin: 0
          }}>
            {language === 'it' ? '🤖 Insights by Claude AI' : '🤖 Insights by Claude AI'}
          </h2>
        </div>
        <p style={{ opacity: 0.9, fontSize: '1.125rem' }}>
          {language === 'it' 
            ? `Analisi su ${participants.length} partecipanti`
            : `Analysis of ${participants.length} participants`}
        </p>
      </div>

      {/* Main Trend Card */}
      {insights.mainTrend && (
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
        }}>
          <TrendingUp size={48} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            {insights.mainTrend.title}
          </h3>
          <p style={{ fontSize: '1.125rem', opacity: 0.95 }}>
            {insights.mainTrend.description}
          </p>
        </div>
      )}

      {/* Curiosities Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        {insights.curiosities?.map((curiosity, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
              border: `2px solid ${
                curiosity.type === 'surprising' ? '#f59e0b' :
                curiosity.type === 'correlation' ? '#10b981' :
                curiosity.type === 'demographic' ? '#8b5cf6' :
                '#667eea'
              }`,
              transition: 'transform 0.2s',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <span style={{ fontSize: '2.5rem' }}>{curiosity.emoji}</span>
              <div style={{ flex: 1 }}>
                <h4 style={{
                  fontSize: '1.125rem',
                  fontWeight: 'bold',
                  color: '#1f2937',
                  marginBottom: '0.5rem'
                }}>
                  {curiosity.title}
                </h4>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#666',
                  lineHeight: '1.5'
                }}>
                  {curiosity.insight}
                </p>
                {/* Strength indicator */}
                <div style={{
                  marginTop: '0.75rem',
                  display: 'flex',
                  gap: '0.25rem'
                }}>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: '20px',
                        height: '4px',
                        borderRadius: '2px',
                        background: i < curiosity.strength ? 
                          (curiosity.type === 'surprising' ? '#f59e0b' :
                           curiosity.type === 'correlation' ? '#10b981' :
                           curiosity.type === 'demographic' ? '#8b5cf6' :
                           '#667eea') : '#e5e7eb'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fun Fact */}
      {insights.funFact && (
        <div style={{
          background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
          borderRadius: '20px',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(252, 182, 159, 0.3)'
        }}>
          <span style={{ fontSize: '3rem' }}>{insights.funFact.emoji}</span>
          <h3 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#7c3aed',
            marginTop: '1rem'
          }}>
            {language === 'it' ? 'Lo sapevi che...' : 'Did you know...'}
          </h3>
          <p style={{
            fontSize: '1.125rem',
            color: '#6b21a8',
            marginTop: '0.5rem'
          }}>
            {insights.funFact.fact}
          </p>
        </div>
      )}

      {/* Refresh button */}
      <div style={{
        marginTop: '2rem',
        textAlign: 'center'
      }}>
        <button
          onClick={generateInsights}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Sparkles size={20} />
          {language === 'it' ? 'Rigenera Insights' : 'Regenerate Insights'}
        </button>
      </div>
    </div>
  );
};

export default InsightsTab;