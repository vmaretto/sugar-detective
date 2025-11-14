// src/screens/Part3Screen.js - Part 3: Objective Knowledge
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Part3Screen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [pairs, setPairs] = useState([]);
  const [foods, setFoods] = useState([]);
  const [responses, setResponses] = useState({});

  useEffect(() => {
    // Load comparison pairs from sessionStorage (set by WelcomeScreen)
    const storedPairs = sessionStorage.getItem('comparisonPairs');
    const storedFoods = sessionStorage.getItem('foods');
    
    if (!storedPairs || !storedFoods) {
      console.error('No comparison pairs or foods found');
      alert('Configurazione non trovata. Riparti dalla home.');
      navigate('/');
      return;
    }
    
    const pairsData = JSON.parse(storedPairs);
    const foodsData = JSON.parse(storedFoods);
    
    // Create a lookup map for foods
    const foodsMap = {};
    foodsData.forEach(food => {
      foodsMap[food.id] = food;
    });
    
    // Transform pairs into usable format
    const transformedPairs = pairsData.map((pair, index) => ({
      id: `pair_${index}`,
      foodA: foodsMap[pair.food_a_id],
      foodB: foodsMap[pair.food_b_id],
      order: pair.order_position || index
    })).filter(pair => pair.foodA && pair.foodB); // Filter out any invalid pairs
    
    setPairs(transformedPairs);
    setFoods(foodsData);
    
    // Initialize responses
    const initialResponses = {};
    transformedPairs.forEach(pair => {
      initialResponses[pair.id] = null;
    });
    setResponses(initialResponses);
  }, [navigate]);

  const handleComparisonSelect = (pairId, value) => {
    setResponses(prev => ({
      ...prev,
      [pairId]: value
    }));
  };

  const handleSubmit = () => {
    // Validate all comparisons made
    const allCompleted = pairs.every(pair => responses[pair.id] !== null);
    
    if (!allCompleted) {
      alert(t('common.error') + ': ' + (i18n.language === 'it' ? 'Per favore completa tutti i confronti' : 'Please complete all comparisons'));
      return;
    }

    // Store Part 3 data
    sessionStorage.setItem('part3Data', JSON.stringify(responses));
    
    navigate('/awareness');
  };

  const getFoodName = (food) => {
    if (!food) return '';
    return i18n.language === 'it' ? food.name_it : food.name_en;
  };

  if (pairs.length === 0) {
    return (
      <div className="screen">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="card">
          <h2>{t('pretest.part3.title')}</h2>
          <p style={{ marginBottom: '24px' }}>
            {t('pretest.part3.instructions')}
          </p>

          {pairs.map((pair, index) => (
            <div key={pair.id} className="food-item">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '16px',
                padding: '16px',
                background: '#f3f4f6',
                borderRadius: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                  <span style={{ fontSize: '2rem' }}>{pair.foodA?.emoji}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {getFoodName(pair.foodA)}
                  </span>
                </div>
                
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                  VS
                </span>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>
                    {getFoodName(pair.foodB)}
                  </span>
                  <span style={{ fontSize: '2rem' }}>{pair.foodB?.emoji}</span>
                </div>
              </div>

              <div className="radio-group" style={{ display: 'flex', gap: '8px' }}>
                <label className={`radio-option ${responses[pair.id] === 'a_more' ? 'selected' : ''}`} style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name={`comparison_${pair.id}`}
                    value="a_more"
                    checked={responses[pair.id] === 'a_more'}
                    onChange={(e) => handleComparisonSelect(pair.id, e.target.value)}
                  />
                  {pair.foodA?.emoji} {t('pretest.part3.more')}
                </label>
                
                <label className={`radio-option ${responses[pair.id] === 'equal' ? 'selected' : ''}`} style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name={`comparison_${pair.id}`}
                    value="equal"
                    checked={responses[pair.id] === 'equal'}
                    onChange={(e) => handleComparisonSelect(pair.id, e.target.value)}
                  />
                  {t('pretest.equal')}
                </label>
                
                <label className={`radio-option ${responses[pair.id] === 'b_more' ? 'selected' : ''}`} style={{ flex: 1 }}>
                  <input
                    type="radio"
                    name={`comparison_${pair.id}`}
                    value="b_more"
                    checked={responses[pair.id] === 'b_more'}
                    onChange={(e) => handleComparisonSelect(pair.id, e.target.value)}
                  />
                  {pair.foodB?.emoji} {t('pretest.part3.more')}
                </label>
              </div>
            </div>
          ))}

          <button 
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={!pairs.every(pair => responses[pair.id] !== null)}
          >
            {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Part3Screen;
