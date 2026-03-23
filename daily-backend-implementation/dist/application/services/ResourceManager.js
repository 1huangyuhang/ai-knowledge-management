"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceManagerImpl = void 0;
const Resource_1 = require("../domain/entities/Resource");
class ResourceManagerImpl {
    resourceRepository;
    logger;
    constructor(resourceRepository, logger) {
        this.resourceRepository = resourceRepository;
        this.logger = logger;
    }
    async initialize() {
        try {
            this.logger.info('Initializing resource management service');
            const existingResources = await this.resourceRepository.findAll();
            if (existingResources.length === 0) {
                await this.initializeDefaultResources();
            }
            this.logger.info('Resource management service initialized successfully');
        }
        catch (error) {
            this.logger.error('Failed to initialize resource management service', error);
            throw error;
        }
    }
    async initializeDefaultResources() {
        const defaultResources = [
            {
                name: 'GPT-4 LLM',
                type: Resource_1.ResourceType.LLM,
                description: 'OpenAI GPT-4 language model',
                capacity: 10,
                config: { model: 'gpt-4', maxTokens: 8192 },
                metadata: { provider: 'OpenAI', region: 'us-west-2' }
            },
            {
                name: 'GPT-3.5 LLM',
                type: Resource_1.ResourceType.LLM,
                description: 'OpenAI GPT-3.5 language model',
                capacity: 20,
                config: { model: 'gpt-3.5-turbo', maxTokens: 4096 },
                metadata: { provider: 'OpenAI', region: 'us-west-2' }
            },
            {
                name: 'OpenAI Embedding',
                type: Resource_1.ResourceType.EMBEDDING,
                description: 'OpenAI text embedding service',
                capacity: 30,
                config: { model: 'text-embedding-ada-002', dimensions: 1536 },
                metadata: { provider: 'OpenAI', region: 'us-west-2' }
            },
            {
                name: 'Qdrant Vector DB',
                type: Resource_1.ResourceType.VECTOR_DB,
                description: 'Qdrant vector database service',
                capacity: 50,
                config: { host: 'localhost', port: 6333 },
                metadata: { version: '1.7.0', region: 'local' }
            },
            {
                name: 'File Processing Service',
                type: Resource_1.ResourceType.FILE_PROCESSING,
                description: 'File processing service for document analysis',
                capacity: 15,
                config: { supportedFormats: ['pdf', 'txt', 'docx'] },
                metadata: { region: 'local' }
            },
            {
                name: 'Speech Processing Service',
                type: Resource_1.ResourceType.SPEECH_PROCESSING,
                description: 'Speech-to-text and text-to-speech service',
                capacity: 10,
                config: { sttModel: 'whisper', ttsModel: 'elevenlabs' },
                metadata: { provider: 'OpenAI/ElevenLabs', region: 'us-west-2' }
            },
            {
                name: 'Cognitive Modeling Service',
                type: Resource_1.ResourceType.COGNITIVE_MODELING,
                description: 'Cognitive model processing service',
                capacity: 25,
                config: { maxNodes: 1000, maxRelations: 5000 },
                metadata: { region: 'local' }
            }
        ];
        for (const resourceData of defaultResources) {
            const resource = Resource_1.Resource.create(resourceData.name, resourceData.type, resourceData.description, Resource_1.ResourceStatus.AVAILABLE, resourceData.capacity, resourceData.config, resourceData.metadata);
            await this.resourceRepository.save(resource);
            this.logger.info(`Default resource created: ${resourceData.name}`);
        }
    }
    async createResource(name, type, description, capacity, config = {}, metadata = {}) {
        try {
            const resource = Resource_1.Resource.create(name, type, description, Resource_1.ResourceStatus.AVAILABLE, capacity, config, metadata);
            const savedResource = await this.resourceRepository.save(resource);
            this.logger.info(`Resource created: ${name} (${type})`);
            return savedResource;
        }
        catch (error) {
            this.logger.error(`Failed to create resource ${name}`, error);
            throw error;
        }
    }
    async getResource(id) {
        try {
            return await this.resourceRepository.findById(id);
        }
        catch (error) {
            this.logger.error(`Failed to get resource ${id.value}`, error);
            throw error;
        }
    }
    async getAllResources() {
        try {
            return await this.resourceRepository.findAll();
        }
        catch (error) {
            this.logger.error('Failed to get all resources', error);
            throw error;
        }
    }
    async getAvailableResources(type) {
        try {
            return await this.resourceRepository.findAvailableResources(type);
        }
        catch (error) {
            this.logger.error('Failed to get available resources', error);
            throw error;
        }
    }
    async allocateResource(type, amount) {
        try {
            const availableResources = await this.resourceRepository.findAvailableResources(type);
            const sortedResources = availableResources.sort((a, b) => a.usageRate - b.usageRate);
            for (const resource of sortedResources) {
                if (resource.remainingCapacity >= amount) {
                    resource.allocate(amount);
                    await this.resourceRepository.save(resource);
                    this.logger.info(`Resource allocated: ${resource.name} (${amount}/${resource.capacity})`);
                    return resource;
                }
            }
            this.logger.warn(`No available resources for type ${type} with amount ${amount}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Failed to allocate resource of type ${type}`, error);
            throw error;
        }
    }
    async releaseResource(resourceId, amount) {
        try {
            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error(`Resource not found: ${resourceId.value}`);
            }
            resource.release(amount);
            await this.resourceRepository.save(resource);
            this.logger.info(`Resource released: ${resource.name} (-${amount})`);
        }
        catch (error) {
            this.logger.error(`Failed to release resource ${resourceId.value}`, error);
            throw error;
        }
    }
    async updateResourceStatus(resourceId, status) {
        try {
            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error(`Resource not found: ${resourceId.value}`);
            }
            resource.update(undefined, undefined, status);
            await this.resourceRepository.save(resource);
            this.logger.info(`Resource status updated: ${resource.name} -> ${status}`);
        }
        catch (error) {
            this.logger.error(`Failed to update resource status for ${resourceId.value}`, error);
            throw error;
        }
    }
    async deleteResource(resourceId) {
        try {
            const resource = await this.resourceRepository.findById(resourceId);
            if (!resource) {
                throw new Error(`Resource not found: ${resourceId.value}`);
            }
            await this.resourceRepository.delete(resourceId);
            this.logger.info(`Resource deleted: ${resource.name}`);
        }
        catch (error) {
            this.logger.error(`Failed to delete resource ${resourceId.value}`, error);
            throw error;
        }
    }
    async getResourceUsageStatistics(type) {
        try {
            return await this.resourceRepository.getResourceUsageStatistics(type);
        }
        catch (error) {
            this.logger.error('Failed to get resource usage statistics', error);
            throw error;
        }
    }
    async batchAllocateResources(allocations) {
        const successes = [];
        const failures = [];
        for (const allocation of allocations) {
            try {
                const resource = await this.allocateResource(allocation.type, allocation.amount);
                if (resource) {
                    successes.push({ resource, amount: allocation.amount });
                }
                else {
                    failures.push({
                        type: allocation.type,
                        amount: allocation.amount,
                        reason: 'No available resources'
                    });
                }
            }
            catch (error) {
                failures.push({
                    type: allocation.type,
                    amount: allocation.amount,
                    reason: error.message
                });
            }
        }
        return { successes, failures };
    }
}
exports.ResourceManagerImpl = ResourceManagerImpl;
//# sourceMappingURL=ResourceManager.js.map