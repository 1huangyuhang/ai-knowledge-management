import { Resource, ResourceStatus, ResourceType } from '../domain/entities/Resource';
import { ResourceRepository } from '../repositories/ResourceRepository';
import { UUID } from '../core/domain/UUID';
import { LoggerService } from '../../infrastructure/logging/LoggerService';
export interface ResourceManager {
    initialize(): Promise<void>;
    createResource(name: string, type: ResourceType, description: string, capacity: number, config?: Record<string, any>, metadata?: Record<string, any>): Promise<Resource>;
    getResource(id: UUID): Promise<Resource | null>;
    getAllResources(): Promise<Resource[]>;
    getAvailableResources(type?: ResourceType): Promise<Resource[]>;
    allocateResource(type: ResourceType, amount: number): Promise<Resource | null>;
    releaseResource(resourceId: UUID, amount: number): Promise<void>;
    updateResourceStatus(resourceId: UUID, status: ResourceStatus): Promise<void>;
    deleteResource(resourceId: UUID): Promise<void>;
    getResourceUsageStatistics(type?: ResourceType): Promise<{
        total: number;
        available: number;
        inUse: number;
        maintenance: number;
        unavailable: number;
        averageUsageRate: number;
    }>;
    batchAllocateResources(allocations: Array<{
        type: ResourceType;
        amount: number;
    }>): Promise<{
        successes: Array<{
            resource: Resource;
            amount: number;
        }>;
        failures: Array<{
            type: ResourceType;
            amount: number;
            reason: string;
        }>;
    }>;
}
export declare class ResourceManagerImpl implements ResourceManager {
    private readonly resourceRepository;
    private readonly logger;
    constructor(resourceRepository: ResourceRepository, logger: LoggerService);
    initialize(): Promise<void>;
    private initializeDefaultResources;
    createResource(name: string, type: ResourceType, description: string, capacity: number, config?: Record<string, any>, metadata?: Record<string, any>): Promise<Resource>;
    getResource(id: UUID): Promise<Resource | null>;
    getAllResources(): Promise<Resource[]>;
    getAvailableResources(type?: ResourceType): Promise<Resource[]>;
    allocateResource(type: ResourceType, amount: number): Promise<Resource | null>;
    releaseResource(resourceId: UUID, amount: number): Promise<void>;
    updateResourceStatus(resourceId: UUID, status: ResourceStatus): Promise<void>;
    deleteResource(resourceId: UUID): Promise<void>;
    getResourceUsageStatistics(type?: ResourceType): Promise<{
        total: number;
        available: number;
        inUse: number;
        maintenance: number;
        unavailable: number;
        averageUsageRate: number;
    }>;
    batchAllocateResources(allocations: Array<{
        type: ResourceType;
        amount: number;
    }>): Promise<{
        successes: Array<{
            resource: Resource;
            amount: number;
        }>;
        failures: Array<{
            type: ResourceType;
            amount: number;
            reason: string;
        }>;
    }>;
}
//# sourceMappingURL=ResourceManager.d.ts.map