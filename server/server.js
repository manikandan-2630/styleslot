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

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the static frontend (client folder)
app.use(express.static(path.join(__dirname, '..', 'client')));

// API routes
app.use('/api/appointments', appointmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'StyleSlot API is running.' });
});

// Fallback to index.html for the single-page app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
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
