import { pool } from '../../config/database';

export const createApplication = async (applicationData: any) => {
  const { jobId, name, email, resumeLink, coverNote } = applicationData;
  const result = await pool.query(
    'INSERT INTO applications (job_id, name, email, resume_link, cover_note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [jobId, name, email, resumeLink, coverNote]
  );
  return result.rows[0];
};
