import { pool } from '../../config/database';

export const createApplication = async (applicationData: any) => {
  const { jobId, name, email, resumeLink, coverNote } = applicationData;
  const result = await pool.query(
    'INSERT INTO applications (job_id, name, email, resume_link, cover_note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [jobId, name, email, resumeLink, coverNote]
  );
  return result.rows[0];
};

export const getApplicationsByEmail = async (email: string) => {
  const result = await pool.query(
    `SELECT a.*, j.title, j.company, j.location, j.logo 
     FROM applications a 
     JOIN jobs j ON a.job_id = j.id 
     WHERE a.email = $1 
     ORDER BY a.created_at DESC`,
    [email]
  );
  return result.rows;
};

export const getAllApplications = async () => {
  const result = await pool.query(
    `SELECT a.*, j.title, j.company 
     FROM applications a 
     JOIN jobs j ON a.job_id = j.id 
     ORDER BY a.created_at DESC`
  );
  return result.rows;
};
