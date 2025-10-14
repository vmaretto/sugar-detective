// src/components/PairsComparison.js - VERSIONE COMPATTA
import React, { useState } from 'react';
import { CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { compareFoods, isPairAnswerCorrect } from '../utils/sugarUtils';

const PairsComparison = ({ pairs, foods, measurements, part3Data, language }) => {
  const [showAll, setShowAll] = useState(false);
  
  const getFoodName = (food) => {
    if (!food) return '';
    return language === 'it' ? food.name_it : food.name_en;
  };

  const getFoodById = (id) => {
    return foods.find(f => f.id === id);
  };

  // Calculate correct answers
  let correctAnswers = 0;
  let totalAnswers = 0;

  const pairResults = pairs.map((pair, index) => {
    const pairId = `pair_${index}`;
    const userAnswer = part3Data[pairId];
    
    if (!userAnswer) return null;

    const foodA = getFoodById(pair.food_a_id);
    const foodB = getFoodById(pair.food_b_id);
    
    if (!foodA || !foodB) return null;

    const brixA = measurements[foodA.id]?.brix || 0;
    const brixB = measurements[foodB.id]?.brix || 0;

    const reality = compareFoods(brixA, brixB);
    const isCorrect = isPairAnswerCorrect(userAnswer, reality);

    if (isCorrect) correctAnswers++;
    totalAnswers++;

    return {
      foodA,
      foodB,
      brixA,
      brixB,
      userAnswer,
      reality,
      isCorrect,
      pairId
    };
  }).filter(Boolean);

  const accuracy = totalAnswers > 0 ? ((correctAnswers / totalAnswers) * 100).toFixed(0) : 0;

  const getUserAnswerIcon = (isCorrect) => {
    return isCorrect ? <CheckCircle size={20} color="#10b981" /> : <XCircle size={20} color="#ef4444" />;
  };

  const getRealityText = (reality, foodA, foodB) => {
    if (reality === 'a') {
      return `${getFoodName(foodA)} ${language === 'it' ? 'più dolce' : 'sweeter'}`;
    } else if (reality === 'b') {
      return `${getFoodName(foodB)} ${language === 'it' ? 'più dolce' : 'sweeter'}`;
    } else {
      return language === 'it' ? 'Uguale' : 'Equal';
    }
  };

  // Determina quante coppie mostrare
  const displayedPairs = showAll ? pairResults : pairResults.slice(0, 6);
  const hasMore = pairResults.length > 6;

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
        marginBottom: '1rem'
      }}>
        {language === 'it' ? '🎯 Le tue previsioni sulle coppie' : '🎯 Your predictions on pairs'}
      </h2>
      
      {/* Summary */}
      <div style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '15px',
        marginBottom: '2rem',
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {language === 'it' ? 'Precisione complessiva' : 'Overall accuracy'}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
              {accuracy}%
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {language === 'it' ? 'Risposte corrette' : 'Correct answers'}
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
              {correctAnswers}/{totalAnswers}
            </div>
          </div>
        </div>
      </div>

      {/* Pair Results - GRIGLIA COMPATTA */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        marginBottom: hasMore ? '1.5rem' : '0'
      }}>
        {displayedPairs.map((result) => (
          <div
            key={result.pairId}
            style={{
              padding: '1rem',
              border: `2px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`,
              borderRadius: '12px',
              background: result.isCorrect ? '#10b98108' : '#ef444408'
            }}
          >
            {/* Header compatto con risultato */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem'
            }}>
              {getUserAnswerIcon(result.isCorrect)}
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 'bold',
                color: result.isCorrect ? '#10b981' : '#ef4444'
              }}>
                {result.isCorrect
                  ? (language === 'it' ? 'Corretto' : 'Correct')
                  : (language === 'it' ? 'Errato' : 'Wrong')}
              </div>
            </div>

            {/* Coppia compatta */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.75rem',
              padding: '0.5rem',
              background: 'white',
              borderRadius: '8px',
              fontSize: '0.875rem'
            }}>
              <span>{result.foodA.emoji} {getFoodName(result.foodA)}</span>
              <span style={{ fontWeight: 'bold', color: '#667eea' }}>vs</span>
              <span>{result.foodB.emoji} {getFoodName(result.foodB)}</span>
            </div>

            {/* Realtà */}
            <div style={{
              padding: '0.5rem',
              background: 'white',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: '0.25rem' }}>
                {language === 'it' ? 'Realtà:' : 'Reality:'}
              </div>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: result.isCorrect ? '#10b981' : '#ef4444'
              }}>
                {getRealityText(result.reality, result.foodA, result.foodB)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.25rem' }}>
                {result.brixA}°Bx vs {result.brixB}°Bx
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pulsante Mostra tutte / Mostra meno */}
      {hasMore && (
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowAll(!showAll)}
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
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#5568d3';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#667eea';
            }}
          >
            {showAll ? (
              <>
                {language === 'it' ? 'Mostra meno' : 'Show less'}
                <ChevronUp size={20} />
              </>
            ) : (
              <>
                {language === 'it' ? `Mostra tutte (${pairResults.length})` : `Show all (${pairResults.length})`}
                <ChevronDown size={20} />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default PairsComparison;
