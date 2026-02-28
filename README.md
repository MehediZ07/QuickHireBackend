# QuickHire Backend

A RESTful API backend for QuickHire - a modern job portal platform built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- JWT-based authentication
- Job management (CRUD operations)
- Job application submission
- Input validation and error handling
- PostgreSQL database with proper relationships
- Admin-only protected routes

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs

## API Endpoints

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job by ID
- `POST /api/jobs` - Create new job (Admin only, requires auth)
- `DELETE /api/jobs/:id` - Delete job (Admin only, requires auth)

### Applications
- `POST /api/applications` - Submit job application

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

## Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Create a `.env` file in the root directory:

```env
CONNECTION_STR=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
```

## Database Schema

### Jobs Table
- id (SERIAL PRIMARY KEY)
- title (VARCHAR)
- company (VARCHAR)
- location (VARCHAR)
- category (VARCHAR)
- description (TEXT)
- logo (VARCHAR)
- type (VARCHAR)
- created_at (TIMESTAMP)

### Applications Table
- id (SERIAL PRIMARY KEY)
- job_id (INTEGER, FK to jobs)
- name (VARCHAR)
- email (VARCHAR)
- resume_link (VARCHAR)
- cover_note (TEXT)
- created_at (TIMESTAMP)

## Project Structure

```
src/
├── config/
│   ├── database.ts
│   └── index.ts
├── middleware/
│   └── auth.ts
├── modules/
│   ├── auth/
│   ├── jobs/
│   └── applications/
└── server.ts
```

## License

MIT
