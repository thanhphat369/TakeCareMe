# Test Database Connection Script
# PowerShell script to test SQL Server connection

Write-Host "🔍 Testing SQL Server Database Connection..." -ForegroundColor Cyan
Write-Host "=" * 60

# Database configuration
$server = "localhost"
$database = "TakeCareMeDB"
$username = "sa"
$password = "123456"

Write-Host "📊 Configuration:" -ForegroundColor Yellow
Write-Host "   Server: $server"
Write-Host "   Database: $database"
Write-Host "   Username: $username"
Write-Host ""

try {
    # Test connection using sqlcmd
    Write-Host "🔗 Testing connection with sqlcmd..." -ForegroundColor Blue
    
    $connectionString = "Server=$server;Database=$database;User Id=$username;Password=$password;TrustServerCertificate=True;"
    
    # Test basic connection
    $testQuery = "SELECT @@VERSION as version"
    $result = sqlcmd -S $server -d $database -U $username -P $password -Q $testQuery -h -1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection successful!" -ForegroundColor Green
        Write-Host "📋 SQL Server version: $($result[0])" -ForegroundColor Cyan
        
        # Check if Users table exists
        Write-Host "🔍 Checking Users table..." -ForegroundColor Blue
        $tableQuery = "SELECT COUNT(*) as count FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Users'"
        $tableResult = sqlcmd -S $server -d $database -U $username -P $password -Q $tableQuery -h -1
        
        if ($tableResult -match "1") {
            Write-Host "✅ Users table exists" -ForegroundColor Green
            
            # Count users
            $countQuery = "SELECT COUNT(*) as count FROM Users"
            $countResult = sqlcmd -S $server -d $database -U $username -P $password -Q $countQuery -h -1
            Write-Host "📊 Total users: $countResult" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Users table does not exist" -ForegroundColor Red
            Write-Host "💡 Please run database migrations first" -ForegroundColor Yellow
        }
        
    } else {
        Write-Host "❌ Database connection failed!" -ForegroundColor Red
        Write-Host "💡 Troubleshooting tips:" -ForegroundColor Yellow
        Write-Host "   1. Check if SQL Server is running" -ForegroundColor White
        Write-Host "   2. Verify connection credentials" -ForegroundColor White
        Write-Host "   3. Check firewall settings" -ForegroundColor White
        Write-Host "   4. Ensure SQL Server allows TCP/IP connections" -ForegroundColor White
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Backend Configuration:" -ForegroundColor Yellow
Write-Host "   Backend URL: http://localhost:3000" -ForegroundColor White
Write-Host "   API Endpoint: http://localhost:3000/api/auth/register" -ForegroundColor White
Write-Host "   Database: SQL Server - $database" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Green
Write-Host "   1. Start Backend: cd backend && npm run start:dev" -ForegroundColor White
Write-Host "   2. Start Frontend: cd Index && npm start" -ForegroundColor White
Write-Host "   3. Test registration: http://localhost:3001" -ForegroundColor White
