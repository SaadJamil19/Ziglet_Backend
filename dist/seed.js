"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("./data-source");
const Task_1 = require("./database/entities/Task");
data_source_1.AppDataSource.initialize().then(async () => {
    console.log('Seeding Tasks...');
    const taskRepo = data_source_1.AppDataSource.getRepository(Task_1.Task);
    const tasks = [
        {
            slug: 'twitter-follow',
            type: Task_1.TaskType.SOCIAL_CHECK,
            platform: 'twitter',
            reward_type: Task_1.RewardType.FAUCET,
            reward_amount: '1.0', // 1 Zig Token
            daily_limit: 0,
            is_active: true,
            metadata: { target_handle: 'ZigletApp' }
        },
        {
            slug: 'telegram-join',
            type: Task_1.TaskType.SOCIAL_CHECK,
            platform: 'telegram',
            reward_type: Task_1.RewardType.POINTS,
            reward_amount: '100',
            daily_limit: 0,
            is_active: true,
            metadata: { group_id: 'ziglet_official' }
        },
        {
            slug: 'daily-tweet',
            type: Task_1.TaskType.SOCIAL_CHECK,
            platform: 'twitter',
            reward_type: Task_1.RewardType.POINTS,
            reward_amount: '50',
            daily_limit: 1, // Daily active
            is_active: true,
            metadata: {
                required_hashtags: ['#Ziglet', '#ZigChain'],
                required_mention: '@ZigletApp'
            }
        }
    ];
    for (const t of tasks) {
        const exists = await taskRepo.findOneBy({ slug: t.slug });
        if (!exists) {
            const task = taskRepo.create(t);
            await taskRepo.save(task);
            console.log(`Created task: ${t.slug}`);
        }
        else {
            console.log(`Skipping ${t.slug}, already exists.`);
        }
    }
    console.log('Done!');
    process.exit(0);
}).catch(err => console.error(err));
