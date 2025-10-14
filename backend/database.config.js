// Database Configuration for Take Care Me Backend
module.exports = {
  development: {
    type: 'mssql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 1433,
    username: process.env.DB_USERNAME || 'sa',
    password: process.env.DB_PASSWORD || 'sa',
    database: process.env.DB_DATABASE || 'TakeCareMeDB',
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    },
    synchronize: false,
    logging: process.env.NODE_ENV === 'development',
  },
  production: {
    type: 'mssql',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: false,
    },
    synchronize: false,
    logging: false,
  }
};


