const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const moment = require('moment');

const db = getDb();

// Trial Balance Report
router.get('/trial-balance', (req, res) => {
  const { branch, report_date } = req.query;
  
  let query = `
    SELECT 
      account_code,
      account_name,
      SUM(debit) as total_debit,
      SUM(credit) as total_credit,
      (SUM(debit) - SUM(credit)) as balance,
      branch
    FROM transactions
    WHERE 1=1
  `;
  
  let params = [];
  
  if (branch) {
    query += ' AND branch = ?';
    params.push(branch);
  }
  
  if (report_date) {
    query += ' AND date <= ?';
    params.push(report_date);
  }
  
  query += ` GROUP BY account_code, account_name, branch
             ORDER BY account_code`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const totalDebit = rows.reduce((sum, row) => sum + row.total_debit, 0);
      const totalCredit = rows.reduce((sum, row) => sum + row.total_credit, 0);
      
      res.json({
        data: rows,
        summary: {
          total_debit: totalDebit,
          total_credit: totalCredit,
          difference: totalDebit - totalCredit
        }
      });
    }
  });
});

// Balance Sheet Report
router.get('/balance-sheet', (req, res) => {
  const { branch, report_date } = req.query;
  
  let query = `
    SELECT 
      CASE 
        WHEN account_name LIKE '%Asset%' OR account_name LIKE '%Bank%' THEN 'Assets'
        WHEN account_name LIKE '%Liability%' OR account_name LIKE '%Payable%' THEN 'Liabilities'
        WHEN account_name LIKE '%Equity%' OR account_name LIKE '%Capital%' THEN 'Equity'
        ELSE 'Other'
      END as section,
      account_code,
      account_name,
      SUM(debit) as debit,
      SUM(credit) as credit,
      (SUM(debit) - SUM(credit)) as amount
    FROM transactions
    WHERE 1=1
  `;
  
  let params = [];
  
  if (branch) {
    query += ' AND branch = ?';
    params.push(branch);
  }
  
  if (report_date) {
    query += ' AND date <= ?';
    params.push(report_date);
  }
  
  query += ` GROUP BY section, account_code, account_name
             ORDER BY section, account_code`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const grouped = rows.reduce((acc, row) => {
        if (!acc[row.section]) acc[row.section] = [];
        acc[row.section].push(row);
        return acc;
      }, {});
      
      res.json({ data: grouped });
    }
  });
});

// Profit & Loss Report
router.get('/profit-loss', (req, res) => {
  const { branch, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      CASE 
        WHEN account_name LIKE '%Revenue%' OR account_name LIKE '%Sales%' THEN 'Revenue'
        WHEN account_name LIKE '%Expense%' OR account_name LIKE '%Cost%' THEN 'Expenses'
        ELSE 'Other'
      END as category,
      account_code,
      account_name,
      SUM(debit) as debit,
      SUM(credit) as credit,
      (SUM(credit) - SUM(debit)) as amount
    FROM transactions
    WHERE 1=1
  `;
  
  let params = [];
  
  if (branch) {
    query += ' AND branch = ?';
    params.push(branch);
  }
  
  if (start_date && end_date) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  query += ` GROUP BY category, account_code, account_name
             ORDER BY category, account_code`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const revenue = rows.filter(r => r.category === 'Revenue').reduce((sum, r) => sum + r.amount, 0);
      const expenses = rows.filter(r => r.category === 'Expenses').reduce((sum, r) => sum + r.amount, 0);
      const profit = revenue - expenses;
      
      res.json({
        data: rows,
        summary: {
          revenue,
          expenses,
          profit,
          profit_margin: revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0
        }
      });
    }
  });
});

// Consolidated Report (All Branches)
router.get('/consolidated', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      branch,
      CASE 
        WHEN account_name LIKE '%Revenue%' OR account_name LIKE '%Sales%' THEN 'Revenue'
        WHEN account_name LIKE '%Expense%' OR account_name LIKE '%Cost%' THEN 'Expenses'
        ELSE 'Other'
      END as category,
      account_code,
      account_name,
      SUM(debit) as debit,
      SUM(credit) as credit,
      (SUM(credit) - SUM(debit)) as amount
    FROM transactions
    WHERE 1=1
  `;
  
  let params = [];
  
  if (start_date && end_date) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  query += ` GROUP BY branch, category, account_code, account_name
             ORDER BY branch, category, account_code`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
});

// Expense Breakdown
router.get('/expense-breakdown', (req, res) => {
  const { branch, start_date, end_date } = req.query;
  
  let query = `
    SELECT 
      account_code,
      account_name,
      branch,
      SUM(debit) as total_amount,
      COUNT(*) as transaction_count
    FROM transactions
    WHERE (account_name LIKE '%Expense%' OR account_name LIKE '%Cost%')
  `;
  
  let params = [];
  
  if (branch) {
    query += ' AND branch = ?';
    params.push(branch);
  }
  
  if (start_date && end_date) {
    query += ' AND date BETWEEN ? AND ?';
    params.push(start_date, end_date);
  }
  
  query += ` GROUP BY account_code, account_name, branch
             ORDER BY total_amount DESC`;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const total = rows.reduce((sum, row) => sum + row.total_amount, 0);
      const breakdown = rows.map(row => ({
        ...row,
        percentage: ((row.total_amount / total) * 100).toFixed(2)
      }));
      
      res.json({
        data: breakdown,
        summary: { total_expenses: total }
      });
    }
  });
});

module.exports = router;
