"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Mock Implementation
class MockRedis {
    constructor() {
        this.store = new Map();
        this.isOpen = true;
    }
    async connect() { return; }
    async get(key) { return this.store.get(key) || null; }
    async set(key, value, options) {
        // Basic NX implementation support
        if (options?.NX && this.store.has(key))
            return null;
        this.store.set(key, value);
        return 'OK';
    }
    async setEx(key, seconds, value) {
        this.store.set(key, value);
        setTimeout(() => this.store.delete(key), seconds * 1000);
        return 'OK';
    }
    async del(key) {
        const existed = this.store.has(key);
        this.store.delete(key);
        return existed ? 1 : 0;
    }
}
// Real wrapper to allow swapping
class RedisWrapper {
    constructor() {
        this.useMock = false;
        this.mock = new MockRedis();
        this.client = (0, redis_1.createClient)({
            url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
        });
        this.client.on('error', (err) => {
            // If connection fails, we might switch to mock or just log
            // console.warn('Redis Error:', err.message);
        });
    }
    async connect() {
        try {
            await this.client.connect();
            console.log('✅ Redis Connected');
        }
        catch (e) {
            console.warn('⚠️  Redis Connection Failed. Switching to In-Memory Mock (Non-Persistent).');
            this.useMock = true;
        }
    }
    get isOpen() { return this.useMock ? true : this.client.isOpen; }
    async get(key) {
        return this.useMock ? this.mock.get(key) : this.client.get(key);
    }
    async set(key, value, options) {
        return this.useMock ? this.mock.set(key, value, options) : this.client.set(key, value, options);
    }
    async setEx(key, seconds, value) {
        return this.useMock ? this.mock.setEx(key, seconds, value) : this.client.setEx(key, seconds, value);
    }
    async del(key) {
        return this.useMock ? this.mock.del(key) : this.client.del(key);
    }
}
const redisInstance = new RedisWrapper();
// Auto-connect on import (async)
(async () => {
    await redisInstance.connect();
})();
exports.default = redisInstance;
