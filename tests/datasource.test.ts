import { AppDataSource } from '../src/data-source';

describe('DataSource Initialization', () => {
    it('should be defined', () => {
        expect(AppDataSource).toBeDefined();
    });

    it('should initialize', async () => {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        expect(AppDataSource.isInitialized).toBe(true);
        await AppDataSource.destroy();
    });
});
