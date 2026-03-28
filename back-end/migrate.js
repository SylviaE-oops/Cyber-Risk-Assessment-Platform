const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const dbName = process.env.DB_NAME || 'cyberriskapp';
const baseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password'
};

function listMigrationFiles(dirPath) {
  return fs
    .readdirSync(dirPath)
    .filter((name) => name.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
}

async function ensureDatabaseAndMigrationsTable(adminConnection) {
  const safeDbName = dbName.replace(/`/g, '');
  await adminConnection.query(`CREATE DATABASE IF NOT EXISTS \`${safeDbName}\``);
  await adminConnection.query(`USE \`${safeDbName}\``);
  await adminConnection.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getAppliedMigrations(connection) {
  const [rows] = await connection.query('SELECT file_name FROM schema_migrations');
  return new Set(rows.map((row) => row.file_name));
}

function splitSqlStatements(sqlText) {
  return sqlText
    .split(';')
    .map((stmt) => stmt.trim())
    .filter(Boolean);
}

async function executeStatement(connection, statement) {
  try {
    await connection.query(statement);
  } catch (error) {
    const ignorableCodes = new Set(['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_TABLE_EXISTS_ERROR']);
    if (error && ignorableCodes.has(error.code)) {
      return;
    }
    throw error;
  }
}

async function applyMigration(connection, fileName, sqlText) {
  await connection.beginTransaction();
  try {
    const statements = splitSqlStatements(sqlText);
    for (const statement of statements) {
      await executeStatement(connection, statement);
    }
    await connection.query('INSERT INTO schema_migrations (file_name) VALUES (?)', [fileName]);
    await connection.commit();
    console.log(`Applied migration: ${fileName}`);
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations folder not found: ${migrationsDir}`);
  }

  const adminConnection = await mysql.createConnection(baseConfig);
  try {
    await ensureDatabaseAndMigrationsTable(adminConnection);

    const files = listMigrationFiles(migrationsDir);
    const applied = await getAppliedMigrations(adminConnection);

    for (const fileName of files) {
      if (applied.has(fileName)) {
        continue;
      }

      const fullPath = path.join(migrationsDir, fileName);
      const sqlText = fs.readFileSync(fullPath, 'utf8').trim();
      if (!sqlText) {
        await adminConnection.query('INSERT INTO schema_migrations (file_name) VALUES (?)', [fileName]);
        console.log(`Marked empty migration as applied: ${fileName}`);
        continue;
      }

      await applyMigration(adminConnection, fileName, sqlText);
    }

    console.log('Migrations complete.');
  } finally {
    await adminConnection.end();
  }
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
regi