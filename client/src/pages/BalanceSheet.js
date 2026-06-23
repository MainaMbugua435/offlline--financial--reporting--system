import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function BalanceSheet() {
  const [data, setData] = useState(null);
  const [branch, setBranch] = useState('Kidfarmaco');
  const [reportDate, setReportDate] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalanceSheet();
  }, [branch, reportDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/balance-sheet', {
        params: { branch, report_date: reportDate }
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading balance sheet...</div>;

  return (
    <div className="card">
      <div className="page-header">
        <h1>Balance Sheet</h1>
        <p>As at {reportDate}</p>
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
          <label>Report Date</label>
          <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} />
        </div>
      </div>

      {error && <div className="error">Error: {error}</div>}

      {data && Object.entries(data.data || {}).map(([section, items]) => (
        <div key={section}>
          <h2 style={{marginTop: '20px', marginBottom: '10px'}}>{section}</h2>
          <table>
            <thead>
              <tr>
                <th>Account</th>
                <th style={{textAlign: 'right'}}>Amount (KES)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.account_name}</td>
                  <td style={{textAlign: 'right'}}>{item.amount?.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default BalanceSheet;
