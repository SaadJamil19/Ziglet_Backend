import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

export enum SubmissionStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('meme_submissions')
export class MemeSubmission {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Index()
    @ManyToOne(() => Task)
    @JoinColumn({ name: 'task_id' })
    task!: Task;

    @Column()
    image_url!: string;

    @Column({ type: 'simple-enum', enum: SubmissionStatus, default: SubmissionStatus.PENDING })
    status!: SubmissionStatus;

    @Column({ type: 'text', nullable: true })
    admin_feedback!: string;

    @CreateDateColumn()
    submitted_at!: Date;

    @Column({ nullable: true })
    reviewed_at!: Date;
}
