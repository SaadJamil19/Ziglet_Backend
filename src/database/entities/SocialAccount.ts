import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';
import { User } from './User';

export enum SocialPlatform {
    TWITTER = 'twitter',
    TELEGRAM = 'telegram',
    INSTAGRAM = 'instagram',
}

@Entity('social_accounts')
@Unique(['platform', 'platform_user_id'])
@Unique(['user', 'platform'])
export class SocialAccount {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @ManyToOne(() => User, (user: User) => user.social_accounts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'simple-enum', enum: SocialPlatform })
    platform!: SocialPlatform;

    @Column()
    platform_user_id!: string;

    @Column()
    username!: string;

    @CreateDateColumn()
    verified_at!: Date;
}
