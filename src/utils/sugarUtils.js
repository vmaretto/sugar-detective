// src/utils/sugarUtils.js - Utility per conversione Brix e calcoli zucchero

/**
 * Converte gradi Brix in punteggio di dolcezza percepita (1-10)
 * Basato su scala empirica:
 * - 0-2°Bx: Molto poco dolce (1-2)
 * - 2-5°Bx: Poco dolce (3-4)
 * - 5-8°Bx: Moderatamente dolce (5-6)
 * - 8-12°Bx: Dolce (7-8)
 * - 12+°Bx: Molto dolce (9-10)
 */
export const brixToSweetness = (brix) => {
  const brixNum = parseFloat(brix);
  
  if (isNaN(brixNum)) return 0;
  
  if (brixNum <= 2) {
    return Math.max(1, Math.min(2, 1 + brixNum / 2));
  } else if (brixNum <= 5) {
    return 2 + ((brixNum - 2) / 3) * 2; // 2-4
  } else if (brixNum <= 8) {
    return 4 + ((brixNum - 5) / 3) * 2; // 4-6
  } else if (brixNum <= 12) {
    return 6 + ((brixNum - 8) / 4) * 2; // 6-8
  } else {
    return Math.min(10, 8 + ((brixNum - 12) / 8) * 2); // 8-10
  }
};

/**
 * Converte punteggio di dolcezza (1-10) in descrizione testuale
 */
export const sweetnessToLabel = (sweetness, language = 'it') => {
  const labels = {
    it: {
      veryLow: 'Molto poco dolce',
      low: 'Poco dolce',
      medium: 'Moderatamente dolce',
      high: 'Dolce',
      veryHigh: 'Molto dolce'
    },
    en: {
      veryLow: 'Very low sweetness',
      low: 'Low sweetness',
      medium: 'Moderate sweetness',
      high: 'Sweet',
      veryHigh: 'Very sweet'
    }
  };
  
  const lang = labels[language] || labels.it;
  
  if (sweetness <= 2) return lang.veryLow;
  if (sweetness <= 4) return lang.low;
  if (sweetness <= 6) return lang.medium;
  if (sweetness <= 8) return lang.high;
  return lang.veryHigh;
};

/**
 * Calcola la differenza tra percezione e realtà
 * Ritorna: { difference, percentage, status }
 * status: 'accurate' | 'underestimated' | 'overestimated'
 */
export const comparePerceptionVsReality = (perceivedSweetness, measuredBrix) => {
  const realSweetness = brixToSweetness(measuredBrix);
  const difference = perceivedSweetness - realSweetness;
  const percentage = Math.abs((difference / realSweetness) * 100);
  
  let status = 'accurate';
  if (Math.abs(difference) <= 1) {
    status = 'accurate'; // Entro 1 punto = accurato
  } else if (difference < 0) {
    status = 'underestimated'; // Sottostimato
  } else {
    status = 'overestimated'; // Sovrastimato
  }
  
  return {
    difference: difference.toFixed(1),
    percentage: percentage.toFixed(1),
    status,
    realSweetness: realSweetness.toFixed(1)
  };
};

/**
 * Confronta due alimenti e determina quale ha più zucchero
 * Ritorna: 'a' | 'b' | 'equal'
 */
export const compareFoods = (brixA, brixB, threshold = 0.5) => {
  const diff = parseFloat(brixA) - parseFloat(brixB);
  
  if (Math.abs(diff) < threshold) {
    return 'equal';
  } else if (diff > 0) {
    return 'a'; // A ha più zucchero
  } else {
    return 'b'; // B ha più zucchero
  }
};

/**
 * Verifica se la risposta della coppia è corretta
 * userAnswer: 'a_more' | 'b_more' | 'equal'
 * reality: 'a' | 'b' | 'equal'
 */
export const isPairAnswerCorrect = (userAnswer, reality) => {
  const mapping = {
    'a_more': 'a',
    'b_more': 'b',
    'equal': 'equal'
  };
  
  return mapping[userAnswer] === reality;
};

/**
 * Calcola accuracy score basato su precisione delle stime
 * Ritorna punteggio 0-100
 */
export const calculateAccuracyScore = (comparisons) => {
  if (!comparisons || comparisons.length === 0) return 0;
  
  let totalError = 0;
  
  comparisons.forEach(comp => {
    const { difference } = comparePerceptionVsReality(
      comp.perceivedSweetness,
      comp.measuredBrix
    );
    totalError += Math.abs(parseFloat(difference));
  });
  
  const avgError = totalError / comparisons.length;
  
  // Converti errore medio in score (meno errore = più score)
  // Errore 0 = 100 punti, Errore 5+ = 0 punti
  const score = Math.max(0, Math.min(100, 100 - (avgError * 20)));
  
  return score.toFixed(1);
};

export default {
  brixToSweetness,
  sweetnessToLabel,
  comparePerceptionVsReality,
  compareFoods,
  isPairAnswerCorrect,
  calculateAccuracyScore
};
