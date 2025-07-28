# PowerShell script to run the medicine orders migration
# Make sure PostgreSQL is running and accessible

Write-Host "Starting medicine orders table migration..." -ForegroundColor Green

# PostgreSQL connection parameters (adjust as needed)
$env:PGHOST = "localhost"
$env:PGPORT = "5433"
$env:PGUSER = "postgres"
$env:PGPASSWORD = "aquinattaayo"
$env:PGDATABASE = "healthcare"

Write-Host "Connecting to PostgreSQL database..." -ForegroundColor Yellow

# Run the migration script
try {
    psql -f "src\migrations\medicine_orders_migration.sql"
    Write-Host "Migration completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "Migration failed. Please run the SQL manually in your PostgreSQL client." -ForegroundColor Red
    Write-Host "SQL file location: src\migrations\medicine_orders_migration.sql" -ForegroundColor Yellow
}

Write-Host "Re-enabling synchronization..." -ForegroundColor Yellow
# Note: You'll need to manually set synchronize back to true in database.module.ts after migration
