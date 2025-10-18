// src/utils/rankingUtils.js - Algoritmo di ranking CORRETTO

import { comparePerceptionVsReality } from './sugarUtils';

/**
 * Calcola il punteggio totale di un partecipante
 * Basato su 2 componenti:
 * 1. Knowledge Score (0-100): Precisione delle stime
 * 2. Awareness Score (0-100): Consapevolezza dei propri errori
 * 
 * Formula finale: (Knowledge * 0.7) + (Awareness * 0.3)
 */
export const calculateTotalScore = (participantData) => {
  // Calcolo punteggio stime (0-100)
  const knowledgeScore = calculateEstimatesScore(participantData);
  
  // Calcolo punteggio consapevolezza (0-100)
  const awarenessScore = calculateAwarenessScore(participantData);
  
  // Punteggio totale: 70% conoscenza + 30% consapevolezza
  const totalScore = (knowledgeScore * 0.7) + (awarenessScore * 0.3);
  
  return {
    totalScore: parseFloat(totalScore.toFixed(1)),
    knowledgeScore: parseFloat(knowledgeScore.toFixed(1)),
    awarenessScore: parseFloat(awarenessScore.toFixed(1))
  };
};

/**
 * Estimates Score: Quanto precise sono le tue stime di dolcezza
 * Più sei vicino alla realtà, più punti ottieni
 */
export const calculateEstimatesScore = (participantData) => {
  const { part2_data, measurements, foods } = participantData;
  
  if (!part2_data || !measurements || !foods) return 0;
  
  // Handle both old and new data structures
  let part2;
  if (typeof part2_data === 'string') {
    part2 = JSON.parse(part2_data);
  } else if (part2_data.responses) {
    part2 = part2_data.responses;
  } else {
    part2 = part2_data;
  }
  
  const meas = typeof measurements === 'string' ? JSON.parse(measurements) : measurements;
  const foodsList = typeof foods === 'string' ? JSON.parse(foods) : foods;
  
  if (!Array.isArray(foodsList) || foodsList.length === 0) return 0;
  
  let totalError = 0;
  let count = 0;
  
  foodsList.forEach(food => {
    // Get perceived value - try different possible structures
    let perceived = part2[food.id] || part2[String(food.id)];
    
    // Get measured value
    const measured = meas[food.id]?.brix || meas[String(food.id)]?.brix;
    
    if (perceived && measured) {
      // Convert perceived (1-5 scale) to comparable scale with Brix
      // Assuming 1-5 maps roughly to 0-20 Brix
      const perceivedBrix = perceived * 4; // Simple mapping
      const realBrix = parseFloat(measured);
      
      // Calculate error as percentage difference
      const error = Math.abs(perceivedBrix - realBrix) / Math.max(realBrix, 1);
      totalError += error;
      count++;
    }
  });
  
  if (count === 0) return 0;
  
  const avgError = totalError / count;
  
  // Convert error to score: 0% error = 100, 100% error = 0
  const score = Math.max(0, Math.min(100, 100 * (1 - avgError)));
  
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
  
  let score = 50; // Start from 50 (medium)
  
  // Surprised about vegetables containing sugar
  if (awareness.surprised === 'no') {
    score += 10; // Not surprised = more aware
  } else if (awareness.surprised === 'yes') {
    score -= 10; // Surprised = less aware
  }
  
  // Influence on food choices
  if (awareness.influence === 'very') {
    score += 15; // High influence = high awareness
  } else if (awareness.influence === 'partly') {
    score += 5;
  } else if (awareness.influence === 'little') {
    score -= 5;
  } else if (awareness.influence === 'not') {
    score -= 15; // No influence = low awareness
  }
  
  // Current knowledge self-assessment
  if (awareness.knowledge === 'very') {
    score += 15; // High self-assessed knowledge
  } else if (awareness.knowledge === 'enough') {
    score += 5;
  } else if (awareness.knowledge === 'little') {
    score -= 5;
  } else if (awareness.knowledge === 'nothing') {
    score -= 15; // No knowledge = low awareness
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Genera classifica ordinata di tutti i partecipanti
 */
export const generateRanking = (participants) => {
  const ranked = participants.map(participant => {
    // Estrai i dati dalla struttura corretta del database
    const data = participant.data || {};
    
    // Debug log per vedere la struttura
    console.log('Participant data structure:', {
      id: participant.id,
      hasData: !!participant.data,
      hasPart2: !!data.part2,
      hasMeasurements: !!data.measurements,
      hasFoods: !!data.foods
    });
    
    // Prepara i dati nel formato atteso da calculateTotalScore
    const formattedData = {
      part2_data: data.part2,
      part3_data: data.part3, 
      part4_awareness: data.part4_awareness || data.part4 || data.awarenessData,
      measurements: data.measurements,
      foods: data.foods,
      pairs: data.comparison_pairs || []
    };
    
    const scores = calculateTotalScore(formattedData);
    
    // Debug log per vedere i punteggi
    console.log('Calculated scores for participant', participant.id, ':', scores);
    
    return {
      id: participant.id,
      timestamp: participant.timestamp,
      profile: data.profile,
      language: participant.language,
      data: participant.data, // Mantieni i dati originali
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
  calculateEstimatesScore,
  calculateAwarenessScore,
  generateRanking,
  findParticipantRank,
  getRankingStats
};
