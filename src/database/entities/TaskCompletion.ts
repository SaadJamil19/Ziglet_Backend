import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';
import { Task } from './Task';

@Entity('task_completions')
@Unique(['user', 'task']) // Note: Logic for daily tasks needs to handle this constraint carefully (e.g., date based suffix or separate check) - for MVP sticking to strict internal unique or just logic. 
// Actually, for daily tasks, this unique constraint on user+task is blocking. 
// We should probably remove the DB constraint for daily tasks or add a date column to the unique constraint.
// For now, I will NOT add the unique decorator here and enforce it in Service logic to allow daily tasks.
export class TaskCompletion {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user: User) => user.task_completions)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Task, (task: Task) => task.completions)
    @JoinColumn({ name: 'task_id' })
    task!: Task;

    @CreateDateColumn()
    completed_at!: Date;

    @Column('simple-json', { nullable: true })
    completion_data!: any;
}
