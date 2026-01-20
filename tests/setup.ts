import { AppDataSource } from '../src/data-source';
import redisInstance from '../src/config/redis';
import { MockRepository } from './mocks/MockRepository';

// Map to hold singleton mocks per entity type
const mockRepos = new Map<string, MockRepository<any>>();

beforeAll(async () => {
    // Mock Redis
    if (!redisInstance.isOpen) await redisInstance.connect();

    // Mock TypeORM
    jest.spyOn(AppDataSource, 'getRepository').mockImplementation((entity: any) => {
        const name = entity.name;
        if (!mockRepos.has(name)) {
            mockRepos.set(name, new MockRepository());
        }
        return mockRepos.get(name) as any;
    });

    jest.spyOn(AppDataSource, 'initialize').mockResolvedValue(AppDataSource);
});

afterAll(async () => {
    jest.restoreAllMocks();
});
