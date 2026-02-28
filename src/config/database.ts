import { Pool } from 'pg';
import config from './index';

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

export const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      role VARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      company VARCHAR(200) NOT NULL,
      location VARCHAR(200) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      logo VARCHAR(500),
      type VARCHAR(50) DEFAULT 'Full-Time',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL,
      resume_link VARCHAR(500) NOT NULL,
      cover_note TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
};