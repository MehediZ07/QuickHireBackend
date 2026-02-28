import { Router } from 'express';
import { getAllUsers, updateUser, deleteUser } from './users.controller';
import { authenticateToken, authorizeRole } from '../../middleware/auth';

const router = Router();

router.get('/', authenticateToken, authorizeRole(['admin']), getAllUsers);
router.put('/:userId', authenticateToken, updateUser);
router.delete('/:userId', authenticateToken, authorizeRole(['admin']), deleteUser);

export default router;