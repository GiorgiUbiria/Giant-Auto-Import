# Car Due Prices Update Scripts

This directory contains scripts to update the due prices for all cars in the database based on their existing fee prices.

## Scripts Overview

### 1. Basic Update Script (`update-car-due-prices.ts`)
Updates due prices for all cars using standard fee calculations without custom pricing.

### 2. Advanced Update Script (`update-car-due-prices-advanced.ts`)
Updates due prices for all cars while considering custom pricing configurations for each user.

## Usage

### Prerequisites
- Ensure the database is running and accessible
- Make sure all environment variables are set (especially database connection)
- The project should be built successfully

### Running the Scripts

#### Basic Update (Standard Fees Only)
```bash
npm run update-due-prices
```

#### Advanced Update (With Custom Pricing)
```bash
npm run update-due-prices:advanced
```

### What the Scripts Do

1. **Fetch All Cars**: Retrieves all cars from the database with their fee information
2. **Calculate Due Amounts**: Uses the `calculateDueAmounts` utility function to compute:
   - `purchaseDue`: Sum of purchase fee, auction fee, gate fee, title fee, environmental fee, and virtual bid fee
   - `shippingDue`: Sum of shipping fee, ground fee, and ocean fee (with custom pricing adjustments if applicable)
   - `totalDue`: Sum of purchase due and shipping due
3. **Apply Custom Pricing** (Advanced script only): Considers user-specific pricing configurations including:
   - Ground fee adjustments
   - Pickup surcharges
   - Service fees
   - Hybrid/EV surcharges
4. **Update Database**: Updates each car with the new due amounts
5. **Reset Paid Amounts**: Sets `paidAmount` to 0 for all existing cars
6. **Progress Reporting**: Shows real-time progress and detailed results

### Output Example

```
🚗 Starting advanced car due prices update...

📊 Fetching all cars from database...
✅ Found 150 cars to process

[0.7%] Processing car 1/150: 1HGBH41JXMN109186
  📋 Using custom pricing for user user_123
  ✅ Updated: Purchase Due: $5000, Shipping Due: $1200, Total Due: $6200
  💰 Custom pricing applied: Ground +100, Pickup +300, Service +50, Hybrid +150

[1.3%] Processing car 2/150: 2T1BURHE0JC123456
  ✅ Updated: Purchase Due: $3500, Shipping Due: $800, Total Due: $4300

...

📋 ADVANCED UPDATE SUMMARY
================================================================================
Total cars processed: 150
Successfully updated: 148
Cars with custom pricing: 45
Errors: 2
Success rate: 98.7%

✅ Due prices have been updated successfully!
Note: All cars now have paidAmount set to 0. You may want to review and adjust this manually if needed.

💰 Custom pricing was applied to 45 cars based on user configurations.

🎉 Advanced script completed successfully!
```

### Important Notes

⚠️ **Warning**: These scripts will reset the `paidAmount` field to 0 for all cars. This means:
- All existing payment history will remain in the `payments` table
- But the current paid amount will be reset to 0
- You may need to manually review and adjust paid amounts for cars that already have payments

### When to Use

- **Basic Script**: Use when you want to quickly update all cars with standard fee calculations
- **Advanced Script**: Use when you want to ensure custom pricing configurations are properly applied
- **After Schema Changes**: Run after adding new fee fields or modifying the fee calculation logic
- **Data Migration**: Use when migrating from an old system to the new payments module

### Troubleshooting

#### Common Issues

1. **Database Connection Error**
   - Ensure the database is running
   - Check environment variables
   - Verify database schema is up to date

2. **TypeScript Compilation Errors**
   - Run `npm run build` first to ensure the project compiles
   - Check that all dependencies are installed

3. **Permission Errors**
   - Ensure the script has read/write access to the database
   - Check database user permissions

#### Error Recovery

If the script fails partway through:
1. Check the error logs to identify which cars failed
2. Fix any underlying issues (database, permissions, etc.)
3. Re-run the script - it will process all cars again
4. The script is idempotent, so running it multiple times is safe

### Customization

You can modify these scripts to:
- Add additional fee calculations
- Include more custom pricing logic
- Add validation rules
- Export results to CSV
- Send notifications on completion

### Support

If you encounter issues:
1. Check the console output for detailed error messages
2. Verify the database schema matches the expected structure
3. Ensure all required environment variables are set
4. Check that the `calculateDueAmounts` utility function is working correctly
