import 'reflect-metadata';
import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from './database/entities/User';
import { SocialAccount } from './database/entities/SocialAccount';
import { Task } from './database/entities/Task';
import { TaskCompletion } from './database/entities/TaskCompletion';
import { FaucetClaim } from './database/entities/FaucetClaim';
import { MemeSubmission } from './database/entities/MemeSubmission';
import { PointsLedger } from './database/entities/PointsLedger';
import { TaskEvent } from './database/entities/TaskEvent';
import { UserLogin } from './database/entities/UserLogin';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test';
console.log('🔌 DataSource Config:', { isTest, NODE_ENV: process.env.NODE_ENV, type: isTest ? 'sqljs' : 'postgres' });

export const AppDataSource = new DataSource({
    type: isTest ? 'sqlite' : 'postgres',
    location: isTest ? undefined : undefined,
    autoSave: false,
    host: !isTest ? (process.env.DB_HOST || 'localhost') : undefined,
    port: !isTest ? parseInt(process.env.DB_PORT || '5432') : undefined,
    username: !isTest ? (process.env.DB_USERNAME || 'postgres') : undefined,
    password: !isTest ? (process.env.DB_PASSWORD || 'postgres') : undefined,
    database: isTest ? ':memory:' : (process.env.DB_NAME || 'ziglet_backend'),
    synchronize: true, // Auto-create tables for both Dev and Test
    logging: false,
    entities: [
        User,
        SocialAccount,
        Task,
        TaskCompletion,
        FaucetClaim,
        MemeSubmission,
        PointsLedger,
        TaskEvent,
        UserLogin
    ],
    migrations: [],
    subscribers: [],
} as any);
