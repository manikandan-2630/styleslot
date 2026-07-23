// =========================================================
// Appointment Controller
// Handles validation, booking ID generation, and persistence
// =========================================================

const db = require('../config/db');

const VALID_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];
const VALID_PAYMENT_METHODS = ['Cash', 'UPI', 'Card'];

/**
 * Validates the incoming appointment payload.
 * Returns an object map of { field: message } for any invalid fields.
 */
function validateAppointment(data) {
  const errors = {};

  const {
    fullName,
    mobile,
    email,
    gender,
    age,
    service,
    stylist,
    appointmentDate,
    appointmentTime,
    branch,
    paymentMethod,
    termsAccepted
  } = data;

  if (!fullName || !fullName.trim()) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }

  if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
    errors.mobile = 'Enter a valid 10-digit mobile number.';
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!gender || !VALID_GENDERS.includes(gender)) {
    errors.gender = 'Please select a gender.';
  }

  const ageNum = Number(age);
  if (!age || Number.isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
    errors.age = 'Enter a valid age.';
  }

  if (!service || !service.trim()) {
    errors.service = 'Please select a service.';
  }

  if (!stylist || !stylist.trim()) {
    errors.stylist = 'Please select a preferred stylist.';
  }

  if (!appointmentDate) {
    errors.appointmentDate = 'Appointment date is required.';
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(appointmentDate);
    if (Number.isNaN(selectedDate.getTime())) {
      errors.appointmentDate = 'Invalid appointment date.';
    } else if (selectedDate < today) {
      errors.appointmentDate = 'Appointment date cannot be in the past.';
    }
  }

  if (!appointmentTime || !appointmentTime.trim()) {
    errors.appointmentTime = 'Preferred time is required.';
  }

  if (!branch || !branch.trim()) {
    errors.branch = 'Please select a branch / location.';
  }

  if (!paymentMethod || !VALID_PAYMENT_METHODS.includes(paymentMethod)) {
    errors.paymentMethod = 'Please select a payment method.';
  }

  if (!termsAccepted) {
    errors.termsAccepted = 'You must agree to the Terms & Conditions and Cancellation Policy.';
  }

  return errors;
}

/**
 * Generates the next sequential booking ID in the format STS000001.
 * Reads the last inserted numeric suffix from the database to stay
 * consistent across server restarts.
 */
async function generateBookingId(connection) {
  const [rows] = await connection.query(
    `SELECT booking_id FROM appointments ORDER BY id DESC LIMIT 1`
  );

  let nextNumber = 1;
  if (rows.length > 0) {
    const lastId = rows[0].booking_id; // e.g. STS000042
    const numericPart = parseInt(lastId.replace('STS', ''), 10);
    if (!Number.isNaN(numericPart)) {
      nextNumber = numericPart + 1;
    }
  }

  return `STS${String(nextNumber).padStart(6, '0')}`;
}

/**
 * POST /api/appointments
 * Validates, generates a booking ID, and stores the appointment.
 */
async function createAppointment(req, res) {
  try {
    const errors = validateAppointment(req.body);

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Please correct the highlighted fields.',
        errors
      });
    }

    const {
      fullName,
      mobile,
      email,
      gender,
      age,
      service,
      stylist,
      appointmentDate,
      appointmentTime,
      branch,
      specialRequest,
      paymentMethod
    } = req.body;

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      const bookingId = await generateBookingId(connection);

      await connection.query(
        `INSERT INTO appointments
          (booking_id, full_name, mobile, email, gender, age, service, stylist,
           appointment_date, appointment_time, branch, special_request, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          bookingId,
          fullName.trim(),
          mobile.trim(),
          email.trim(),
          gender,
          Number(age),
          service,
          stylist,
          appointmentDate,
          appointmentTime,
          branch,
          (specialRequest || '').trim(),
          paymentMethod
        ]
      );

      await connection.commit();

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        bookingId,
        data: {
          bookingId,
          fullName: fullName.trim(),
          service,
          stylist,
          appointmentDate,
          appointmentTime,
          branch,
          paymentMethod
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error creating appointment:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong while saving your appointment. Please try again.'
    });
  }
}

/**
 * GET /api/appointments
 * Optional helper endpoint to list recent appointments (useful for testing).
 */
async function getAppointments(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT * FROM appointments ORDER BY id DESC LIMIT 50`
    );
    return res.status(200).json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching appointments:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch appointments.'
    });
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  validateAppointment
};
