import { Router } from 'express';
import { SocialController } from '../controllers/social.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const socialController = new SocialController();

// Protected Routes
router.get('/twitter/connect', authenticateToken, socialController.initiateTwitterAuth);
router.post('/twitter/callback', authenticateToken, socialController.linkTwitter);

export default router;
