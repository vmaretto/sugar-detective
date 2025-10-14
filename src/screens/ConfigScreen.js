// src/screens/ConfigScreen.js - Pannello di Configurazione Esperienza
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Settings, Plus, Trash2, Check, X, ArrowLeft } from 'lucide-react';

const ConfigScreen = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [allFoods, setAllFoods] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [activeConfig, setActiveConfig] = useState(null);
  const [editingConfig, setEditingConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [selectedFoodIds, setSelectedFoodIds] = useState([]);
  const [comparisonPairs, setComparisonPairs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load all foods
      const foodsRes = await fetch('/api/foods');
      const foodsData = await foodsRes.json();
      setAllFoods(foodsData);
      
      // Load active config
      const configRes = await fetch('/api/config?active=true');
      if (configRes.ok) {
        const configData = await configRes.json();
        setActiveConfig(configData);
        setSelectedFoodIds(configData.config.selected_food_ids);
        
        // Transform pairs to simpler format
        const pairs = configData.pairs.map(p => ({
          food_a_id: p.food_a_id,
          food_b_id: p.food_b_id
        }));
        setComparisonPairs(pairs);
      }
      
      // Load all configs
      const allConfigsRes = await fetch('/api/config');
      const allConfigsData = await allConfigsRes.json();
      setConfigs(allConfigsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  const toggleFoodSelection = (foodId) => {
    setSelectedFoodIds(prev => {
      if (prev.includes(foodId)) {
        return prev.filter(id => id !== foodId);
      } else {
        return [...prev, foodId];
      }
    });
  };

  const addComparisonPair = () => {
    if (selectedFoodIds.length < 2) {
      alert('Seleziona almeno 2 alimenti prima di creare coppie');
      return;
    }
    
    setComparisonPairs(prev => [...prev, {
      food_a_id: selectedFoodIds[0],
      food_b_id: selectedFoodIds[1]
    }]);
  };

  const removePair = (index) => {
    setComparisonPairs(prev => prev.filter((_, i) => i !== index));
  };

  const updatePair = (index, field, value) => {
    setComparisonPairs(prev => {
      const newPairs = [...prev];
      newPairs[index] = { ...newPairs[index], [field]: parseInt(value) };
      return newPairs;
    });
  };

  const saveConfiguration = async () => {
    if (!configName || selectedFoodIds.length === 0) {
      alert('Inserisci un nome e seleziona almeno un alimento');
      return;
    }

    try {
      const payload = {
        name: configName || 'Nuova Configurazione',
        description: configDescription,
        selected_food_ids: selectedFoodIds,
        pairs: comparisonPairs,
        activate: true
      };

      const method = editingConfig ? 'PUT' : 'POST';
      if (editingConfig) {
        payload.id = editingConfig.id;
      }

      const response = await fetch('/api/config', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Configurazione salvata con successo!');
        loadData();
        resetForm();
      } else {
        const error = await response.json();
        alert('Errore: ' + error.message);
      }
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Errore nel salvataggio');
    }
  };

  const resetForm = () => {
    setConfigName('');
    setConfigDescription('');
    setSelectedFoodIds([]);
    setComparisonPairs([]);
    setEditingConfig(null);
  };

  const getFoodName = (food) => {
    return i18n.language === 'it' ? food.name_it : food.name_en;
  };

  const getFoodById = (id) => {
    return allFoods.find(f => f.id === id);
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>Caricamento...</p>
      </div>
    );
  }

  const fruits = allFoods.filter(f => f.category === 'fruit');
  const vegetables = allFoods.filter(f => f.category === 'vegetable');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <button
              onClick={() => navigate('/admin')}
              style={{
                padding: '0.5rem 1rem',
                background: '#e5e7eb',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <ArrowLeft size={20} />
              Indietro
            </button>
            <Settings size={32} color="#667eea" />
            <h1 style={{
              margin: 0,
              fontSize: '2rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Configurazione Esperienza
            </h1>
          </div>
          <p style={{ color: '#666', margin: 0 }}>
            Seleziona gli alimenti e configura le coppie di comparazione
          </p>
        </div>

        {/* Form di Configurazione */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
        }}>
          <h2 style={{ color: '#667eea', marginTop: 0 }}>
            {editingConfig ? 'Modifica Configurazione' : 'Nuova Configurazione'}
          </h2>

          {/* Nome e Descrizione */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Nome Configurazione
            </label>
            <input
              type="text"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="es. Setup Primavera 2025"
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Descrizione (opzionale)
            </label>
            <textarea
              value={configDescription}
              onChange={(e) => setConfigDescription(e.target.value)}
              placeholder="Breve descrizione della configurazione..."
              rows={2}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Selezione Alimenti */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: '#667eea' }}>
              Seleziona Alimenti ({selectedFoodIds.length} selezionati)
            </h3>
            
            {/* Frutti */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#f59e0b', marginBottom: '1rem' }}>🍎 Frutti</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {fruits.map(food => (
                  <div
                    key={food.id}
                    onClick={() => toggleFoodSelection(food.id)}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${selectedFoodIds.includes(food.id) ? '#667eea' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: selectedFoodIds.includes(food.id) ? '#eef2ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {food.emoji}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      {getFoodName(food)}
                    </div>
                    {selectedFoodIds.includes(food.id) && (
                      <Check size={16} color="#667eea" style={{ marginTop: '0.5rem' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Verdure */}
            <div>
              <h4 style={{ color: '#10b981', marginBottom: '1rem' }}>🥕 Verdure</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                {vegetables.map(food => (
                  <div
                    key={food.id}
                    onClick={() => toggleFoodSelection(food.id)}
                    style={{
                      padding: '1rem',
                      border: `2px solid ${selectedFoodIds.includes(food.id) ? '#667eea' : '#e5e7eb'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: selectedFoodIds.includes(food.id) ? '#eef2ff' : 'white',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                      {food.emoji}
                    </div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      {getFoodName(food)}
                    </div>
                    {selectedFoodIds.includes(food.id) && (
                      <Check size={16} color="#667eea" style={{ marginTop: '0.5rem' }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Coppie di Comparazione */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ color: '#667eea', margin: 0 }}>
                Coppie di Comparazione
              </h3>
              <button
                onClick={addComparisonPair}
                disabled={selectedFoodIds.length < 2}
                style={{
                  padding: '0.5rem 1rem',
                  background: selectedFoodIds.length < 2 ? '#e5e7eb' : '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: selectedFoodIds.length < 2 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Plus size={16} />
                Aggiungi Coppia
              </button>
            </div>

            {comparisonPairs.length === 0 ? (
              <p style={{ color: '#666', fontStyle: 'italic' }}>
                Nessuna coppia configurata. Clicca "Aggiungi Coppia" per iniziare.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {comparisonPairs.map((pair, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <span style={{ fontWeight: '600', color: '#667eea' }}>#{index + 1}</span>
                    
                    <select
                      value={pair.food_a_id}
                      onChange={(e) => updatePair(index, 'food_a_id', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      {selectedFoodIds.map(id => {
                        const food = getFoodById(id);
                        return (
                          <option key={id} value={id}>
                            {food?.emoji} {getFoodName(food)}
                          </option>
                        );
                      })}
                    </select>

                    <span style={{ fontWeight: '600' }}>vs</span>

                    <select
                      value={pair.food_b_id}
                      onChange={(e) => updatePair(index, 'food_b_id', e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.5rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '1rem'
                      }}
                    >
                      {selectedFoodIds.map(id => {
                        const food = getFoodById(id);
                        return (
                          <option key={id} value={id}>
                            {food?.emoji} {getFoodName(food)}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      onClick={() => removePair(index)}
                      style={{
                        padding: '0.5rem',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Azioni */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button
              onClick={resetForm}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#e5e7eb',
                border: 'none',
                borderRadius: '10px',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Reset
            </button>
            <button
              onClick={saveConfiguration}
              disabled={!configName || selectedFoodIds.length === 0}
              style={{
                padding: '0.75rem 1.5rem',
                background: (!configName || selectedFoodIds.length === 0) ? '#e5e7eb' : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                cursor: (!configName || selectedFoodIds.length === 0) ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '600'
              }}
            >
              Salva e Attiva Configurazione
            </button>
          </div>
        </div>

        {/* Configurazione Attiva */}
        {activeConfig && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ color: '#10b981', marginTop: 0 }}>
              ✓ Configurazione Attiva
            </h2>
            <div style={{ marginBottom: '1rem' }}>
              <strong>Nome:</strong> {activeConfig.config.name}
            </div>
            {activeConfig.config.description && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Descrizione:</strong> {activeConfig.config.description}
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <strong>Alimenti selezionati ({activeConfig.foods.length}):</strong>
              <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                marginTop: '0.5rem'
              }}>
                {activeConfig.foods.map(food => (
                  <span
                    key={food.id}
                    style={{
                      padding: '0.25rem 0.75rem',
                      background: '#eef2ff',
                      borderRadius: '20px',
                      fontSize: '0.875rem'
                    }}
                  >
                    {food.emoji} {getFoodName(food)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong>Coppie di comparazione ({activeConfig.pairs.length}):</strong>
              <div style={{ marginTop: '0.5rem' }}>
                {activeConfig.pairs.map((pair, index) => {
                  const foodA = getFoodById(pair.food_a_id);
                  const foodB = getFoodById(pair.food_b_id);
                  return (
                    <div key={index} style={{ marginBottom: '0.25rem' }}>
                      {foodA?.emoji} {getFoodName(foodA)} <strong>vs</strong> {foodB?.emoji} {getFoodName(foodB)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigScreen;
