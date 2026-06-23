import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function BankReconciliation() {
  const [branch, setBranch] = useState('Kidfarmaco');
  const [month, setMonth] = useState(moment().format('YYYY-MM'));
  const [data, setData] = useState(null);
  const [bankStatementBalance, setBankStatementBalance] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchReconciliation();
  }, [branch, month]);

  const fetchReconciliation = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/reconciliation/monthly/${branch}/${month}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async () => {
    if (!bankStatementBalance) {
      alert('Please enter bank statement balance');
      return;
    }

    try {
      const response = await axios.post('/api/reconciliation/create', {
        branch,
        bank_name: 'Main Bank',
        reconciliation_month: month,
        bank_statement_balance: parseFloat(bankStatementBalance)
      });
      setSuccess(`Reconciliation ${response.data.reconciled ? 'completed!' : 'pending review'}`);
      fetchReconciliation();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">Loading reconciliation...</div>;

  return (
    <div className="card">
      <div className="page-header">
        <h1>Bank Reconciliation</h1>
        <p>{branch} - {month}</p>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Branch</label>
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="Kidfarmaco">Kidfarmaco</option>
            <option value="Thogoto">Thogoto</option>
            <option value="Bustani">Bustani</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Month</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </div>
      </div>

      {error && <div className="error">Error: {error}</div>}
      {success && <div className="success">Success: {success}</div>}

      {data && (
        <>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px'}}>
            <div className="filter-group">
              <label>Bank Statement Balance</label>
              <input type="number" step="0.01" value={bankStatementBalance} onChange={(e) => setBankStatementBalance(e.target.value)} />
              <button className="btn-primary" onClick={handleReconcile} style={{marginTop: '10px'}}>✓ Reconcile</button>
            </div>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Book Balance</div>
              <div style={{fontSize: '18px', fontWeight: 'bold'}}>KES {data.book_balance?.toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Transactions</div>
              <div style={{fontSize: '18px', fontWeight: 'bold'}}>{data.transaction_count}</div>
            </div>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Total Debits</div>
              <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--success-color)'}}>KES {data.total_debits?.toLocaleString()}</div>
            </div>
          </div>

          <h3>Bank Transactions</h3>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Account</th>
                <th>Description</th>
                <th style={{textAlign: 'right'}}>Debit (KES)</th>
                <th style={{textAlign: 'right'}}>Credit (KES)</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions?.map((txn, idx) => (
                <tr key={idx}>
                  <td>{txn.date}</td>
                  <td>{txn.account_name}</td>
                  <td>{txn.description}</td>
                  <td style={{textAlign: 'right'}}>{txn.debit?.toLocaleString()}</td>
                  <td style={{textAlign: 'right'}}>{txn.credit?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default BankReconciliation;
