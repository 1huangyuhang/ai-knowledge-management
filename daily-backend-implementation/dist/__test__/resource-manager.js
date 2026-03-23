"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceManager = void 0;
class ResourceManager {
    createdResources = [];
    databaseClient;
    constructor(databaseClient) {
        this.databaseClient = databaseClient;
    }
    registerCleanup(cleanupFn) {
        this.createdResources.push(cleanupFn);
    }
    async cleanup() {
        for (const cleanupFn of this.createdResources.reverse()) {
            try {
                await cleanupFn();
            }
            catch (error) {
                console.error('Error cleaning up resource:', error);
            }
        }
        this.createdResources = [];
    }
    async cleanupTable(tableName) {
        await this.databaseClient.execute(`DELETE FROM ${tableName}`);
    }
    async cleanupAllTables() {
        const tables = ['thought_fragments', 'cognitive_concepts', 'cognitive_relations', 'cognitive_insights'];
        for (const table of tables) {
            await this.cleanupTable(table);
        }
    }
}
exports.ResourceManager = ResourceManager;
//# sourceMappingURL=resource-manager.js.map