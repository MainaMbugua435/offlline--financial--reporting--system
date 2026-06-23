import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function TrialBalance() {
  const [data, setData] = useState(null);
  const [branch, setBranch] = useState('Kidfarmaco');
  const [reportDate, setReportDate] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTrialBalance();
  }, [branch, reportDate]);

  const fetchTrialBalance = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/trial-balance', {
        params: { branch, report_date: reportDate }
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading trial balance...</div>;

  return (
    <div className="card">
      <div className="page-header">
        <h1>Trial Balance Report</h1>
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

      {data && (
        <table>
          <thead>
            <tr>
              <th>Account Code</th>
              <th>Account Name</th>
              <th style={{textAlign: 'right'}}>Debit (KES)</th>
              <th style={{textAlign: 'right'}}>Credit (KES)</th>
              <th style={{textAlign: 'right'}}>Balance (KES)</th>
            </tr>
          </thead>
          <tbody>
            {data.data?.map((row, idx) => (
              <tr key={idx}>
                <td>{row.account_code}</td>
                <td>{row.account_name}</td>
                <td style={{textAlign: 'right'}}>{row.total_debit?.toLocaleString()}</td>
                <td style={{textAlign: 'right'}}>{row.total_credit?.toLocaleString()}</td>
                <td style={{textAlign: 'right'}}>{row.balance?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TrialBalance;
