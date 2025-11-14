// src/screens/MeasurementScreen.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function MeasurementScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [foods, setFoods] = useState([]);
  const [measurements, setMeasurements] = useState({});

  useEffect(() => {
    // Load foods from session storage
    const storedFoods = JSON.parse(sessionStorage.getItem('foods') || '[]');
    setFoods(storedFoods);
    
    // Initialize measurements - SOLO BRIX
    const initialMeasurements = {};
    storedFoods.forEach(food => {
      initialMeasurements[food.id] = {
        brix: ''
      };
    });
    setMeasurements(initialMeasurements);
  }, []);

  const handleMeasurementChange = (foodId, value) => {
    setMeasurements(prev => ({
      ...prev,
      [foodId]: {
        brix: value
      }
    }));
  };

  const handleSubmit = () => {
    // Validate that all measurements are filled
    const allFilled = foods.every(food => 
      measurements[food.id]?.brix
    );

    if (!allFilled) {
      alert(t('common.error') + ': Please fill all measurements');
      return;
    }

    // Store measurements
    sessionStorage.setItem('measurements', JSON.stringify(measurements));
    navigate('/posttest');
  };

  const getFoodName = (food) => {
    return i18n.language === 'it' ? food.name_it : food.name_en;
  };

  const allMeasurementsFilled = foods.length > 0 && foods.every(food => 
    measurements[food.id]?.brix
  );

  return (
    <div className="screen" style={{ paddingTop: '40px', paddingBottom: '40px', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1 }}>
        <div className="container" style={{ maxWidth: '700px' }}>
          <div className="card">
            <h2>{t('measurement.screen.title')}</h2>
            <p style={{ marginBottom: '16px' }}>
              {t('measurement.detailed.instructions')}
            </p>

            {/* Spiegazione Brix */}
            <div style={{
              background: '#fef3c7',
              border: '2px solid #fbbf24',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              fontSize: '0.875rem',
              lineHeight: '1.6'
            }}>
              <strong>📊 Cos'è il °Brix?</strong>
              <p style={{ margin: '8px 0 0 0' }}>
                {t('measurement.brixExplanation')}
              </p>
            </div>

            {foods.map(food => (
              <div key={food.id} className="food-item">
                <div className="food-header">
                  <span className="food-emoji">{food.emoji}</span>
                  <span className="food-name">{getFoodName(food)}</span>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('measurement.brix')}</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-input"
                    value={measurements[food.id]?.brix || ''}
                    onChange={(e) => handleMeasurementChange(food.id, e.target.value)}
                    placeholder={t('measurement.placeholder.brix')}
                  />
                </div>
              </div>
            ))}

            <button 
              className="btn btn-primary" 
              onClick={handleSubmit}
              disabled={!allMeasurementsFilled}
            >
              {t('common.next')}
            </button>
          </div>
        </div>
      </div>

      {/* The global FooterSwitch component renders the official Switch footer. */}
    </div>
  );
}

export default MeasurementScreen;
