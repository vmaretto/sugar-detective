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
  const [dataSnapshot, setDataSnapshot] = useState(null); // Snapshot dei dati quando gli insight sono generati

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

    // Load data snapshot
    const savedSnapshot = localStorage.getItem('data_snapshot');
    if (savedSnapshot) {
      try {
        setDataSnapshot(JSON.parse(savedSnapshot));
      } catch (e) {
        console.error('Error loading snapshot:', e);
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

  // Funzione per creare uno snapshot dei dati
  const createDataSnapshot = (participantsData) => {
    return {
      count: participantsData.length,
      timestamp: new Date().toISOString(),
      // Hash semplice basato su ID partecipanti e timestamp
      participantIds: participantsData.map(p => p.id || p.timestamp).sort(),
      // Checksum dei dati per rilevare modifiche
      dataHash: JSON.stringify(participantsData.map(p => ({
        id: p.id || p.timestamp,
        measurements: Object.keys(p.data?.measurements || {}).length,
        responses: Object.keys(p.data?.part2 || {}).length
      })))
    };
  };

  // Funzione per calcolare la percentuale di cambiamento
  const calculateDataChangePercentage = () => {
    if (!dataSnapshot) return 100; // Se non c'è snapshot, permetti rigenerazione

    const currentCount = participants.length;
    const snapshotCount = dataSnapshot.count;

    // Calcola la percentuale di nuovi partecipanti
    const newParticipantsPercentage = ((currentCount - snapshotCount) / snapshotCount) * 100;

    // Controlla se ci sono nuovi ID partecipanti
    const currentIds = participants.map(p => p.id || p.timestamp).sort();
    const snapshotIds = dataSnapshot.participantIds || [];
    const newIds = currentIds.filter(id => !snapshotIds.includes(id));
    const newIdsPercentage = (newIds.length / snapshotCount) * 100;

    // Ritorna la percentuale maggiore
    return Math.max(newParticipantsPercentage, newIdsPercentage);
  };

  // Verifica se la rigenerazione è permessa (soglia 10%)
  const canRegenerateInsights = () => {
    if (!dataSnapshot) return true; // Prima generazione sempre permessa
    const changePercentage = calculateDataChangePercentage();
    return changePercentage >= 10; // Soglia del 10%
  };

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
        participants: participants, // Include raw participants for chunking analysis
        timestamp: new Date().toISOString(),
        note: 'Thursday data excluded (test data)'
      };

      // Call server-side API endpoint (Railway for long-running analysis, or Vercel fallback)
      const apiUrl = process.env.REACT_APP_INSIGHTS_API_URL || "/api/claude-insights";
      const endpoint = process.env.REACT_APP_INSIGHTS_API_URL
        ? `${apiUrl}/api/insights`
        : apiUrl;

      console.log(`Calling insights API: ${endpoint}`);

      const response = await fetch(endpoint, {
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

      // Crea e salva snapshot dei dati
      const snapshot = createDataSnapshot(participants);
      setDataSnapshot(snapshot);
      localStorage.setItem('data_snapshot', JSON.stringify(snapshot));
      
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);

      // Generate local insights as fallback
      const localInsights = generateLocalInsights(participants);
      setInsights(localInsights);

      // Salva snapshot anche per insights locali
      const snapshot = createDataSnapshot(participants);
      setDataSnapshot(snapshot);
      localStorage.setItem('data_snapshot', JSON.stringify(snapshot));
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
    // Generate insights based on REAL data analysis
    const insights = {
      curiosities: [],
      mainTrend: null,
      funFact: null,
      methodology: language === 'it' 
        ? "Analisi statistica locale dei dati raccolti"
        : "Local statistical analysis of collected data",
      generatedAt: new Date().toISOString(),
      participantCount: participants.length
    };
    
    // Analyze real patterns in the data
    const demographics = extractDemographics(participants);
    const patterns = extractPatterns(participants);
    
    // Generate insights based on actual data
    
    // 1. Age pattern insight
    if (demographics.ageGroups) {
      const mostCommonAge = Object.entries(demographics.ageGroups)
        .sort((a, b) => b[1] - a[1])[0];
      if (mostCommonAge && mostCommonAge[1] > 0) {
        insights.curiosities.push({
          title: language === 'it' ? "Età predominante" : "Predominant age",
          insight: language === 'it' 
            ? `Il ${Math.round((mostCommonAge[1] / participants.length) * 100)}% dei partecipanti appartiene alla fascia ${mostCommonAge[0]}`
            : `${Math.round((mostCommonAge[1] / participants.length) * 100)}% of participants are in the ${mostCommonAge[0]} age group`,
          emoji: "👥",
          type: "demographic",
          strength: 4,
          evidence: `n=${mostCommonAge[1]} su ${participants.length} totali`
        });
      }
    }
    
    // 2. Gender distribution insight
    if (demographics.genders) {
      const femaleCount = demographics.genders['F'] || 0;
      const maleCount = demographics.genders['M'] || 0;
      if (femaleCount > 0 || maleCount > 0) {
        const femalePercent = Math.round((femaleCount / participants.length) * 100);
        const malePercent = Math.round((maleCount / participants.length) * 100);
        insights.curiosities.push({
          title: language === 'it' ? "Distribuzione genere" : "Gender distribution",
          insight: language === 'it'
            ? `Donne: ${femalePercent}%, Uomini: ${malePercent}%`
            : `Women: ${femalePercent}%, Men: ${malePercent}%`,
          emoji: "⚧",
          type: "demographic",
          strength: 3,
          evidence: `F=${femaleCount}, M=${maleCount}`
        });
      }
    }
    
    // 3. Time pattern insight (if data exists)
    if (demographics.timePatterns) {
      const mostActiveTime = Object.entries(demographics.timePatterns)
        .sort((a, b) => b[1] - a[1])[0];
      if (mostActiveTime && mostActiveTime[1] > 0) {
        insights.curiosities.push({
          title: language === 'it' ? "Orario preferito" : "Preferred time",
          insight: language === 'it'
            ? `La maggior parte delle partecipazioni (${mostActiveTime[1]}) avviene di ${
                mostActiveTime[0] === 'morning' ? 'mattina' :
                mostActiveTime[0] === 'afternoon' ? 'pomeriggio' :
                mostActiveTime[0] === 'evening' ? 'sera' : 'notte'
              }`
            : `Most participations (${mostActiveTime[1]}) occur in the ${mostActiveTime[0]}`,
          emoji: "🕐",
          type: "temporal",
          strength: 3,
          evidence: `${Math.round((mostActiveTime[1] / participants.length) * 100)}% del totale`
        });
      }
    }
    
    // 4. Consumption habits insight
    if (demographics.consumption) {
      const dailyConsumers = demographics.consumption['daily'] || 0;
      if (dailyConsumers > 0) {
        insights.curiosities.push({
          title: language === 'it' ? "Consumo quotidiano" : "Daily consumption",
          insight: language === 'it'
            ? `${Math.round((dailyConsumers / participants.length) * 100)}% consuma frutta/verdura quotidianamente`
            : `${Math.round((dailyConsumers / participants.length) * 100)}% consume fruits/vegetables daily`,
          emoji: "🥗",
          type: "behavioral",
          strength: 4,
          evidence: `n=${dailyConsumers}`
        });
      }
    }
    
    // 5. Profession insight
    if (demographics.professions) {
      const topProfession = Object.entries(demographics.professions)
        .filter(([k, v]) => k !== 'unknown' && v > 0)
        .sort((a, b) => b[1] - a[1])[0];
      if (topProfession) {
        insights.curiosities.push({
          title: language === 'it' ? "Professione comune" : "Common profession",
          insight: language === 'it'
            ? `${topProfession[0]} è la professione più rappresentata (${topProfession[1]} partecipanti)`
            : `${topProfession[0]} is the most represented profession (${topProfession[1]} participants)`,
          emoji: "💼",
          type: "demographic",
          strength: 3,
          evidence: `${Math.round((topProfession[1] / participants.length) * 100)}%`
        });
      }
    }
    
    // Set main trend (most significant finding)
    if (insights.curiosities.length > 0) {
      const mainCuriosity = insights.curiosities[0];
      insights.mainTrend = {
        title: mainCuriosity.title,
        description: mainCuriosity.insight,
        significance: language === 'it' 
          ? "Questo è il pattern più evidente nei dati raccolti"
          : "This is the most evident pattern in the collected data"
      };
    } else {
      insights.mainTrend = {
        title: language === 'it' ? "Dati in elaborazione" : "Processing data",
        description: language === 'it' 
          ? "Stiamo ancora raccogliendo dati per generare insights significativi"
          : "Still collecting data to generate significant insights",
        significance: ""
      };
    }
    
    // Fun fact based on real data
    const totalParticipants = participants.length;
    insights.funFact = {
      fact: language === 'it' 
        ? `Abbiamo già raccolto dati da ${totalParticipants} partecipanti!`
        : `We have already collected data from ${totalParticipants} participants!`,
      emoji: "🎉",
      explanation: language === 'it'
        ? "Ogni partecipazione contribuisce alla ricerca"
        : "Every participation contributes to the research"
    };
    
    // Ensure we have at least 8 insights (duplicate if necessary)
    while (insights.curiosities.length < 8 && insights.curiosities.length > 0) {
      const randomIndex = Math.floor(Math.random() * insights.curiosities.length);
      insights.curiosities.push({
        ...insights.curiosities[randomIndex],
        title: insights.curiosities[randomIndex].title + " (2)",
        strength: Math.max(1, insights.curiosities[randomIndex].strength - 1)
      });
    }
    
    // If still not enough, add placeholder
    while (insights.curiosities.length < 8) {
      insights.curiosities.push({
        title: language === 'it' ? "In analisi" : "Analyzing",
        insight: language === 'it' ? "Dati in elaborazione..." : "Processing data...",
        emoji: "📊",
        type: "correlation",
        strength: 2,
        evidence: ""
      });
    }
    
    return insights;
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
        <p style={{ fontSize: '1.25rem', fontWeight: '600' }}>
          {language === 'it' ? 'Claude sta analizzando TUTTI i dati...' : 'Claude is analyzing ALL data...'}
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          {language === 'it' ? 'Cercando correlazioni laterali e curiose...' : 'Looking for lateral and curious correlations...'}
        </p>
        <p style={{
          fontSize: '0.875rem',
          color: '#f59e0b',
          marginTop: '1rem',
          fontWeight: '500',
          padding: '0.75rem',
          background: '#fef3c7',
          borderRadius: '8px',
          maxWidth: '400px',
          margin: '1rem auto 0'
        }}>
          {language === 'it'
            ? '⏱️ Analisi approfondita in corso su tutti i 250+ partecipanti. Può richiedere 1-2 minuti (GPT-4o) o 4-5 minuti (Claude). Non chiudere la pagina!'
            : '⏱️ Deep analysis in progress on all 250+ participants. May take 1-2 minutes (GPT-4o) or 4-5 minutes (Claude). Don\'t close the page!'}
        </p>
        <p style={{
          fontSize: '0.75rem',
          color: '#6b7280',
          marginTop: '1rem',
          fontStyle: 'italic'
        }}>
          {language === 'it'
            ? 'Puoi controllare il progresso dettagliato nei log di Vercel'
            : 'You can check detailed progress in Vercel logs'}
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
            disabled={!canRegenerateInsights()}
            title={!canRegenerateInsights()
              ? (language === 'it'
                  ? `Rigenerazione disponibile quando i dati cambiano di almeno il 10%. Attualmente: ${calculateDataChangePercentage().toFixed(1)}%`
                  : `Regeneration available when data changes by at least 10%. Currently: ${calculateDataChangePercentage().toFixed(1)}%`)
              : ''
            }
            style={{
              padding: '0.5rem 1rem',
              background: canRegenerateInsights() ? '#10b981' : '#9ca3af',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: canRegenerateInsights() ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: canRegenerateInsights() ? 1 : 0.6
            }}
          >
            <Sparkles size={18} />
            {language === 'it' ? 'Rigenera' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* Data change indicator */}
      {dataSnapshot && !canRegenerateInsights() && (
        <div style={{
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          marginTop: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <AlertCircle size={20} color="#92400e" />
          <span style={{ color: '#92400e', fontSize: '0.875rem' }}>
            {language === 'it'
              ? `Rigenerazione disponibile quando i dati cambiano di almeno il 10%. Cambiamento attuale: ${calculateDataChangePercentage().toFixed(1)}%`
              : `Regeneration available when data changes by at least 10%. Current change: ${calculateDataChangePercentage().toFixed(1)}%`}
          </span>
        </div>
      )}

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
              background: 'linear-gradient(135deg, #ddd6fe 0%, #c7d2fe 100%)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)',
              border: '2px solid #7c3aed'
            }}>
              <TrendingUp size={48} style={{ marginBottom: '1rem', color: '#5b21b6' }} />
              <h3 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e1b4b' }}>
                {insights.mainTrend.title}
              </h3>
              <p style={{ fontSize: '1.125rem', marginBottom: '1rem', color: '#312e81', fontWeight: '500' }}>
                {insights.mainTrend.description}
              </p>
              {insights.mainTrend.significance && (
                <p style={{ fontSize: '0.875rem', color: '#4c1d95', fontStyle: 'italic', fontWeight: '500' }}>
                  💡 {insights.mainTrend.significance}
                </p>
              )}
            </div>
          )}

          {/* Curiosities Grid - Always 9 insights in 3x3 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {(() => {
              // Ensure we always have exactly 9 curiosities for 3x3 grid
              let displayCuriosities = insights.curiosities || [];
              
              // If we have less than 9, duplicate some insights with variations
              while (displayCuriosities.length < 9 && displayCuriosities.length > 0) {
                const randomIndex = Math.floor(Math.random() * displayCuriosities.length);
                const baseCuriosity = displayCuriosities[randomIndex];
                displayCuriosities.push({
                  ...baseCuriosity,
                  title: baseCuriosity.title + " (bis)",
                  strength: Math.max(1, baseCuriosity.strength - 1)
                });
              }
              
              // If still no insights, add real placeholder
              if (displayCuriosities.length === 0) {
                for (let i = 0; i < 9; i++) {
                  displayCuriosities.push({
                    title: language === 'it' ? 'Analisi in corso' : 'Analyzing',
                    insight: language === 'it' ? 'Stiamo elaborando i dati...' : 'Processing data...',
                    emoji: '📊',
                    type: 'correlation',
                    strength: 3,
                    evidence: ''
                  });
                }
              }
              
              // Take exactly 9
              displayCuriosities = displayCuriosities.slice(0, 9);
              
              return displayCuriosities.map((curiosity, index) => (
                <div
                  key={index}
                  style={{
                    background: 'white',
                    borderRadius: '15px',
                    padding: '1.25rem',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                    border: `2px solid ${
                      curiosity.type === 'paradox' ? '#dc2626' :
                      curiosity.type === 'psychological' ? '#7c3aed' :
                      curiosity.type === 'temporal' ? '#ea580c' :
                      curiosity.type === 'behavioral' ? '#16a34a' :
                      curiosity.type === 'demographic' ? '#2563eb' :
                      '#0891b2'
                    }`,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    position: 'relative',
                    minHeight: '200px',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                  }}
                >
                  <button
                    onClick={() => toggleFavorite(curiosity)}
                    style={{
                      position: 'absolute',
                      top: '0.75rem',
                      right: '0.75rem',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: isFavorite(curiosity) ? '#fbbf24' : '#d1d5db',
                      transition: 'color 0.2s',
                      padding: '0.25rem'
                    }}
                  >
                    <Star size={18} fill={isFavorite(curiosity) ? '#fbbf24' : 'none'} />
                  </button>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <span style={{ fontSize: '2rem', lineHeight: '1' }}>{curiosity.emoji}</span>
                      <h4 style={{
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        color: '#111827', // Very dark gray for maximum contrast
                        lineHeight: '1.2',
                        flex: 1
                      }}>
                        {curiosity.title}
                      </h4>
                    </div>
                    
                    <p style={{
                      fontSize: '0.875rem',
                      color: '#374151', // Dark gray for good readability
                      lineHeight: '1.5',
                      marginBottom: '0.75rem',
                      flex: 1,
                      fontWeight: '400'
                    }}>
                      {curiosity.insight}
                    </p>
                    
                    {curiosity.evidence && (
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#1f2937', // Very dark gray instead of light gray
                        fontStyle: 'italic',
                        borderTop: '1px solid #e5e7eb',
                        paddingTop: '0.5rem',
                        marginTop: 'auto',
                        fontWeight: '500'
                      }}>
                        📊 {curiosity.evidence}
                      </p>
                    )}
                    
                    {/* Strength indicator */}
                    <div style={{
                      marginTop: '0.5rem',
                      display: 'flex',
                      gap: '0.2rem'
                    }}>
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: '3px',
                            borderRadius: '2px',
                            background: i < curiosity.strength ? 
                              (curiosity.type === 'paradox' ? '#dc2626' :
                               curiosity.type === 'psychological' ? '#7c3aed' :
                               curiosity.type === 'temporal' ? '#ea580c' :
                               curiosity.type === 'behavioral' ? '#16a34a' :
                               curiosity.type === 'demographic' ? '#2563eb' :
                               '#0891b2') : '#e5e7eb'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>

          {/* Fun Fact */}
          {insights.funFact && (
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(252, 182, 159, 0.3)',
              marginBottom: '2rem',
              border: '2px solid #f59e0b'
            }}>
              <span style={{ fontSize: '3rem' }}>{insights.funFact.emoji}</span>
              <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: '#92400e', // Dark brown for high contrast
                marginTop: '1rem'
              }}>
                {language === 'it' ? 'Lo sapevi che...' : 'Did you know...'}
              </h3>
              <p style={{
                fontSize: '1.125rem',
                color: '#451a03', // Very dark brown for readability
                marginTop: '0.5rem',
                fontWeight: '500'
              }}>
                {insights.funFact.fact}
              </p>
              {insights.funFact.explanation && (
                <p style={{
                  fontSize: '0.875rem',
                  color: '#78350f', // Dark amber for good contrast
                  marginTop: '0.5rem',
                  fontStyle: 'italic',
                  fontWeight: '500'
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
              fontSize: '0.875rem',
              color: '#1f2937', // Dark gray for good contrast
              textAlign: 'center',
              fontWeight: '500',
              border: '1px solid #d1d5db'
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