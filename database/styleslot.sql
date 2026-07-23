-- =========================================================
-- StyleSlot - Salon Appointment Booking
-- Database schema
-- =========================================================

CREATE DATABASE IF NOT EXISTS styleslot
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE styleslot;

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

-- Helpful index for lookups by date
CREATE INDEX idx_appointment_date ON appointments (appointment_date);
