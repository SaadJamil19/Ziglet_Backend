

export class MockRepository<T> {
    private store: any[] = [];

    create(entity: any) {
        return { ...entity, id: Math.random().toString(36).substring(7), created_at: new Date() };
    }

    async save(entity: any) {
        const exists = this.store.find(e => e.id === entity.id);
        if (exists) {
            Object.assign(exists, entity);
            return exists;
        }
        this.store.push(entity);
        return entity;
    }

    async findOne(options: any) {
        // Simple mock implementation for findOneBy / findOne
        // options might be { where: { zig_address: ... } } or just { zig_address: ... }
        const where = options.where || options;
        return this.store.find(item => {
            return Object.keys(where).every(key => item[key] === where[key]);
        }) || null;
    }

    async findOneBy(where: any) {
        return this.findOne(where);
    }

    async find(options: any) {
        return this.store;
    }

    createQueryBuilder() {
        return {
            where: () => this.createQueryBuilder(),
            andWhere: () => this.createQueryBuilder(),
            getOne: () => null // Mock return null for checks
        }
    }
}
