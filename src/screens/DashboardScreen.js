import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Download, RefreshCw, TrendingUp } from 'lucide-react';

const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a'];

const DashboardScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

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
    } catch (err) {
      console.error('Error fetching data:', err);
      alert('Error loading data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    // Demographics
    const ageGroups = {};
    const genders = {};
    const sugarHabits = {};

    // Knowledge scores
    let totalKnowledge = 0;
    let knowledgeCount = 0;

    // Awareness scores
    let totalAwareness = 0;
    let awarenessCount = 0;

    // Estimation accuracy
    const estimations = {
      apple: [],
      cocaCola: [],
      orangeJuice: [],
      yogurt: [],
      biscuits: [],
      cerealBar: []
    };

    participants.forEach(p => {
      const data = p.data || {};
      
      // Demographics
      if (data.profile) {
        const { age, gender, sugarHabits: habits } = data.profile;
        ageGroups[age] = (ageGroups[age] || 0) + 1;
        genders[gender] = (genders[gender] || 0) + 1;
        sugarHabits[habits] = (sugarHabits[habits] || 0) + 1;
      }

      // Knowledge
      if (data.part2) {
        const k1 = parseInt(data.part2.knowledge1) || 0;
        const k2 = parseInt(data.part2.knowledge2) || 0;
        const k3 = parseInt(data.part2.knowledge3) || 0;
        totalKnowledge += (k1 + k2 + k3) / 3;
        knowledgeCount++;
      }

      // Awareness
      if (data.part4) {
        const a1 = parseInt(data.part4.awareness1) || 0;
        const a2 = parseInt(data.part4.awareness2) || 0;
        const a3 = parseInt(data.part4.awareness3) || 0;
        totalAwareness += (a1 + a2 + a3) / 3;
        awarenessCount++;
      }

      // Estimations
      if (data.measurements) {
        Object.keys(estimations).forEach(food => {
          if (data.measurements[food]) {
            estimations[food].push(parseFloat(data.measurements[food]));
          }
        });
      }
    });

    // Calculate averages
    const avgEstimations = {};
    Object.keys(estimations).forEach(food => {
      const values = estimations[food];
      if (values.length > 0) {
        avgEstimations[food] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    });

    setStats({
      totalParticipants: participants.length,
      demographics: {
        age: Object.entries(ageGroups).map(([name, value]) => ({ name, value })),
        gender: Object.entries(genders).map(([name, value]) => ({ name, value })),
        habits: Object.entries(sugarHabits).map(([name, value]) => ({ name, value }))
      },
      avgKnowledge: knowledgeCount > 0 ? (totalKnowledge / knowledgeCount).toFixed(2) : 0,
      avgAwareness: awarenessCount > 0 ? (totalAwareness / awarenessCount).toFixed(2) : 0,
      estimations: Object.entries(avgEstimations).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        estimate: parseFloat(value.toFixed(2))
      }))
    });
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Timestamp',
      'Language',
      'Age',
      'Gender',
      'Sugar Habits',
      'Knowledge Avg',
      'Awareness Avg',
      'Apple Estimate',
      'Coca Cola Estimate',
      'Orange Juice Estimate',
      'Yogurt Estimate',
      'Biscuits Estimate',
      'Cereal Bar Estimate'
    ];

    const rows = participants.map(p => {
      const data = p.data || {};
      const profile = data.profile || {};
      const part2 = data.part2 || {};
      const part4 = data.part4 || {};
      const measurements = data.measurements || {};

      const knowledgeAvg = part2.knowledge1 && part2.knowledge2 && part2.knowledge3
        ? ((parseInt(part2.knowledge1) + parseInt(part2.knowledge2) + parseInt(part2.knowledge3)) / 3).toFixed(2)
        : '';

      const awarenessAvg = part4.awareness1 && part4.awareness2 && part4.awareness3
        ? ((parseInt(part4.awareness1) + parseInt(part4.awareness2) + parseInt(part4.awareness3)) / 3).toFixed(2)
        : '';

      return [
        p.timestamp,
        p.language,
        profile.age || '',
        profile.gender || '',
        profile.sugarHabits || '',
        knowledgeAvg,
        awarenessAvg,
        measurements.apple || '',
        measurements.cocaCola || '',
        measurements.orangeJuice || '',
        measurements.yogurt || '',
        measurements.biscuits || '',
        measurements.cerealBar || ''
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
                Real-time data analysis
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
        </div>

        {/* Stats Cards */}
        {stats && (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <Users size={32} style={{ color: '#667eea', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#667eea' }}>
                  {stats.totalParticipants}
                </div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>Total Participants</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <TrendingUp size={32} style={{ color: '#10b981', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.avgKnowledge}/5
                </div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>Avg Knowledge Score</div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <TrendingUp size={32} style={{ color: '#f59e0b', margin: '0 auto 0.5rem' }} />
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {stats.avgAwareness}/5
                </div>
                <div style={{ color: '#666', fontSize: '0.875rem' }}>Avg Awareness Score</div>
              </div>
            </div>

            {/* Charts */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
              gap: '2rem'
            }}>
              {/* Age Distribution */}
              {stats.demographics.age.length > 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Age Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.demographics.age}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {stats.demographics.age.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Estimations Accuracy */}
              {stats.estimations.length > 0 && (
                <div style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '2rem',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                }}>
                  <h3 style={{ marginBottom: '1rem', color: '#667eea' }}>Avg Sugar Estimations (vs Apple)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={stats.estimations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="estimate" fill="#667eea" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        )}

        {/* No Data */}
        {!stats && !loading && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '3rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <p style={{ fontSize: '1.25rem', color: '#666' }}>
              No data available yet. Start collecting responses!
            </p>
          </div>
        )}

        {/* Back Button */}
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '1rem 2rem',
              background: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardScreen;
