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
        user_id INT,
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
          org_name VARCHAR(255),
          org_type VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await pool.query(`
        CREATE TABLE IF NOT EXISTS assessment_reports (
          id INT AUTO_INCREMENT PRIMARY KEY,
          assessment_id INT NOT NULL,
          user_id INT NOT NULL,
          file_name VARCHAR(255) NOT NULL,
          mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
          pdf_data LONGBLOB NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY uq_assessment_reports_assessment_id (assessment_id)
        )
      `);

    // Ensure organization columns exist for older databases created before this schema update.
    // Some MySQL versions do not support "ADD COLUMN IF NOT EXISTS".
    try {
      await pool.query('ALTER TABLE users ADD COLUMN org_name VARCHAR(255)');
    } catch (error) {
      if (error && error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }

    try {
      await pool.query('ALTER TABLE users ADD COLUMN org_type VARCHAR(100)');
    } catch (error) {
      if (error && error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }

    // Ensure assessments can be associated to the authenticated user account.
    try {
      await pool.query('ALTER TABLE assessments ADD COLUMN user_id INT');
    } catch (error) {
      if (error && error.code !== 'ER_DUP_FIELDNAME') {
        throw error;
      }
    }

    try {
      await pool.query('CREATE INDEX idx_assessments_user_id ON assessments (user_id)');
    } catch (error) {
      if (error && error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }

    try {
      await pool.query('CREATE INDEX idx_assessment_reports_user_id ON assessment_reports (user_id)');
    } catch (error) {
      if (error && error.code !== 'ER_DUP_KEYNAME') {
        throw error;
      }
    }
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
