// src/screens/PreTestScreen.js - Part 2: Perceived Knowledge CON INTERVALLI BRIX
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
      // Load foods from sessionStorage (set by WelcomeScreen from active config)
      const storedFoods = sessionStorage.getItem('foods');
      
      if (storedFoods) {
        const foodsList = JSON.parse(storedFoods);
        setFoods(foodsList);
        initializeResponses(foodsList);
        
        // Also save to sessionStorage for other screens
        sessionStorage.setItem('foods', JSON.stringify(foodsList));
      } else {
        // If no stored foods, redirect to home
        console.error('No foods configuration found. Redirecting to home.');
        alert('Configurazione non trovata. Riparti dalla home.');
        navigate('/');
      }
    } catch (error) {
      console.error('Error loading foods:', error);
      alert('Errore nel caricamento degli alimenti.');
      navigate('/');
    } finally {
      setLoading(false);
    }
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
    
    // Salta Part3Screen e vai direttamente ad Awareness
    navigate('/awareness');
  };

  const getFoodName = (food) => {
    return i18n.language === 'it' ? food.name_it : food.name_en;
  };

  const getScaleDescription = (value) => {
    const descriptions = {
      it: {
        1: "Pochissimo dolce",
        2: "Poco dolce",
        3: "Moderatamente dolce",
        4: "Dolce",
        5: "Molto dolce"
      },
      en: {
        1: "Very little sweet",
        2: "Slightly sweet",
        3: "Moderately sweet",
        4: "Sweet",
        5: "Very sweet"
      }
    };
    
    return descriptions[i18n.language][value];
  };

  // Funzione per ottenere intervalli Brix
  const getBrixRange = (value) => {
    const ranges = {
      1: "0-2 °Bx",
      2: "2-5 °Bx",
      3: "5-8 °Bx",
      4: "8-12 °Bx",
      5: "12+ °Bx"
    };
    return ranges[value] || "";
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
    <div className="screen" style={{ paddingTop: '40px', paddingBottom: '40px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="card">
            <h2>{t('pretest.part2.title')}</h2>
            <p>{t('pretest.instructions')}:</p>
            <div style={{
              background: '#f0f9ff',
              border: '2px solid #0ea5e9',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '24px',
              fontSize: '0.875rem'
            }}>
              <strong>{t('pretest.scale1')}</strong> → <strong>{t('pretest.scale5')}</strong>
            </div>

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
                      style={{ 
                        flex: 1, 
                        textAlign: 'center', 
                        padding: '12px 4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
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
                      <span style={{ 
                        fontSize: '0.65rem', 
                        lineHeight: '1.2',
                        color: responses[food.id] === value ? 'inherit' : '#666'
                      }}>
                        {getScaleDescription(value)}
                      </span>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        lineHeight: '1.1',
                        color: responses[food.id] === value ? 'inherit' : '#999',
                        fontWeight: '600'
                      }}>
                        {getBrixRange(value)}
                      </span>
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

      {/* The global FooterSwitch component renders the official Switch footer. */}
    </div>
  );
}

export default PreTestScreen;
