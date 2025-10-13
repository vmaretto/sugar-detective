// src/screens/ProfileScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ProfileScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    profession: '',
    consumption: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.age || !formData.gender || !formData.profession || !formData.consumption) {
      alert(t('common.error') + ': Please fill all fields');
      return;
    }

    // Store profile data in sessionStorage
    sessionStorage.setItem('profileData', JSON.stringify(formData));
    
    // Navigate to pre-test
    navigate('/pretest');
  };

  const isFormValid = formData.age && formData.gender && formData.profession && formData.consumption;

  return (
    <div className="screen">
      <div className="card">
        <h2>{t('profile.title')}</h2>
        
        <form onSubmit={handleSubmit}>
          {/* Age */}
          <div className="form-group">
            <label className="form-label">{t('profile.age')}</label>
            <input
              type="number"
              className="form-input"
              value={formData.age}
              onChange={(e) => handleChange('age', e.target.value)}
              min="1"
              max="120"
              placeholder="25"
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">{t('profile.gender')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.gender === 'F' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="F"
                  checked={formData.gender === 'F'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.f')}
              </label>
              <label className={`radio-option ${formData.gender === 'M' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="M"
                  checked={formData.gender === 'M'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.m')}
              </label>
              <label className={`radio-option ${formData.gender === 'Other' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="gender"
                  value="Other"
                  checked={formData.gender === 'Other'}
                  onChange={(e) => handleChange('gender', e.target.value)}
                />
                {t('profile.gender.other')}
              </label>
            </div>
          </div>

          {/* Profession */}
          <div className="form-group">
            <label className="form-label">{t('profile.profession')}</label>
            <input
              type="text"
              className="form-input"
              value={formData.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              placeholder="e.g. Student, Engineer, Teacher"
            />
          </div>

          {/* Fruit/Vegetable Consumption */}
          <div className="form-group">
            <label className="form-label">{t('profile.consumption')}</label>
            <div className="radio-group">
              <label className={`radio-option ${formData.consumption === 'daily' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="consumption"
                  value="daily"
                  checked={formData.consumption === 'daily'}
                  onChange={(e) => handleChange('consumption', e.target.value)}
                />
                {t('profile.consumption.daily')}
              </label>
              <label className={`radio-option ${formData.consumption === 'weekly' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="consumption"
                  value="weekly"
                  checked={formData.consumption === 'weekly'}
                  onChange={(e) => handleChange('consumption', e.target.value)}
                />
                {t('profile.consumption.weekly')}
              </label>
              <label className={`radio-option ${formData.consumption === 'rarely' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="consumption"
                  value="rarely"
                  checked={formData.consumption === 'rarely'}
                  onChange={(e) => handleChange('consumption', e.target.value)}
                />
                {t('profile.consumption.rarely')}
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={!isFormValid}>
            {t('profile.next')}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileScreen;
