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
    
    // Initialize measurements
    const initialMeasurements = {};
    storedFoods.forEach(food => {
      initialMeasurements[food.id] = {
        brix: '',
        glucose: ''
      };
    });
    setMeasurements(initialMeasurements);
  }, []);

  const handleMeasurementChange = (foodId, field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [foodId]: {
        ...prev[foodId],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    // Validate that all measurements are filled
    const allFilled = foods.every(food => 
      measurements[food.id]?.brix && measurements[food.id]?.glucose
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
    measurements[food.id]?.brix && measurements[food.id]?.glucose
  );

  return (
    <div className="screen" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
      <div className="container" style={{ maxWidth: '700px' }}>
        <div className="card">
          <h2>Misurazione con spettrometro</h2>
          <p style={{ marginBottom: '24px' }}>
            <strong>Ora usa lo spettrometro per misurare ogni alimento</strong> e inserisci i valori rilevati qui sotto:
          </p>

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
                  onChange={(e) => handleMeasurementChange(food.id, 'brix', e.target.value)}
                  placeholder={t('measurement.placeholder.brix')}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('measurement.glucose')}</label>
                <input
                  type="number"
                  step="0.1"
                  className="form-input"
                  value={measurements[food.id]?.glucose || ''}
                  onChange={(e) => handleMeasurementChange(food.id, 'glucose', e.target.value)}
                  placeholder={t('measurement.placeholder.glucose')}
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
  );
}

export default MeasurementScreen;
