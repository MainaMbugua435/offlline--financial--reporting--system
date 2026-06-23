const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

const db = getDb();

// Get all transactions
router.get('/', (req, res) => {
  const { branch, account_code, start_date, end_date } = req.query;
  
  let query = 'SELECT * FROM transactions WHERE 1=1';
  let params = [];
  
  if (branch) {
    query += ' AND branch = ?';
    params.push(branch);
  }
  
  if (account_code) {
    query += ' AND account_code = ?';
    params.push(account_code);
  }
  
  if (start_date && end_date) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  query += ' ORDER BY date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Add transaction
router.post('/', (req, res) => {
  const { date, account_code, account_name, description, debit, credit, branch, transaction_type, bank_name, reference } = req.body;
  
  const query = `
    INSERT INTO transactions 
    (date, account_code, account_name, description, debit, credit, branch, transaction_type, bank_name, reference)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.run(query, [date, account_code, account_name, description, debit || 0, credit || 0, branch, transaction_type, bank_name, reference], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ id: this.lastID, message: 'Transaction added' });
    }
  });
});

// Delete transaction
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM transactions WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Transaction deleted' });
    }
  });
});

// Reset all transactions
router.post('/reset', (req, res) => {
  db.run('DELETE FROM transactions', function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'All transactions deleted' });
    }
  });
});

module.exports = router;
