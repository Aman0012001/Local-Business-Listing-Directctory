# PowerShell script to create PostgreSQL database
# Run this script to automatically create the database

Write-Host "Creating PostgreSQL Database..." -ForegroundColor Green

# Prompt for PostgreSQL password
$password = Read-Host "Enter your PostgreSQL password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

# Set PGPASSWORD environment variable
$env:PGPASSWORD = $plainPassword

Write-Host "Checking if database exists..." -ForegroundColor Yellow

# Check if database exists
$dbExists = psql -U postgres -lqt | Select-String -Pattern "business_saas_db"

if ($dbExists) {
    Write-Host "Database 'business_saas_db' already exists!" -ForegroundColor Yellow
} else {
    Write-Host "Creating database 'business_saas_db'..." -ForegroundColor Yellow
    
    # Create database
    psql -U postgres -c "CREATE DATABASE business_saas_db;"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database created successfully!" -ForegroundColor Green
    } else {
        Write-Host "✗ Failed to create database" -ForegroundColor Red
        exit 1
    }
}

# Verify database
Write-Host "`nVerifying database..." -ForegroundColor Yellow
psql -U postgres -c "\l business_saas_db"

Write-Host "`n✓ Setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Update the .env file with your PostgreSQL password" -ForegroundColor White
Write-Host "2. Run: npm run start:dev" -ForegroundColor White

# Clear password from environment
$env:PGPASSWORD = ""
