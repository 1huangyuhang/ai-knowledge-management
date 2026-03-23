import { Resource, ResourceStatus, ResourceType } from '../domain/entities/Resource';
import { UUID } from '../core/domain/UUID';
export interface ResourceRepository {
    save(resource: Resource): Promise<Resource>;
    findById(id: UUID): Promise<Resource | null>;
    findByName(name: string): Promise<Resource | null>;
    findByType(type: ResourceType): Promise<Resource[]>;
    findByStatus(status: ResourceStatus): Promise<Resource[]>;
    findAll(): Promise<Resource[]>;
    findAvailableResources(type?: ResourceType): Promise<Resource[]>;
    update(resource: Resource): Promise<Resource>;
    delete(id: UUID): Promise<boolean>;
    getResourceUsageStatistics(type?: ResourceType): Promise<{
        total: number;
        available: number;
        inUse: number;
        maintenance: number;
        unavailable: number;
        averageUsageRate: number;
    }>;
    batchUpdateStatus(ids: UUID[], status: ResourceStatus): Promise<number>;
}
//# sourceMappingURL=ResourceRepository.d.ts.map