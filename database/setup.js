// =========================================================
// StyleSlot Database Initializer & Sample Data Seeder
// Creates database, tables, and inserts sample appointments
// =========================================================

require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbUser = process.env.DB_USER || 'root';
  const dbPassword = process.env.DB_PASSWORD || '';
  const dbPort = process.env.DB_PORT || 3306;
  const dbName = process.env.DB_NAME || 'styleslot';

  console.log(`🔌 Connecting to MySQL server at ${dbHost}:${dbPort}...`);

  let connection;
  try {
    // 1. Connect without selecting database to ensure database creation
    connection = await mysql.createConnection({
      host: dbHost,
      user: dbUser,
      password: dbPassword,
      port: dbPort
    });

    console.log('✅ Connected to MySQL server.');

    // 2. Create database
    console.log(`📁 Creating database '${dbName}' if not exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    await connection.query(`USE \`${dbName}\`;`);

    // 3. Create table
    console.log('📋 Creating table \'appointments\' if not exists...');
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

    // Create index if needed
    try {
      await connection.query(`CREATE INDEX idx_appointment_date ON appointments (appointment_date);`);
    } catch (e) {
      // Index might already exist, safe to ignore error
    }

    console.log('✅ Database schema ready.');

    // 4. Insert sample data
    const sampleAppointments = [
      [
        'STS000001',
        'Karthik Raja',
        '9876543210',
        'karthik@example.com',
        'Male',
        28,
        'Haircut & Beard Trim',
        'Alex Rivera',
        '2026-08-01',
        '10:30 AM',
        'Main Street Branch',
        'Please suggest hair styling product.',
        'UPI'
      ],
      [
        'STS000002',
        'Ananya Sharma',
        '9123456789',
        'ananya@example.com',
        'Female',
        25,
        'Hair Coloring & Spa',
        'Sophia Chen',
        '2026-08-02',
        '02:00 PM',
        'City Mall Branch',
        'Ammonia free colors preferred.',
        'Card'
      ],
      [
        'STS000003',
        'Venkatesh Iyer',
        '9988776655',
        'venkat@example.com',
        'Male',
        34,
        'Executive Facial',
        'Marco Rossi',
        '2026-08-03',
        '05:00 PM',
        'Downtown Spa & Salon',
        'Sensitive skin',
        'Cash'
      ]
    ];

    console.log('🌱 Inserting sample data into appointments table...');

    for (const appt of sampleAppointments) {
      await connection.query(
        `INSERT IGNORE INTO appointments
          (booking_id, full_name, mobile, email, gender, age, service, stylist,
           appointment_date, appointment_time, branch, special_request, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        appt
      );
    }

    console.log('✅ Sample data inserted successfully.');

    // 5. Query and display sample data
    const [rows] = await connection.query('SELECT * FROM appointments ORDER BY id ASC');
    console.log('\n=========================================');
    console.log('📊 Stored Appointments in Database (styleslot):');
    console.log('=========================================');
    console.table(rows);

    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database setup error:', err);
    if (connection) await connection.end();
    process.exit(1);
  }
}

setupDatabase();
