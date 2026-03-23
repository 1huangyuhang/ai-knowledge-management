"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestDataGenerator = void 0;
const uuid_1 = require("uuid");
class TestDataGenerator {
    static generateThoughtFragment(overrides) {
        return {
            id: (0, uuid_1.v4)(),
            content: '这是一个测试思维片段内容，用于单元测试和集成测试。',
            timestamp: new Date(),
            metadata: {
                source: 'test-source',
                tags: ['test-tag-1', 'test-tag-2'],
            },
            ...overrides,
        };
    }
    static generateCognitiveConcept(overrides) {
        return {
            id: (0, uuid_1.v4)(),
            name: '测试概念',
            description: '这是一个测试认知概念的描述。',
            importance: Math.random() * 10,
            relatedConcepts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides,
        };
    }
    static generateThoughtFragments(count) {
        return Array.from({ length: count }, () => this.generateThoughtFragment());
    }
    static generateCognitiveConcepts(count) {
        return Array.from({ length: count }, () => this.generateCognitiveConcept());
    }
}
exports.TestDataGenerator = TestDataGenerator;
//# sourceMappingURL=test-data-generator.js.map