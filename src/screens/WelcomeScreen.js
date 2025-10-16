// src/screens/WelcomeScreen.js - CON FOOTER IDENTICO A SWITCHDIET.EU
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

      {/* FOOTER IDENTICO A SWITCHDIET.EU */}
      <footer style={{
        background: '#1a1a1a',
        color: '#ffffff',
        padding: '3rem 1.5rem 1.5rem',
        marginTop: 'auto'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Logo e Titolo */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <img 
              src="https://switchdiet.eu/wp-content/themes/switchdiet/dist/images/switch-logo.svg" 
              alt="SWITCH Logo"
              style={{ height: '48px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'block';
              }}
            />
            <div style={{ display: 'none', fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>
              SWITCH
            </div>
          </div>

          {/* Grid principale */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
            fontSize: '0.9rem'
          }}>
            {/* Colonna 1: About */}
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                marginBottom: '1rem', 
                fontWeight: '600',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Follow us
              </h3>
              <div style={{ 
                display: 'flex', 
                gap: '1rem',
                marginBottom: '1.5rem'
              }}>
                <a href="https://x.com/SWITCHDiet" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
                  𝕏
                </a>
                <a href="https://www.linkedin.com/company/switchdiet" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
                  in
                </a>
                <a href="https://www.instagram.com/switchdiet" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
                  📷
                </a>
                <a href="https://www.facebook.com/SWITCHDiet" target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
                  f
                </a>
                <a href="https://www.youtube.com/channel/UC..." target="_blank" rel="noopener noreferrer" style={{ color: '#ffffff', fontSize: '1.5rem' }}>
                  ▶
                </a>
              </div>
            </div>

            {/* Colonna 2: Project */}
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                marginBottom: '1rem', 
                fontWeight: '600',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Project
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                lineHeight: '2',
                margin: 0
              }}>
                <li>
                  <a href="https://switchdiet.eu/about-switch/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    About SWITCH
                  </a>
                </li>
                <li>
                  <a href="https://switchdiet.eu/case-studies/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Case studies
                  </a>
                </li>
                <li>
                  <a href="https://switchdiet.eu/project-partners/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Project partners
                  </a>
                </li>
                <li>
                  <a href="https://switchdiet.eu/policy-recommendations/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Policy recommendations
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonna 3: Resources */}
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                marginBottom: '1rem', 
                fontWeight: '600',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Resources
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                lineHeight: '2',
                margin: 0
              }}>
                <li>
                  <a href="https://switchdiet.eu/publications/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Publications
                  </a>
                </li>
                <li>
                  <a href="https://switchdiet.eu/news/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    News & Events
                  </a>
                </li>
                <li>
                  <a href="https://switchdiet.eu/newsletter/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Newsletter
                  </a>
                </li>
              </ul>
            </div>

            {/* Colonna 4: Contact */}
            <div>
              <h3 style={{ 
                fontSize: '1rem', 
                marginBottom: '1rem', 
                fontWeight: '600',
                color: '#ffffff',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Contact
              </h3>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0,
                lineHeight: '2',
                margin: 0
              }}>
                <li>
                  <a href="https://switchdiet.eu/contact/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Contact us
                  </a>
                </li>
                <li>
                  <a href="https://switchdiet.eu/privacy-policy/" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#cccccc', textDecoration: 'none', transition: 'color 0.2s' }}
                     onMouseEnter={(e) => e.target.style.color = '#4CAF50'}
                     onMouseLeave={(e) => e.target.style.color = '#cccccc'}>
                    Privacy policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* EU Funding Info */}
          <div style={{
            borderTop: '1px solid #333333',
            paddingTop: '2rem',
            marginBottom: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2rem',
              flexWrap: 'wrap'
            }}>
              <img 
                src="https://switchdiet.eu/wp-content/themes/switchdiet/dist/images/eu-flag.svg" 
                alt="EU Flag"
                style={{ height: '60px' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div style={{ 
                flex: 1,
                fontSize: '0.8rem',
                lineHeight: '1.6',
                color: '#cccccc'
              }}>
                <p style={{ margin: '0 0 0.5rem 0' }}>
                  <strong>SWITCH</strong> - Project number: <strong>101060483</strong>
                </p>
                <p style={{ margin: 0 }}>
                  Call: <strong>HORIZON-CL6-2021-FARM2FORK-01-12</strong> - Transition to sustainable and healthy dietary behaviour
                </p>
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div style={{
            fontSize: '0.75rem',
            lineHeight: '1.5',
            color: '#999999',
            fontStyle: 'italic'
          }}>
            <p style={{ margin: 0 }}>
              Funded by the European Union. Views and opinions expressed are however those of the author(s) only and do not necessarily reflect those of the European Union or the granting authority. Neither the European Union nor the granting authority can be held responsible for them.
            </p>
          </div>

          {/* Copyright */}
          <div style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #333333',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#999999'
          }}>
            <p style={{ margin: 0 }}>
              © {new Date().getFullYear()} SWITCH Project. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default WelcomeScreen;
