// src/screens/AwarenessScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AwarenessScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    surprised: '',
    influence: '',
    knowledge: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.surprised || !formData.influence || !formData.knowledge) {
      alert(t('common.error') + ': Please answer all questions');
      return;
    }

    sessionStorage.setItem('awarenessData', JSON.stringify(formData));
    navigate('/measurement');
  };

  const isFormValid = formData.surprised && formData.influence && formData.knowledge;

  return (
    <div className="screen">
      <div className="card">
        <h2>{t('awareness.part4.title')}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Question 1: Surprised about vegetables containing sugar */}
          <div className="form-group">
            <label className="form-label">{t('awareness.surprised')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.surprised === 'yes' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="surprised"
                  value="yes"
                  checked={formData.surprised === 'yes'}
                  onChange={(e) => handleChange('surprised', e.target.value)}
                />
                {t('common.yes')}
              </label>
              <label className={`radio-option ${formData.surprised === 'no' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="surprised"
                  value="no"
                  checked={formData.surprised === 'no'}
                  onChange={(e) => handleChange('surprised', e.target.value)}
                />
                {t('common.no')}
              </label>
            </div>
          </div>

          {/* Question 2: Influence on food choices */}
          <div className="form-group">
            <label className="form-label">{t('awareness.influence')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.influence === 'very' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="influence"
                  value="very"
                  checked={formData.influence === 'very'}
                  onChange={(e) => handleChange('influence', e.target.value)}
                />
                {t('awareness.influence.very')}
              </label>
              <label className={`radio-option ${formData.influence === 'partly' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="influence"
                  value="partly"
                  checked={formData.influence === 'partly'}
                  onChange={(e) => handleChange('influence', e.target.value)}
                />
                {t('awareness.influence.partly')}
              </label>
              <label className={`radio-option ${formData.influence === 'little' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="influence"
                  value="little"
                  checked={formData.influence === 'little'}
                  onChange={(e) => handleChange('influence', e.target.value)}
                />
                {t('awareness.influence.little')}
              </label>
              <label className={`radio-option ${formData.influence === 'not' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="influence"
                  value="not"
                  checked={formData.influence === 'not'}
                  onChange={(e) => handleChange('influence', e.target.value)}
                />
                {t('awareness.influence.not')}
              </label>
            </div>
          </div>

          {/* Question 3: Current knowledge */}
          <div className="form-group">
            <label className="form-label">{t('awareness.knowledge')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.knowledge === 'very' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="knowledge"
                  value="very"
                  checked={formData.knowledge === 'very'}
                  onChange={(e) => handleChange('knowledge', e.target.value)}
                />
                {t('awareness.knowledge.very')}
              </label>
              <label className={`radio-option ${formData.knowledge === 'enough' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="knowledge"
                  value="enough"
                  checked={formData.knowledge === 'enough'}
                  onChange={(e) => handleChange('knowledge', e.target.value)}
                />
                {t('awareness.knowledge.enough')}
              </label>
              <label className={`radio-option ${formData.knowledge === 'little' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="knowledge"
                  value="little"
                  checked={formData.knowledge === 'little'}
                  onChange={(e) => handleChange('knowledge', e.target.value)}
                />
                {t('awareness.knowledge.little')}
              </label>
              <label className={`radio-option ${formData.knowledge === 'nothing' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="knowledge"
                  value="nothing"
                  checked={formData.knowledge === 'nothing'}
                  onChange={(e) => handleChange('knowledge', e.target.value)}
                />
                {t('awareness.knowledge.nothing')}
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
            {t('awareness.next')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AwarenessScreen;
