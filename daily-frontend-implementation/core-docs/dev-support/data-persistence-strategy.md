# 数据持久化策略文档

## 模块关联索引

### 所属环节
- **阶段**：文档优化
- **开发主题**：数据持久化策略

### 相关核心文档
- [前端架构设计](../architecture-design/frontend-architecture.md)
- [API集成规范](../core-features/api-integration-spec.md)
- [安全策略](../security-policy.md)

## 1. 概述

本文档定义了AI认知辅助系统前端的数据持久化策略，包括数据存储方式、Core Data配置、数据同步机制、数据生命周期管理等，确保数据的安全性、一致性和可靠性。

## 2. 数据持久化需求

### 2.1 数据类型

- **用户数据**：用户信息、认证状态、偏好设置
- **认知模型数据**：认知模型、概念、关系、思想片段
- **缓存数据**：API响应缓存、图片缓存
- **临时数据**：会话数据、临时状态

### 2.2 持久化要求

- **安全性**：敏感数据必须加密存储
- **一致性**：本地数据与服务器数据保持一致
- **可靠性**：数据存储必须可靠，防止数据丢失
- **性能**：数据操作必须高效，不影响应用性能
- **可扩展性**：支持数据模型的扩展和变更

## 3. 数据持久化方案

### 3.1 存储方案选择

| 存储类型 | 存储方案 | 适用场景 | 安全级别 |
|----------|----------|----------|----------|
| 用户数据 | Keychain | 敏感数据（JWT令牌、用户凭证） | 高 |
| 认知模型数据 | Core Data | 结构化数据、需要查询的数据 | 中 |
| 缓存数据 | URLCache/SDWebImage | API响应缓存、图片缓存 | 低 |
| 临时数据 | Memory/State | 会话数据、临时状态 | 无 |

### 3.2 Core Data配置

#### 3.2.1 数据模型设计

- **实体关系图**：
  ```
  ┌─────────────────┐      ┌─────────────────┐
  │ CognitiveModel  │◄─────┤    UserData     │
  └─────────────────┘      └─────────────────┘
          │
          ├─────────────────┐
          │                 │
  ┌──────────────┐   ┌───────────────┐
  │  Concept     │   │   Relation    │
  └──────────────┘   └───────────────┘
          │                 │
          └─────────────────┘
                  │
          ┌───────────────┐
          │ ThoughtFragment│
          └───────────────┘
  ```

#### 3.2.2 配置选项

- **持久化存储类型**：SQLite（默认）
- **加密设置**：启用SQLite加密
- **自动迁移**：启用轻量级自动迁移
- **批量操作**：使用NSBatchUpdateRequest进行批量更新
- **并发控制**：使用NSPersistentContainer的viewContext进行主线程操作，newBackgroundContext()进行后台操作

#### 3.2.3 Core Data Stack实现

```swift
class CoreDataManager {
    static let shared = CoreDataManager()
    
    private init() {}
    
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "CognitiveModel")
        
        // 配置加密
        let description = NSPersistentStoreDescription()
        description.setOption(FileProtectionType.complete as NSObject,
                              forKey: NSPersistentStoreFileProtectionKey)
        
        // 配置自动迁移
        description.shouldMigrateStoreAutomatically = true
        description.shouldInferMappingModelAutomatically = true
        
        container.persistentStoreDescriptions = [description]
        
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        })
        
        return container
    }()
    
    var viewContext: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    func newBackgroundContext() -> NSManagedObjectContext {
        let context = persistentContainer.newBackgroundContext()
        context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        return context
    }
    
    func saveContext() {
        let context = viewContext
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nserror = error as NSError
                fatalError("Unresolved error \(nserror), \(nserror.userInfo)")
            }
        }
    }
}
```

## 4. 数据同步机制

### 4.1 同步策略

- **双向同步**：本地数据变更同步到服务器，服务器数据变更同步到本地
- **增量同步**：只同步变更的数据，减少网络流量
- **冲突解决**：
  - 服务器优先：服务器数据覆盖本地数据
  - 时间戳优先：新数据覆盖旧数据
  - 手动解决：复杂冲突提示用户手动解决

### 4.2 同步触发方式

- **实时同步**：重要数据实时同步到服务器
- **定期同步**：非重要数据定期同步
- **手动同步**：允许用户手动触发同步
- **事件触发**：特定事件（如应用启动、用户登出）触发同步

### 4.3 同步实现示例

