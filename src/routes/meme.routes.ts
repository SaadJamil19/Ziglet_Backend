import { Router } from 'express';
import { MemeController } from '../controllers/meme.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const memeController = new MemeController();

// User Routes
router.post('/', authenticateToken, memeController.submit);

// Admin Routes (Protected by Header Key in Controller for now, or split routers)
router.get('/pending', memeController.listPending);
router.post('/:id/review', memeController.review);

export default router;
