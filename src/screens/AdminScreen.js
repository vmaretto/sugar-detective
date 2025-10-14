import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, useTranslation as useI18n } from 'react-i18next';
import { Download, Trash2, RefreshCw, Settings } from 'lucide-react';
import Leaderboard from '../components/Leaderboard';
import { generateRanking } from '../utils/rankingUtils';

const AdminScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/participants');
      
      if (!response.ok) {
        throw new Error('Failed to fetch participants');
      }
      
      const data = await response.json();
      setParticipants(data);
      
      // Generate ranking
      const rankedData = generateRanking(data);
      setRanking(rankedData);
      
      setError(null);
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (participants.length === 0) {
      alert(t('admin.noData'));
      return;
    }

    // Prepare CSV headers
    const headers = [
      'Timestamp',
      'Language',
      'Age',
      'Gender',
      'Sugar Habits',
      'Knowledge Q1',
      'Knowledge Q2',
      'Knowledge Q3',
      'Awareness Q1',
      'Awareness Q2',
      'Awareness Q3',
      'Post-test Response',
      'Apple Estimate',
      'Coca Cola Estimate',
      'Orange Juice Estimate',
      'Yogurt Estimate',
      'Biscuits Estimate',
      'Cereal Bar Estimate'
    ];

    // Prepare CSV rows
    const rows = participants.map(p => {
      const profile = p.data?.profile || {};
      const part2 = p.data?.part2 || {};
      const measurements = p.data?.measurements || {};
      const part4 = p.data?.part4 || {};
      const part5 = p.data?.part5 || {};

      return [
        p.timestamp,
        p.language,
        profile.age || '',
        profile.gender || '',
        profile.sugarHabits || '',
        part2.knowledge1 || '',
        part2.knowledge2 || '',
        part2.knowledge3 || '',
        part4.awareness1 || '',
        part4.awareness2 || '',
        part4.awareness3 || '',
        part5.postTestResponse || '',
        measurements.apple || '',
        measurements.cocaCola || '',
        measurements.orangeJuice || '',
        measurements.yogurt || '',
        measurements.biscuits || '',
        measurements.cerealBar || ''
      ];
    });

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `sugar-detective-data-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm(t('admin.confirmDelete'))) {
      return;
    }

    try {
      const response = await fetch('/api/participants', {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete data');
      }

      alert(t('admin.deleteSuccess'));
      fetchParticipants();
    } catch (err) {
      console.error('Error deleting data:', err);
      alert(t('admin.deleteError'));
    }
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
          <RefreshCw size={48} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
          <p>{t('admin.loading')}</p>
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
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
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
              {t('admin.title')}
            </h1>
            <p style={{ color: '#666' }}>
              {t('admin.totalParticipants')}: {participants.length}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={fetchParticipants}
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
              {t('admin.refresh')}
            </button>

            <button
              onClick={() => navigate('/config')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#f59e0b',
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
              <Settings size={20} />
              Configurazione
            </button>

            <button
              onClick={handleExportCSV}
              disabled={participants.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: participants.length === 0 ? '#ccc' : '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: participants.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <Download size={20} />
              {t('admin.exportCSV')}
            </button>

            <button
              onClick={handleDeleteAll}
              disabled={participants.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: participants.length === 0 ? '#ccc' : '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: participants.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              <Trash2 size={20} />
              {t('admin.deleteAll')}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee2e2',
            border: '2px solid #ef4444',
            borderRadius: '10px',
            marginBottom: '1rem',
            color: '#991b1b'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* No Data Message */}
        {participants.length === 0 && !error && (
          <div style={{
            padding: '3rem',
            textAlign: 'center',
            color: '#666'
          }}>
            <p style={{ fontSize: '1.25rem' }}>{t('admin.noData')}</p>
          </div>
        )}

        {/* Data Table */}
        {participants.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.875rem'
            }}>
              <thead>
                <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #667eea' }}>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>
                    {t('admin.timestamp')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>
                    {t('admin.language')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>
                    {t('admin.profile')}
                  </th>
                  <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>
                    {t('admin.data')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant, index) => (
                  <tr
                    key={participant.id}
                    style={{
                      borderBottom: '1px solid #e5e7eb',
                      background: index % 2 === 0 ? 'white' : '#f9fafb'
                    }}
                  >
                    <td style={{ padding: '1rem' }}>
                      {new Date(participant.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {participant.language?.toUpperCase() || 'N/A'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <strong>Age:</strong> {participant.data?.profile?.age || 'N/A'}<br />
                        <strong>Gender:</strong> {participant.data?.profile?.gender || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <button
                        onClick={() => {
                          alert(JSON.stringify(participant.data, null, 2));
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '0.875rem'
                        }}
                      >
                        {t('admin.viewDetails')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

	{/* Leaderboard Section */}
        <div style={{ marginTop: '3rem' }}>
          <Leaderboard ranking={ranking} language={i18n.language} />
        </div>

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
            {t('admin.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen;
