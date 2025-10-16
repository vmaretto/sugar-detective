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

      {/* Switch Footer */}
      <footer style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
        color: 'white',
        padding: '2rem 1rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '2rem',
          fontSize: '0.875rem'
        }}>
          {/* Logo e Descrizione */}
          <div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>
              SWITCH
            </h3>
            <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
              Sustainable and Healthy Diets in Europe
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
              {i18n.language === 'it' ? 'Link Utili' : 'Useful Links'}
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2' }}>
              <li>
                <a href="https://switchdiet.eu" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  🌐 {i18n.language === 'it' ? 'Sito Web' : 'Website'}
                </a>
              </li>
              <li>
                <a href="https://switchdiet.eu/about" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  ℹ️ {i18n.language === 'it' ? 'Chi Siamo' : 'About Us'}
                </a>
              </li>
              <li>
                <a href="https://switchdiet.eu/contact" target="_blank" rel="noopener noreferrer" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  ✉️ {i18n.language === 'it' ? 'Contatti' : 'Contact'}
                </a>
              </li>
            </ul>
          </div>

          {/* EU Funding */}
          <div>
            <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>
              EU Funding
            </h4>
            <p style={{ lineHeight: '1.6', opacity: 0.9 }}>
              This project has received funding from the European Union's Horizon 2020 research and innovation programme.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div style={{
          maxWidth: '1200px',
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          textAlign: 'center',
          fontSize: '0.75rem',
          opacity: 0.8
        }}>
          © 2025 SWITCH Project. All rights reserved. | Sugar Detective - Interactive Experience
        </div>
      </footer>
    </div>
  );
}

export default WelcomeScreen;