```swift
class DataSyncManager {
    private let apiClient: APIClient
    private let coreDataManager: CoreDataManager
    
    init(apiClient: APIClient, coreDataManager: CoreDataManager) {
        self.apiClient = apiClient
        self.coreDataManager = coreDataManager
    }
    
    // 同步认知模型到服务器
    func syncCognitiveModel(_ model: CognitiveModel) async throws {
        // 1. 调用API将模型同步到服务器
        let updatedModel = try await apiClient.updateModel(model)
        
        // 2. 更新本地数据
        let context = coreDataManager.newBackgroundContext()
        context.perform { [weak self] in
            guard let self = self else { return }
            
            do {
                // 查找本地模型
                let fetchRequest: NSFetchRequest<CoreDataCognitiveModel> = CoreDataCognitiveModel.fetchRequest()
                fetchRequest.predicate = NSPredicate(format: "id == %@", updatedModel.id)
                
                if let localModel = try context.fetch(fetchRequest).first {
                    // 更新本地模型
                    localModel.name = updatedModel.name
                    localModel.updatedAt = Date()
                    // 更新其他字段...
                }
                
                try context.save()
            } catch {
                // 处理错误
                print("Error updating local model: \(error)")
            }
        }
    }
    
    // 从服务器同步认知模型到本地
    func syncCognitiveModelsFromServer() async throws {
        // 1. 从服务器获取模型列表
        let models = try await apiClient.listModels()
        
        // 2. 更新本地数据
        let context = coreDataManager.newBackgroundContext()
        context.perform { [weak self] in
            guard let self = self else { return }
            
            do {
                // 清除旧模型
                let fetchRequest: NSFetchRequest<NSFetchRequestResult> = CoreDataCognitiveModel.fetchRequest()
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                try context.execute(deleteRequest)
                
                // 添加新模型
                for model in models {
                    let coreDataModel = CoreDataCognitiveModel(context: context)
                    coreDataModel.id = model.id
                    coreDataModel.name = model.name
                    // 设置其他字段...
                }
                
                try context.save()
            } catch {
                // 处理错误
                print("Error syncing models from server: \(error)")
            }
        }
    }
}
```

## 5. 数据生命周期管理

### 5.1 数据创建

- **本地创建**：用户在本地创建数据，然后同步到服务器
- **服务器创建**：服务器生成数据，然后同步到本地
- **导入创建**：从外部导入数据（如文件导入）

### 5.2 数据更新

- **本地更新**：用户在本地更新数据，然后同步到服务器
- **服务器更新**：服务器更新数据，然后同步到本地
- **自动更新**：系统自动更新数据（如定期同步）

### 5.3 数据删除

- **本地删除**：用户在本地删除数据，然后同步到服务器
- **服务器删除**：服务器删除数据，然后同步到本地
- **自动删除**：系统自动删除过期数据
- **软删除**：标记数据为已删除，而非物理删除

### 5.4 数据归档

- **归档策略**：定期归档旧数据，减少存储空间占用
- **归档方式**：将旧数据导出为文件，存储在iCloud或其他云存储中
- **归档恢复**：支持从归档中恢复数据

## 6. 数据安全

### 6.1 数据加密

- **Core Data加密**：启用Core Data的SQLite加密功能
- **敏感数据加密**：使用Keychain存储敏感数据
- **传输加密**：数据同步时使用HTTPS加密传输

### 6.2 数据备份

- **iCloud备份**：配置Core Data支持iCloud备份
- **手动备份**：允许用户手动备份数据
- **自动备份**：定期自动备份关键数据

### 6.3 数据清除

- **用户登出**：用户登出时，清除所有本地数据
- **应用卸载**：应用卸载时，自动清除所有数据
- **数据擦除**：提供数据擦除功能，彻底清除所有数据

## 7. 性能优化

### 7.1 查询优化

- **索引**：为常用查询字段添加索引
- **批量查询**：使用分页查询，避免一次性加载大量数据
- **预取关系**：使用NSFetchRequest的relationshipKeyPathsForPrefetching属性预取关系数据
- **谓词优化**：使用高效的谓词查询，避免复杂的连接查询

### 7.2 写入优化

- **批量写入**：使用NSBatchInsertRequest和NSBatchUpdateRequest进行批量操作
- **异步写入**：在后台线程进行写入操作，避免阻塞主线程
- **合并写入**：合并多次写入操作，减少磁盘I/O

### 7.3 内存优化

- **使用fetchedResultsController**：使用NSFetchedResultsController管理数据显示，优化内存使用
- **释放不再使用的对象**：及时释放不再使用的NSManagedObject对象
- **限制结果数量**：限制查询结果数量，避免加载过多数据到内存

## 8. 数据迁移

### 8.1 轻量级迁移

- **启用自动迁移**：在NSPersistentStoreDescription中设置shouldMigrateStoreAutomatically和shouldInferMappingModelAutomatically为true
- **适用场景**：简单的数据模型变更，如添加字段、重命名字段、添加关系等

### 8.2 重量级迁移

- **创建映射模型**：使用Xcode创建映射模型，定义旧模型到新模型的映射关系
- **适用场景**：复杂的数据模型变更，如删除字段、改变关系类型、重构数据模型等

### 8.3 迁移步骤

1. **备份数据**：在迁移前备份现有数据
2. **测试迁移**：在测试环境中测试迁移过程
3. **执行迁移**：在生产环境中执行迁移
4. **验证迁移**：验证迁移后的数据完整性和一致性

## 9. 监控与维护

### 9.1 数据监控

- **监控数据大小**：定期监控数据存储大小，及时清理不必要的数据
- **监控同步状态**：监控数据同步状态，及时处理同步失败
- **监控查询性能**：监控查询性能，优化慢查询

### 9.2 数据维护

- **定期清理**：定期清理过期数据和临时数据
- **数据修复**：提供数据修复功能，修复损坏的数据
- **数据统计**：收集数据统计信息，用于优化数据模型和查询

## 10. 参考资料

- Apple Core Data Documentation
- Core Data Performance Best Practices
- SQLite Encryption Extension
- iOS Data Storage Guidelines
