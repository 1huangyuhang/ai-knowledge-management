"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const thought_fragment_repository_implementation_1 = require("../repositories/thought-fragment-repository-implementation");
const test_utils_1 = require("../../../__test__/test-utils");
const thought_fragment_1 = require("../../../domain/entities/thought-fragment");
const uuid_1 = require("../../../domain/value-objects/uuid");
const user_entity_1 = require("../entities/user.entity");
const thought_fragment_entity_1 = require("../entities/thought-fragment.entity");
describe('ThoughtFragmentRepository Integration Tests', () => {
    let repository;
    let testEnv;
    beforeEach(async () => {
        testEnv = await test_utils_1.TestUtils.createTestEnvironment();
        const dataSource = testEnv.databaseConnection.getConnection();
        if (!dataSource) {
            throw new Error('Failed to get database connection');
        }
        const userEntityRepository = dataSource.getRepository(user_entity_1.UserEntity);
        const thoughtFragmentEntityRepository = dataSource.getRepository(thought_fragment_entity_1.ThoughtFragmentEntity);
        repository = new thought_fragment_repository_implementation_1.ThoughtFragmentRepositoryImpl(thoughtFragmentEntityRepository);
        testEnv.userEntityRepository = userEntityRepository;
        testEnv.thoughtFragmentEntityRepository = thoughtFragmentEntityRepository;
    });
    afterEach(async () => {
        await test_utils_1.TestUtils.cleanupTestEnvironment(testEnv);
    });
    test('should create and retrieve a thought fragment', async () => {
        const user = await testEnv.userEntityRepository.save({
            email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
            password: 'test-password',
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            isActive: true
        });
        const createdEntity = await testEnv.thoughtFragmentEntityRepository.save({
            userId: user.id,
            content: 'Test thought content',
            source: 'test-source',
            isProcessed: false
        });
        const retrievedFragment = await repository.getById(uuid_1.UUID.fromString(createdEntity.id));
        expect(retrievedFragment).not.toBeNull();
        expect(retrievedFragment?.id).toBe(createdEntity.id);
        expect(retrievedFragment?.content).toBe(createdEntity.content);
        expect(retrievedFragment?.userId).toBe(createdEntity.userId);
    });
    test('should get thought fragments by user ID', async () => {
        const user1 = await testEnv.userEntityRepository.save({
            email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
            password: 'test-password1',
            firstName: 'Test1',
            lastName: 'User1',
            role: 'USER',
            isActive: true
        });
        const user2 = await testEnv.userEntityRepository.save({
            email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
            password: 'test-password2',
            firstName: 'Test2',
            lastName: 'User2',
            role: 'USER',
            isActive: true
        });
        const fragment1 = new thought_fragment_1.ThoughtFragmentImpl(uuid_1.UUID.generate().toString(), 'Test thought 1', user1.id, { source: 'test-source' }, false, 0, null, new Date());
        const fragment2 = new thought_fragment_1.ThoughtFragmentImpl(uuid_1.UUID.generate().toString(), 'Test thought 2', user1.id, { source: 'test-source' }, false, 0, null, new Date());
        const fragment3 = new thought_fragment_1.ThoughtFragmentImpl(uuid_1.UUID.generate().toString(), 'Test thought 3', user2.id, { source: 'test-source' }, false, 0, null, new Date());
        await repository.create(fragment1);
        await repository.create(fragment2);
        await repository.create(fragment3);
        const user1Fragments = await repository.getByUserId(uuid_1.UUID.fromString(user1.id));
        const user2Fragments = await repository.getByUserId(uuid_1.UUID.fromString(user2.id));
        expect(user1Fragments.length).toBe(2);
        expect(user2Fragments.length).toBe(1);
        expect(user1Fragments.map(f => f.content)).toEqual(expect.arrayContaining(['Test thought 1', 'Test thought 2']));
    });
    test('should update a thought fragment', async () => {
        const user = await testEnv.userEntityRepository.save({
            email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
            password: 'test-password',
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            isActive: true
        });
        const createdEntity = await testEnv.thoughtFragmentEntityRepository.save({
            userId: user.id,
            content: 'Original content',
            source: 'test-source',
            isProcessed: false
        });
        const createdFragment = await repository.getById(uuid_1.UUID.fromString(createdEntity.id));
        expect(createdFragment).not.toBeNull();
        const updatedFragment = new thought_fragment_1.ThoughtFragmentImpl(createdFragment.id, 'Updated content', user.id, { source: 'test-source' }, true, 0, null, createdFragment.createdAt);
        const result = await repository.update(updatedFragment);
        const retrievedFragment = await repository.getById(uuid_1.UUID.fromString(createdEntity.id));
        expect(result.content).toBe('Updated content');
        expect(result.isProcessed).toBe(true);
        expect(retrievedFragment?.content).toBe('Updated content');
        expect(retrievedFragment?.isProcessed).toBe(true);
    });
    test('should delete a thought fragment', async () => {
        const user = await testEnv.userEntityRepository.save({
            email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
            password: 'test-password',
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            isActive: true
        });
        const createdEntity = await testEnv.thoughtFragmentEntityRepository.save({
            userId: user.id,
            content: 'Test thought content',
            source: 'test-source',
            isProcessed: false
        });
        const deleteResult = await repository.delete(uuid_1.UUID.fromString(createdEntity.id));
        const retrievedFragment = await repository.getById(uuid_1.UUID.fromString(createdEntity.id));
        expect(deleteResult).toBe(true);
        expect(retrievedFragment).toBeNull();
    });
    test('should get unprocessed thought fragments', async () => {
        const user = await testEnv.userEntityRepository.save({
            email: `user-${Math.random().toString(36).substring(2, 10)}@example.com`,
            password: 'test-password',
            firstName: 'Test',
            lastName: 'User',
            role: 'USER',
            isActive: true
        });
        const unprocessedEntity = await testEnv.thoughtFragmentEntityRepository.save({
            userId: user.id,
            content: 'Unprocessed thought',
            source: 'test-source',
            isProcessed: false
        });
        const processedEntity = await testEnv.thoughtFragmentEntityRepository.save({
            userId: user.id,
            content: 'Processed thought',
            source: 'test-source',
            isProcessed: true
        });
        const unprocessedFragments = await repository.getUnprocessedByUserId(uuid_1.UUID.fromString(user.id));
        expect(unprocessedFragments.length).toBe(1);
        expect(unprocessedFragments[0].content).toBe('Unprocessed thought');
        expect(unprocessedFragments[0].isProcessed).toBe(false);
    });
});
//# sourceMappingURL=repository-integration.test.js.map