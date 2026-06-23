# Offline Financial Reporting System

A comprehensive offline financial reporting system for managing multiple branches with features for trial balances, balance sheets, profit & loss statements, bank reconciliation, and consolidated reporting.

## Features

- ✅ **Multi-Branch Support**: Manage 3 branches (Kidfarmaco, Thogoto, Bustani)
- ✅ **Financial Reports**: Trial Balance, Balance Sheet, P&L Statement
- ✅ **Bank Reconciliation**: Per bank, per month, per branch
- ✅ **Data Import**: Upload Excel files with transactions
- ✅ **Data Management**: Reset/Clear all data
- ✅ **Consolidated Reporting**: Combine data from all branches
- ✅ **Expense Breakdown**: Detailed expense analysis
- ✅ **Offline Capability**: Uses SQLite for local data storage
- ✅ **PDF Export**: Generate reports in PDF format

## Technology Stack

- **Frontend**: React.js
- **Backend**: Node.js + Express
- **Database**: SQLite3
- **File Import**: XLSX parser
- **Reports**: PDFKit

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn

### Setup

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Start backend server
npm run dev

# In another terminal, start frontend
npm run client
```

## Project Structure

```
├── server.js              # Main server file
├── database.js            # Database initialization
├── routes/                # API routes
│   ├── transactions.js
│   ├── reports.js
│   ├── import.js
│   └── reconciliation.js
├── controllers/           # Business logic
├── client/               # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── uploads/              # Temporary upload storage
```

## API Endpoints

### Transactions
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Add new transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Reports
- `GET /api/reports/trial-balance` - Trial balance report
- `GET /api/reports/balance-sheet` - Balance sheet report
- `GET /api/reports/profit-loss` - P&L statement
- `GET /api/reports/consolidated` - Consolidated report
- `GET /api/reports/expense-breakdown` - Expense breakdown

### Bank Reconciliation
- `GET /api/reconciliation/monthly/:branch/:month` - Monthly reconciliation
- `POST /api/reconciliation/create` - Create reconciliation entry

### Data Management
- `POST /api/import` - Import Excel file
- `POST /api/reset` - Reset all data

## Usage

1. **Import Data**: Click "Import Excel" button to upload your financial data
2. **View Reports**: Navigate to different report sections
3. **Bank Reconciliation**: Select branch and month to view reconciliation
4. **Export**: Generate PDF reports for sharing
5. **Reset**: Clear all data when needed

## License

MIT
