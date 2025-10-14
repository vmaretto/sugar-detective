// src/utils/rankingUtils.js - Algoritmo di ranking per classifica partecipanti

import { comparePerceptionVsReality, compareFoods, isPairAnswerCorrect } from './sugarUtils';

/**
 * Calcola il punteggio totale di un partecipante
 * Basato su 3 componenti:
 * 1. Knowledge Score (0-100): Precisione delle stime di dolcezza
 * 2. Awareness Score (0-100): Consapevolezza dei propri errori
 * 3. Pairs Accuracy (0-100): Correttezza delle comparazioni a coppie
 * 
 * Formula finale: (Knowledge * 0.4) + (Awareness * 0.3) + (Pairs * 0.3)
 */
export const calculateTotalScore = (participantData) => {
  const knowledgeScore = calculateKnowledgeScore(participantData);
  const awarenessScore = calculateAwarenessScore(participantData);
  const pairsScore = calculatePairsScore(participantData);
  
  const totalScore = (knowledgeScore * 0.4) + (awarenessScore * 0.3) + (pairsScore * 0.3);
  
  return {
    totalScore: parseFloat(totalScore.toFixed(1)),
    knowledgeScore: parseFloat(knowledgeScore.toFixed(1)),
    awarenessScore: parseFloat(awarenessScore.toFixed(1)),
    pairsScore: parseFloat(pairsScore.toFixed(1))
  };
};

/**
 * Knowledge Score: Quanto precise sono le tue stime di dolcezza
 * Più sei vicino alla realtà, più punti ottieni
 */
export const calculateKnowledgeScore = (participantData) => {
  const { part2_data, measurements, foods } = participantData;
  
  if (!part2_data || !measurements || !foods) return 0;
  
  const part2 = typeof part2_data === 'string' ? JSON.parse(part2_data) : part2_data;
  const meas = typeof measurements === 'string' ? JSON.parse(measurements) : measurements;
  const foodsList = typeof foods === 'string' ? JSON.parse(foods) : foods;
  
  let totalError = 0;
  let count = 0;
  
  foodsList.forEach(food => {
    // Try to get perceived value from different possible structures
    let perceived = part2[food.id];
    
    // If not found, try numeric keys (for backward compatibility)
    if (!perceived && part2.responses) {
      perceived = part2.responses[food.id];
    }
    
    // If still not found, try by index
    if (!perceived) {
      const index = foodsList.findIndex(f => f.id === food.id);
      if (index >= 0) {
        perceived = part2[index.toString()] || part2[(index + 1).toString()];
      }
    }
    
    const measured = meas[food.id]?.brix;
    
    if (perceived && measured) {
      const comparison = comparePerceptionVsReality(perceived, measured);
      totalError += Math.abs(parseFloat(comparison.difference));
      count++;
    }
  });
  
  if (count === 0) return 0;
  
  const avgError = totalError / count;
  
  // Converti errore in score: errore 0 = 100, errore 5+ = 0
  // Formula: max(0, 100 - (avgError * 20))
  const score = Math.max(0, Math.min(100, 100 - (avgError * 20)));
  
  return score;
};

/**
 * Awareness Score: Quanto sei consapevole dei tuoi errori
 * Basato sulle risposte della sezione "awareness"
 */
export const calculateAwarenessScore = (participantData) => {
  const { part4_awareness } = participantData;
  
  if (!part4_awareness) return 50; // Default medio
  
  const awareness = typeof part4_awareness === 'string' 
    ? JSON.parse(part4_awareness) 
    : part4_awareness;
  
  let score = 50; // Start da 50 (medio)
  
  // Confidence level (più sei confident nei tuoi errori = peggio)
  if (awareness.confidence) {
    const conf = parseInt(awareness.confidence);
    // Confidence alta (9-10) quando hai fatto errori = score basso
    // Confidence bassa (1-2) quando hai fatto errori = score alto (sei consapevole)
    score += (10 - conf) * 2; // Max +18, Min -18
  }
  
  // Difficulty perception
  if (awareness.difficulty) {
    const diff = parseInt(awareness.difficulty);
    // Se percepisci il test come difficile, probabilmente sei più consapevole
    score += (diff - 5) * 3; // Max +15, Min -15
  }
  
  // Surprise level
  if (awareness.surprise) {
    const surp = parseInt(awareness.surprise);
    // Alta sorpresa = eri inconsapevole dei reali valori
    score -= (surp - 5) * 2; // Max -10, Min +10
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Pairs Score: Correttezza delle comparazioni a coppie
 */
export const calculatePairsScore = (participantData) => {
  const { part3_data, measurements, pairs, foods } = participantData;
  
  if (!part3_data || !measurements || !pairs || !foods) return 0;
  
  const part3 = typeof part3_data === 'string' ? JSON.parse(part3_data) : part3_data;
  const meas = typeof measurements === 'string' ? JSON.parse(measurements) : measurements;
  const pairsList = typeof pairs === 'string' ? JSON.parse(pairs) : pairs;
  const foodsList = typeof foods === 'string' ? JSON.parse(foods) : foods;
  
  const foodsMap = {};
  foodsList.forEach(food => {
    foodsMap[food.id] = food;
  });
  
  let correctAnswers = 0;
  let totalAnswers = 0;
  
  pairsList.forEach((pair, index) => {
    const pairId = `pair_${index}`;
    const userAnswer = part3[pairId];
    
    if (!userAnswer) return;
    
    const foodA = foodsMap[pair.food_a_id];
    const foodB = foodsMap[pair.food_b_id];
    
    if (!foodA || !foodB) return;
    
    const brixA = meas[foodA.id]?.brix || 0;
    const brixB = meas[foodB.id]?.brix || 0;
    
    const reality = compareFoods(brixA, brixB);
    const isCorrect = isPairAnswerCorrect(userAnswer, reality);
    
    if (isCorrect) correctAnswers++;
    totalAnswers++;
  });
  
  if (totalAnswers === 0) return 0;
  
  return (correctAnswers / totalAnswers) * 100;
};

/**
 * Genera classifica ordinata di tutti i partecipanti
 */
export const generateRanking = (participants) => {
  const ranked = participants.map(participant => {
    const scores = calculateTotalScore(participant);
    
    return {
      id: participant.id,
      timestamp: participant.timestamp,
      profile: participant.profile,
      ...scores,
      participant // Keep original data
    };
  });
  
  // Ordina per totalScore decrescente
  ranked.sort((a, b) => b.totalScore - a.totalScore);
  
  // Aggiungi posizione
  ranked.forEach((item, index) => {
    item.rank = index + 1;
  });
  
  return ranked;
};

/**
 * Trova la posizione di un partecipante specifico nella classifica
 */
export const findParticipantRank = (participantId, ranking) => {
  const participant = ranking.find(p => p.id === participantId);
  return participant ? participant.rank : null;
};

/**
 * Ottieni statistiche sulla classifica
 */
export const getRankingStats = (ranking) => {
  if (ranking.length === 0) {
    return {
      totalParticipants: 0,
      avgScore: 0,
      topScore: 0,
      bottomScore: 0
    };
  }
  
  const scores = ranking.map(p => p.totalScore);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  return {
    totalParticipants: ranking.length,
    avgScore: parseFloat(avgScore.toFixed(1)),
    topScore: Math.max(...scores),
    bottomScore: Math.min(...scores)
  };
};

export default {
  calculateTotalScore,
  calculateKnowledgeScore,
  calculateAwarenessScore,
  calculatePairsScore,
  generateRanking,
  findParticipantRank,
  getRankingStats
};
