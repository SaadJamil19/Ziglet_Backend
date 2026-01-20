import { AppDataSource } from '../data-source';
import { MemeSubmission, SubmissionStatus } from '../database/entities/MemeSubmission';
import { User } from '../database/entities/User';
import { Task, TaskType } from '../database/entities/Task';
import { PointsLedger } from '../database/entities/PointsLedger';

export class MemeService {
    private memeRepository = AppDataSource.getRepository(MemeSubmission);
    private userRepository = AppDataSource.getRepository(User);
    private taskRepository = AppDataSource.getRepository(Task);
    private pointsRepository = AppDataSource.getRepository(PointsLedger);

    async submitMeme(userId: string, taskId: string, imageUrl: string) {
        const user = await this.userRepository.findOneBy({ id: userId });
        if (!user) throw new Error('User not found');

        const task = await this.taskRepository.findOneBy({ id: taskId });
        if (!task || task.type !== TaskType.SUBMISSION) throw new Error('Invalid meme task');

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
            status: SubmissionStatus.PENDING,
            submitted_at: new Date()
        });

        return await this.memeRepository.save(submission);
    }

    async getPendingSubmissions() {
        return await this.memeRepository.find({
            where: { status: SubmissionStatus.PENDING },
            relations: ['user', 'task'],
            order: { submitted_at: 'ASC' }
        });
    }

    async reviewSubmission(adminUserId: string, submissionId: string, status: SubmissionStatus.APPROVED | SubmissionStatus.REJECTED, feedback?: string, pointsOverride?: number) {
        // Admin check is done in controller
        const submission = await this.memeRepository.findOne({
            where: { id: submissionId },
            relations: ['user', 'task']
        });

        if (!submission) throw new Error('Submission not found');
        if (submission.status !== SubmissionStatus.PENDING) throw new Error('Submission already reviewed');

        submission.status = status;
        submission.admin_feedback = feedback || '';
        submission.reviewed_at = new Date();

        await this.memeRepository.save(submission);

        if (status === SubmissionStatus.APPROVED) {
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
