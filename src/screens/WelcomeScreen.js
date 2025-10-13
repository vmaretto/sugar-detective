// src/screens/WelcomeScreen.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('it');

  const handleLanguageChange = (lang) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    // Store language preference
    localStorage.setItem('language', lang);
  };

  const handleStart = () => {
    navigate('/profile');
  };

  return (
    <div className="screen">
      <div className="card">
        <h1>{t('welcome.title')}</h1>
        <p className="text-center" style={{ fontSize: '1.2rem', marginBottom: '32px' }}>
          {t('welcome.subtitle')}
        </p>

        <div className="language-selector">
          <button
            className={`language-btn ${selectedLanguage === 'it' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('it')}
          >
            🇮🇹 Italiano
          </button>
          <button
            className={`language-btn ${selectedLanguage === 'en' ? 'active' : ''}`}
            onClick={() => handleLanguageChange('en')}
          >
            🇬🇧 English
          </button>
        </div>

        <button className="btn btn-primary" onClick={handleStart}>
          {t('welcome.start')}
        </button>
      </div>
    </div>
  );
}

export default WelcomeScreen;
