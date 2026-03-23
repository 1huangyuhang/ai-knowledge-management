//
// ResourceManager.ts
//

import { Resource, ResourceStatus, ResourceType } from '../domain/entities/Resource';
import { ResourceRepository } from '../repositories/ResourceRepository';
import { UUID } from '../core/domain/UUID';
import { LoggerService } from '../../infrastructure/logging/LoggerService';

/**
 * 资源管理服务
 */
export interface ResourceManager {
  /**
   * 初始化资源
   */
  initialize(): Promise<void>;
  
  /**
   * 创建资源
   * @param name 资源名称
   * @param type 资源类型
   * @param description 资源描述
   * @param capacity 资源容量
   * @param config 资源配置
   * @param metadata 资源元数据
   * @returns 创建的资源
   */
  createResource(
    name: string,
    type: ResourceType,
    description: string,
    capacity: number,
    config?: Record<string, any>,
    metadata?: Record<string, any>
  ): Promise<Resource>;
  
  /**
   * 获取资源
   * @param id 资源ID
   * @returns 资源，如果不存在则返回null
   */
  getResource(id: UUID): Promise<Resource | null>;
  
  /**
   * 获取所有资源
   * @returns 资源列表
   */
  getAllResources(): Promise<Resource[]>;
  
  /**
   * 获取可用资源
   * @param type 可选的资源类型
   * @returns 可用资源列表
   */
  getAvailableResources(type?: ResourceType): Promise<Resource[]>;
  
  /**
   * 分配资源
   * @param type 资源类型
   * @param amount 分配量
   * @returns 分配的资源，如果没有可用资源则返回null
   */
  allocateResource(type: ResourceType, amount: number): Promise<Resource | null>;
  
  /**
   * 释放资源
   * @param resourceId 资源ID
   * @param amount 释放量
   */
  releaseResource(resourceId: UUID, amount: number): Promise<void>;
  
  /**
   * 更新资源状态
   * @param resourceId 资源ID
   * @param status 资源状态
   */
  updateResourceStatus(resourceId: UUID, status: ResourceStatus): Promise<void>;
  
  /**
   * 删除资源
   * @param resourceId 资源ID
   */
  deleteResource(resourceId: UUID): Promise<void>;
  
  /**
   * 获取资源使用统计
   * @param type 可选的资源类型
   * @returns 资源使用统计
   */
  getResourceUsageStatistics(type?: ResourceType): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    unavailable: number;
    averageUsageRate: number;
  }>;
  
  /**
   * 批量分配资源
   * @param allocations 分配请求列表
   * @returns 分配结果，包含成功分配的资源和失败的分配请求
   */
  batchAllocateResources(allocations: Array<{
    type: ResourceType;
    amount: number;
  }>): Promise<{
    successes: Array<{ resource: Resource; amount: number }>;
    failures: Array<{ type: ResourceType; amount: number; reason: string }>;
  }>;
}

/**
 * 资源管理服务实现
 */
export class ResourceManagerImpl implements ResourceManager {
  /**
   * 构造函数
   * @param resourceRepository 资源仓库
   * @param logger 日志服务
   */
  constructor(
    private readonly resourceRepository: ResourceRepository,
    private readonly logger: LoggerService
  ) {}

  /**
   * 初始化资源
   */
  async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing resource management service');
      
      // 检查是否已经初始化了基础资源
      const existingResources = await this.resourceRepository.findAll();
      if (existingResources.length === 0) {
        // 初始化默认资源
        await this.initializeDefaultResources();
      }
      
