import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalDebit: 0,
    totalCredit: 0,
    branches: ['Kidfarmaco', 'Thogoto', 'Bustani']
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/transactions');
      const transactions = response.data;

      const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
      const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);

      setStats({
        totalTransactions: transactions.length,
        totalDebit,
        totalCredit,
        netBalance: totalDebit - totalCredit,
        branches: ['Kidfarmaco', 'Thogoto', 'Bustani']
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome to your offline financial reporting system</p>
      </div>

      {error && <div className="error">Error: {error}</div>}

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px'}}>
        <div className="card">
          <h3>Total Transactions</h3>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--secondary-color)'}}>{stats.totalTransactions}</div>
        </div>
        <div className="card">
          <h3>Total Debits</h3>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--success-color)'}}>KES {stats.totalDebit?.toLocaleString()}</div>
        </div>
        <div className="card">
          <h3>Total Credits</h3>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: 'var(--danger-color)'}}>KES {stats.totalCredit?.toLocaleString()}</div>
        </div>
        <div className="card">
          <h3>Net Balance</h3>
          <div style={{fontSize: '24px', fontWeight: 'bold', color: stats.netBalance >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}}>KES {stats.netBalance?.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <h2>Branches</h2>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px'}}>
          {stats.branches.map(branch => (
            <div key={branch} style={{background: 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))', color: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center'}}>
              <h3>{branch}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
