
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique, Index } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('task_events')
@Unique(['task', 'external_id', 'event_date']) // Enforces idempotency and reuse prevention
export class TaskEvent {
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

    @Column({ length: 50 })
    event_type!: string; // e.g., 'social_verify', 'submission', 'faucet_claim'

    @Column({ type: 'text', nullable: true })
    external_id!: string; // e.g., Tweet ID, Submission ID, or constructed key for daily tasks

    @Column({ type: 'date', nullable: true }) // Nullable in SQLite for some setups, but logic should set it
    event_date!: string; // YYYY-MM-DD

    @CreateDateColumn()
    occurred_at!: Date;

    @Column('simple-json', { nullable: true })
    metadata: any = {};
}
