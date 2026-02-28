import { Router } from 'express';
import { createBooking, getAllBookings, updateBooking } from './bookings.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/', authenticateToken, createBooking);
router.get('/', authenticateToken, getAllBookings);
router.put('/:bookingId', authenticateToken, updateBooking);

export default router;