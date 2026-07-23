// =========================================================
// StyleSlot Server
// Express app serving the REST API + the static frontend
// =========================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware — allow Vercel frontend to call this API
app.use(cors({
  origin: [
    'https://styleslot-sage.vercel.app',
    'http://localhost:3000',
    'http://localhost:5500'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// NOTE: Frontend is deployed separately on Vercel.
// This server is a pure API backend.

// API routes
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StyleSlot API is running.' });
});

// Debug endpoint — shows which DB env vars are available (no secrets exposed)
app.get('/api/debug', async (req, res) => {
  const db = require('./config/db');
  let dbStatus = 'unknown';
  let dbError = null;
  try {
    const conn = await db.getConnection();
    dbStatus = 'connected';
    conn.release();
  } catch (err) {
    dbStatus = 'failed';
    dbError = err.message;
  }
  res.json({
    dbStatus,
    dbError,
    envVars: {
      DATABASE_URL: !!process.env.DATABASE_URL,
      MYSQL_URL: !!process.env.MYSQL_URL,
      MYSQLHOST: !!process.env.MYSQLHOST,
      MYSQLUSER: !!process.env.MYSQLUSER,
      MYSQLPASSWORD: !!process.env.MYSQLPASSWORD,
      MYSQLDATABASE: !!process.env.MYSQLDATABASE,
      MYSQLPORT: !!process.env.MYSQLPORT,
      DB_HOST: !!process.env.DB_HOST,
      DB_USER: !!process.env.DB_USER,
      DB_NAME: !!process.env.DB_NAME,
      DB_PORT: !!process.env.DB_PORT
    }
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`  StyleSlot running at http://localhost:${PORT}`);
  console.log('=========================================');
});
