// src/screens/PostTestScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function PostTestScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    different: '',
    differentHow: '',
    awareness: '',
    education: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.different || !formData.awareness || !formData.education) {
      alert(t('common.error') + ': Please answer all questions');
      return;
    }

    // Store posttest data
    sessionStorage.setItem('posttestData', JSON.stringify(formData));
    
    // Save all data to database and navigate to results
    await saveDataToDatabase();
    navigate('/results');
  };

  const saveDataToDatabase = async () => {
    try {
      // Gather all data from sessionStorage
      const profileData = JSON.parse(sessionStorage.getItem('profileData') || '{}');
      const part2Data = JSON.parse(sessionStorage.getItem('part2Data') || '{}');
      const part3Data = JSON.parse(sessionStorage.getItem('part3Data') || '{}');
      const awarenessData = JSON.parse(sessionStorage.getItem('awarenessData') || '{}');
      const measurements = JSON.parse(sessionStorage.getItem('measurements') || '{}');
      const posttestData = formData;
      const foods = JSON.parse(sessionStorage.getItem('foods') || '[]');
      const language = localStorage.getItem('language') || 'it';

      // Prepare document
      const participantData = {
        timestamp: new Date().toISOString(),
        language,
        profile: profileData,
        part2: part2Data,
        part3: part3Data,
        part4_awareness: awarenessData,
        measurements,
        part5_posttest: posttestData,
        foods
      };

      // Store locally for results page
      sessionStorage.setItem('participantData', JSON.stringify(participantData));

      // Save to API
      const response = await fetch('/api/participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(participantData)
      });

      if (response.ok) {
        console.log('Data saved successfully');
      } else {
        console.error('Error saving data');
      }
    } catch (error) {
      console.error('Error saving to database:', error);
      // Continue anyway - data is stored in sessionStorage
    }
  };

  const isFormValid = formData.different && formData.awareness && formData.education;

  return (
    <div className="screen">
      <div className="card">
        <h2>Parte 5 - Dopo la misurazione</h2>
        <p style={{ marginBottom: '24px' }}>
          Dopo aver osservato la misurazione reale del contenuto zuccherino con lo strumento:
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* Question 1: Different from expected */}
          <div className="form-group">
            <label className="form-label">{t('posttest.different')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.different === 'yes' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="different"
                  value="yes"
                  checked={formData.different === 'yes'}
                  onChange={(e) => handleChange('different', e.target.value)}
                />
                {t('common.yes')}
              </label>
              <label className={`radio-option ${formData.different === 'no' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="different"
                  value="no"
                  checked={formData.different === 'no'}
                  onChange={(e) => handleChange('different', e.target.value)}
                />
                {t('common.no')}
              </label>
            </div>
          </div>

          {/* Optional text field if yes */}
          {formData.different === 'yes' && (
            <div className="form-group">
              <label className="form-label">Se sì, in che senso?</label>
              <input
                type="text"
                className="form-input"
                value={formData.differentHow}
                onChange={(e) => handleChange('differentHow', e.target.value)}
                placeholder={i18n.language === 'it' ? "es. Le verdure avevano più zucchero di quanto pensassi" : "e.g. Vegetables had more sugar than I thought"}
              />
            </div>
          )}

          {/* Question 2: Increased awareness */}
          <div className="form-group">
            <label className="form-label">{t('posttest.awareness')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.awareness === 'much' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="awareness"
                  value="much"
                  checked={formData.awareness === 'much'}
                  onChange={(e) => handleChange('awareness', e.target.value)}
                />
                {t('posttest.awareness.much')}
              </label>
              <label className={`radio-option ${formData.awareness === 'bit' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="awareness"
                  value="bit"
                  checked={formData.awareness === 'bit'}
                  onChange={(e) => handleChange('awareness', e.target.value)}
                />
                {t('posttest.awareness.bit')}
              </label>
              <label className={`radio-option ${formData.awareness === 'same' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="awareness"
                  value="same"
                  checked={formData.awareness === 'same'}
                  onChange={(e) => handleChange('awareness', e.target.value)}
                />
                {t('posttest.awareness.same')}
              </label>
            </div>
          </div>

          {/* Question 3: Educational use */}
          <div className="form-group">
            <label className="form-label">{t('posttest.education')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.education === 'yes' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="education"
                  value="yes"
                  checked={formData.education === 'yes'}
                  onChange={(e) => handleChange('education', e.target.value)}
                />
                {t('posttest.education.yes')}
              </label>
              <label className={`radio-option ${formData.education === 'no' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="education"
                  value="no"
                  checked={formData.education === 'no'}
                  onChange={(e) => handleChange('education', e.target.value)}
                />
                {t('posttest.education.no')}
              </label>
              <label className={`radio-option ${formData.education === 'dunno' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="education"
                  value="dunno"
                  checked={formData.education === 'dunno'}
                  onChange={(e) => handleChange('education', e.target.value)}
                />
                {t('posttest.education.dunno')}
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
            {t('posttest.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostTestScreen;
