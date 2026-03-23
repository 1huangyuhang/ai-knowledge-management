import { DataSource } from 'typeorm';
import { User } from '../../src/domain/entities/user';
import { UUID } from '../../src/domain/value-objects/uuid';
import { CognitiveModel } from '../../src/domain/entities/cognitive-model';
import { ThoughtFragment } from '../../src/domain/entities/thought-fragment';
import { CognitiveInsight } from '../../src/domain/entities/cognitive-insight';
export declare class RepositoryTestUtils {
    private dataSource;
    constructor(dataSource: DataSource);
    cleanupDatabase(): Promise<void>;
    createTestUser(): Promise<User>;
    createTestCognitiveModel(userId: UUID): Promise<CognitiveModel>;
    createTestThoughtFragment(userId: UUID): Promise<ThoughtFragment>;
    createTestCognitiveInsight(userId: UUID): Promise<CognitiveInsight>;
}
export declare function getDatabaseConnection(): Promise<DataSource>;
//# sourceMappingURL=repository-test-utils.d.ts.map