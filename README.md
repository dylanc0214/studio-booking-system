# Underrated — DJ Studio Booking Platform

A full-stack web application for booking DJ studio sessions, with user authentication, booking management, payment processing, and a full admin dashboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4, Vite |
| Backend | Express.js (TypeScript), Node.js |
| Database | MySQL via Prisma ORM |
| Auth | JWT, Google OAuth (`@react-oauth/google`) |
| Process Manager | PM2 (`ecosystem.config.cjs`) |

---

## Features

### User-Facing
- **Authentication** — Email/password sign-up & login, plus Google OAuth
- **Studio Booking** — Interactive calendar to select available time slots
- **Checkout** — TNG eWallet or Bank Transfer payment methods, receipt upload
- **Dashboard** — View booking history and statuses
- **Confirmation** — Email confirmation sent upon booking

### Admin Panel
- **Dashboard** — Overview of platform activity
- **Pending Approvals** — Review and approve/reject submitted bookings
- **Upcoming Bookings** — View, edit, or cancel future bookings
- **Manage Users** — View user details, ban/unban or delete accounts
- **Holidays** — Block specific dates or date ranges from being booked

---

## Project Structure

```
underrated/
├── prisma/
│   └── schema.prisma        # Database schema (User, Booking, Payment, DateBlock)
├── server/
│   ├── index.ts             # Express server entry point
│   ├── routes/              # auth, bookings, admin, upload
│   ├── controllers/         # Route handlers
│   ├── middleware/          # Auth & role middleware
│   └── lib/                 # Shared server utilities
├── src/
│   ├── pages/               # React pages (Home, Calendar, Checkout, Dashboard…)
│   │   └── admin/           # Admin-only pages
│   ├── components/          # Reusable UI components
│   ├── context/             # React context (auth state, etc.)
│   └── lib/                 # Shared client utilities
├── public/
│   └── uploads/             # User-uploaded payment receipts
├── ecosystem.config.cjs     # PM2 process config
└── vite.config.ts           # Vite build config
```

---

## Database Schema

| Model | Key Fields |
|---|---|
| `User` | `id`, `name`, `email`, `password_hash`, `role` (ADMIN/CUSTOMER), `is_banned` |
| `Booking` | `id`, `user_id`, `start_time`, `end_time`, `duration`, `total_price`, `status` |
| `Payment` | `id`, `booking_id`, `amount`, `payment_method` (TNG/BANK_TRANSFER), `receipt_url` |
| `DateBlock` | `id`, `date`, `reason` — dates blocked by admin |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL database
- (Optional) A Google Cloud project for OAuth

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | MySQL connection string |
| `GEMINI_API_KEY` | Google Gemini API key |
| `APP_URL` | Public URL of the app (for OAuth callbacks) |
| `SMTP_HOST/PORT/USER/PASS` | SMTP credentials for email sending |
| `SMTP_FROM` | Sender display name and address |
| `ADMIN_EMAIL` | Admin notification recipient |

### 3. Set Up the Database

```bash
npx prisma migrate dev
```

### 4. Seed the Admin User

```bash
npx tsx server/seed-admin.ts
```

---

## Running Locally

Start the frontend dev server (port 3000):

```bash
npm run dev
```

Start the backend API server (port 5000) in a separate terminal:

```bash
npx tsx server/index.ts
```

---

## Production Deployment (PM2)

Build the frontend:

```bash
npm run build
```

Start the API server with PM2:

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
```

Serve the built `dist/` folder via Nginx (or similar) pointing to the app's root, with `/api` proxied to `localhost:5000`.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login with email & password |
| `POST` | `/api/auth/google` | Google OAuth login |
| `GET` | `/api/bookings` | Get current user's bookings |
| `POST` | `/api/bookings` | Create a new booking |
| `GET` | `/api/availability` | Check available time slots |
| `POST` | `/api/upload` | Upload a payment receipt |
| `GET` | `/api/admin/bookings` | (Admin) List all bookings |
| `PUT` | `/api/admin/bookings/:id` | (Admin) Update booking status |
| `GET` | `/api/admin/users` | (Admin) List all users |
| `DELETE` | `/api/admin/users/:id` | (Admin) Delete a user |
| `GET` | `/api/admin/date-blocks` | (Admin) List blocked dates |
| `POST` | `/api/admin/date-blocks` | (Admin) Block a date |
| `DELETE` | `/api/admin/date-blocks/:id` | (Admin) Unblock a date |
| `GET` | `/api/health` | Health check |
