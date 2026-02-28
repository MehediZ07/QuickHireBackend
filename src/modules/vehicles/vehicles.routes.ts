import { Router } from 'express';
import { createVehicle, getAllVehicles, getVehicleById, updateVehicle, deleteVehicle } from './vehicles.controller';
import { authenticateToken, authorizeRole } from '../../middleware/auth';

const router = Router();

router.post('/', authenticateToken, authorizeRole(['admin']), createVehicle);
router.get('/', getAllVehicles);
router.get('/:vehicleId', getVehicleById);
router.put('/:vehicleId', authenticateToken, authorizeRole(['admin']), updateVehicle);
router.delete('/:vehicleId', authenticateToken, authorizeRole(['admin']), deleteVehicle);

export default router;