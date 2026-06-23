import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';

function ConsolidatedReports() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState(moment().startOf('year').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchConsolidatedReport();
  }, [startDate, endDate]);

  const fetchConsolidatedReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports/consolidated', {
        params: { start_date: startDate, end_date: endDate }
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading consolidated report...</div>;

  return (
    <div className="card">
      <div className="page-header">
        <h1>Consolidated Reports</h1>
        <p>All branches - {startDate} to {endDate}</p>
      </div>

      <div className="filters">
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
        <table>
          <thead>
            <tr>
              <th>Branch</th>
              <th>Category</th>
              <th>Account Code</th>
              <th>Account Name</th>
              <th style={{textAlign: 'right'}}>Amount (KES)</th>
            </tr>
          </thead>
          <tbody>
            {data.data?.map((row, idx) => (
              <tr key={idx}>
                <td><strong>{row.branch}</strong></td>
                <td>{row.category}</td>
                <td>{row.account_code}</td>
                <td>{row.account_name}</td>
                <td style={{textAlign: 'right'}}>{row.amount?.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ConsolidatedReports;
