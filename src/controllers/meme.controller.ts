import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { MemeService } from '../services/meme.service';
import { SubmissionStatus } from '../database/entities/MemeSubmission';

export class MemeController {
    private memeService: MemeService;

    constructor() {
        this.memeService = new MemeService();
    }

    submit = async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.userId;
            const { taskId, imageUrl } = req.body;

            if (!userId) return res.status(401).json({ error: 'Unauthorized' });
            if (!imageUrl) return res.status(400).json({ error: 'Image URL required' });

            const result = await this.memeService.submitMeme(userId, taskId, imageUrl);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    };

    // Admin Only
    listPending = async (req: Request, res: Response) => {
        // Basic static admin check for simplicity or use middleware
        const apiKey = req.headers['x-admin-key'] as string;
        if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });

        try {
            const list = await this.memeService.getPendingSubmissions();
            return res.json(list);
        } catch (error: any) {
            return res.status(500).json({ error: error.message });
        }
    }

    review = async (req: Request, res: Response) => {
        const apiKey = req.headers['x-admin-key'] as string;
        if (apiKey !== process.env.ADMIN_API_KEY) return res.status(401).json({ error: 'Unauthorized' });

        try {
            const { id } = req.params;
            const status = req.body.status as SubmissionStatus;
            const { feedback, points } = req.body;

            if (![SubmissionStatus.APPROVED, SubmissionStatus.REJECTED].includes(status)) {
                return res.status(400).json({ error: 'Invalid status' });
            }

            const result = await this.memeService.reviewSubmission('admin', id as string, status as any, feedback, points);
            return res.json(result);
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
}
