"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QdrantClientFactory = exports.QdrantClientImpl = void 0;
class QdrantClientImpl {
    caller;
    config;
    constructor(caller, config) {
        this.caller = caller;
        this.config = config;
    }
    async createCollection(config) {
        await this.caller.put({
            url: `${this.config.baseUrl}/collections/${config.name}`,
            headers: this.getHeaders(),
            data: {
                vectors: {
                    size: config.vectorSize,
                    distance: config.distance,
                },
            },
        });
    }
    async deleteCollection(collectionName) {
        await this.caller.delete({
            url: `${this.config.baseUrl}/collections/${collectionName}`,
            headers: this.getHeaders(),
        });
    }
    async collectionExists(collectionName) {
        try {
            await this.caller.get({
                url: `${this.config.baseUrl}/collections/${collectionName}`,
                headers: this.getHeaders(),
            });
            return true;
        }
        catch {
            return false;
        }
    }
    async insertPoint(collectionName, point) {
        await this.insertPoints(collectionName, [point]);
    }
    async insertPoints(collectionName, points) {
        await this.caller.post({
            url: `${this.config.baseUrl}/collections/${collectionName}/points`,
            headers: this.getHeaders(),
            data: {
                points,
            },
        });
    }
    async deletePoint(collectionName, id) {
        await this.caller.delete({
            url: `${this.config.baseUrl}/collections/${collectionName}/points/${id}`,
            headers: this.getHeaders(),
        });
    }
    async searchSimilar(collectionName, vector, limit) {
        const response = await this.caller.post({
            url: `${this.config.baseUrl}/collections/${collectionName}/points/search`,
            headers: this.getHeaders(),
            data: {
                vector,
                limit,
                with_payload: true,
                with_vector: false,
            },
        });
        return response.data.result;
    }
    async getPointById(collectionName, id) {
        try {
            const response = await this.caller.get({
                url: `${this.config.baseUrl}/collections/${collectionName}/points/${id}`,
                headers: this.getHeaders(),
            });
            return response.data.result;
        }
        catch {
            return null;
        }
    }
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.config.apiKey) {
            headers['api-key'] = this.config.apiKey;
        }
        return headers;
    }
}
exports.QdrantClientImpl = QdrantClientImpl;
class QdrantClientFactory {
    caller;
    config;
    constructor(caller, config) {
        this.caller = caller;
        this.config = config;
    }
    create() {
        return new QdrantClientImpl(this.caller, this.config);
    }
}
exports.QdrantClientFactory = QdrantClientFactory;
//# sourceMappingURL=QdrantClient.js.map