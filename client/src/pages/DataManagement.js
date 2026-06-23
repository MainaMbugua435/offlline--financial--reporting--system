import React, { useState, useRef } from 'react';
import axios from 'axios';

function DataManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post('/api/import/excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(`Successfully imported ${response.data.imported_count} transactions from ${response.data.sheets_processed} sheet(s)`);
      fileInputRef.current.value = '';
    } catch (err) {
      setError(`Import failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('This will delete ALL data. Are you sure?')) {
      try {
        setLoading(true);
        setError(null);
        await axios.post('/api/import/reset');
        setSuccess('All data has been reset');
      } catch (err) {
        setError(`Reset failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Data Management</h1>
        <p>Import and manage financial data</p>
      </div>

      {error && <div className="error">Error: {error}</div>}
      {success && <div className="success">Success: {success}</div>}

      <div className="card">
        <h2>📤 Import Data</h2>
        <p>Upload Excel files with transactions, ledgers, balance sheets, P&L, and supplier data</p>
        <div style={{border: '2px dashed var(--secondary-color)', borderRadius: '8px', padding: '40px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8f9fa'}} onClick={() => fileInputRef.current?.click()}>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} disabled={loading} style={{display: 'none'}} />
          <div style={{fontSize: '48px', marginBottom: '15px'}}>📊</div>
          <h3>Click to upload or drag & drop</h3>
          <p>Excel (.xlsx, .xls) or CSV files</p>
        </div>
      </div>

      <div className="card">
        <h2>🗑️ Reset All Data</h2>
        <p>Permanently delete all data and start fresh</p>
        <button className="btn-danger" onClick={handleReset} disabled={loading}>
          Delete All Data
        </button>
      </div>

      <div className="card">
        <h2>📋 Import Format</h2>
        <p>Your Excel file should have these columns:</p>
        <ul>
          <li><strong>Date</strong> - YYYY-MM-DD</li>
          <li><strong>Account Code</strong> - Chart of accounts</li>
          <li><strong>Account Name</strong> - Description</li>
          <li><strong>Description</strong> - Transaction detail</li>
          <li><strong>Debit</strong> - Debit amount</li>
          <li><strong>Credit</strong> - Credit amount</li>
          <li><strong>Branch</strong> - Kidfarmaco, Thogoto, or Bustani</li>
          <li><strong>Bank</strong> - Bank name (optional)</li>
        </ul>
      </div>
    </div>
  );
}

export default DataManagement;