      this.logger.info('Resource management service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize resource management service', error as Error);
      throw error;
    }
  }

  /**
   * 初始化默认资源
   */
  private async initializeDefaultResources(): Promise<void> {
    const defaultResources = [
      {
        name: 'GPT-4 LLM',
        type: ResourceType.LLM,
        description: 'OpenAI GPT-4 language model',
        capacity: 10,
        config: { model: 'gpt-4', maxTokens: 8192 },
        metadata: { provider: 'OpenAI', region: 'us-west-2' }
      },
      {
        name: 'GPT-3.5 LLM',
        type: ResourceType.LLM,
        description: 'OpenAI GPT-3.5 language model',
        capacity: 20,
        config: { model: 'gpt-3.5-turbo', maxTokens: 4096 },
        metadata: { provider: 'OpenAI', region: 'us-west-2' }
      },
      {
        name: 'OpenAI Embedding',
        type: ResourceType.EMBEDDING,
        description: 'OpenAI text embedding service',
        capacity: 30,
        config: { model: 'text-embedding-ada-002', dimensions: 1536 },
        metadata: { provider: 'OpenAI', region: 'us-west-2' }
      },
      {
        name: 'Qdrant Vector DB',
        type: ResourceType.VECTOR_DB,
        description: 'Qdrant vector database service',
        capacity: 50,
        config: { host: 'localhost', port: 6333 },
        metadata: { version: '1.7.0', region: 'local' }
      },
      {
        name: 'File Processing Service',
        type: ResourceType.FILE_PROCESSING,
        description: 'File processing service for document analysis',
        capacity: 15,
        config: { supportedFormats: ['pdf', 'txt', 'docx'] },
        metadata: { region: 'local' }
      },
      {
        name: 'Speech Processing Service',
        type: ResourceType.SPEECH_PROCESSING,
        description: 'Speech-to-text and text-to-speech service',
        capacity: 10,
        config: { sttModel: 'whisper', ttsModel: 'elevenlabs' },
        metadata: { provider: 'OpenAI/ElevenLabs', region: 'us-west-2' }
      },
      {
        name: 'Cognitive Modeling Service',
        type: ResourceType.COGNITIVE_MODELING,
        description: 'Cognitive model processing service',
        capacity: 25,
        config: { maxNodes: 1000, maxRelations: 5000 },
        metadata: { region: 'local' }
      }
    ];

    for (const resourceData of defaultResources) {
      const resource = Resource.create(
        resourceData.name,
        resourceData.type,
        resourceData.description,
        ResourceStatus.AVAILABLE,
        resourceData.capacity,
        resourceData.config,
        resourceData.metadata
      );
      
      await this.resourceRepository.save(resource);
      this.logger.info(`Default resource created: ${resourceData.name}`);
    }
  }

  /**
   * 创建资源
   * @param name 资源名称
   * @param type 资源类型
   * @param description 资源描述
   * @param capacity 资源容量
   * @param config 资源配置
   * @param metadata 资源元数据
   * @returns 创建的资源
   */
  async createResource(
    name: string,
    type: ResourceType,
    description: string,
    capacity: number,
    config: Record<string, any> = {},
    metadata: Record<string, any> = {}
  ): Promise<Resource> {
    try {
      const resource = Resource.create(
        name,
        type,
        description,
        ResourceStatus.AVAILABLE,
        capacity,
        config,
        metadata
      );
      
      const savedResource = await this.resourceRepository.save(resource);
      this.logger.info(`Resource created: ${name} (${type})`);
      return savedResource;
    } catch (error) {
      this.logger.error(`Failed to create resource ${name}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取资源
   * @param id 资源ID
   * @returns 资源，如果不存在则返回null
   */
  async getResource(id: UUID): Promise<Resource | null> {
    try {
      return await this.resourceRepository.findById(id);
    } catch (error) {
      this.logger.error(`Failed to get resource ${id.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取所有资源
   * @returns 资源列表
   */
  async getAllResources(): Promise<Resource[]> {
    try {
      return await this.resourceRepository.findAll();
    } catch (error) {
      this.logger.error('Failed to get all resources', error as Error);
      throw error;
    }
  }

  /**
   * 获取可用资源
   * @param type 可选的资源类型
   * @returns 可用资源列表
   */
  async getAvailableResources(type?: ResourceType): Promise<Resource[]> {
    try {
      return await this.resourceRepository.findAvailableResources(type);
    } catch (error) {
      this.logger.error('Failed to get available resources', error as Error);
      throw error;
    }
  }

  /**
   * 分配资源
   * @param type 资源类型
   * @param amount 分配量
   * @returns 分配的资源，如果没有可用资源则返回null
   */
  async allocateResource(type: ResourceType, amount: number): Promise<Resource | null> {
    try {
      // 获取可用资源
      const availableResources = await this.resourceRepository.findAvailableResources(type);
      
      // 按使用率排序，优先分配使用率低的资源
      const sortedResources = availableResources.sort((a, b) => a.usageRate - b.usageRate);
      
      // 尝试分配资源
      for (const resource of sortedResources) {
        if (resource.remainingCapacity >= amount) {
          // 分配资源
          resource.allocate(amount);
          await this.resourceRepository.save(resource);
          
          this.logger.info(`Resource allocated: ${resource.name} (${amount}/${resource.capacity})`);
          return resource;
        }
      }
      
      this.logger.warn(`No available resources for type ${type} with amount ${amount}`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to allocate resource of type ${type}`, error as Error);
      throw error;
    }
  }

  /**
   * 释放资源
   * @param resourceId 资源ID
   * @param amount 释放量
   */
  async releaseResource(resourceId: UUID, amount: number): Promise<void> {
    try {
      const resource = await this.resourceRepository.findById(resourceId);
      if (!resource) {
        throw new Error(`Resource not found: ${resourceId.value}`);
      }
      
      // 释放资源
      resource.release(amount);
      await this.resourceRepository.save(resource);
      
      this.logger.info(`Resource released: ${resource.name} (-${amount})`);
    } catch (error) {
      this.logger.error(`Failed to release resource ${resourceId.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 更新资源状态
   * @param resourceId 资源ID
   * @param status 资源状态
   */
  async updateResourceStatus(resourceId: UUID, status: ResourceStatus): Promise<void> {
    try {
      const resource = await this.resourceRepository.findById(resourceId);
      if (!resource) {
        throw new Error(`Resource not found: ${resourceId.value}`);
      }
      
      // 更新资源状态
      resource.update(undefined, undefined, status);
      await this.resourceRepository.save(resource);
      
      this.logger.info(`Resource status updated: ${resource.name} -> ${status}`);
    } catch (error) {
      this.logger.error(`Failed to update resource status for ${resourceId.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 删除资源
   * @param resourceId 资源ID
   */
  async deleteResource(resourceId: UUID): Promise<void> {
    try {
      const resource = await this.resourceRepository.findById(resourceId);
      if (!resource) {
        throw new Error(`Resource not found: ${resourceId.value}`);
      }
      
      await this.resourceRepository.delete(resourceId);
      this.logger.info(`Resource deleted: ${resource.name}`);
    } catch (error) {
      this.logger.error(`Failed to delete resource ${resourceId.value}`, error as Error);
      throw error;
    }
  }

  /**
   * 获取资源使用统计
   * @param type 可选的资源类型
   * @returns 资源使用统计
   */
  async getResourceUsageStatistics(type?: ResourceType): Promise<{
    total: number;
    available: number;
    inUse: number;
    maintenance: number;
    unavailable: number;
    averageUsageRate: number;
  }> {
    try {
      return await this.resourceRepository.getResourceUsageStatistics(type);
    } catch (error) {
      this.logger.error('Failed to get resource usage statistics', error as Error);
      throw error;
    }
  }

  /**
   * 批量分配资源
   * @param allocations 分配请求列表
   * @returns 分配结果，包含成功分配的资源和失败的分配请求
   */
  async batchAllocateResources(allocations: Array<{
    type: ResourceType;
    amount: number;
  }>): Promise<{
    successes: Array<{ resource: Resource; amount: number }>;
    failures: Array<{ type: ResourceType; amount: number; reason: string }>;
  }> {
    const successes: Array<{ resource: Resource; amount: number }> = [];
    const failures: Array<{ type: ResourceType; amount: number; reason: string }> = [];

    for (const allocation of allocations) {
      try {
        const resource = await this.allocateResource(allocation.type, allocation.amount);
        if (resource) {
          successes.push({ resource, amount: allocation.amount });
        } else {
          failures.push({
            type: allocation.type,
            amount: allocation.amount,
            reason: 'No available resources'
          });
        }
      } catch (error) {
        failures.push({
          type: allocation.type,
          amount: allocation.amount,
          reason: (error as Error).message
        });
      }
    }

    return { successes, failures };
  }
}
