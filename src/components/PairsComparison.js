// src/components/PairsComparison.js
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { compareFoods, isPairAnswerCorrect } from '../utils/sugarUtils';

const PairsComparison = ({ pairs, foods, measurements, part3Data, language }) => {
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

  const getUserAnswerText = (answer, foodA, foodB) => {
    if (answer === 'a_more') {
      return `${getFoodName(foodA)} ${language === 'it' ? 'più dolce' : 'sweeter'}`;
    } else if (answer === 'b_more') {
      return `${getFoodName(foodB)} ${language === 'it' ? 'più dolce' : 'sweeter'}`;
    } else {
      return language === 'it' ? 'Uguale dolcezza' : 'Equal sweetness';
    }
  };

  const getRealityText = (reality, foodA, foodB, brixA, brixB) => {
    if (reality === 'a') {
      return `${getFoodName(foodA)} ${language === 'it' ? 'più dolce' : 'sweeter'} (${brixA}°Bx vs ${brixB}°Bx)`;
    } else if (reality === 'b') {
      return `${getFoodName(foodB)} ${language === 'it' ? 'più dolce' : 'sweeter'} (${brixB}°Bx vs ${brixA}°Bx)`;
    } else {
      return `${language === 'it' ? 'Uguale dolcezza' : 'Equal sweetness'} (${brixA}°Bx ≈ ${brixB}°Bx)`;
    }
  };

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

      {/* Pair Results */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {pairResults.map((result, index) => (
          <div
            key={result.pairId}
            style={{
              padding: '1.5rem',
              border: `2px solid ${result.isCorrect ? '#10b981' : '#ef4444'}`,
              borderRadius: '15px',
              background: result.isCorrect ? '#10b98108' : '#ef444408'
            }}
          >
            {/* Header with result */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              {result.isCorrect ? (
                <CheckCircle size={32} color="#10b981" />
              ) : (
                <XCircle size={32} color="#ef4444" />
              )}
              <div style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: result.isCorrect ? '#10b981' : '#ef4444'
              }}>
                {result.isCorrect
                  ? (language === 'it' ? 'Corretto!' : 'Correct!')
                  : (language === 'it' ? 'Non corretto' : 'Incorrect')}
              </div>
            </div>

            {/* Pair display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '2rem' }}>{result.foodA.emoji}</span>
                <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  {getFoodName(result.foodA)}
                </span>
              </div>
              
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                VS
              </span>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                  {getFoodName(result.foodB)}
                </span>
                <span style={{ fontSize: '2rem' }}>{result.foodB.emoji}</span>
              </div>
            </div>

            {/* Your answer */}
            <div style={{
              padding: '1rem',
              background: 'white',
              borderRadius: '10px',
              marginBottom: '0.75rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                {language === 'it' ? 'La tua risposta:' : 'Your answer:'}
              </div>
              <div style={{ fontSize: '1.125rem', fontWeight: '600', color: '#667eea' }}>
                {getUserAnswerText(result.userAnswer, result.foodA, result.foodB)}
              </div>
            </div>

            {/* Reality */}
            <div style={{
              padding: '1rem',
              background: 'white',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>
                {language === 'it' ? 'Realtà:' : 'Reality:'}
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: result.isCorrect ? '#10b981' : '#ef4444'
              }}>
                {getRealityText(result.reality, result.foodA, result.foodB, result.brixA, result.brixB)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PairsComparison;
