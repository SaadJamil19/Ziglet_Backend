import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TaskCompletion } from './TaskCompletion';

export enum TaskType {
    SOCIAL_CHECK = 'social_check',
    SUBMISSION = 'submission',
    ON_CHAIN = 'on_chain',
}

export enum RewardType {
    FAUCET = 'faucet',
    POINTS = 'points',
}

@Entity('tasks')
export class Task {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    slug!: string;

    @Column({ type: 'simple-enum', enum: TaskType, nullable: true })
    type!: TaskType;

    @Column({ nullable: true })
    platform!: string;

    @Column({ type: 'simple-enum', enum: RewardType })
    reward_type!: RewardType;

    @Column('numeric', { precision: 18, scale: 0 })
    reward_amount!: string;

    @Column({ default: 0 })
    daily_limit!: number;

    @Column({ default: true })
    is_active!: boolean;

    @Column('simple-json', { nullable: true })
    metadata: any = {};

    @OneToMany(() => TaskCompletion, (completion: TaskCompletion) => completion.task)
    completions!: TaskCompletion[];
}
