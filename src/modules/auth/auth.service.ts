import { pool } from '../../config/database';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from '../../config';

export const createUser = async (name: string, email: string, password: string, phone: string, role: string) => {

  if (!name || !email || !password || !phone) {
    throw new Error('name, email, password, and phone are required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  const validRoles = ['admin', 'customer'];
  if (role && !validRoles.includes(role)) {
    throw new Error('Invalid role. Allowed values: admin, customer');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  let hashedPassword: string;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, role',
      [name, email.toLowerCase(), hashedPassword, phone, role || 'customer']
    );

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') { 
      throw new Error('Email already exists');
    }
    throw error;
  }
};

export const loginUser = async (email: string, password: string) => {

  if (!email || !password) {
    throw new Error('email and password are required');
  }

  if (!config.jwtSecret) {
    throw new Error('JWT secret is not configured');
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  } catch (error) {
    throw error;
  }
};