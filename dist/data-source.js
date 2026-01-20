"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = require("./database/entities/User");
const SocialAccount_1 = require("./database/entities/SocialAccount");
const Task_1 = require("./database/entities/Task");
const TaskCompletion_1 = require("./database/entities/TaskCompletion");
const FaucetClaim_1 = require("./database/entities/FaucetClaim");
const MemeSubmission_1 = require("./database/entities/MemeSubmission");
const PointsLedger_1 = require("./database/entities/PointsLedger");
dotenv_1.default.config();
const isTest = process.env.NODE_ENV === 'test';
exports.AppDataSource = new typeorm_1.DataSource({
    type: isTest ? 'better-sqlite3' : 'postgres',
    host: !isTest ? (process.env.DB_HOST || 'localhost') : undefined,
    port: !isTest ? parseInt(process.env.DB_PORT || '5432') : undefined,
    username: !isTest ? (process.env.DB_USERNAME || 'postgres') : undefined,
    password: !isTest ? (process.env.DB_PASSWORD || 'postgres') : undefined,
    database: isTest ? ':memory:' : (process.env.DB_NAME || 'ziglet_backend'),
    synchronize: true, // Auto-create tables for both Dev and Test
    logging: false,
    entities: [
        User_1.User,
        SocialAccount_1.SocialAccount,
        Task_1.Task,
        TaskCompletion_1.TaskCompletion,
        FaucetClaim_1.FaucetClaim,
        MemeSubmission_1.MemeSubmission,
        PointsLedger_1.PointsLedger
    ],
    migrations: [],
    subscribers: [],
});
