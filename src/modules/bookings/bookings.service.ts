import { pool } from '../../config/database';

export const createBooking = async (bookingData: any) => {
  const { customer_id, vehicle_id, rent_start_date, rent_end_date } = bookingData;

  if (!vehicle_id || !rent_start_date || !rent_end_date) {
    throw new Error('vehicle_id, rent_start_date, and rent_end_date are required');
  }

  const startDate = new Date(rent_start_date);
  const endDate = new Date(rent_end_date);
  
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    throw new Error('Invalid date format');
  }
  
  if (endDate <= startDate) {
    throw new Error('rent_end_date must be after rent_start_date');
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (startDate < today) {
    throw new Error('rent_start_date cannot be in the past');
  }

  const vehicleResult = await pool.query('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
  
  if (vehicleResult.rows.length === 0) {
    throw new Error('Vehicle not found');
  }

  const vehicle = vehicleResult.rows[0];
  
  if (vehicle.availability_status !== 'available') {
    throw new Error('Vehicle is not available');
  }

  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const total_price = days * vehicle.daily_rent_price;

  if (total_price <= 0) {
    throw new Error('Total price must be positive');
  }

  await pool.query('BEGIN');

  try {
    const bookingResult = await pool.query(
      'INSERT INTO bookings (customer_id, vehicle_id, rent_start_date, rent_end_date, total_price) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [customer_id, vehicle_id, rent_start_date, rent_end_date, total_price]
    );

    await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['booked', vehicle_id]);

    await pool.query('COMMIT');

    const booking = bookingResult.rows[0];
    booking.vehicle = {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: vehicle.daily_rent_price
    };

    return booking;
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};

export const autoReturnExpiredBookings = async () => {
  const today = new Date().toISOString().split('T')[0];
  
  await pool.query('BEGIN');
  
  const expiredBookings = await pool.query(
    'UPDATE bookings SET status = $1 WHERE rent_end_date < $2 AND status = $3 RETURNING vehicle_id',
    ['returned', today, 'active']
  );
  
  for (const booking of expiredBookings.rows) {
    await pool.query(
      'UPDATE vehicles SET availability_status = $1 WHERE id = $2',
      ['available', booking.vehicle_id]
    );
  }
  
  await pool.query('COMMIT');
  
  return expiredBookings.rows.length;
};

export const getBookingsByRole = async (userId: number, role: string) => {
  await autoReturnExpiredBookings();
  
  let query = '';
  let params: any[] = [];

  if (role === 'admin') {
    query = `
      SELECT b.*, 
             u.name as customer_name, u.email as customer_email,
             v.vehicle_name, v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.created_at DESC
    `;
  } else {
    query = `
      SELECT b.id, b.vehicle_id, b.rent_start_date, b.rent_end_date, b.total_price, b.status,
             v.vehicle_name, v.registration_number, v.type
      FROM bookings b
      JOIN vehicles v ON b.vehicle_id = v.id
      WHERE b.customer_id = $1
      ORDER BY b.created_at DESC
    `;
    params = [userId];
  }

  const result = await pool.query(query, params);
  return result.rows;
};

export const updateBookingStatus = async (bookingId: string, status: string, userId: number, role: string) => {
  if (!status) {
    throw new Error('Status is required');
  }

  if (!['cancelled', 'returned'].includes(status)) {
    throw new Error('Invalid status. Allowed values: cancelled, returned');
  }

  const bookingResult = await pool.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
  
  if (bookingResult.rows.length === 0) {
    throw new Error('Booking not found');
  }

  const booking = bookingResult.rows[0];

  if (booking.status !== 'active') {
    throw new Error(`Cannot update booking with status: ${booking.status}`);
  }

  if (role !== 'admin' && booking.customer_id !== userId) {
    throw new Error('You can only update your own bookings');
  }

  if (status === 'returned' && role !== 'admin') {
    throw new Error('Only admins can mark bookings as returned');
  }

  if (status === 'cancelled' && role !== 'admin') {
    const startDate = new Date(booking.rent_start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate <= today) {
      throw new Error('Cannot cancel booking after start date');
    }
  }

  await pool.query('BEGIN');

  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, bookingId]
    );

    if (status === 'cancelled' || status === 'returned') {
      await pool.query('UPDATE vehicles SET availability_status = $1 WHERE id = $2', ['available', booking.vehicle_id]);
    }

    await pool.query('COMMIT');

    return result.rows[0];
  } catch (error) {
    await pool.query('ROLLBACK');
    throw error;
  }
};