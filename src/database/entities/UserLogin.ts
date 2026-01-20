import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique, Index } from 'typeorm';
import { User } from './User';

@Entity('user_logins')
@Unique(['user', 'login_date'])
export class UserLogin {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index()
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'date' })
    login_date!: string; // YYYY-MM-DD

    @Column({ default: false })
    claimed!: boolean;

    @CreateDateColumn()
    created_at!: Date;
}
