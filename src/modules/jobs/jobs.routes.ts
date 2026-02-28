import { Router } from 'express';
import * as jobsController from './jobs.controller';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.get('/', jobsController.getJobs);
router.get('/:id', jobsController.getJob);
router.post('/', authenticateToken, jobsController.createJob);
router.delete('/:id', authenticateToken, jobsController.deleteJob);

export default router;
