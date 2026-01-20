"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemeService = void 0;
const data_source_1 = require("../data-source");
const MemeSubmission_1 = require("../database/entities/MemeSubmission");
const User_1 = require("../database/entities/User");
const Task_1 = require("../database/entities/Task");
const PointsLedger_1 = require("../database/entities/PointsLedger");
class MemeService {
    constructor() {
        this.memeRepository = data_source_1.AppDataSource.getRepository(MemeSubmission_1.MemeSubmission);
        this.userRepository = data_source_1.AppDataSource.getRepository(User_1.User);
        this.taskRepository = data_source_1.AppDataSource.getRepository(Task_1.Task);
        this.pointsRepository = data_source_1.AppDataSource.getRepository(PointsLedger_1.PointsLedger);
    }
    async submitMeme(userId, taskId, imageUrl) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user)
            throw new Error('User not found');
        const task = await this.taskRepository.findOneBy({ id: taskId });
        if (!task || task.type !== Task_1.TaskType.SUBMISSION)
            throw new Error('Invalid meme task');
        // Check daily limit (1 per user per day logic)
        const today = new Date(); // Start of today
        today.setHours(0, 0, 0, 0);
        const existing = await this.memeRepository.createQueryBuilder('meme')
            .where('meme.user_id = :userId', { userId })
            .andWhere('meme.submitted_at >= :today', { today })
            .getOne();
        if (existing) {
            throw new Error('You have already submitted a meme today.');
        }
        const submission = this.memeRepository.create({
            user,
            task,
            image_url: imageUrl,
            status: MemeSubmission_1.SubmissionStatus.PENDING,
            submitted_at: new Date()
        });
        return await this.memeRepository.save(submission);
    }
    async getPendingSubmissions() {
        return await this.memeRepository.find({
            where: { status: MemeSubmission_1.SubmissionStatus.PENDING },
            relations: ['user', 'task'],
            order: { submitted_at: 'ASC' }
        });
    }
    async reviewSubmission(adminUserId, submissionId, status, feedback, pointsOverride) {
        // Admin check is done in controller
        const submission = await this.memeRepository.findOne({
            where: { id: submissionId },
            relations: ['user', 'task']
        });
        if (!submission)
            throw new Error('Submission not found');
        if (submission.status !== MemeSubmission_1.SubmissionStatus.PENDING)
            throw new Error('Submission already reviewed');
        submission.status = status;
        submission.admin_feedback = feedback || '';
        submission.reviewed_at = new Date();
        await this.memeRepository.save(submission);
        if (status === MemeSubmission_1.SubmissionStatus.APPROVED) {
            // Award Points
            const points = pointsOverride || Number(submission.task.reward_amount);
            const ledger = this.pointsRepository.create({
                user: submission.user,
                reason: `meme_approved:${submission.task.slug}`,
                amount: points,
                reference_id: submission.id
            });
            await this.pointsRepository.save(ledger);
        }
        return submission;
    }
}
exports.MemeService = MemeService;
