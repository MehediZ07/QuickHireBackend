import { Router } from 'express';
import * as applicationsController from './applications.controller';

const router = Router();

router.post('/', applicationsController.createApplication);

export default router;
