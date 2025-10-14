import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Download, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import PerceptionComparison from '../components/PerceptionComparison';
import PairsComparison from '../components/PairsComparison';
import { calculateTotalScore } from '../utils/rankingUtils';

const ResultsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const surveyData = location.state?.surveyData || {};

  // Load foods and pairs from surveyData
  const foods = surveyData.foods || [];
  const comparisonPairs = surveyData.comparison_pairs || [];

  // Calculate personal scores
  const personalScores = foods.length > 0 ? calculateTotalScore({
    part2_data: surveyData.part2,
    part3_data: surveyData.part3,
    part4_awareness: surveyData.part4_awareness || surveyData.part4,
    measurements: surveyData.measurements,
    foods: foods,
    pairs: comparisonPairs
  }) : { totalScore: 0, knowledgeScore: 0, awarenessScore: 0 };

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
  const measurements = surveyData.measurements || {};

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
        maxWidth: '900px',
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

          {/* Personal Scores - SOLO 3 PUNTEGGI */}
          <div style={{
            background: '#f9fafb',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              color: '#667eea',
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {language === 'it' ? 'I tuoi punteggi' : 'Your scores'}
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.5rem'
            }}>
              {/* Punteggio Totale */}
              <div style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '15px',
                color: 'white',
                textAlign: 'center',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                  {i18n.language === 'it' ? 'Punteggio Totale' : 'Total Score'}
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
                  {personalScores.totalScore}
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>
                  / 100
                </div>
              </div>
              
              {/* Conoscenza (Stime + Coppie) */}
              <div style={{
                padding: '1.5rem',
                background: 'white',
                border: '2px solid #10b981',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  {i18n.language === 'it' ? 'Conoscenza' : 'Knowledge'}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {personalScores.knowledgeScore}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  / 100
                </div>
                <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.5rem', fontStyle: 'italic' }}>
                  {i18n.language === 'it' ? '(Stime + Coppie)' : '(Estimates + Pairs)'}
                </div>
              </div>
              
              {/* Consapevolezza */}
              <div style={{
                padding: '1.5rem',
                background: 'white',
                border: '2px solid #f59e0b',
                borderRadius: '15px',
                textAlign: 'center',
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.1)'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                  {i18n.language === 'it' ? 'Consapevolezza' : 'Awareness'}
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                  {personalScores.awarenessScore}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  / 100
                </div>
              </div>
            </div>

            {/* Spiegazione algoritmo */}
            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '10px',
              border: '2px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', lineHeight: '1.6' }}>
                <strong style={{ color: '#667eea' }}>
                  {i18n.language === 'it' ? '📊 Come calcoliamo il punteggio:' : '📊 How we calculate the score:'}
                </strong>
                <br />
                {i18n.language === 'it' ? (
                  <>
                    • <strong>Conoscenza (70%):</strong> 60% precisione stime + 40% coppie corrette<br />
                    • <strong>Consapevolezza (30%):</strong> Quanto conosci i tuoi limiti
                  </>
                ) : (
                  <>
                    • <strong>Knowledge (70%):</strong> 60% estimates accuracy + 40% correct pairs<br />
                    • <strong>Awareness (30%):</strong> How well you know your limits
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Perception vs Reality Comparison */}
          {foods.length > 0 && (
            <PerceptionComparison
              foods={foods}
              measurements={surveyData.measurements || {}}
              part2Data={surveyData.part2 || {}}
              language={i18n.language}
            />
          )}

          {/* Pairs Comparison - VERSIONE COMPATTA */}
          {comparisonPairs.length > 0 && (
            <PairsComparison
              pairs={comparisonPairs}
              foods={foods}
              measurements={surveyData.measurements || {}}
              part3Data={surveyData.part3 || {}}
              language={i18n.language}
            />
          )}

          {/* Profile Summary */}
          <div style={{
            background: '#f3f4f6',
            borderRadius: '15px',
            padding: '1.5rem',
            marginBottom: '2rem',
            marginTop: '2rem'
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

          {/* Your Measurements */}
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
                {i18n.language === 'it' ? 'Le tue misurazioni' : 'Your measurements'}
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '0.75rem'
              }}>
                {Object.entries(measurements).map(([foodId, value]) => {
                  const { brix, glucose } = value || {};
                  const food = foods.find(f => f.id === parseInt(foodId));
                  const foodName = food ? (i18n.language === 'it' ? food.name_it : food.name_en) : foodId;
                  const emoji = food ? food.emoji : '🍎';

                  return (
                    <div
                      key={foodId}
                      style={{
                        background: 'white',
                        padding: '0.75rem',
                        borderRadius: '10px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
                        {emoji}
                      </div>
                      <div style={{ fontWeight: 'bold', color: '#667eea', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                        {foodName}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#111', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>°Bx:</span> {brix ?? 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#111' }}>
                        <span style={{ fontWeight: 600 }}>
                          {i18n.language === 'it' ? 'Glucosio:' : 'Glucose:'}
                        </span> {glucose ?? 'N/A'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Thank You Message */}
          <div style={{
            background: '#f9fafb',
            border: '2px solid #667eea',
            borderRadius: '15px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold', 
              marginBottom: '0.5rem',
              color: '#667eea'
            }}>
              {t('results.thankYou')}
            </h3>
            <p style={{ 
              color: '#666',
              fontSize: '1.125rem',
              lineHeight: '1.6',
              margin: 0
            }}>
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
