import { AppDataSource } from './data-source';
import { Task, TaskType, RewardType } from './database/entities/Task';

AppDataSource.initialize().then(async () => {
    console.log('Seeding Tasks...');
    const taskRepo = AppDataSource.getRepository(Task);

    const tasks = [
        {
            slug: 'twitter-follow',
            type: TaskType.SOCIAL_CHECK,
            platform: 'twitter',
            reward_type: RewardType.FAUCET,
            reward_amount: '1.0', // 1 Zig Token
            daily_limit: 0,
            is_active: true,
            metadata: { target_handle: 'ZigletApp' }
        },
        {
            slug: 'telegram-join',
            type: TaskType.SOCIAL_CHECK,
            platform: 'telegram',
            reward_type: RewardType.POINTS,
            reward_amount: '100',
            daily_limit: 0,
            is_active: true,
            metadata: { group_id: 'ziglet_official' }
        },
        {
            slug: 'daily-tweet',
            type: TaskType.SOCIAL_CHECK,
            platform: 'twitter',
            reward_type: RewardType.POINTS,
            reward_amount: '50',
            daily_limit: 1, // Daily active
            is_active: true,
            metadata: {
                required_hashtags: ['#Ziglet', '#ZigChain'],
                required_mention: '@ZigletApp'
            }
        },
        {
            slug: 'daily-login',
            type: TaskType.SOCIAL_CHECK, // Internal check
            platform: 'internal',
            reward_type: RewardType.FAUCET,
            reward_amount: '1.0',
            daily_limit: 1,
            is_active: true,
            metadata: { description: 'Open the garden daily to claim rewards' }
        }
    ];

    for (const t of tasks) {
        const exists = await taskRepo.findOneBy({ slug: t.slug });
        if (!exists) {
            const task = taskRepo.create(t as any);
            await taskRepo.save(task);
            console.log(`Created task: ${t.slug}`);
        } else {
            console.log(`Skipping ${t.slug}, already exists.`);
        }
    }

    console.log('Done!');
    process.exit(0);
}).catch(err => console.error(err));
