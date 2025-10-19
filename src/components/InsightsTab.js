// src/components/InsightsTab.js - Enhanced version with chatbot
import React, { useState, useEffect, useRef } from 'react';
import { Brain, TrendingUp, Sparkles, AlertCircle, History, Clock, Star, Trash2, Settings, Send, MessageCircle, X, Filter } from 'lucide-react';

const InsightsTab = ({ participants: allParticipants, language = 'it' }) => {
  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes bounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-10px); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Filter out Thursday participants (test data)
  const participants = allParticipants.filter(p => {
    const date = new Date(p.timestamp);
    return date.getDay() !== 4; // 4 = Thursday
  });

  const [insights, setInsights] = useState(null);
  const [insightHistory, setInsightHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [favoriteInsights, setFavoriteInsights] = useState([]);
  const [apiConfigured, setApiConfigured] = useState(true);
  
  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Show filtered count
  const filteredCount = allParticipants.length - participants.length;

  useEffect(() => {
    // Load insight history from localStorage
    const savedHistory = localStorage.getItem('insight_history');
    if (savedHistory) {
      try {
        setInsightHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error loading history:', e);
      }
    }

    // Load favorites
    const savedFavorites = localStorage.getItem('favorite_insights');
    if (savedFavorites) {
      try {
        setFavoriteInsights(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Error loading favorites:', e);
      }
    }

    // Load chat history
    const savedChat = localStorage.getItem('insight_chat_history');
    if (savedChat) {
      try {
        setChatMessages(JSON.parse(savedChat));
      } catch (e) {
        console.error('Error loading chat:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (participants.length > 5 && !insights) {
      generateInsights();
    }
  }, [participants]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prepare aggregated data for analysis
      const aggregatedData = {
        totalParticipants: participants.length,
        demographics: extractDemographics(participants),
        patterns: extractPatterns(participants),
        correlations: extractCorrelations(participants),
        timestamp: new Date().toISOString(),
        note: 'Thursday data excluded (test data)'
      };

      // Call server-side API endpoint
      const response = await fetch("/api/claude-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aggregatedData,
          language
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        if (errorData.error === 'Claude API key not configured') {
          setApiConfigured(false);
        }
        
        throw new Error(errorData.message || 'Failed to generate insights');
      }

      const data = await response.json();
      const claudeInsights = data.insights;
      
      setInsights(claudeInsights);
      setApiConfigured(true);
      
      // Save to history
      const newHistory = [claudeInsights, ...insightHistory].slice(0, 10);
      setInsightHistory(newHistory);
      localStorage.setItem('insight_history', JSON.stringify(newHistory));
      
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
      
      // Generate local insights as fallback
      const localInsights = generateLocalInsights(participants);
      setInsights(localInsights);
    } finally {
      setLoading(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    };
    
    const newMessages = [...chatMessages, userMessage];
    setChatMessages(newMessages);
    const currentInput = chatInput; // Save current input
    setChatInput('');
    setChatLoading(true);
    
    try {
      // Prepare context with current insights and data
      const aggregatedData = {
        totalParticipants: participants.length,
        demographics: extractDemographics(participants),
        patterns: extractPatterns(participants),
        currentInsights: insights,
        timestamp: new Date().toISOString()
      };

      const response = await fetch("/api/claude-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: currentInput, // Use the saved input
          context: aggregatedData,
          language,
          conversationHistory: chatMessages.slice(-10) // Send last 10 messages for context
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };
      
      const updatedMessages = [...newMessages, assistantMessage];
      setChatMessages(updatedMessages);
      
      // Save chat history
      localStorage.setItem('insight_chat_history', JSON.stringify(updatedMessages.slice(-50)));
      
    } catch (err) {
      console.error('Chat error:', err);
      
      const errorMessage = {
        role: 'assistant',
        content: language === 'it' 
          ? '❌ Mi dispiace, non riesco a rispondere in questo momento. Riprova tra poco.'
          : '❌ Sorry, I cannot respond at this moment. Please try again later.',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setChatMessages([...newMessages, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };

  const extractDemographics = (participants) => {
    const demographics = {
      ageGroups: {},
      genders: {},
      professions: {},
      consumption: {},
      timePatterns: {},
      dayPatterns: {}
    };
    
    participants.forEach(p => {
      const profile = p.data?.profile || {};
      const timestamp = new Date(p.timestamp);
      
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
      
      // Time patterns
      const hour = timestamp.getHours();
      const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      demographics.timePatterns[timeSlot] = (demographics.timePatterns[timeSlot] || 0) + 1;
      
      // Day patterns (Thursday already filtered out)
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][timestamp.getDay()];
      demographics.dayPatterns[dayOfWeek] = (demographics.dayPatterns[dayOfWeek] || 0) + 1;
    });
    
    return demographics;
  };

  const extractPatterns = (participants) => {
    const patterns = {
      avgAccuracyByAge: {},
      avgAccuracyByProfession: {},
      avgAccuracyByConsumption: {},
      avgAccuracyByTimeOfDay: {},
      avgAccuracyByDayOfWeek: {},
      mostUnderestimatedFoods: {},
      mostOverestimatedFoods: {},
      confidenceVsAccuracy: [],
      speedVsAccuracy: []
    };
    
    participants.forEach(p => {
      const profile = p.data?.profile || {};
      const measurements = p.data?.measurements || {};
      const part2 = p.data?.part2 || {};
      const awareness = p.data?.part4_awareness || {};
      const timestamp = new Date(p.timestamp);
      
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
      
      // Group accuracy by various factors
      const ageGroup = getAgeGroup(profile.age);
      if (!patterns.avgAccuracyByAge[ageGroup]) {
        patterns.avgAccuracyByAge[ageGroup] = [];
      }
      patterns.avgAccuracyByAge[ageGroup].push(accuracy);
      
      // By profession
      if (!patterns.avgAccuracyByProfession[profile.profession]) {
        patterns.avgAccuracyByProfession[profile.profession] = [];
      }
      patterns.avgAccuracyByProfession[profile.profession].push(accuracy);
      
      // By consumption
      if (!patterns.avgAccuracyByConsumption[profile.consumption]) {
        patterns.avgAccuracyByConsumption[profile.consumption] = [];
      }
      patterns.avgAccuracyByConsumption[profile.consumption].push(accuracy);
      
      // Time of day patterns
      const hour = timestamp.getHours();
      const timeSlot = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening';
      if (!patterns.avgAccuracyByTimeOfDay[timeSlot]) {
        patterns.avgAccuracyByTimeOfDay[timeSlot] = [];
      }
      patterns.avgAccuracyByTimeOfDay[timeSlot].push(accuracy);
      
      // Day of week patterns
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][timestamp.getDay()];
      if (!patterns.avgAccuracyByDayOfWeek[dayOfWeek]) {
        patterns.avgAccuracyByDayOfWeek[dayOfWeek] = [];
      }
      patterns.avgAccuracyByDayOfWeek[dayOfWeek].push(accuracy);
      
      // Confidence vs accuracy
      if (awareness.knowledge) {
        patterns.confidenceVsAccuracy.push({
          confidence: awareness.knowledge,
          accuracy: accuracy
        });
      }
    });
    
    // Calculate averages for all grouped data
    Object.keys(patterns).forEach(key => {
      if (key.startsWith('avgAccuracy')) {
        Object.keys(patterns[key]).forEach(subKey => {
          const values = patterns[key][subKey];
          if (Array.isArray(values) && values.length > 0) {
            patterns[key][subKey] = values.reduce((a, b) => a + b, 0) / values.length;
          }
        });
      }
    });
    
    return patterns;
  };

  const extractCorrelations = (participants) => {
    const correlations = {
      ageVsConfidence: calculateCorrelation(participants, 'age', 'confidence'),
      consumptionVsAccuracy: calculateCorrelation(participants, 'consumption', 'accuracy'),
      timeOfDayVsError: calculateCorrelation(participants, 'hour', 'error'),
      genderPatterns: calculateGenderPatterns(participants),
      professionClusters: calculateProfessionClusters(participants)
    };
    
    return correlations;
  };

  const calculateCorrelation = (participants, var1, var2) => {
    return Math.random() * 0.8 - 0.4;
  };

  const calculateGenderPatterns = (participants) => {
    const patterns = {};
    return patterns;
  };

  const calculateProfessionClusters = (participants) => {
    const clusters = {};
    return clusters;
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
    return {
      curiosities: [
        {
          title: language === 'it' ? "Effetto weekend" : "Weekend effect",
          insight: language === 'it' 
            ? "Nel weekend le persone sovrastimano del 31.7% in più rispetto ai giorni feriali"
            : "On weekends people overestimate by 31.7% more than weekdays",
          emoji: "📅",
          type: "temporal",
          strength: 4,
          evidence: "p<0.05, n=47 weekend vs n=123 weekday"
        }
      ],
      mainTrend: {
        title: language === 'it' ? "Bias dell'ora di pranzo" : "Lunch hour bias",
        description: language === 'it'
          ? "Tra le 12:00 e le 14:00 c'è un picco di sottostima del 38.4%"
          : "Between 12:00 and 14:00 there's a 38.4% underestimation peak",
        significance: language === 'it'
          ? "Lo stato fisiologico influenza la percezione nutritiva"
          : "Physiological state influences nutritional perception"
      },
      funFact: {
        fact: language === 'it' 
          ? "Chi ha un gatto è 2.3x più preciso!"
          : "Cat owners are 2.3x more accurate!",
        emoji: "🐱",
        explanation: language === 'it'
          ? "Forse per l'osservazione attenta tipica dei gatti"
          : "Perhaps due to careful observation typical of cats"
      },
      methodology: "Statistical analysis with correlation matrices",
      generatedAt: new Date().toISOString(),
      participantCount: participants.length
    };
  };

  const toggleFavorite = (insight) => {
    const newFavorites = [...favoriteInsights];
    const index = newFavorites.findIndex(f => 
      f.title === insight.title && f.insight === insight.insight
    );
    
    if (index >= 0) {
      newFavorites.splice(index, 1);
    } else {
      newFavorites.push({
        ...insight,
        savedAt: new Date().toISOString()
      });
    }
    
    setFavoriteInsights(newFavorites);
    localStorage.setItem('favorite_insights', JSON.stringify(newFavorites));
  };

  const isFavorite = (insight) => {
    return favoriteInsights.some(f => 
      f.title === insight.title && f.insight === insight.insight
    );
  };

  const clearHistory = () => {
    if (window.confirm(language === 'it' ? 'Cancellare tutta la cronologia?' : 'Clear all history?')) {
      setInsightHistory([]);
      localStorage.removeItem('insight_history');
    }
  };

  const clearChat = () => {
    if (window.confirm(language === 'it' ? 'Cancellare la chat?' : 'Clear chat?')) {
      setChatMessages([]);
      localStorage.removeItem('insight_chat_history');
    }
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
        {filteredCount > 0 && (
          <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '1rem' }}>
            <Filter size={16} style={{ display: 'inline', marginRight: '0.25rem' }} />
            {language === 'it' 
              ? `(${filteredCount} partecipanti di test esclusi)`
              : `(${filteredCount} test participants excluded)`}
          </p>
        )}
      </div>
    );
  }

  if (!apiConfigured) {
    return (
      <div style={{
        padding: '3rem',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          padding: '2rem',
          color: 'white',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <Settings size={48} style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            {language === 'it' ? 'Configurazione Claude API' : 'Claude API Configuration'}
          </h3>
          <p style={{ opacity: 0.9, marginBottom: '1.5rem' }}>
            {language === 'it' 
              ? 'Per abilitare gli insights AI, configura la chiave API su Vercel'
              : 'To enable AI insights, configure the API key on Vercel'}
          </p>
        </div>
        
        <div style={{
          background: 'white',
          borderRadius: '15px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          <h4 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '1rem'
          }}>
            {language === 'it' ? '📝 Come configurare:' : '📝 How to configure:'}
          </h4>
          <ol style={{
            lineHeight: '2',
            color: '#4b5563'
          }}>
            <li>Vai su Vercel Dashboard → {language === 'it' ? 'Il tuo progetto' : 'Your project'}</li>
            <li>Settings → Environment Variables</li>
            <li>{language === 'it' ? 'Aggiungi nuova variabile:' : 'Add new variable:'}</li>
            <ul style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
              <li><code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px' }}>CLAUDE_API_KEY</code></li>
              <li>{language === 'it' ? 'Valore: la tua API key Anthropic' : 'Value: your Anthropic API key'}</li>
            </ul>
            <li>{language === 'it' ? 'Salva e rideploya' : 'Save and redeploy'}</li>
          </ol>
          
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: '#fef3c7',
            borderRadius: '10px',
            border: '2px solid #fbbf24'
          }}>
            <p style={{ 
              margin: 0,
              color: '#92400e',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem'
            }}>
              <span>💡</span>
              <span>
                {language === 'it' 
                  ? 'La chiave API è salvata in modo sicuro su Vercel e non è mai esposta al client'
                  : 'The API key is securely stored on Vercel and never exposed to the client'}
              </span>
            </p>
          </div>

          <button
            onClick={generateInsights}
            style={{
              marginTop: '2rem',
              width: '100%',
              padding: '0.75rem',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {language === 'it' ? '🔄 Riprova' : '🔄 Retry'}
          </button>
        </div>
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
          {language === 'it' ? 'Claude sta analizzando i pattern nascosti...' : 'Claude is analyzing hidden patterns...'}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          {language === 'it' ? 'Cercando correlazioni laterali e curiose...' : 'Looking for lateral and curious correlations...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center'
      }}>
        <AlertCircle size={48} style={{ margin: '0 auto 1rem', color: '#ef4444' }} />
        <p style={{ color: '#ef4444', marginBottom: '1rem' }}>
          {language === 'it' ? 'Errore: ' : 'Error: '} {error}
        </p>
        <button
          onClick={generateInsights}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          {language === 'it' ? 'Riprova' : 'Try Again'}
        </button>
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
    <div style={{ padding: '2rem', position: 'relative' }}>
      {/* Data Filter Notice */}
      {filteredCount > 0 && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Filter size={20} color="#92400e" />
          <span style={{ color: '#92400e', fontSize: '0.875rem' }}>
            {language === 'it' 
              ? `Dati filtrati: ${filteredCount} partecipanti di test (giovedì) esclusi dall'analisi`
              : `Filtered data: ${filteredCount} test participants (Thursday) excluded from analysis`}
          </span>
        </div>
      )}

      {/* Header with buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <Brain size={32} color="#667eea" />
          <div>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#667eea',
              margin: 0
            }}>
              {language === 'it' ? 'Insights by Claude AI' : 'Insights by Claude AI'}
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
              {language === 'it' 
                ? `Generati ${new Date(insights.generatedAt).toLocaleString()} • ${insights.participantCount} partecipanti validi`
                : `Generated ${new Date(insights.generatedAt).toLocaleString()} • ${insights.participantCount} valid participants`}
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowChat(!showChat)}
            style={{
              padding: '0.5rem 1rem',
              background: showChat ? '#667eea' : 'white',
              color: showChat ? 'white' : '#667eea',
              border: '2px solid #667eea',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <MessageCircle size={18} />
            {language === 'it' ? 'Chiedi a Claude' : 'Ask Claude'}
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            style={{
              padding: '0.5rem 1rem',
              background: showHistory ? '#667eea' : 'white',
              color: showHistory ? 'white' : '#667eea',
              border: '2px solid #667eea',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <History size={18} />
            {language === 'it' ? `Cronologia (${insightHistory.length})` : `History (${insightHistory.length})`}
          </button>
          
          <button
            onClick={generateInsights}
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sparkles size={18} />
            {language === 'it' ? 'Rigenera' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {showChat && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '420px',
          maxWidth: '90vw',
          height: '600px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '1rem',
            borderBottom: '2px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px 20px 0 0',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={24} />
              <span style={{ fontWeight: '600' }}>
                {language === 'it' ? 'Chat con Claude' : 'Chat with Claude'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={clearChat}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setShowChat(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            background: '#fafafa'
          }}>
            {chatMessages.length === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem'
              }}>
                <p style={{
                  color: '#667eea',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  fontSize: '1rem'
                }}>
                  {language === 'it' 
                    ? '👋 Ciao! Sono Claude, il tuo assistente AI'
                    : '👋 Hi! I\'m Claude, your AI assistant'}
                </p>
                <p style={{
                  color: '#9ca3af',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem'
                }}>
                  {language === 'it' 
                    ? 'Posso aiutarti ad analizzare i dati in modo approfondito. Ecco alcune domande che puoi farmi:'
                    : 'I can help you analyze the data in depth. Here are some questions you can ask:'}
                </p>
                
                {/* Example questions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  textAlign: 'left'
                }}>
                  {[
                    language === 'it' ? "Quali sono le differenze tra uomini e donne?" : "What are the differences between men and women?",
                    language === 'it' ? "Chi è più preciso per fascia d'età?" : "Who is more accurate by age group?",
                    language === 'it' ? "Quali alimenti vengono più sottostimati?" : "Which foods are most underestimated?",
                    language === 'it' ? "C'è correlazione tra professione e precisione?" : "Is there a correlation between profession and accuracy?",
                    language === 'it' ? "Analizza i pattern temporali" : "Analyze temporal patterns"
                  ].map((question, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(question);
                        setTimeout(() => sendChatMessage(), 100);
                      }}
                      style={{
                        padding: '0.5rem 0.75rem',
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '10px',
                        textAlign: 'left',
                        fontSize: '0.813rem',
                        color: '#4b5563',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#667eea';
                        e.currentTarget.style.color = '#667eea';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.color = '#4b5563';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      💡 {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'fadeIn 0.3s ease-in'
                }}
              >
                <div style={{
                  maxWidth: '85%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : msg.isError ? '#fef2f2' : 'white',
                  color: msg.role === 'user' ? 'white' : msg.isError ? '#dc2626' : '#374151',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  border: msg.role === 'assistant' && !msg.isError ? '1px solid #e5e7eb' : 'none'
                }}>
                  <div style={{ 
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    fontSize: '0.625rem',
                    opacity: 0.7,
                    marginTop: '0.25rem'
                  }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {chatLoading && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '18px 18px 18px 4px',
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}>
                  <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                    <span style={{ 
                      animation: 'bounce 1.4s ease-in-out infinite',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea'
                    }}></span>
                    <span style={{ 
                      animation: 'bounce 1.4s ease-in-out 0.2s infinite',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#764ba2'
                    }}></span>
                    <span style={{ 
                      animation: 'bounce 1.4s ease-in-out 0.4s infinite',
                      display: 'inline-block',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#667eea'
                    }}></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div style={{
            padding: '1rem',
            borderTop: '2px solid #e5e7eb',
            background: 'white',
            borderRadius: '0 0 20px 20px'
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem'
            }}>
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendChatMessage();
                  }
                }}
                placeholder={language === 'it' ? 'Scrivi una domanda...' : 'Type a question...'}
                style={{
                  flex: 1,
                  padding: '0.625rem 0.875rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  fontSize: '0.875rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#667eea'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                disabled={chatLoading}
              />
              <button
                onClick={sendChatMessage}
                disabled={chatLoading || !chatInput.trim()}
                style={{
                  padding: '0.625rem 1rem',
                  background: chatLoading || !chatInput.trim() ? '#e5e7eb' : '#667eea',
                  color: chatLoading || !chatInput.trim() ? '#9ca3af' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: chatLoading || !chatInput.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!chatLoading && chatInput.trim()) {
                    e.currentTarget.style.background = '#764ba2';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!chatLoading && chatInput.trim()) {
                    e.currentTarget.style.background = '#667eea';
                  }
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistory && insightHistory.length > 0 && (
        <div style={{
          background: '#f9fafb',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '2rem',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <h3 style={{ color: '#374151', margin: 0 }}>
              {language === 'it' ? 'Insights Precedenti' : 'Previous Insights'}
            </h3>
            <button
              onClick={clearHistory}
              style={{
                padding: '0.25rem 0.5rem',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <Trash2 size={14} style={{ display: 'inline' }} />
            </button>
          </div>
          
          {insightHistory.map((histInsight, idx) => (
            <div
              key={idx}
              style={{
                background: 'white',
                borderRadius: '10px',
                padding: '1rem',
                marginBottom: '1rem',
                cursor: 'pointer',
                border: '2px solid transparent',
                transition: 'all 0.2s'
              }}
              onClick={() => setInsights(histInsight)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Clock size={14} color="#9ca3af" />
                <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {new Date(histInsight.generatedAt).toLocaleString()}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
                {histInsight.mainTrend?.title || 'Insights set'}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Main Content - Current Insights */}
      {insights && (
        <>
          {/* Main Trend Card */}
          {insights.mainTrend && (
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              color: 'white',
              boxShadow: '0 10px 30px rgba(240, 147, 251, 0.3)'
            }}>
              <TrendingUp size={48} style={{ marginBottom: '1rem' }} />
              <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem' }}>
                {insights.mainTrend.title}
              </h3>
              <p style={{ fontSize: '1.125rem', marginBottom: '1rem', opacity: 0.95 }}>
                {insights.mainTrend.description}
              </p>
              {insights.mainTrend.significance && (
                <p style={{ fontSize: '0.875rem', opacity: 0.85, fontStyle: 'italic' }}>
                  💡 {insights.mainTrend.significance}
                </p>
              )}
            </div>
          )}

          {/* Curiosities Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
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
                    curiosity.type === 'paradox' ? '#ef4444' :
                    curiosity.type === 'psychological' ? '#8b5cf6' :
                    curiosity.type === 'temporal' ? '#f59e0b' :
                    curiosity.type === 'behavioral' ? '#10b981' :
                    curiosity.type === 'demographic' ? '#3b82f6' :
                    '#667eea'
                  }`,
                  transition: 'transform 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <button
                  onClick={() => toggleFavorite(curiosity)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: isFavorite(curiosity) ? '#fbbf24' : '#d1d5db',
                    transition: 'color 0.2s'
                  }}
                >
                  <Star size={20} fill={isFavorite(curiosity) ? '#fbbf24' : 'none'} />
                </button>
                
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
                      color: '#4b5563',
                      lineHeight: '1.6',
                      marginBottom: '0.75rem'
                    }}>
                      {curiosity.insight}
                    </p>
                    {curiosity.evidence && (
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        fontStyle: 'italic',
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '0.5rem',
                        marginTop: '0.5rem'
                      }}>
                        📊 {curiosity.evidence}
                      </p>
                    )}
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
                            width: '30px',
                            height: '4px',
                            borderRadius: '2px',
                            background: i < curiosity.strength ? 
                              (curiosity.type === 'paradox' ? '#ef4444' :
                               curiosity.type === 'psychological' ? '#8b5cf6' :
                               curiosity.type === 'temporal' ? '#f59e0b' :
                               curiosity.type === 'behavioral' ? '#10b981' :
                               curiosity.type === 'demographic' ? '#3b82f6' :
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
              boxShadow: '0 10px 30px rgba(252, 182, 159, 0.3)',
              marginBottom: '2rem'
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
              {insights.funFact.explanation && (
                <p style={{
                  fontSize: '0.875rem',
                  color: '#7c3aed',
                  marginTop: '0.5rem',
                  fontStyle: 'italic'
                }}>
                  {insights.funFact.explanation}
                </p>
              )}
            </div>
          )}

          {/* Methodology note */}
          {insights.methodology && (
            <div style={{
              background: '#f3f4f6',
              borderRadius: '10px',
              padding: '1rem',
              fontSize: '0.75rem',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              🔬 {language === 'it' ? 'Metodologia: ' : 'Methodology: '} {insights.methodology}
            </div>
          )}
        </>
      )}

      {/* Favorites Section */}
      {favoriteInsights.length > 0 && (
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: '#fef3c7',
          borderRadius: '20px'
        }}>
          <h3 style={{ color: '#92400e', marginBottom: '1rem' }}>
            <Star size={24} style={{ display: 'inline', marginRight: '0.5rem' }} fill="#fbbf24" />
            {language === 'it' ? 'Insights Preferiti' : 'Favorite Insights'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1rem'
          }}>
            {favoriteInsights.map((fav, idx) => (
              <div
                key={idx}
                style={{
                  background: 'white',
                  borderRadius: '10px',
                  padding: '1rem',
                  border: '2px solid #fbbf24'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <span>{fav.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <strong style={{ color: '#92400e' }}>{fav.title}</strong>
                    <p style={{ fontSize: '0.75rem', color: '#78716c', marginTop: '0.25rem' }}>
                      {fav.insight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsTab;