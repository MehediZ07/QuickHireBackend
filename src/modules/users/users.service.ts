import { pool } from '../../config/database';

export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, name, email, phone, role FROM users ORDER BY id');
  return result.rows;
};

export const updateUser = async (userId: string, updates: any) => {
  const allowedFields = ['name', 'email', 'phone', 'role'];
  const fields = Object.keys(updates).filter(field => allowedFields.includes(field));
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  if (updates.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(updates.email)) {
      throw new Error('Invalid email format');
    }
  }

  if (updates.role) {
    const validRoles = ['admin', 'customer'];
    if (!validRoles.includes(updates.role)) {
      throw new Error('Invalid role. Allowed values: admin, customer');
    }
  }

  const values = fields.map(field => updates[field]);
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  try {
    const result = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${fields.length + 1} RETURNING id, name, email, phone, role`,
      [...values, userId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('Email already exists');
    }
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  const activeBookings = await pool.query(
    'SELECT id FROM bookings WHERE customer_id = $1 AND status = $2',
    [userId, 'active']
  );

  if (activeBookings.rows.length > 0) {
    throw new Error('Cannot delete user with active bookings');
  }

  const result = await pool.query('DELETE FROM users WHERE id = $1', [userId]);
  return (result.rowCount ?? 0) > 0;
};