import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

// Define a unified interface for real and mock redis
interface RedisInterface {
    isOpen: boolean;
    connect(): Promise<void>;
    get(key: string): Promise<string | null>;
    set(key: string, value: string, options?: any): Promise<string | null>;
    setEx(key: string, seconds: number, value: string): Promise<string>;
    del(key: string): Promise<number>;
}

// Mock Implementation
class MockRedis implements RedisInterface {
    private store = new Map<string, string>();
    public isOpen = true;

    async connect() { return; }

    async get(key: string) { return this.store.get(key) || null; }

    async set(key: string, value: string, options?: any) {
        // Basic NX implementation support
        if (options?.NX && this.store.has(key)) return null;
        this.store.set(key, value);
        return 'OK';
    }

    async setEx(key: string, seconds: number, value: string) {
        this.store.set(key, value);
        setTimeout(() => this.store.delete(key), seconds * 1000);
        return 'OK';
    }

    async del(key: string) {
        const existed = this.store.has(key);
        this.store.delete(key);
        return existed ? 1 : 0;
    }
}

// Real wrapper to allow swapping
class RedisWrapper {
    private client: any;
    private useMock = false;
    private mock = new MockRedis();

    constructor() {
        if (process.env.NODE_ENV === 'test') {
            this.useMock = true;
            console.log('⚠️  Test Mode: Redis Mock Enabled Immediately');
            return;
        }

        this.client = createClient({
            url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        });

        this.client.on('error', (err: any) => {
            // console.warn('Redis Error:', err.message);
        });
    }

    async connect() {
        if (this.useMock) return;
        try {
            // Add a timeout to the connection attempt
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
            );

            await Promise.race([this.client.connect(), timeout]);
            console.log('✅ Redis Connected');
        } catch (e) {
            console.warn('⚠️  Redis Connection Failed. Switching to In-Memory Mock (Non-Persistent).');
            this.useMock = true;
        }
    }

    get isOpen() { return this.useMock ? true : this.client.isOpen; }

    async get(key: string) {
        return this.useMock ? this.mock.get(key) : this.client.get(key);
    }

    async set(key: string, value: string, options?: any) {
        return this.useMock ? this.mock.set(key, value, options) : this.client.set(key, value, options);
    }

    async setEx(key: string, seconds: number, value: string) {
        return this.useMock ? this.mock.setEx(key, seconds, value) : this.client.setEx(key, seconds, value);
    }

    async del(key: string) {
        return this.useMock ? this.mock.del(key) : this.client.del(key);
    }
}

const redisInstance = new RedisWrapper();

// Auto-connect on import (async)
(async () => {
    await redisInstance.connect();
})();

export default redisInstance;
