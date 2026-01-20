import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, OneToOne, Index } from 'typeorm';
import { User } from './User';
import { TaskEvent } from './TaskEvent';

@Entity('points_ledger')
export class PointsLedger {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @ManyToOne(() => User, (user: User) => user.points_ledger)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column()
    reason!: string;

    @Column('int')
    amount!: number;

    @Column({ type: 'uuid', nullable: true })
    reference_id!: string;

    @CreateDateColumn()
    created_at!: Date;

    @OneToOne(() => TaskEvent, { nullable: true })
    @JoinColumn({ name: 'event_id' })
    @Index({ unique: true })
    event!: TaskEvent;
}
