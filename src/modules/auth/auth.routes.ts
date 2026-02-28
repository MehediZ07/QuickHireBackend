import { Router } from 'express';
import { signup, signin } from './auth.controller';

const router = Router();

router.post('/register', signup);
router.post('/login', signin);

export default router;