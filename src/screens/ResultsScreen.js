import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Trophy, Download, Home } from 'lucide-react';
import html2canvas from 'html2canvas';
import PerceptionComparison from '../components/PerceptionComparison';
import { calculateTotalScore } from '../utils/rankingUtils';

const ResultsScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const resultsRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [rankingPosition, setRankingPosition] = useState(null);
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [savingNickname, setSavingNickname] = useState(false);

  const surveyData = location.state?.surveyData || {};

  // Load foods from surveyData
  const foods = surveyData.foods || [];

  // Calculate personal scores
  const personalScores = foods.length > 0 ? calculateTotalScore({
    part2_data: surveyData.part2,
    part3_data: surveyData.part3,
    part4_awareness: surveyData.part4_awareness || surveyData.part4,
    measurements: surveyData.measurements,
    foods: foods,
    pairs: []
  }) : { totalScore: 0, knowledgeScore: 0, awarenessScore: 0 };

  // Fetch ranking position when component mounts
  React.useEffect(() => {
    fetchRankingPosition();
  }, []);

  const fetchRankingPosition = async () => {
    try {
      const response = await fetch('/api/participants');
      if (!response.ok) {
        console.log('Failed to fetch participants for ranking');
        return;
      }
      
      const participants = await response.json();
      console.log('Fetched participants:', participants.length);
      setTotalParticipants(participants.length);
      
      // Calculate ranks for all participants
      const ranked = participants.map(p => {
        const scores = calculateTotalScore({
          part2_data: p.data?.part2,
          part3_data: p.data?.part3,
          part4_awareness: p.data?.part4_awareness || p.data?.part4,
          measurements: p.data?.measurements,
          foods: p.data?.foods,
          pairs: []
        });
        return {
          id: p.id,
          timestamp: p.timestamp,
          totalScore: scores.totalScore
        };
      });
      
      // Sort by score descending
      ranked.sort((a, b) => b.totalScore - a.totalScore);
      
      // Find current participant's position
      const myTimestamp = surveyData.timestamp;
      const myId = surveyData.id;
      
      console.log('My timestamp:', myTimestamp);
      console.log('My id:', myId);
      console.log('My score:', personalScores.totalScore);
      
      // First try by timestamp
      let myPosition = ranked.findIndex(p => p.timestamp === myTimestamp);
      
      // If not found, try by ID
      if (myPosition < 0 && myId) {
        myPosition = ranked.findIndex(p => p.id === myId);
      }
      
      // If still not found, try to match by score (less reliable)
      if (myPosition < 0) {
        myPosition = ranked.findIndex(p => 
          Math.abs(p.totalScore - personalScores.totalScore) < 0.1
        );
      }
      
      console.log('My position:', myPosition);
      
      if (myPosition >= 0) {
        setRankingPosition(myPosition + 1);
        console.log('Set ranking position to:', myPosition + 1);
      } else {
        console.log('Could not find position in ranking');
        setRankingPosition(participants.length);
      }
    } catch (error) {
      console.error('Error fetching ranking:', error);
    }
  };

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      alert(i18n.language === 'it' ? 'Inserisci un nickname!' : 'Enter a nickname!');
      return;
    }

    setSavingNickname(true);
    try {
      const updatedData = {
        ...surveyData,
        nickname: nickname.trim()
      };
      
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        alert(i18n.language === 'it' 
          ? '✓ Nickname salvato! Ora apparirai nella classifica.' 
          : '✓ Nickname saved! You will now appear in the leaderboard.');
        setShowNicknameInput(false);
      } else {
        alert(i18n.language === 'it' ? 'Errore nel salvataggio' : 'Error saving nickname');
      }
    } catch (error) {
      console.error('Error saving nickname:', error);
      alert(i18n.language === 'it' ? 'Errore di rete' : 'Network error');
    } finally {
      setSavingNickname(false);
    }
  };

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
              {i18n.language === 'it' ? 'I tuoi punteggi' : 'Your scores'}
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
              
              {/* Conoscenza */}
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
                    • <strong>Conoscenza (70%):</strong> Precisione delle tue stime di dolcezza<br />
                    • <strong>Consapevolezza (30%):</strong> Quanto conosci i tuoi limiti
                  </>
                ) : (
                  <>
                    • <strong>Knowledge (70%):</strong> Accuracy of your sweetness estimates<br />
                    • <strong>Awareness (30%):</strong> How well you know your limits
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Ranking Position Card */}
          {totalParticipants > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
              borderRadius: '20px',
              padding: '2rem',
              marginBottom: '2rem',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(251, 191, 36, 0.3)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {rankingPosition === 1 ? '🥇' : rankingPosition === 2 ? '🥈' : rankingPosition === 3 ? '🥉' : '🏆'}
              </div>
              <h2 style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                marginBottom: '0.5rem',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)' 
              }}>
                {rankingPosition ? (
                  i18n.language === 'it' 
                    ? `${rankingPosition}° posto su ${totalParticipants}!` 
                    : `${rankingPosition}${rankingPosition === 1 ? 'st' : rankingPosition === 2 ? 'nd' : rankingPosition === 3 ? 'rd' : 'th'} place out of ${totalParticipants}!`
                ) : (
                  i18n.language === 'it'
                    ? `Hai completato l'esperienza! (${totalParticipants} partecipanti totali)`
                    : `You completed the experience! (${totalParticipants} total participants)`
                )}
              </h2>
              
              {/* Nickname Section */}
              {!showNicknameInput ? (
                <div>
                  <p style={{ 
                    fontSize: '1rem', 
                    opacity: 0.9,
                    marginBottom: '1rem' 
                  }}>
                    {i18n.language === 'it' 
                      ? 'Vuoi apparire nella classifica pubblica?' 
                      : 'Want to appear on the public leaderboard?'}
                  </p>
                  <button
                    onClick={() => setShowNicknameInput(true)}
                    style={{
                      padding: '0.75rem 2rem',
                      background: 'white',
                      color: '#f59e0b',
                      border: 'none',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    {i18n.language === 'it' ? '✨ Aggiungi Nickname' : '✨ Add Nickname'}
                  </button>
                </div>
              ) : (
                <div style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  backdropFilter: 'blur(10px)'
                }}>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    marginBottom: '1rem',
                    opacity: 0.9 
                  }}>
                    {i18n.language === 'it' 
                      ? 'Scegli come vuoi apparire nella classifica:' 
                      : 'Choose how you want to appear on the leaderboard:'}
                  </p>
                  <div style={{ 
                    display: 'flex', 
                    gap: '0.75rem',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap'
                  }}>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder={i18n.language === 'it' ? 'Il tuo nickname...' : 'Your nickname...'}
                      maxLength={20}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        border: '2px solid white',
                        fontSize: '1rem',
                        minWidth: '200px',
                        outline: 'none'
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleSaveNickname();
                      }}
                    />
                    <button
                      onClick={handleSaveNickname}
                      disabled={savingNickname}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: savingNickname ? '#9ca3af' : 'white',
                        color: '#f59e0b',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: savingNickname ? 'not-allowed' : 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      {savingNickname 
                        ? (i18n.language === 'it' ? 'Salvo...' : 'Saving...') 
                        : (i18n.language === 'it' ? '✓ Salva' : '✓ Save')}
                    </button>
                    <button
                      onClick={() => setShowNicknameInput(false)}
                      style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(255,255,255,0.3)',
                        color: 'white',
                        border: '2px solid white',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      {i18n.language === 'it' ? 'Annulla' : 'Cancel'}
                    </button>
                  </div>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    marginTop: '0.75rem',
                    opacity: 0.8 
                  }}>
                    {i18n.language === 'it' 
                      ? 'Max 20 caratteri. Il nickname sarà pubblico.' 
                      : 'Max 20 characters. Nickname will be public.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Perception vs Reality Comparison */}
          {foods.length > 0 && (
            <PerceptionComparison
              foods={foods}
              measurements={surveyData.measurements || {}}
              part2Data={surveyData.part2 || {}}
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

          {/* Your Measurements - SENZA GLUCOSIO */}
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
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {Object.entries(measurements).map(([foodId, value]) => {
                  const { brix } = value || {};
                  const food = foods.find(f => f.id === parseInt(foodId));
                  const foodName = food ? (i18n.language === 'it' ? food.name_it : food.name_en) : foodId;
                  const emoji = food ? food.emoji : '🍎';
                  
                  // Get user's prediction from part2
                  const part2 = surveyData.part2 || {};
                  const userPrediction = part2[foodId] || part2.responses?.[foodId];
                  
                  // Calculate real sweetness from brix
                  const realSweetness = brix ? (brix / 2.5).toFixed(1) : null;
                  
                  // Determine if prediction was accurate
                  let predictionStatus = null;
                  let statusColor = '#9ca3af';
                  let statusText = '';
                  
                  if (userPrediction && realSweetness) {
                    const diff = Math.abs(userPrediction - realSweetness);
                    if (diff <= 0.5) {
                      predictionStatus = 'accurate';
                      statusColor = '#10b981';
                      statusText = i18n.language === 'it' ? '✓ Preciso!' : '✓ Accurate!';
                    } else if (userPrediction < realSweetness) {
                      predictionStatus = 'underestimated';
                      statusColor = '#f59e0b';
                      statusText = i18n.language === 'it' ? '↓ Sottostimato' : '↓ Underestimated';
                    } else {
                      predictionStatus = 'overestimated';
                      statusColor = '#ef4444';
                      statusText = i18n.language === 'it' ? '↑ Sovrastimato' : '↑ Overestimated';
                    }
                  }

                  return (
                    <div
                      key={foodId}
                      style={{
                        background: 'white',
                        padding: '1rem',
                        borderRadius: '10px',
                        border: predictionStatus ? `2px solid ${statusColor}` : '2px solid #e5e7eb'
                      }}
                    >
                      {/* Header con emoji e nome */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '1.5rem' }}>{emoji}</span>
                          <span style={{ fontWeight: 'bold', color: '#667eea', fontSize: '0.875rem' }}>
                            {foodName}
                          </span>
                        </div>
                        {predictionStatus && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: '600',
                            color: statusColor
                          }}>
                            {statusText}
                          </span>
                        )}
                      </div>
                      
                      {/* Confronto Previsione vs Realtà */}
                      {userPrediction && (
                        <div style={{
                          background: '#f9fafb',
                          padding: '0.5rem',
                          borderRadius: '6px',
                          marginBottom: '0.5rem',
                          fontSize: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <span style={{ color: '#666' }}>
                              {i18n.language === 'it' ? 'La tua stima:' : 'Your estimate:'}
                            </span>
                            <span style={{ fontWeight: '600', color: '#667eea' }}>
                              {userPrediction}/5
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#666' }}>
                              {i18n.language === 'it' ? 'Realtà:' : 'Reality:'}
                            </span>
                            <span style={{ fontWeight: '600', color: '#10b981' }}>
                              {realSweetness}/5
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Misurazioni - SOLO BRIX */}
                      <div style={{ fontSize: '0.875rem', color: '#111' }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>°Bx:</span> {brix ?? 'N/A'}
                        </div>
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
              {i18n.language === 'it' ? '🙏 Grazie per aver partecipato!' : '🙏 Thank you for participating!'}
            </h3>
            <p style={{ 
              color: '#666',
              fontSize: '1.125rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              {i18n.language === 'it' 
                ? 'I tuoi dati aiuteranno la ricerca sul consumo consapevole di zuccheri.'
                : 'Your data will help research on conscious sugar consumption.'}
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
