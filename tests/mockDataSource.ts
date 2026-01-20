console.log("Loading Mock Data Source");

import { MockRepository } from './mocks/MockRepository';

export const AppDataSource = {
    initialize: jest.fn().mockResolvedValue(true),
    destroy: jest.fn().mockResolvedValue(true),
    isInitialized: true,
    getRepository: jest.fn((entity) => {
        console.log("Getting repository for", entity?.name);
        return new MockRepository();
    }),
    manager: {
        save: jest.fn(),
    }
};
