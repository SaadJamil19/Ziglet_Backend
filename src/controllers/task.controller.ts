import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { TaskService } from '../services/task.service';

export class TaskController {
    private taskService: TaskService;

    constructor() {
        this.taskService = new TaskService();
    }

    getTasks = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const tasks = await this.taskService.getTasks(userId);
            return res.json({ tasks });
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    };

    completeTask = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
            const { taskId, proof } = req.body;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            const result = await this.taskService.verifyAndCompleteTask(userId, taskId, {
                ...proof,
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }

    claimDailyLogin = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ error: 'Unauthorized' });

            // Find the ID for the daily-login task
            const tasks = await this.taskService.getTasks(userId);
            console.log('Available Task Slugs:', tasks.map(t => t.slug));
            const dailyTask = tasks.find(t => t.slug === 'daily-login');

            if (!dailyTask) return res.status(404).json({ error: 'Daily login task not configured' });

            const result = await this.taskService.verifyAndCompleteTask(userId, dailyTask.id, {
                ip: req.ip,
                userAgent: req.headers['user-agent']
            });
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
