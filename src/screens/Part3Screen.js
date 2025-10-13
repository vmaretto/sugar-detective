// src/screens/Part3Screen.js - Part 3: Objective Knowledge
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Part3Screen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [responses, setResponses] = useState({});
  const [referenceFood, setReferenceFood] = useState(null);

  useEffect(() => {
    // Load foods from session
    const storedFoods = JSON.parse(sessionStorage.getItem('foods') || '[]');
    const reference = storedFoods.find(f => f.isReference) || storedFoods[0];
    const otherFoods = storedFoods.filter(f => !f.isReference);
    
    setFoods(otherFoods);
    setReferenceFood(reference);
    
    // Initialize responses
    const initialResponses = {};
    otherFoods.forEach(food => {
      initialResponses[food.id] = null;
    });
    setResponses(initialResponses);
  }, []);

  const handleComparisonSelect = (foodId, value) => {
    setResponses(prev => ({
      ...prev,
      [foodId]: value
    }));
  };

  const handleSubmit = () => {
    // Validate all comparisons made
    const allCompleted = foods.every(food => responses[food.id] !== null);
    
    if (!allCompleted) {
      alert(t('common.error') + ': ' + (i18n.language === 'it' ? 'Per favore completa tutti i confronti' : 'Please complete all comparisons'));
      return;
    }

    // Store Part 3 data
    sessionStorage.setItem('part3Data', JSON.stringify(responses));
    
    navigate('/awareness');
  };

  const getFoodName = (food) => {
    return i18n.language === 'it' ? food.name_it : food.name_en;
  };

  if (!referenceFood) {
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
          <h2>Parte 3 - Conoscenza oggettiva</h2>
          <p>
            Per ognuno, indica se pensi che contenga <strong>più, uguale o meno</strong> zucchero rispetto alla{' '}
            <strong>{referenceFood.emoji} {getFoodName(referenceFood)}</strong>:
          </p>

          {foods.map(food => (
            <div key={food.id} className="food-item">
              <div className="food-header">
                <span className="food-emoji">{food.emoji}</span>
                <span className="food-name">{getFoodName(food)}</span>
              </div>

              <div className="form-group">
                <label className="form-label">Rispetto alla {getFoodName(referenceFood)}:</label>
                <div className="radio-group">
                  <label 
                    className={`radio-option ${responses[food.id] === 'more' ? 'selected' : ''}`}
                    onClick={() => handleComparisonSelect(food.id, 'more')}
                  >
                    <input
                      type="radio"
                      name={`comparison-${food.id}`}
                      value="more"
                      checked={responses[food.id] === 'more'}
                      onChange={() => {}}
                    />
                    {i18n.language === 'it' ? 'Più zucchero' : 'More sugar'}
                  </label>
                  <label 
                    className={`radio-option ${responses[food.id] === 'equal' ? 'selected' : ''}`}
                    onClick={() => handleComparisonSelect(food.id, 'equal')}
                  >
                    <input
                      type="radio"
                      name={`comparison-${food.id}`}
                      value="equal"
                      checked={responses[food.id] === 'equal'}
                      onChange={() => {}}
                    />
                    {i18n.language === 'it' ? 'Uguale' : 'Equal'}
                  </label>
                  <label 
                    className={`radio-option ${responses[food.id] === 'less' ? 'selected' : ''}`}
                    onClick={() => handleComparisonSelect(food.id, 'less')}
                  >
                    <input
                      type="radio"
                      name={`comparison-${food.id}`}
                      value="less"
                      checked={responses[food.id] === 'less'}
                      onChange={() => {}}
                    />
                    {i18n.language === 'it' ? 'Meno zucchero' : 'Less sugar'}
                  </label>
                </div>
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

export default Part3Screen;
