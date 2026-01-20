import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();
const adminController = new AdminController();

router.post('/faucet/process', adminController.processFaucet);

export default router;
