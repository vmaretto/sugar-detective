import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, useTranslation as useI18n } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Download, RefreshCw, TrendingUp, Trophy, Brain, BarChart3 } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import InsightsTab from '../components/InsightsTab';
import { generateRanking } from '../utils/rankingUtils';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fbbf24', '#ef4444'];

const DashboardScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('leaderboard'); // 'leaderboard', 'stats', 'insights'

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (participants.length > 0) {
      calculateStats();
    }
  }, [participants]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/participants');
      
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      
      const data = await response.json();
      setParticipants(data);
      
      // Generate ranking
      const rankedData = generateRanking(data);
      setRanking(rankedData);
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Initialize data structures with proper grouping
    const ageGroups = {
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55+': 0
    };
    
    const genders = {
      'M': 0,
      'F': 0,
      'Other': 0
    };
    
    const professionGroups = {
      'student': 0,
      'employee': 0,
      'entrepreneur': 0,
      'healthcare': 0,
      'teacher': 0,
      'retired': 0,
      'other': 0
    };
    
    const consumptionHabits = {
      'daily': 0,
      'weekly': 0,
      'rarely': 0
    };

    // Scores tracking
    let totalKnowledgeScore = 0;
    let totalAwarenessScore = 0;
    let scoreCount = 0;

    // Time patterns
    const timeOfDay = {
      'morning': [],
      'afternoon': [],
      'evening': [],
      'night': []
    };

    // Day of week patterns
    const dayOfWeek = {
      'Monday': [],
      'Tuesday': [],
      'Wednesday': [],
      'Thursday': [],
      'Friday': [],
      'Saturday': [],
      'Sunday': []
    };

    participants.forEach(p => {
      const data = p.data || {};
      const timestamp = new Date(p.timestamp);
      
      // Demographics
      if (data.profile) {
        const { age, gender, profession, consumption } = data.profile;
        
        // Group ages into ranges
        const ageNum = parseInt(age);
        if (ageNum < 25) ageGroups['18-24']++;
        else if (ageNum < 35) ageGroups['25-34']++;
        else if (ageNum < 45) ageGroups['35-44']++;
        else if (ageNum < 55) ageGroups['45-54']++;
        else ageGroups['55+']++;
        
        // Gender grouping
        if (gender) {
          genders[gender] = (genders[gender] || 0) + 1;
        }
        
        // Profession grouping (combine similar ones)
        if (profession) {
          if (profession === 'consultant') {
            professionGroups['employee']++;
          } else if (profession === 'researcher') {
            professionGroups['healthcare']++;
          } else if (profession === 'homemaker') {
            professionGroups['other']++;
          } else if (professionGroups[profession] !== undefined) {
            professionGroups[profession]++;
          } else {
            professionGroups['other']++;
          }
        }
        
        // Consumption habits
        if (consumption && consumptionHabits[consumption] !== undefined) {
          consumptionHabits[consumption]++;
        }
      }

      // Time patterns
      const hour = timestamp.getHours();
      let timeSlot;
      if (hour >= 6 && hour < 12) timeSlot = 'morning';
      else if (hour >= 12 && hour < 18) timeSlot = 'afternoon';
      else if (hour >= 18 && hour < 24) timeSlot = 'evening';
      else timeSlot = 'night';
      
      // Day patterns
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[timestamp.getDay()];
      
      // Track scores by time/day (if we have scores from ranking)
      const participantRanking = ranking.find(r => r.id === p.id);
      if (participantRanking) {
        if (participantRanking.totalScore) {
          timeOfDay[timeSlot].push(participantRanking.totalScore);
          dayOfWeek[dayName].push(participantRanking.totalScore);
        }
        
        if (participantRanking.knowledgeScore) {
          totalKnowledgeScore += participantRanking.knowledgeScore;
          scoreCount++;
        }
        
        if (participantRanking.awarenessScore) {
          totalAwarenessScore += participantRanking.awarenessScore;
        }
      }
    });

    // Calculate averages for time patterns
    Object.keys(timeOfDay).forEach(key => {
      const scores = timeOfDay[key];
      timeOfDay[key] = scores.length > 0 
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

    Object.keys(dayOfWeek).forEach(key => {
      const scores = dayOfWeek[key];
      dayOfWeek[key] = scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : 0;
    });

    // Format data for charts
    const formatDataForChart = (obj, nameKey = 'name') => {
      return Object.entries(obj).map(([key, value]) => ({
        [nameKey]: key,
        value: value,
        percentage: participants.length > 0 ? ((value / participants.length) * 100).toFixed(1) : 0
      }));
    };

    setStats({
      totalParticipants: participants.length,
      demographics: {
        age: formatDataForChart(ageGroups, 'ageGroup'),
        gender: formatDataForChart(genders, 'gender'),
        profession: formatDataForChart(professionGroups, 'profession'),
        consumption: formatDataForChart(consumptionHabits, 'habit')
      },
      avgKnowledgeScore: scoreCount > 0 ? (totalKnowledgeScore / scoreCount).toFixed(1) : 0,
      avgAwarenessScore: scoreCount > 0 ? (totalAwarenessScore / scoreCount).toFixed(1) : 0,
      avgTotalScore: ranking.length > 0 
        ? (ranking.reduce((sum, p) => sum + (p.totalScore || 0), 0) / ranking.length).toFixed(1)
        : 0,
      timePatterns: formatDataForChart(timeOfDay, 'timeSlot'),
      dayPatterns: formatDataForChart(dayOfWeek, 'day')
    });
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'ID',
      'Timestamp',
      'Language',
      'Age Group',
      'Gender',
      'Profession',
      'Consumption',
      'Total Score',
      'Knowledge Score',
      'Awareness Score',
      'Rank'
    ];

    const rows = ranking.map(p => {
      const profile = p.profile || {};
      const age = parseInt(profile.age);
      let ageGroup = '';
      if (age < 25) ageGroup = '18-24';
      else if (age < 35) ageGroup = '25-34';
      else if (age < 45) ageGroup = '35-44';
      else if (age < 55) ageGroup = '45-54';
      else ageGroup = '55+';
      
      return [
        p.id,
        p.timestamp,
        p.language || 'it',
        ageGroup,
        profile.gender || '',
        profile.profession || '',
        profile.consumption || '',
        p.totalScore || 0,
        p.knowledgeScore || 0,
        p.awarenessScore || 0,
        p.rank || ''
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sugar-detective-dashboard-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <RefreshCw size={48} style={{ margin: '0 auto 1rem', animation: 'spin 1s linear infinite' }} />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: '#667eea',
                marginBottom: '0.5rem'
              }}>
                📊 Sugar Detective Dashboard
              </h1>
              <p style={{ color: '#666', fontSize: '1rem' }}>
                {participants.length} {i18n.language === 'it' ? 'partecipanti totali' : 'total participants'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={fetchData}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                <RefreshCw size={20} />
                Refresh
              </button>

              <button
                onClick={handleExportCSV}
                disabled={!stats}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: stats ? '#667eea' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: stats ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                <Download size={20} />
                Export CSV
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginTop: '2rem',
            borderTop: '2px solid #e5e7eb',
            paddingTop: '1rem'
          }}>
            <button
              onClick={() => setActiveTab('leaderboard')}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === 'leaderboard' ? '#667eea' : 'transparent',
                color: activeTab === 'leaderboard' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Trophy size={20} />
              {i18n.language === 'it' ? 'Classifica' : 'Leaderboard'}
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === 'stats' ? '#667eea' : 'transparent',
                color: activeTab === 'stats' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <BarChart3 size={20} />
              {i18n.language === 'it' ? 'Statistiche' : 'Statistics'}
            </button>

            <button
              onClick={() => setActiveTab('insights')}
              style={{
                padding: '0.75rem 1.5rem',
                background: activeTab === 'insights' ? '#667eea' : 'transparent',
                color: activeTab === 'insights' ? 'white' : '#667eea',
                border: '2px solid #667eea',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
            >
              <Brain size={20} />
              {i18n.language === 'it' ? 'Insights AI' : 'AI Insights'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          minHeight: '500px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          {/* Leaderboard Tab */}
          {activeTab === 'leaderboard' && (
            <div style={{ padding: '2rem' }}>
              <Leaderboard ranking={ranking} language={i18n.language} />
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && stats && (
            <div style={{ padding: '2rem' }}>
              {/* Key Metrics Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Users size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {stats.totalParticipants}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {i18n.language === 'it' ? 'Partecipanti Totali' : 'Total Participants'}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Trophy size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {stats.avgTotalScore}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {i18n.language === 'it' ? 'Punteggio Medio' : 'Average Score'}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <Brain size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {stats.avgKnowledgeScore}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {i18n.language === 'it' ? 'Conoscenza Media' : 'Avg Knowledge'}
                  </div>
                </div>

                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  color: 'white',
                  textAlign: 'center'
                }}>
                  <TrendingUp size={32} style={{ margin: '0 auto 0.5rem' }} />
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    {stats.avgAwarenessScore}
                  </div>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                    {i18n.language === 'it' ? 'Consapevolezza Media' : 'Avg Awareness'}
                  </div>
                </div>
              </div>

              {/* Demographics Charts */}
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#667eea', 
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                {i18n.language === 'it' ? '📊 Analisi Demografiche' : '📊 Demographic Analysis'}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
              }}>
                {/* Age Distribution */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                    {i18n.language === 'it' ? '👥 Distribuzione per Età' : '👥 Age Distribution'}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.demographics.age}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} (${((value/stats.totalParticipants)*100).toFixed(1)}%)`, 'Partecipanti']} />
                      <Bar dataKey="value" fill="#667eea" radius={[8, 8, 0, 0]}>
                        {stats.demographics.age.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Gender Distribution */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                    {i18n.language === 'it' ? '⚧ Distribuzione per Genere' : '⚧ Gender Distribution'}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.demographics.gender}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ gender, percentage }) => `${gender}: ${percentage}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.demographics.gender.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Profession Distribution */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                    {i18n.language === 'it' ? '💼 Distribuzione per Professione' : '💼 Profession Distribution'}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.demographics.profession} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="profession" type="category" />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Consumption Habits */}
                <div style={{
                  background: '#f9fafb',
                  borderRadius: '15px',
                  padding: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                }}>
                  <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                    {i18n.language === 'it' ? '🥗 Abitudini di Consumo' : '🥗 Consumption Habits'}
                  </h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.demographics.consumption}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ habit, percentage }) => `${habit}: ${percentage}%`}
                        outerRadius={80}
                        fill="#10b981"
                        dataKey="value"
                      >
                        {stats.demographics.consumption.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Temporal Patterns */}
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold', 
                color: '#667eea', 
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                {i18n.language === 'it' ? '⏰ Pattern Temporali' : '⏰ Temporal Patterns'}
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '2rem'
              }}>
                {/* Time of Day Performance */}
                {stats.timePatterns && stats.timePatterns.length > 0 && (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                      {i18n.language === 'it' ? '🌅 Performance per Ora del Giorno' : '🌅 Performance by Time of Day'}
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.timePatterns}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeSlot" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, 'Punteggio Medio']} />
                        <Bar dataKey="value" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Day of Week Performance */}
                {stats.dayPatterns && stats.dayPatterns.length > 0 && (
                  <div style={{
                    background: '#f9fafb',
                    borderRadius: '15px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}>
                    <h4 style={{ marginBottom: '1rem', color: '#667eea' }}>
                      {i18n.language === 'it' ? '📅 Performance per Giorno' : '📅 Performance by Day'}
                    </h4>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={stats.dayPatterns}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" angle={-45} textAnchor="end" height={80} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}`, 'Punteggio Medio']} />
                        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div style={{
                marginTop: '3rem',
                padding: '2rem',
                background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                borderRadius: '15px',
                border: '2px solid #667eea'
              }}>
                <h4 style={{
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  color: '#667eea',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  {i18n.language === 'it' ? '📈 Riepilogo Statistiche' : '📈 Statistics Summary'}
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      {i18n.language === 'it' ? 'Età Media' : 'Average Age'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                      {(() => {
                        let totalAge = 0;
                        let count = 0;
                        participants.forEach(p => {
                          if (p.data?.profile?.age) {
                            totalAge += parseInt(p.data.profile.age);
                            count++;
                          }
                        });
                        return count > 0 ? Math.round(totalAge / count) : 'N/A';
                      })()}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      {i18n.language === 'it' ? 'Top Score' : 'Top Score'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {ranking[0]?.totalScore || 0}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      {i18n.language === 'it' ? 'Partecipazioni Oggi' : 'Participations Today'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {(() => {
                        const today = new Date().toDateString();
                        return participants.filter(p => 
                          new Date(p.timestamp).toDateString() === today
                        ).length;
                      })()}
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.25rem' }}>
                      {i18n.language === 'it' ? 'Tasso Completamento' : 'Completion Rate'}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                      {(() => {
                        const completed = participants.filter(p => 
                          p.data?.measurements && Object.keys(p.data.measurements).length > 0
                        ).length;
                        return participants.length > 0 
                          ? `${((completed / participants.length) * 100).toFixed(0)}%`
                          : '0%';
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <InsightsTab participants={participants} language={i18n.language} />
          )}
        </div>

        {/* Back Button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '1rem 2rem',
              background: 'white',
              color: '#667eea',
              border: '2px solid white',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ← {i18n.language === 'it' ? 'Torna alla Home' : 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;