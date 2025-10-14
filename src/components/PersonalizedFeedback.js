// src/components/PersonalizedFeedback.js
import React from 'react';
import { ThumbsUp, ThumbsDown, Lightbulb, TrendingUp } from 'lucide-react';

const PersonalizedFeedback = ({ personalScores, language = 'it' }) => {
  const { totalScore, knowledgeScore, awarenessScore, pairsScore } = personalScores;

  // Generate personalized messages based on scores
  const getKnowledgeFeedback = () => {
    if (knowledgeScore >= 80) {
      return {
        icon: <ThumbsUp size={32} color="#10b981" />,
        title: language === 'it' ? '🎯 Ottima conoscenza!' : '🎯 Excellent knowledge!',
        message: language === 'it' 
          ? 'Le tue stime di dolcezza sono molto accurate! Hai un\'ottima percezione del contenuto di zuccheri negli alimenti.'
          : 'Your sweetness estimates are very accurate! You have an excellent perception of sugar content in foods.',
        color: '#10b981'
      };
    } else if (knowledgeScore >= 50) {
      return {
        icon: <Lightbulb size={32} color="#f59e0b" />,
        title: language === 'it' ? '📚 Buona base!' : '📚 Good foundation!',
        message: language === 'it'
          ? 'Hai una discreta conoscenza, ma c\'è margine di miglioramento. Alcuni alimenti ti hanno sorpreso?'
          : 'You have decent knowledge, but there\'s room for improvement. Were you surprised by some foods?',
        color: '#f59e0b'
      };
    } else {
      return {
        icon: <TrendingUp size={32} color="#ef4444" />,
        title: language === 'it' ? '💡 Scopri di più!' : '💡 Learn more!',
        message: language === 'it'
          ? 'La percezione della dolcezza può ingannare! Molti alimenti "sani" contengono più zucchero di quanto pensiamo.'
          : 'Sweetness perception can be deceiving! Many "healthy" foods contain more sugar than we think.',
        color: '#ef4444'
      };
    }
  };

  const getPairsFeedback = () => {
    if (pairsScore >= 80) {
      return {
        icon: <ThumbsUp size={32} color="#10b981" />,
        title: language === 'it' ? '🏆 Eccellente!' : '🏆 Excellent!',
        message: language === 'it'
          ? 'Hai indovinato la maggior parte delle comparazioni! Sai riconoscere bene quali alimenti sono più dolci.'
          : 'You guessed most comparisons correctly! You know well which foods are sweeter.',
        color: '#10b981'
      };
    } else if (pairsScore >= 50) {
      return {
        icon: <Lightbulb size={32} color="#f59e0b" />,
        title: language === 'it' ? '🎲 Non male!' : '🎲 Not bad!',
        message: language === 'it'
          ? 'Hai indovinato circa metà delle comparazioni. Alcune coppie erano difficili!'
          : 'You guessed about half of the comparisons. Some pairs were tricky!',
        color: '#f59e0b'
      };
    } else {
      return {
        icon: <ThumbsDown size={32} color="#ef4444" />,
        title: language === 'it' ? '🤔 Difficile, vero?' : '🤔 Tricky, right?',
        message: language === 'it'
          ? 'Confrontare gli alimenti è più difficile di quanto sembra! I risultati potrebbero averti sorpreso.'
          : 'Comparing foods is harder than it seems! The results might have surprised you.',
        color: '#ef4444'
      };
    }
  };

  const getAwarenessFeedback = () => {
    if (awarenessScore >= 70) {
      return {
        icon: <ThumbsUp size={32} color="#10b981" />,
        title: language === 'it' ? '🧠 Ottima consapevolezza!' : '🧠 Great awareness!',
        message: language === 'it'
          ? 'Sei consapevole dei tuoi limiti e delle difficoltà del test. Questo è il primo passo per migliorare!'
          : 'You\'re aware of your limitations and the test\'s difficulty. This is the first step to improve!',
        color: '#10b981'
      };
    } else if (awarenessScore >= 40) {
      return {
        icon: <Lightbulb size={32} color="#f59e0b" />,
        title: language === 'it' ? '🤷 Incertezza moderata' : '🤷 Moderate uncertainty',
        message: language === 'it'
          ? 'Hai un livello medio di consapevolezza. A volte è difficile valutare quanto sappiamo davvero!'
          : 'You have a medium level of awareness. Sometimes it\'s hard to evaluate how much we really know!',
        color: '#f59e0b'
      };
    } else {
      return {
        icon: <ThumbsDown size={32} color="#ef4444" />,
        title: language === 'it' ? '😅 Eccesso di fiducia?' : '😅 Overconfident?',
        message: language === 'it'
          ? 'Potresti essere troppo sicuro delle tue risposte. L\'importante è imparare dai risultati!'
          : 'You might be too confident in your answers. The important thing is to learn from the results!',
        color: '#ef4444'
      };
    }
  };

  const getOverallFeedback = () => {
    if (totalScore >= 70) {
      return {
        emoji: '🌟',
        title: language === 'it' ? 'Prestazione eccellente!' : 'Excellent performance!',
        message: language === 'it'
          ? 'Complimenti! Hai dimostrato un\'ottima conoscenza degli zuccheri negli alimenti. Continua così!'
          : 'Congratulations! You demonstrated excellent knowledge of sugar in foods. Keep it up!',
        color: '#10b981'
      };
    } else if (totalScore >= 40) {
      return {
        emoji: '👍',
        title: language === 'it' ? 'Buon lavoro!' : 'Good job!',
        message: language === 'it'
          ? 'Hai una conoscenza discreta. Alcune scoperte ti hanno sorpreso? È normale! Gli zuccheri possono nascondersi ovunque.'
          : 'You have decent knowledge. Were you surprised by some findings? That\'s normal! Sugars can hide anywhere.',
        color: '#f59e0b'
      };
    } else {
      return {
        emoji: '💪',
        title: language === 'it' ? 'Ottima occasione per imparare!' : 'Great opportunity to learn!',
        message: language === 'it'
          ? 'Non preoccuparti! La maggior parte delle persone sottostima il contenuto di zuccheri. Ora sai qualcosa in più!'
          : 'Don\'t worry! Most people underestimate sugar content. Now you know something more!',
        color: '#667eea'
      };
    }
  };

  const knowledgeFB = getKnowledgeFeedback();
  const pairsFB = getPairsFeedback();
  const awarenessFB = getAwarenessFeedback();
  const overallFB = getOverallFeedback();

  return (
    <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      {/* Overall Feedback */}
      <div style={{
        background: `linear-gradient(135deg, ${overallFB.color}15 0%, ${overallFB.color}05 100%)`,
        border: `2px solid ${overallFB.color}`,
        borderRadius: '20px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{overallFB.emoji}</div>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 'bold',
          color: overallFB.color,
          marginBottom: '1rem'
        }}>
          {overallFB.title}
        </h2>
        <p style={{ fontSize: '1.125rem', color: '#666', lineHeight: '1.6' }}>
          {overallFB.message}
        </p>
      </div>

      {/* Detailed Feedback */}
      <h3 style={{
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#667eea',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        {language === 'it' ? '📊 Analisi dettagliata' : '📊 Detailed analysis'}
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* Knowledge Feedback */}
        <div style={{
          background: 'white',
          border: `2px solid ${knowledgeFB.color}`,
          borderRadius: '15px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {knowledgeFB.icon}
            <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: knowledgeFB.color, margin: 0 }}>
              {knowledgeFB.title}
            </h4>
          </div>
          <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
            {knowledgeFB.message}
          </p>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: `${knowledgeFB.color}10`,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {language === 'it' ? 'Punteggio Conoscenza' : 'Knowledge Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: knowledgeFB.color }}>
              {knowledgeScore}/100
            </div>
          </div>
        </div>

        {/* Pairs Feedback */}
        <div style={{
          background: 'white',
          border: `2px solid ${pairsFB.color}`,
          borderRadius: '15px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {pairsFB.icon}
            <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: pairsFB.color, margin: 0 }}>
              {pairsFB.title}
            </h4>
          </div>
          <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
            {pairsFB.message}
          </p>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: `${pairsFB.color}10`,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {language === 'it' ? 'Punteggio Coppie' : 'Pairs Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: pairsFB.color }}>
              {pairsScore}/100
            </div>
          </div>
        </div>

        {/* Awareness Feedback */}
        <div style={{
          background: 'white',
          border: `2px solid ${awarenessFB.color}`,
          borderRadius: '15px',
          padding: '1.5rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            {awarenessFB.icon}
            <h4 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: awarenessFB.color, margin: 0 }}>
              {awarenessFB.title}
            </h4>
          </div>
          <p style={{ color: '#666', lineHeight: '1.6', margin: 0 }}>
            {awarenessFB.message}
          </p>
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: `${awarenessFB.color}10`,
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              {language === 'it' ? 'Punteggio Consapevolezza' : 'Awareness Score'}
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: awarenessFB.color }}>
              {awarenessScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Score Explanation */}
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        background: '#f9fafb',
        borderRadius: '15px',
        border: '2px solid #e5e7eb'
      }}>
        <h4 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          color: '#667eea',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Lightbulb size={24} />
          {language === 'it' ? 'Come vengono calcolati i punteggi?' : 'How are scores calculated?'}
        </h4>
        
        <div style={{ color: '#666', lineHeight: '1.8' }}>
          <p style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: '#10b981' }}>
              {language === 'it' ? '🎯 Conoscenza (40%):' : '🎯 Knowledge (40%):'}
            </strong>{' '}
            {language === 'it'
              ? 'Misura quanto sei preciso nel stimare la dolcezza. Più le tue stime si avvicinano ai valori reali misurati, più alto è il punteggio.'
              : 'Measures how accurate you are in estimating sweetness. The closer your estimates to the real measured values, the higher the score.'}
          </p>
          
          <p style={{ marginBottom: '0.75rem' }}>
            <strong style={{ color: '#8b5cf6' }}>
              {language === 'it' ? '🎲 Coppie (30%):' : '🎲 Pairs (30%):'}
            </strong>{' '}
            {language === 'it'
              ? 'Percentuale di volte in cui hai indovinato correttamente quale alimento contiene più zucchero tra due.'
              : 'Percentage of times you correctly guessed which food contains more sugar between two.'}
          </p>
          
          <p style={{ marginBottom: 0 }}>
            <strong style={{ color: '#f59e0b' }}>
              {language === 'it' ? '🧠 Consapevolezza (30%):' : '🧠 Awareness (30%):'}
            </strong>{' '}
            {language === 'it'
              ? 'Valuta quanto sei consapevole dei tuoi limiti. Essere troppo sicuri quando si sbaglia abbassa il punteggio!'
              : 'Evaluates how aware you are of your limitations. Being too confident when wrong lowers the score!'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PersonalizedFeedback;
