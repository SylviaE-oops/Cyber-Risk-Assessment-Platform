const mysql = require('mysql2/promise');

const dbName = process.env.DB_NAME || 'cyberriskapp';
const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password'
};

const pool = mysql.createPool({
  ...baseConfig,
  database: dbName,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  const adminConnection = await mysql.createConnection(baseConfig);

  try {
    const safeDbName = dbName.replace(/`/g, '');
    await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDbName}\``);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        org_name VARCHAR(255) NOT NULL,
        org_type VARCHAR(100) NOT NULL,
        answers JSON NOT NULL,
        score INT NOT NULL,
        risk_level VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `); 
  } finally {
    await adminConnection.end();
  }
}

async function testConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

module.exports = {
  pool,
  initializeDatabase,
  testConnection
};
