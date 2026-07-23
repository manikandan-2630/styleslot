// =========================================================
// Appointment Routes
// =========================================================

const express = require('express');
const router = express.Router();
const {
  createAppointment,
  getAppointments
} = require('../controllers/appointmentController');

// POST /api/appointments - create a new booking
router.post('/', createAppointment);

// GET /api/appointments - list recent bookings (testing / admin use)
router.get('/', getAppointments);

module.exports = router;
