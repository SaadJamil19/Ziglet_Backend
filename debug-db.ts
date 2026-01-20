import { AppDataSource } from './src/data-source';
process.env.NODE_ENV = 'test';

(async () => {
    try {
        await AppDataSource.initialize();
        console.log('✅ Initialization Success');
        await AppDataSource.destroy();
    } catch (e) {
        console.error('❌ Initialization Failed:', e);
        process.exit(1);
    }
})();
