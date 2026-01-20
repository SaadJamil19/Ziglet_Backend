import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToOne, Index } from 'typeorm';
import { User } from './User';
import { TaskCompletion } from './TaskCompletion';
import { TaskEvent } from './TaskEvent';

@Entity('faucet_claims')
export class FaucetClaim {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @ManyToOne(() => User, (user: User) => user.faucet_claims)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => TaskCompletion)
    @JoinColumn({ name: 'task_completion_id' })
    task_completion!: TaskCompletion;

    @Column()
    amount!: string;

    @Column({ unique: true })
    tx_hash!: string;

    @Column({ default: 'confirmed' })
    status!: string;

    @CreateDateColumn()
    claimed_at!: Date;

    @OneToOne(() => TaskEvent, { nullable: true })
    @JoinColumn({ name: 'event_id' })
    @Index({ unique: true })
    event!: TaskEvent;
}
