import { Router } from 'express';
import * as applicationsController from './applications.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/', applicationsController.createApplication);
router.get('/my-applications', authenticateToken, applicationsController.getMyApplications);
router.get('/all', authenticateToken, applicationsController.getAllApplications);

export default router;
