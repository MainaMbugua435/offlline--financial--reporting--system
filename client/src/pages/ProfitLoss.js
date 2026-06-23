import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function ProfitLoss() {
  const [data, setData] = useState(null);
  const [branch, setBranch] = useState('Kidfarmaco');
  const [startDate, setStartDate] = useState(moment().startOf('year').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfitLoss();
  }, [branch, startDate, endDate]);

  const fetchProfitLoss = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/profit-loss', {
        params: { branch, start_date: startDate, end_date: endDate }
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading P&L...</div>;

  return (
    <div className="card">
      <div className="page-header">
        <h1>Profit & Loss Statement</h1>
        <p>From {startDate} to {endDate}</p>
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
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {data && (
        <>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px'}}>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Revenue</div>
              <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--success-color)'}}>KES {data.summary?.revenue?.toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Expenses</div>
              <div style={{fontSize: '18px', fontWeight: 'bold', color: 'var(--danger-color)'}}>KES {data.summary?.expenses?.toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Profit/Loss</div>
              <div style={{fontSize: '18px', fontWeight: 'bold', color: data.summary?.profit >= 0 ? 'var(--success-color)' : 'var(--danger-color)'}}>KES {data.summary?.profit?.toLocaleString()}</div>
            </div>
            <div className="card">
              <div style={{fontSize: '12px', color: '#7f8c8d'}}>Margin</div>
              <div style={{fontSize: '18px', fontWeight: 'bold'}}>{data.summary?.profit_margin}%</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Account Code</th>
                <th>Account Name</th>
                <th style={{textAlign: 'right'}}>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              {data.data?.map((row, idx) => (
                <tr key={idx}>
                  <td><strong>{row.category}</strong></td>
                  <td>{row.account_code}</td>
                  <td>{row.account_name}</td>
                  <td style={{textAlign: 'right'}}>{row.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default ProfitLoss;
