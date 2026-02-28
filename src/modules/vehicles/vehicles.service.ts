import { pool } from '../../config/database';

export const createVehicle = async (vehicleData: any) => {
  const { vehicle_name, type, registration_number, daily_rent_price, availability_status } = vehicleData;
  
  if (!vehicle_name || !type || !registration_number || daily_rent_price === undefined) {
    throw new Error('vehicle_name, type, registration_number, and daily_rent_price are required');
  }

  const validTypes = ['car', 'bike', 'van', 'SUV'];
  if (!validTypes.includes(type)) {
    throw new Error('Invalid vehicle type. Allowed values: car, bike, van, SUV');
  }

  if (typeof daily_rent_price !== 'number' || daily_rent_price <= 0) {
    throw new Error('daily_rent_price must be a positive number');
  }

  const validStatuses = ['available', 'booked'];
  if (availability_status && !validStatuses.includes(availability_status)) {
    throw new Error('Invalid availability_status. Allowed values: available, booked');
  }

  try {
    const result = await pool.query(
      'INSERT INTO vehicles (vehicle_name, type, registration_number, daily_rent_price, availability_status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [vehicle_name, type, registration_number, daily_rent_price, availability_status || 'available']
    );

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('Registration number already exists');
    }
    throw error;
  }
};

export const getAllVehicles = async () => {
  const result = await pool.query('SELECT * FROM vehicles ORDER BY id');
  return result.rows;
};

export const getVehicleById = async (vehicleId: string) => {
  const result = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicleId]);
  return result.rows[0];
};

export const updateVehicle = async (vehicleId: string, updates: any) => {
  const allowedFields = ['vehicle_name', 'type', 'registration_number', 'daily_rent_price', 'availability_status'];
  const fields = Object.keys(updates).filter(field => allowedFields.includes(field));
  
  if (fields.length === 0) {
    throw new Error('No valid fields to update');
  }

  if (updates.type) {
    const validTypes = ['car', 'bike', 'van', 'SUV'];
    if (!validTypes.includes(updates.type)) {
      throw new Error('Invalid vehicle type. Allowed values: car, bike, van, SUV');
    }
  }

  if (updates.daily_rent_price !== undefined) {
    if (typeof updates.daily_rent_price !== 'number' || updates.daily_rent_price <= 0) {
      throw new Error('daily_rent_price must be a positive number');
    }
  }

  if (updates.availability_status) {
    const validStatuses = ['available', 'booked'];
    if (!validStatuses.includes(updates.availability_status)) {
      throw new Error('Invalid availability_status. Allowed values: available, booked');
    }
  }

  const values = fields.map(field => updates[field]);
  const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');

  try {
    const result = await pool.query(
      `UPDATE vehicles SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, vehicleId]
    );

    return result.rows[0];
  } catch (error: any) {
    if (error.code === '23505') {
      throw new Error('Registration number already exists');
    }
    throw error;
  }
};

export const deleteVehicle = async (vehicleId: string) => {
  const activeBookings = await pool.query(
    'SELECT id FROM bookings WHERE vehicle_id = $1 AND status = $2',
    [vehicleId, 'active']
  );

  if (activeBookings.rows.length > 0) {
    throw new Error('Cannot delete vehicle with active bookings');
  }

  const result = await pool.query('DELETE FROM vehicles WHERE id = $1', [vehicleId]);
  return (result.rowCount ?? 0) > 0;
};