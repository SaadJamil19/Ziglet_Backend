import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const taskController = new TaskController();

router.get('/', authenticateToken, (req, res) => taskController.getTasks(req, res));
router.post('/complete', authenticateToken, (req, res) => taskController.completeTask(req, res));
router.post('/daily-login-claim', authenticateToken, (req, res) => taskController.claimDailyLogin(req, res));

export default router;
