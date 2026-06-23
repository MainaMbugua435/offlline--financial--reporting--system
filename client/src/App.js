import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css';

import Dashboard from './pages/Dashboard';
import TrialBalance from './pages/TrialBalance';
import BalanceSheet from './pages/BalanceSheet';
import ProfitLoss from './pages/ProfitLoss';
import BankReconciliation from './pages/BankReconciliation';
import ConsolidatedReports from './pages/ConsolidatedReports';
import DataManagement from './pages/DataManagement';

function App() {
  const [apiStatus, setApiStatus] = useState('checking');

  useEffect(() => {
    axios.get('/api/health')
      .then(() => setApiStatus('connected'))
      .catch(() => setApiStatus('disconnected'));
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar apiStatus={apiStatus} />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trial-balance" element={<TrialBalance />} />
            <Route path="/balance-sheet" element={<BalanceSheet />} />
            <Route path="/profit-loss" element={<ProfitLoss />} />
            <Route path="/bank-reconciliation" element={<BankReconciliation />} />
            <Route path="/consolidated" element={<ConsolidatedReports />} />
            <Route path="/data-management" element={<DataManagement />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function Navbar({ apiStatus }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          📊 Financial Reporting System
        </Link>
        <ul className="nav-menu">
          <li><Link to="/">Dashboard</Link></li>
          <li><Link to="/trial-balance">Trial Balance</Link></li>
          <li><Link to="/balance-sheet">Balance Sheet</Link></li>
          <li><Link to="/profit-loss">P&L</Link></li>
          <li><Link to="/bank-reconciliation">Bank Reconciliation</Link></li>
          <li><Link to="/consolidated">Consolidated</Link></li>
          <li><Link to="/data-management">Data</Link></li>
        </ul>
        <div className="api-status">
          <span className={`status-indicator ${apiStatus}`}></span>
          {apiStatus === 'connected' ? 'Online' : 'Offline'}
        </div>
      </div>
    </nav>
  );
}

export default App;
