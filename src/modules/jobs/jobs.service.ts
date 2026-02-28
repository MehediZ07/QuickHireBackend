import { pool } from '../../config/database';

export const getAllJobs = async () => {
  const result = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
  return result.rows;
};

export const getJobById = async (id: number) => {
  const result = await pool.query('SELECT * FROM jobs WHERE id = $1', [id]);
  return result.rows[0];
};

export const createJob = async (jobData: any) => {
  const { title, company, location, category, description, logo, type } = jobData;
  const result = await pool.query(
    'INSERT INTO jobs (title, company, location, category, description, logo, type) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [title, company, location, category, description, logo, type || 'Full-Time']
  );
  return result.rows[0];
};

export const deleteJob = async (id: number) => {
  const result = await pool.query('DELETE FROM jobs WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};
