import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();
const authController = new AuthController();

router.post('/nonce', authController.generateNonce);
router.post('/verify', authController.verifySignature);

export default router;
