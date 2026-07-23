// =========================================================
// Database Configuration
// Creates a MySQL connection pool using environment variables
// (falls back to sensible localhost defaults for quick setup)
// =========================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'styleslot',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Quick connectivity check on startup — helps surface config
// mistakes immediately instead of failing silently on first request.
async function verifyConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully to database:', process.env.DB_NAME || 'styleslot');

    // Auto-ensure table exists
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        booking_id VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(100) NOT NULL,
        mobile VARCHAR(10) NOT NULL,
        email VARCHAR(150) NOT NULL,
        gender VARCHAR(20) NOT NULL,
        age INT NOT NULL,
        service VARCHAR(100) NOT NULL,
        stylist VARCHAR(100) NOT NULL,
        appointment_date DATE NOT NULL,
        appointment_time VARCHAR(20) NOT NULL,
        branch VARCHAR(100) NOT NULL,
        special_request TEXT,
        payment_method VARCHAR(20) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    try {
      await connection.query(`CREATE INDEX idx_appointment_date ON appointments (appointment_date);`);
    } catch (e) {
      // Index might already exist
    }

    console.log('✅ Table \'appointments\' verified and ready.');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
    console.error('   Check your .env file and confirm MySQL is running.');
  }
}

verifyConnection();

module.exports = pool;
