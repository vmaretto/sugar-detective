// src/screens/PreTestScreen.js - Part 2: Perceived Knowledge
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function PreTestScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    try {
      // Load from API or use default
      const response = await fetch('/api/foods');
      if (response.ok) {
        const foodsList = await response.json();
        setFoods(foodsList);
        initializeResponses(foodsList);
      } else {
        setDefaultFoods();
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      setDefaultFoods();
    }
  };

  const setDefaultFoods = () => {
    const defaultFoods = [
      { id: 'apple', name_it: 'Mela', name_en: 'Apple', emoji: '🍎', isReference: true },
      { id: 'banana', name_it: 'Banana', name_en: 'Banana', emoji: '🍌', isReference: false },
      { id: 'watermelon', name_it: 'Anguria', name_en: 'Watermelon', emoji: '🍉', isReference: false },
      { id: 'tomato', name_it: 'Pomodoro', name_en: 'Tomato', emoji: '🍅', isReference: false },
      { id: 'carrot', name_it: 'Carota', name_en: 'Carrot', emoji: '🥕', isReference: false },
      { id: 'pepper', name_it: 'Peperone', name_en: 'Bell Pepper', emoji: '🫑', isReference: false }
    ];
    setFoods(defaultFoods);
    initializeResponses(defaultFoods);
  };

  const initializeResponses = (foodsList) => {
    const initialResponses = {};
    foodsList.forEach(food => {
      initialResponses[food.id] = null;
    });
    setResponses(initialResponses);
    setLoading(false);
  };

  const handleSweetnessSelect = (foodId, value) => {
    setResponses(prev => ({
      ...prev,
      [foodId]: parseInt(value)
    }));
  };

  const handleSubmit = () => {
    // Validate all foods rated
    const allRated = foods.every(food => responses[food.id] !== null);
    
    if (!allRated) {
      alert(t('common.error') + ': ' + (i18n.language === 'it' ? 'Per favore valuta tutti gli alimenti' : 'Please rate all foods'));
      return;
    }

    // Store Part 2 data
    const part2Data = {
      responses,
      timestamp: Date.now()
    };
    
    sessionStorage.setItem('part2Data', JSON.stringify(part2Data));
    sessionStorage.setItem('foods', JSON.stringify(foods));
    
    navigate('/part3');
  };

  const getFoodName = (food) => {
    return i18n.language === 'it' ? food.name_it : food.name_en;
  };

  if (loading) {
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
          <h2>Parte 2 - Conoscenza percepita</h2>
          <p>Per ognuno dei seguenti alimenti, indica quanto pensi che sia dolce (cioè quanto zucchero naturale contiene) su una scala da 1 a 5:</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-light)', marginBottom: '24px' }}>
            1 = pochissimo zucchero, 5 = molto zucchero
          </p>

          {foods.map(food => (
            <div key={food.id} className="food-item">
              <div className="food-header">
                <span className="food-emoji">{food.emoji}</span>
                <span className="food-name">{getFoodName(food)}</span>
              </div>

              <div className="radio-group" style={{ flexDirection: 'row', gap: '8px', justifyContent: 'space-between' }}>
                {[1, 2, 3, 4, 5].map(value => (
                  <label 
                    key={value} 
                    className={`radio-option ${responses[food.id] === value ? 'selected' : ''}`}
                    style={{ flex: 1, textAlign: 'center', padding: '16px 8px' }}
                    onClick={() => handleSweetnessSelect(food.id, value)}
                  >
                    <input
                      type="radio"
                      name={`sweetness-${food.id}`}
                      value={value}
                      checked={responses[food.id] === value}
                      onChange={() => handleSweetnessSelect(food.id, value)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <button className="btn btn-primary" onClick={handleSubmit}>
            {t('common.next')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreTestScreen;
