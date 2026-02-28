import { Request, Response } from 'express';
import * as bookingService from './bookings.service';

interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string };
}

export const createBooking = async (req: AuthRequest, res: Response) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for booking creation'
    });
  }

  const { vehicle_id, rent_start_date, rent_end_date, customer_id: providedCustomerId } = req.body;
  const customer_id = req.user!.id;

  if (providedCustomerId && providedCustomerId !== customer_id && req.user!.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'You can only create bookings for yourself'
    });
  }

  try {
    const booking = await bookingService.createBooking({ customer_id, vehicle_id, rent_start_date, rent_end_date });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAllBookings = async (req: AuthRequest, res: Response) => {
  const currentUser = req.user!;

  try {
    const bookings = await bookingService.getBookingsByRole(currentUser.id, currentUser.role);

    const message = currentUser.role === 'admin' 
      ? 'Bookings retrieved successfully'
      : 'Your bookings retrieved successfully';

    res.json({
      success: true,
      message,
      data: bookings.map(row => {
        if (currentUser.role === 'admin') {
          return {
            id: row.id,
            customer_id: row.customer_id,
            vehicle_id: row.vehicle_id,
            rent_start_date: row.rent_start_date,
            rent_end_date: row.rent_end_date,
            total_price: row.total_price,
            status: row.status,
            customer: {
              name: row.customer_name,
              email: row.customer_email
            },
            vehicle: {
              vehicle_name: row.vehicle_name,
              registration_number: row.registration_number
            }
          };
        } else {
          return {
            id: row.id,
            vehicle_id: row.vehicle_id,
            rent_start_date: row.rent_start_date,
            rent_end_date: row.rent_end_date,
            total_price: row.total_price,
            status: row.status,
            vehicle: {
              vehicle_name: row.vehicle_name,
              registration_number: row.registration_number,
              type: row.type
            }
          };
        }
      })
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBooking = async (req: AuthRequest, res: Response) => {
  const { bookingId } = req.params;
  const { status } = req.body;
  const currentUser = req.user!;

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No data provided for update'
    });
  }

  try {
    const booking = await bookingService.updateBookingStatus(bookingId!, status, currentUser.id, currentUser.role);

    const message = status === 'cancelled' 
      ? 'Booking cancelled successfully'
      : 'Booking marked as returned. Vehicle is now available';

    const responseData = booking;
    if (status === 'returned') {
      responseData.vehicle = { availability_status: 'available' };
    }

    res.json({
      success: true,
      message,
      data: responseData
    });
  } catch (error: any) {
    const statusCode = 
      error.message === 'Booking not found' ? 404 :
      error.message.includes('Only admins') || error.message.includes('only update your own') ? 403 :
      400;

    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};