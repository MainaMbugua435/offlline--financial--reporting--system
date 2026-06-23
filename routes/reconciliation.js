const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const moment = require('moment');

const db = getDb();

// Get monthly reconciliation for a specific bank and branch
router.get('/monthly/:branch/:month', (req, res) => {
  const { branch, month } = req.params; // month format: YYYY-MM
  
  // Get all bank transactions for the month
  const query = `
    SELECT 
      date,
      account_name,
      bank_name,
      description,
      debit,
      credit,
      reference,
      (debit - credit) as net_amount
    FROM transactions
    WHERE branch = ?
      AND bank_name IS NOT NULL
      AND strftime('%Y-%m', date) = ?
    ORDER BY date ASC
  `;
  
  db.all(query, [branch, month], (err, bankTransactions) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Calculate totals
    const totalDebits = bankTransactions.reduce((sum, t) => sum + (t.debit || 0), 0);
    const totalCredits = bankTransactions.reduce((sum, t) => sum + (t.credit || 0), 0);
    const bookBalance = totalDebits - totalCredits;
    
    // Get existing reconciliation record
    const reconcileQuery = `
      SELECT * FROM bank_reconciliation 
      WHERE branch = ? AND reconciliation_month = ?
    `;
    
    db.get(reconcileQuery, [branch, month], (err, reconciliation) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      res.json({
        branch,
        month,
        book_balance: bookBalance,
        total_debits: totalDebits,
        total_credits: totalCredits,
        transactions: bankTransactions,
        reconciliation: reconciliation || null,
        transaction_count: bankTransactions.length
      });
    });
  });
});

// Create/Update bank reconciliation
router.post('/create', (req, res) => {
  const { branch, bank_name, reconciliation_month, bank_statement_balance, notes } = req.body;
  
  // Get book balance for the period
  const bookQuery = `
    SELECT 
      SUM(debit) as total_debit,
      SUM(credit) as total_credit
    FROM transactions
    WHERE branch = ?
      AND bank_name = ?
      AND strftime('%Y-%m', date) = ?
  `;
  
  db.get(bookQuery, [branch, bank_name, reconciliation_month], (err, balanceData) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    const bookBalance = (balanceData?.total_debit || 0) - (balanceData?.total_credit || 0);
    const reconciled = Math.abs(bank_statement_balance - bookBalance) < 0.01;
    
    // Check if reconciliation already exists
    const checkQuery = `
      SELECT id FROM bank_reconciliation 
      WHERE branch = ? AND bank_name = ? AND reconciliation_month = ?
    `;
    
    db.get(checkQuery, [branch, bank_name, reconciliation_month], (err, existing) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (existing) {
        // Update existing
        const updateQuery = `
          UPDATE bank_reconciliation 
          SET bank_statement_balance = ?, book_balance = ?, status = ?, notes = ?, reconciliation_date = ?
          WHERE id = ?
        `;
        
        db.run(updateQuery, [
          bank_statement_balance,
          bookBalance,
          reconciled ? 'reconciled' : 'pending',
          notes,
          new Date().toISOString(),
          existing.id
        ], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({
              message: 'Reconciliation updated',
              id: existing.id,
              reconciled,
              difference: Math.abs(bank_statement_balance - bookBalance)
            });
          }
        });
      } else {
        // Create new
        const insertQuery = `
          INSERT INTO bank_reconciliation 
          (branch, bank_name, reconciliation_month, bank_statement_balance, book_balance, status, notes, reconciliation_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        db.run(insertQuery, [
          branch,
          bank_name,
          reconciliation_month,
          bank_statement_balance,
          bookBalance,
          reconciled ? 'reconciled' : 'pending',
          notes,
          new Date().toISOString()
        ], function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            res.json({
              message: 'Reconciliation created',
              id: this.lastID,
              reconciled,
              difference: Math.abs(bank_statement_balance - bookBalance)
            });
          }
        });
      }
    });
  });
});

// Get all reconciliations for a branch
router.get('/branch/:branch', (req, res) => {
  const { branch } = req.params;
  
  db.all(`
    SELECT * FROM bank_reconciliation 
    WHERE branch = ?
    ORDER BY reconciliation_month DESC
  `, [branch], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

module.exports = router;
