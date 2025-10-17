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

  const handleStart = async () => {
    try {
      // Carica configurazione attiva
      const response = await fetch('/api/config?active=true');
      
      if (!response.ok) {
        throw new Error('No active configuration found');
      }
      
      const configData = await response.json();
      
      // Salva gli alimenti in sessionStorage
      sessionStorage.setItem('foods', JSON.stringify(configData.foods));
      
      // Salva le coppie per la Parte 3
      sessionStorage.setItem('comparisonPairs', JSON.stringify(configData.pairs));
      
      navigate('/profile');
    } catch (error) {
      console.error('Error loading config:', error);
      alert('Errore nel caricamento della configurazione. Verifica che ci sia una configurazione attiva in Admin > Configurazione.');
    }
  };

  return (
    <div className="screen" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card">
          <h1>{t('welcome.title')}</h1>
          <p className="text-center" style={{ fontSize: '1.2rem', marginBottom: '24px' }}>
            {t('welcome.subtitle')}
          </p>

          {/* Privacy Notice */}
          <div style={{
            background: '#f0f9ff',
            border: '2px solid #0ea5e9',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '24px',
            fontSize: '0.875rem',
            lineHeight: '1.6',
            color: '#0c4a6e'
          }}>
            <strong>ℹ️ Privacy:</strong> {t('welcome.privacy')}
          </div>

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

      {/* The global FooterSwitch component renders the official Switch footer. */}
    </div>
  );
}

export default WelcomeScreen;
