import Foundation
import CoreData

/// Core Data管理类
class CoreDataManager {
    /// 单例实例
    static let shared = CoreDataManager()
    
    /// 私有初始化器
    private init() {}
    
    /// 持久化容器
    lazy var persistentContainer: NSPersistentContainer = {
        let container = NSPersistentContainer(name: "AI_Voice_Interaction_App")
        container.loadPersistentStores(completionHandler: { (storeDescription, error) in
            if let error = error as NSError? {
                fatalError("Unresolved error \(error), \(error.userInfo)")
            }
        })
        return container
    }()
    
    /// 主上下文
    var context: NSManagedObjectContext {
        return persistentContainer.viewContext
    }
    
    /// 保存上下文
    func saveContext() {
        if context.hasChanges {
            do {
                try context.save()
            } catch {
                let nserror = error as NSError
                fatalError("Unresolved error \(nserror), \(nserror.userInfo)")
            }
        }
    }
    
    /// 获取后台上下文
    /// - Returns: 后台上下文
    func backgroundContext() -> NSManagedObjectContext {
        return persistentContainer.newBackgroundContext()
    }
}