"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemeController = void 0;
const meme_service_1 = require("../services/meme.service");
const MemeSubmission_1 = require("../database/entities/MemeSubmission");
class MemeController {
    constructor() {
        this.submit = async (req, res) => {
            try {
                const userId = req.user?.userId;
                const { taskId, imageUrl } = req.body;
                if (!userId)
                    return res.status(401).json({ error: 'Unauthorized' });
                if (!imageUrl)
                    return res.status(400).json({ error: 'Image URL required' });
                const result = await this.memeService.submitMeme(userId, taskId, imageUrl);
                return res.json(result);
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        };
        // Admin Only
        this.listPending = async (req, res) => {
            // Basic static admin check for simplicity or use middleware
            const apiKey = req.headers['x-admin-key'];
            if (apiKey !== process.env.ADMIN_API_KEY)
                return res.status(401).json({ error: 'Unauthorized' });
            try {
                const list = await this.memeService.getPendingSubmissions();
                return res.json(list);
            }
            catch (error) {
                return res.status(500).json({ error: error.message });
            }
        };
        this.review = async (req, res) => {
            const apiKey = req.headers['x-admin-key'];
            if (apiKey !== process.env.ADMIN_API_KEY)
                return res.status(401).json({ error: 'Unauthorized' });
            try {
                const { id } = req.params;
                const status = req.body.status;
                const { feedback, points } = req.body;
                if (![MemeSubmission_1.SubmissionStatus.APPROVED, MemeSubmission_1.SubmissionStatus.REJECTED].includes(status)) {
                    return res.status(400).json({ error: 'Invalid status' });
                }
                const result = await this.memeService.reviewSubmission('admin', id, status, feedback, points);
                return res.json(result);
            }
            catch (error) {
                return res.status(400).json({ error: error.message });
            }
        };
        this.memeService = new meme_service_1.MemeService();
    }
}
exports.MemeController = MemeController;
