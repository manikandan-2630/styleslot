# StyleSlot — Premium Salon Appointment Booking

A single-page salon appointment booking application with a Black + White + Gold
premium theme. Built with plain HTML/CSS/JS on the frontend and a Node.js +
Express + MySQL backend, running entirely on localhost.

---

## Tech Stack

| Layer     | Technology                       |
|-----------|-----------------------------------|
| Frontend  | HTML5, CSS3, Vanilla JavaScript  |
| Backend   | Node.js, Express.js               |
| Database  | MySQL                             |
| API       | REST (JSON)                       |

---

## Folder Structure

```
StyleSlot/
├── client/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── server/
│   ├── server.js
│   ├── routes/
│   │   └── appointmentRoutes.js
│   ├── controllers/
│   │   └── appointmentController.js
│   └── config/
│       └── db.js
├── database/
│   └── styleslot.sql
├── package.json
├── .env.example
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) running locally
- A MySQL client of your choice (MySQL Workbench, CLI, phpMyAdmin, etc.)

---

## Setup Instructions

### 1. Create the database

Open your MySQL client and run the provided SQL file:

```bash
mysql -u root -p < database/styleslot.sql
```

This creates the `styleslot` database and the `appointments` table.

### 2. Configure environment variables

Copy `.env.example` to `.env` in the project root and update it to match your
local MySQL credentials:

```bash
cp .env.example .env
```

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=styleslot
DB_PORT=3306
PORT=3000
```

> If your local MySQL root user has no password, leave `DB_PASSWORD` blank.

### 3. Install dependencies

From the project root:

```bash
npm install
```

### 4. Start the server

```bash
npm start
```

You should see:

```
=========================================
  StyleSlot running at http://localhost:3000
=========================================
✅ MySQL connected successfully to database: styleslot
```

### 5. Open the app

Visit **http://localhost:3000** in your browser.

---

## API Reference

### `POST /api/appointments`

Creates a new appointment booking.

**Request body (JSON):**

```json
{
  "fullName": "Aanya Sharma",
  "mobile": "9876543210",
  "email": "aanya@example.com",
  "gender": "Female",
  "age": 28,
  "service": "Hair Cut & Styling",
  "stylist": "Meera Kapoor",
  "appointmentDate": "2026-08-01",
  "appointmentTime": "14:30",
  "branch": "StyleSlot — Bandra West",
  "specialRequest": "Prefer a quiet corner seat.",
  "paymentMethod": "UPI",
  "termsAccepted": true
}
```

**Success response `201`:**

```json
{
  "success": true,
  "message": "Appointment booked successfully.",
  "bookingId": "STS000001",
  "data": { "...": "appointment summary" }
}
```

**Validation error response `400`:**

```json
{
  "success": false,
  "message": "Please correct the highlighted fields.",
  "errors": { "mobile": "Enter a valid 10-digit mobile number." }
}
```

### `GET /api/appointments`

Returns the 50 most recent bookings (useful for testing/verification).

---

## Validation Rules

- All fields except **Special Request** are required.
- Email must be a valid email format.
- Mobile number must be exactly 10 digits.
- Appointment date cannot be in the past.
- Appointment time is required.
- The Terms & Conditions / Cancellation Policy checkbox must be checked.

Validation runs both on the client (instant inline feedback) and on the
server (authoritative, prevents bad data from ever reaching MySQL).

---

## Booking ID Generation

Booking IDs follow the format `STS000001`, `STS000002`, etc. The next number
is calculated from the highest existing `booking_id` in the database, so
numbering stays consistent even after a server restart.

---

## Notes

- The Express server serves both the API (`/api/appointments`) and the static
  frontend (`client/`), so a single `npm start` is all you need.
- No Firebase, no MongoDB — MySQL only, as required.
- CORS is enabled for local development flexibility.
