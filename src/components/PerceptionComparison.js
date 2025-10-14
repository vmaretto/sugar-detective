// src/components/PerceptionComparison.js - VERSIONE MIGLIORATA
import React from 'react';
import { CheckCircle, XCircle, AlertCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { comparePerceptionVsReality, brixToSweetness } from '../utils/sugarUtils';

const PerceptionComparison = ({ foods, measurements, part2Data, language }) => {
  const getFoodName = (food) => {
    return language === 'it' ? food.name_it : food.name_en;
  };

  const getStatusIcon = (status) => {
    if (status === 'accurate') {
      return <CheckCircle size={24} color="#10b981" />;
    } else if (status === 'underestimated') {
      return <AlertCircle size={24} color="#f59e0b" />;
    } else {
      return <XCircle size={24} color="#ef4444" />;
    }
  };

  const getStatusText = (status) => {
    const texts = {
      it: {
        accurate: 'Accurato!',
        underestimated: 'Sottostimato',
        overestimated: 'Sovrastimato'
      },
      en: {
        accurate: 'Accurate!',
        underestimated: 'Underestimated',
        overestimated: 'Overestimated'
      }
    };
    return texts[language][status];
  };

  const getStatusColor = (status) => {
    if (status === 'accurate') return '#10b981';
    if (status === 'underestimated') return '#f59e0b';
    return '#ef4444';
  };

  const getFeedbackMessage = (status, difference) => {
    const diff = Math.abs(parseFloat(difference));
    
    if (status === 'accurate') {
      return language === 'it'
        ? '🎯 Ottimo! La tua stima era molto vicina alla realtà.'
        : '🎯 Great! Your estimate was very close to reality.';
    } else if (status === 'underestimated') {
      if (diff > 3) {
        return language === 'it'
          ? '😮 Sorpresa! Questo alimento è molto più dolce di quanto pensassi.'
          : '😮 Surprise! This food is much sweeter than you thought.';
      } else {
        return language === 'it'
          ? '📊 Hai sottostimato un po\' la dolcezza. Capita spesso con questo alimento!'
          : '📊 You underestimated the sweetness a bit. This happens often with this food!';
      }
    } else {
      if (diff > 3) {
        return language === 'it'
          ? '🤔 Hai sopravvalutato parecchio la dolcezza. L\'aspetto può ingannare!'
          : '🤔 You overestimated the sweetness quite a bit. Appearance can be deceiving!';
      } else {
        return language === 'it'
          ? '💭 Pensavi fosse più dolce di quanto sia realmente.'
          : '💭 You thought it was sweeter than it actually is.';
      }
    }
  };

  // Check if we have valid data
  const hasData = foods.some(food => {
    const perceived = part2Data[food.id];
    const measured = measurements[food.id]?.brix;
    return perceived && measured;
  });

  if (!hasData) {
    return null; // Don't show section if no data
  }

  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        fontSize: '1.75rem',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '0.5rem'
      }}>
        {language === 'it' ? '📊 Percezione vs Realtà' : '📊 Perception vs Reality'}
      </h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {language === 'it' 
          ? 'Confronto tra quanto dolce pensavi fossero gli alimenti e quanto lo sono realmente'
          : 'Comparison between how sweet you thought foods were and how sweet they actually are'}
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {foods.map(food => {
          const perceivedSweetness = part2Data[food.id];
          const measuredBrix = measurements[food.id]?.brix;
          
          if (!perceivedSweetness || !measuredBrix) return null;

          const comparison = comparePerceptionVsReality(perceivedSweetness, measuredBrix);
          const feedbackMessage = getFeedbackMessage(comparison.status, comparison.difference);
          
          return (
            <div
              key={food.id}
              style={{
                padding: '1.5rem',
                border: `2px solid ${getStatusColor(comparison.status)}`,
                borderRadius: '15px',
                background: `${getStatusColor(comparison.status)}08`
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '2.5rem' }}>{food.emoji}</span>
                  <div>
                    <h3 style={{
                      fontSize: '1.25rem',
                      fontWeight: '600',
                      margin: 0,
                      marginBottom: '0.25rem'
                    }}>
                      {getFoodName(food)}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(comparison.status)}
                      <span style={{
                        fontWeight: '600',
                        color: getStatusColor(comparison.status)
                      }}>
                        {getStatusText(comparison.status)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              <div style={{
                padding: '1rem',
                background: 'white',
                borderRadius: '10px',
                marginBottom: '1rem',
                border: '2px solid #f3f4f6'
              }}>
                <p style={{ 
                  margin: 0, 
                  color: '#666',
                  fontSize: '1rem',
                  lineHeight: '1.5'
                }}>
                  {feedbackMessage}
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    {language === 'it' ? 'La tua percezione' : 'Your perception'}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#667eea'
                  }}>
                    {perceivedSweetness}/10
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    {language === 'it' ? 'Misurato' : 'Measured'}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: '#10b981'
                  }}>
                    {measuredBrix}°Bx
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    marginTop: '0.25rem'
                  }}>
                    ≈ {comparison.realSweetness}/10
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  background: 'white',
                  borderRadius: '10px',
                  border: '2px solid #e5e7eb'
                }}>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    marginBottom: '0.5rem'
                  }}>
                    {language === 'it' ? 'Differenza' : 'Difference'}
                  </div>
                  <div style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: getStatusColor(comparison.status)
                  }}>
                    {comparison.difference > 0 ? '+' : ''}{comparison.difference}
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    color: '#666',
                    marginTop: '0.25rem'
                  }}>
                    ({comparison.percentage}%)
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PerceptionComparison;
