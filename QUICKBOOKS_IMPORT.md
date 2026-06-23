# Quickbooks to Financial Reporting System - Import Guide

## Exporting from QuickBooks

You've already exported your QuickBooks data. Here's what to do next:

## Step 1: Prepare Your QuickBooks Data

If you exported multiple sheets from QuickBooks, you should have:

1. **General Ledger** - All transactions
2. **Trial Balance** - Account balances
3. **Balance Sheet** - Assets, Liabilities, Equity
4. **P&L Statement** - Revenue and Expenses
5. **Bank Reconciliation** - Bank account details
6. **Supplier Balances** - Accounts payable

## Step 2: Map QuickBooks Columns to System Format

Your QuickBooks export likely has these columns:

| QuickBooks Column | Map to System | Format |
|-------------------|---------------|--------|
| Date | Date | YYYY-MM-DD |
| Account # | Account Code | Text |
| Account | Account Name | Text |
| Name/Memo | Description | Text |
| Debit | Debit | Number |
| Credit | Credit | Number |
| Class/Location | Branch | Kidfarmaco/Thogoto/Bustani |
| Type | Type | Optional |
| Name | Bank Name | Optional |

## Step 3: Format Your Excel File

### For General Ledger Import:

Create/edit your Excel file with these columns IN THIS ORDER:

```
A: Date          B: Account Code  C: Account Name  D: Description
E: Debit        F: Credit        G: Branch        H: Type
I: Bank          J: Reference
```

**Example Data:**
```
2024-01-01  1001  Bank-Kidfarmaco  Opening Balance  100000      Kidfarmaco
2024-01-05  4001  Sales Revenue    Invoice #1               50000  Kidfarmaco
2024-01-10  5001  Office Rent      January Rent     5000           Kidfarmaco
2024-01-15  1020  Bank-Thogoto     Opening Balance  80000           Thogoto
2024-01-20  4001  Sales Revenue    Invoice #2               45000  Thogoto
2024-02-01  6001  Utilities        Power Bill       2500           Bustani
```

### QuickBooks Export Columns Mapping:

If your QuickBooks export has different column names, map them as follows:

- **QB "Date"** → Column A (Date)
- **QB "Account #"** → Column B (Account Code)
- **QB "Account"** → Column C (Account Name)
- **QB "Memo" or "Name"** → Column D (Description)
- **QB "Debit Amount"** → Column E (Debit)
- **QB "Credit Amount"** → Column F (Credit)
- **QB "Class" or "Location"** → Column G (Branch)
- **QB "Type"** → Column H (Type) - Optional
- **QB "Name" (for bank accounts)** → Column I (Bank) - Optional
- **QB "Reference" or "Ref #"** → Column J (Reference) - Optional

## Step 4: Clean Your Data in Excel

Before importing, do the following:

1. **Remove Header Rows**: Delete any extra header rows, titles, or summaries
2. **Remove Footer Rows**: Delete subtotals, totals, or extra information at the bottom
3. **Branch Names**: Ensure branch names are EXACTLY:
   - `Kidfarmaco`
   - `Thogoto`
   - `Bustani`
   (Case-sensitive!)
4. **Dates**: Format all dates as `YYYY-MM-DD`
5. **Numbers**: Ensure Debit and Credit columns contain only numbers (no currency symbols)
6. **Remove Blanks**: Delete any completely blank rows
7. **Single Sheet**: If you have multiple sheets, copy all data into ONE sheet

## Step 5: Import into the System

1. **Start the System**:
   ```bash
   # Terminal 1: Backend
   npm run dev
   
   # Terminal 2: Frontend
   npm run client
   ```

2. **Open Browser**: Navigate to `http://localhost:3000`

3. **Click "Data Management"** in the navigation menu

4. **Upload Your File**:
   - Click the upload area
   - Select your cleaned Excel file
   - Wait for success message

5. **View Imported Data**:
   - Click "Dashboard" to see total transactions
   - Click on any report to verify data

## Step 6: Verify Your Data

After import:

1. **Check Dashboard**
   - Verify total transactions count
   - Check total debits and credits
   - Should be approximately balanced

2. **Review Trial Balance**
   - Go to "Trial Balance"
   - Select each branch
   - Check that debits = credits

3. **Check Bank Reconciliation**
   - Go to "Bank Reconciliation"
   - Select branch and month
   - Verify bank transactions appear

4. **View Balance Sheet**
   - Verify assets, liabilities, equity
   - Check totals make sense

5. **View P&L**
   - Verify revenue and expense accounts
   - Check profit/loss calculation

## Troubleshooting Import Issues

### Issue: Import Fails or Shows Errors

**Solution:**
- Check column headers match exactly:
  - Date, Account Code, Account Name, Description, Debit, Credit, Branch
- Verify date format is YYYY-MM-DD
- Ensure no special characters in account codes
- Remove currency symbols from debit/credit

### Issue: Only Some Rows Import

**Solution:**
- Check for blank rows in the middle of data
- Remove extra header rows
- Ensure all rows have a date and account code
- Check for merged cells in Excel

### Issue: Transactions Show in Wrong Branch

**Solution:**
- Verify branch names are exactly: Kidfarmaco, Thogoto, Bustani
- Check for extra spaces before/after branch name
- Go to Data Management → Reset → Re-import with correct names

### Issue: Numbers Not Appearing as Currency

**Solution:**
- This is normal - the system stores amounts as numbers
- Reports will display with proper formatting (KES currency)
- All calculations are still correct

## Multi-Sheet Import

If your QuickBooks export has multiple sheets (General Ledger, Trial Balance, etc.):

**Option 1: Import All Sheets**
- The system will import transactions from all sheets automatically
- Make sure column names match in all sheets

**Option 2: Import Only General Ledger**
- Copy just the General Ledger sheet
- Create new Excel file with only that data
- Import the single sheet
- (Recommended for cleaner data)

## QuickBooks-Specific Notes

### If using QuickBooks Online (QBO):
1. Export reports as Excel or CSV
2. Clean as per Step 4 above
3. Follow import steps

### If using QuickBooks Desktop:
1. Use "Export" function → Excel
2. Or use "Report" → "Export" → Excel
3. Clean as per Step 4 above
4. Follow import steps

### Handling QuickBooks Classes (Departments/Locations):
- Map QB Classes to our "Branch" field
- Or add as suffix to Description
- Example: "Office Rent - Kidfarmaco"

## After Import

Your system now contains:

✅ All transactions from QuickBooks
✅ Trial balances by branch
✅ Balance sheet data
✅ P&L data
✅ Bank reconciliation data
✅ Supplier balance data

## Next Steps

1. **Run Reports** - Verify all reports match QuickBooks
2. **Bank Reconciliation** - Match each month's bank statements
3. **Month-End Close** - Review P&L for each month
4. **Branch Analysis** - Compare branches using consolidated reports
5. **Export Reports** - Use for presentations or further analysis

## Support

If you encounter issues:

1. Check the error message in the import dialog
2. Review "Troubleshooting Import Issues" section above
3. Reset data and re-import with corrected file
4. Check ARCHITECTURE.md for system details

## Tips for Success

- **Keep it simple**: Start with General Ledger transactions only
- **One branch at a time**: Import Kidfarmaco first, verify, then add others
- **Test small**: Import 1 month of data first to verify format
- **Keep original**: Don't modify your QB export file while testing
- **Document changes**: Note any data transformations you make

Good luck! Your QuickBooks data is now in a flexible, offline-capable financial reporting system! 🎉
