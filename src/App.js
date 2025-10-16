// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './config/i18n';
import './App.css';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import PreTestScreen from './screens/PreTestScreen';
import AwarenessScreen from './screens/AwarenessScreen';
import MeasurementScreen from './screens/MeasurementScreen';
import PostTestScreen from './screens/PostTestScreen';
import ResultsScreen from './screens/ResultsScreen';
import DashboardScreen from './screens/DashboardScreen';
import AdminScreen from './screens/AdminScreen';
import ConfigScreen from './screens/ConfigScreen';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<WelcomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/pretest" element={<PreTestScreen />} />
          <Route path="/awareness" element={<AwarenessScreen />} />
          <Route path="/measurement" element={<MeasurementScreen />} />
          <Route path="/posttest" element={<PostTestScreen />} />
          <Route path="/results" element={<ResultsScreen />} />
          <Route path="/dashboard" element={<DashboardScreen />} />
          <Route path="/admin" element={<AdminScreen />} />
          <Route path="/config" element={<ConfigScreen />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
