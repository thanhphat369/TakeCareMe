// Test Database Connection Script
const sql = require('mssql');

// Database configuration
const config = {
  server: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 1433,
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_DATABASE || 'TakeCareMeDB',
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
  }
};

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log('📊 Configuration:', {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user
    });

    // Connect to database
    const pool = await sql.connect(config);
    console.log('✅ Database connection successful!');

    // Test query
    const result = await pool.request().query('SELECT @@VERSION as version');
    console.log('📋 SQL Server version:', result.recordset[0].version);

    // Check if database exists
    const dbResult = await pool.request().query(`
      SELECT name FROM sys.databases WHERE name = '${config.database}'
    `);
    
    if (dbResult.recordset.length > 0) {
      console.log(`✅ Database '${config.database}' exists`);
    } else {
      console.log(`❌ Database '${config.database}' does not exist`);
      console.log('💡 Creating database...');
      await pool.request().query(`CREATE DATABASE [${config.database}]`);
      console.log(`✅ Database '${config.database}' created successfully`);
    }

    // Check Users table
    const tableResult = await pool.request().query(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'Users' AND TABLE_SCHEMA = 'dbo'
    `);
    
    if (tableResult.recordset.length > 0) {
      console.log('✅ Users table exists');
      
      // Count users
      const countResult = await pool.request().query('SELECT COUNT(*) as count FROM Users');
      console.log(`📊 Total users in database: ${countResult.recordset[0].count}`);
    } else {
      console.log('❌ Users table does not exist');
      console.log('💡 Please run database migrations first');
    }

    await pool.close();
    console.log('🔒 Database connection closed');
    console.log('✅ Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Troubleshooting tips:');
    console.error('   1. Check if SQL Server is running');
    console.error('   2. Verify connection credentials');
    console.error('   3. Check firewall settings');
    console.error('   4. Ensure SQL Server allows TCP/IP connections');
    process.exit(1);
  }
}

// Run the test
testConnection();


