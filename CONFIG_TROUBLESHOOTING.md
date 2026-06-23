# Configuration & Troubleshooting

## Environment Setup

### .env File

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_PATH=./financial_data.db
```

### .env Variables

| Variable | Default | Description |
|----------|---------|-------------|
| NODE_ENV | development | development or production |
| PORT | 5000 | Backend server port |
| DATABASE_PATH | ./financial_data.db | Path to SQLite database file |

## Installation Issues & Solutions

### Problem: npm install fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Problem: SQLite installation fails

```bash
# Install Python (required for SQLite3 compilation)
# macOS:
brew install python3

# Windows: Download from python.org
# Linux:
sudo apt-get install python3

# Then reinstall
npm install
```

### Problem: Port 5000 already in use

```bash
# Change port in .env file
PORT=5001

# Or kill process using port 5000
# macOS/Linux:
lsof -ti:5000 | xargs kill -9

# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Problem: React app won't start

```bash
cd client
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
npm start
```

## Runtime Issues & Solutions

### Problem: Database locked error

**Cause**: SQLite database is locked by another process

**Solution**:
```bash
# Restart backend server
# 1. Kill the running server (Ctrl+C)
# 2. Delete the database
rm financial_data.db
# 3. Restart
npm run dev
```

### Problem: Import fails with "Cannot read property"

**Cause**: Excel file has incorrect column structure

**Solution**:
- Verify column headers match exactly: Date, Account Code, Account Name, Description, Debit, Credit, Branch
- Remove extra blank columns
- Ensure first data row is after headers

### Problem: Reports show no data

**Cause**: No transactions imported or filter is too strict

**Solution**:
1. Check Dashboard - see if transactions exist
2. Import data via Data Management
3. Verify branch names are exactly: Kidfarmaco, Thogoto, Bustani
4. Check date format is YYYY-MM-DD

### Problem: Balance Sheet shows 0 amounts

**Cause**: Account names don't contain Asset, Liability, or Equity keywords

**Solution**:
- Edit account names to include type
- Examples:
  - "Bank - Asset"
  - "Accounts Payable - Liability"
  - "Capital - Equity"

## Data Management

### Backup Database

```bash
# Copy database file
cp financial_data.db financial_data_backup.db
```

### Restore Database

```bash
# Restore from backup
cp financial_data_backup.db financial_data.db
```

### Reset Database

```bash
# Delete database (all data will be lost)
rm financial_data.db

# Restart server to recreate empty database
npm run dev
```

### Export Data from SQLite

```bash
# Install sqlite3 CLI (if not installed)
# macOS:
brew install sqlite3

# Linux:
sudo apt-get install sqlite3

# Windows: Download from sqlite.org

# Export table to CSV
sqlite3 financial_data.db "SELECT * FROM transactions;" > transactions.csv
```

## Performance Optimization

### Large Dataset Handling

For datasets with 100,000+ transactions:

1. **Use pagination** (future enhancement)
2. **Import in batches** - Split Excel file into multiple imports
3. **Archive old data** - Move old transactions to separate database

### Database Optimization

```bash
# Analyze database performance
sqlite3 financial_data.db "ANALYZE;"

# Vacuum database
sqlite3 financial_data.db "VACUUM;"
```

## Security Best Practices

### Protect Your Database

1. **Backup regularly**
   ```bash
   cp financial_data.db financial_data_$(date +%Y%m%d).db
   ```

2. **Restrict file access**
   ```bash
   chmod 600 financial_data.db
   ```

3. **Keep on secure location**
   - Don't commit database to git
   - Store backups in secure location
   - Use .gitignore to exclude database file

### Production Deployment

1. Set `NODE_ENV=production`
2. Use strong database path
3. Implement authentication (future feature)
4. Use HTTPS for data transmission
5. Regular backups
6. Monitor error logs

## Logging & Debugging

### Enable Debug Mode

```bash
# Set debug environment variable
export DEBUG=*
npm run dev
```

### Check Backend Logs

Backend logs appear in terminal:
```
Server running on port 5000
Database initialized successfully
...
```

### Check Frontend Logs

Open browser console (F12) to see frontend errors

### Database Inspection

```bash
# Open SQLite CLI
sqlite3 financial_data.db

# View tables
.tables

# View schema
.schema transactions

# Query data
SELECT COUNT(*) FROM transactions;

# Exit
.exit
```

## Network & Connectivity

### CORS Issues

If frontend can't connect to backend:

```javascript
// Already configured in server.js
app.use(cors());
```

If custom CORS needed, edit server.js:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### API Not Responding

1. Check backend is running: `http://localhost:5000/api/health`
2. Check port in frontend `.env`
3. Restart both backend and frontend
4. Clear browser cache (Ctrl+Shift+Delete)

## Upgrading Dependencies

### Update Backend Dependencies

```bash
# Check for updates
npm outdated

# Update specific package
npm update express

# Update all packages
npm update
```

### Update Frontend Dependencies

```bash
cd client
npm update
cd ..
```

## System Requirements

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Node.js | v14 | v18+ |
| npm | v6 | v8+ |
| RAM | 512MB | 2GB |
| Disk Space | 100MB | 500MB |
| Browser | Chrome 90+ | Latest |

## Getting Help

### Check System Status

```bash
# Node version
node --version

# npm version
npm --version

# Database size
ls -lh financial_data.db

# Port in use
lsof -i :5000
```

### Common Commands

```bash
# Start system
npm run dev                # Backend
npm run client            # Frontend

# Install all dependencies
npm install-all           # Installs backend and frontend

# Clean reinstall
rm -rf node_modules client/node_modules package-lock.json client/package-lock.json
npm install-all

# Reset everything
rm -rf node_modules client/node_modules financial_data.db
npm install-all
npm run dev
```
