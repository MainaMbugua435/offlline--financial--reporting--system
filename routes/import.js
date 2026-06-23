const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const { getDb } = require('../database');

const db = getDb();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// Import Excel file
router.post('/excel', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const workbook = XLSX.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;
    
    let importedCount = 0;
    let errors = [];

    // Process each sheet
    sheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Import transactions from each sheet
      data.forEach((row, index) => {
        try {
          // Map Excel columns to database fields
          const transaction = {
            date: row['Date'] || row['date'] || new Date().toISOString().split('T')[0],
            account_code: row['Account Code'] || row['account_code'] || '',
            account_name: row['Account Name'] || row['account_name'] || '',
            description: row['Description'] || row['description'] || '',
            debit: parseFloat(row['Debit'] || row['debit'] || 0) || 0,
            credit: parseFloat(row['Credit'] || row['credit'] || 0) || 0,
            branch: row['Branch'] || row['branch'] || 'Unknown',
            transaction_type: row['Type'] || row['type'] || 'General',
            bank_name: row['Bank'] || row['bank'] || null,
            reference: row['Reference'] || row['reference'] || null
          };

          // Insert into database
          const insertQuery = `
            INSERT INTO transactions 
            (date, account_code, account_name, description, debit, credit, branch, transaction_type, bank_name, reference)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(insertQuery, [
            transaction.date,
            transaction.account_code,
            transaction.account_name,
            transaction.description,
            transaction.debit,
            transaction.credit,
            transaction.branch,
            transaction.transaction_type,
            transaction.bank_name,
            transaction.reference
          ]);

          importedCount++;
        } catch (err) {
          errors.push(`Row ${index + 1}: ${err.message}`);
        }
      });
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      message: 'File imported successfully',
      imported_count: importedCount,
      sheets_processed: sheetNames.length,
      errors: errors
    });
  } catch (err) {
    fs.unlinkSync(req.file.path);
    res.status(500).json({ error: err.message });
  }
});

// Reset all data
router.post('/reset', (req, res) => {
  db.serialize(() => {
    db.run('DELETE FROM transactions', function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        db.run('DELETE FROM supplier_balances', function(err) {
          if (err) {
            res.status(500).json({ error: err.message });
          } else {
            db.run('DELETE FROM bank_reconciliation', function(err) {
              if (err) {
                res.status(500).json({ error: err.message });
              } else {
                res.json({ 
                  message: 'All data has been reset',
                  tables_cleared: ['transactions', 'supplier_balances', 'bank_reconciliation']
                });
              }
            });
          }
        });
      }
    });
  });
});

module.exports = router;
