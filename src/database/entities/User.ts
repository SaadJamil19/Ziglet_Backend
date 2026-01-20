import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { SocialAccount } from './SocialAccount';
import { TaskCompletion } from './TaskCompletion';
import { FaucetClaim } from './FaucetClaim';
import { PointsLedger } from './PointsLedger';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    zig_address!: string;

    @CreateDateColumn()
    created_at!: Date;

    @Column({ nullable: true })
    last_login_at!: Date;

    @OneToMany(() => SocialAccount, (account: SocialAccount) => account.user)
    social_accounts!: SocialAccount[];

    @OneToMany(() => TaskCompletion, (completion: TaskCompletion) => completion.user)
    task_completions!: TaskCompletion[];

    @OneToMany(() => FaucetClaim, (claim: FaucetClaim) => claim.user)
    faucet_claims!: FaucetClaim[];

    @OneToMany(() => PointsLedger, (ledger: PointsLedger) => ledger.user)
    points_ledger!: PointsLedger[];
}
