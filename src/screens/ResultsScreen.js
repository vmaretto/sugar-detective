import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Download, Home } from 'lucide-react';
import html2canvas from 'html2canvas';

const ResultsScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const surveyData = location.state?.surveyData || {};

  const handleDownloadImage = async () => {
    if (!resultsRef.current) return;

    try {
      setDownloading(true);
      const canvas = await html2canvas(resultsRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true
      });

      const link = document.createElement('a');
      link.download = `sugar-detective-results-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
      alert(t('results.downloadError'));
    } finally {
      setDownloading(false);
    }
  };

  const handleStartNew = () => {
    navigate('/');
  };

  // Calculate some stats
  const profile = surveyData.profile || {};
  const part2 = surveyData.part2 || {};
  const measurements = surveyData.measurements || {};
  const part4 = surveyData.part4_awareness || surveyData.part4 || {};

  // Calculate knowledge score from part2 responses (scale 1-6)
  const part2Values = Object.entries(part2)
    .filter(([key]) => key.startsWith('response_q'))
    .map(([, value]) => parseInt(value));
  
  const knowledgeAvg = part2Values.length > 0
    ? (part2Values.reduce((sum, val) => sum + val, 0) / part2Values.length).toFixed(1)
    : 'N/A';

  // Calculate awareness score from part4 
  // Map text responses to numbers: very/much = 5, partly/bit = 3, little = 2, not/same = 1
  const awarenessMap = {
    'very': 5, 'much': 5,
    'partly': 3, 'bit': 3,
    'little': 2,
    'not': 1, 'same': 1, 'no': 1
  };
  
  const awarenessValues = Object.values(part4)
    .map(val => {
      if (typeof val === 'string') {
        const matched = Object.keys(awarenessMap).find(key => val.toLowerCase().includes(key));
        return matched ? awarenessMap[matched] : null;
      }
      return null;
    })
    .filter(val => val !== null);

  const awarenessAvg = awarenessValues.length > 0
    ? (awarenessValues.reduce((sum, val) => sum + val, 0) / awarenessValues.length).toFixed(1)
    : 'N/A';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '800px',
        width: '100%'
      }}>
        {/* Results Card */}
        <div
          ref={resultsRef}
          style={{
            background: 'white',
            borderRadius: '30px',
            padding: '3rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            marginBottom: '2rem'
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Trophy size={64} style={{ color: '#fbbf24', marginBottom: '1rem' }} />
            <h1 style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginBottom: '0.5rem'
            }}>
              {t('results.title')}
            </h1>
            <p style={{ color: '#666', fontSize: '1.125rem' }}>
              {t('results.subtitle')}
            </p>
          </div>

          {/* Summary Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              padding: '1.5rem',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {knowledgeAvg}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {t('results.knowledgeScore')}
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '15px',
              padding: '1.5rem',
              textAlign: 'center',
              color: 'white'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                {awarenessAvg}
              </div>
              <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                {t('results.awarenessScore')}
              </div>
            </div>
          </div>

          {/* Profile Summary */}
          <div style={{
            background: '#f3f4f6',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#667eea',
              marginBottom: '1rem'
            }}>
              {t('results.yourProfile')}
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <strong>{t('profile.age')}:</strong> {profile.age || 'N/A'}
              </div>
              <div>
                <strong>{t('profile.gender')}:</strong> {profile.gender || 'N/A'}
              </div>
              <div>
                <strong>{t('profile.sugarHabits')}:</strong> {profile.consumption || profile.sugarHabits || 'N/A'}
              </div>
            </div>
          </div>

          {/* Your Estimations */}
          {Object.keys(measurements).length > 0 && (
            <div style={{
              background: '#f3f4f6',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#667eea',
                marginBottom: '1rem'
              }}>
                {t('results.yourEstimations')}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem'
              }}>
                {Object.entries(measurements).map(([food, value]) => {
                  const { brix, glucose } = value || {};
                  const formattedBrix = brix ?? 'N/A';
                  const formattedGlucose = glucose ?? 'N/A';

                  return (
                    <div
                      key={food}
                      style={{
                        background: 'white',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem' }}>
                        {food.charAt(0).toUpperCase() + food.slice(1)}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#111', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>°Bx:</span>{' '}
                        <span style={{ fontWeight: 'bold' }}>{formattedBrix}</span>
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#111', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>Glucose:</span>{' '}
                        <span style={{ fontWeight: 'bold' }}>{formattedGlucose}</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        vs Apple
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thank You Message */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            padding: '2rem',
            textAlign: 'center',
            color: 'white'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {t('results.thankYou')}
            </h3>
            <p style={{ opacity: 0.9 }}>
              {t('results.dataContribution')}
            </p>
          </div>

          {/* Footer */}
          <div style={{
            marginTop: '2rem',
            textAlign: 'center',
            color: '#666',
            fontSize: '0.875rem'
          }}>
            <p>Sugar Detective • Maker Faire 2025</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={handleDownloadImage}
            disabled={downloading}
            style={{
              padding: '1rem 2rem',
              background: downloading ? '#9ca3af' : 'white',
              color: downloading ? 'white' : '#667eea',
              border: 'none',
              borderRadius: '15px',
              cursor: downloading ? 'not-allowed' : 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
          >
            <Download size={24} />
            {downloading ? t('results.downloading') : t('results.download')}
          </button>

          <button
            onClick={handleStartNew}
            style={{
              padding: '1rem 2rem',
              background: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '15px',
              cursor: 'pointer',
              fontSize: '1.125rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              transition: 'all 0.3s'
            }}
          >
            <Home size={24} />
            {t('results.startNew')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
