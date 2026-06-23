const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'financial_data.db');
const db = new sqlite3.Database(DB_PATH);

const initializeDatabase = () => {
  db.serialize(() => {
    // Transactions table
    db.run(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        account_code TEXT NOT NULL,
        account_name TEXT NOT NULL,
        description TEXT,
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        branch TEXT NOT NULL,
        transaction_type TEXT,
        bank_name TEXT,
        reference TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Chart of Accounts
    db.run(`
      CREATE TABLE IF NOT EXISTS chart_of_accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_code TEXT UNIQUE NOT NULL,
        account_name TEXT NOT NULL,
        account_type TEXT NOT NULL,
        account_category TEXT,
        balance REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bank Reconciliation
    db.run(`
      CREATE TABLE IF NOT EXISTS bank_reconciliation (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch TEXT NOT NULL,
        bank_name TEXT NOT NULL,
        reconciliation_month TEXT NOT NULL,
        bank_statement_balance REAL,
        book_balance REAL,
        reconciliation_date TEXT,
        reconciled_amount REAL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bank Reconciliation Details (outstanding items)
    db.run(`
      CREATE TABLE IF NOT EXISTS reconciliation_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        reconciliation_id INTEGER NOT NULL,
        item_type TEXT,
        item_date TEXT,
        amount REAL,
        description TEXT,
        FOREIGN KEY (reconciliation_id) REFERENCES bank_reconciliation(id)
      )
    `);

    // Supplier Balances
    db.run(`
      CREATE TABLE IF NOT EXISTS supplier_balances (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supplier_name TEXT NOT NULL,
        supplier_code TEXT,
        branch TEXT NOT NULL,
        balance REAL DEFAULT 0,
        currency TEXT DEFAULT 'KES',
        last_transaction_date TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Trial Balance Cache
    db.run(`
      CREATE TABLE IF NOT EXISTS trial_balance_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_date TEXT,
        branch TEXT,
        account_code TEXT,
        account_name TEXT,
        debit REAL DEFAULT 0,
        credit REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  });
};

const getDb = () => db;

module.exports = {
  db,
  getDb,
  initializeDatabase,
  DB_PATH
};
