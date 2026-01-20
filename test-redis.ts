import redisClient from './src/config/redis';

async function test() {
    console.log('Testing Redis...');
    try {
        await redisClient.setEx('test_key', 10, 'hello');
        const val = await redisClient.get('test_key');
        console.log('Redis Val:', val);
    } catch (e) {
        console.error('Redis Error:', e);
    }
    process.exit(0);
}

test();
