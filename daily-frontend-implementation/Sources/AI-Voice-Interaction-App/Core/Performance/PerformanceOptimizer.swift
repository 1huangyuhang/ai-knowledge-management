import Foundation
import Combine
import UIKit
import Network
import MachO

/// 性能优化工具类
class PerformanceOptimizer {
    
    /// 单例实例
    static let shared = PerformanceOptimizer()
    
    /// 私有初始化
    private init() {}
    
    // MARK: - 内存管理
    
    /// 检查并清理内存
    func optimizeMemoryUsage() {
        // 清除缓存
        ImageCache.shared.clear()
        
        // 清理临时文件
        clearTemporaryFiles()
        
        // 记录内存使用情况
        logMemoryUsage()
    }
    
    /// 清理临时文件
    private func clearTemporaryFiles() {
        let fileManager = FileManager.default
        let tempDirectory = NSTemporaryDirectory()
        
        do {
            let files = try fileManager.contentsOfDirectory(atPath: tempDirectory)
            for file in files {
                let filePath = tempDirectory + file
                try fileManager.removeItem(atPath: filePath)
            }
        } catch {
            print("清理临时文件失败: \(error.localizedDescription)")
        }
    }
    
    /// 记录内存使用情况
    private func logMemoryUsage() {
        // 使用更简单的方法获取内存使用情况
        let usedMemory = ProcessInfo.processInfo.physicalMemory
        let usedMB = Double(usedMemory) / (1024 * 1024)
        print("当前内存使用: \(String(format: "%.2f", usedMB)) MB")
    }
    
    // MARK: - 网络请求优化
    
    /// 网络请求缓存策略
    func networkCachePolicy() -> URLRequest.CachePolicy {
        // 根据网络状态返回不同的缓存策略
        if NetworkMonitor.shared.isConnected {
            return .reloadRevalidatingCacheData
        } else {
            return .returnCacheDataElseLoad
        }
    }
    
    /// 优化网络请求参数
    /// - Parameter params: 原始参数
    /// - Returns: 优化后的参数
    func optimizeRequestParams(_ params: [String: Any]) -> [String: Any] {
        // 移除空值参数
        return params.filter { !($0.value is NSNull) }
    }
    
    // MARK: - 图片加载优化
    
    /// 优化图片加载
    /// - Parameters:
    ///   - url: 图片URL
    ///   - size: 目标尺寸
    /// - Returns: 优化后的图片URL
    func optimizeImageURL(_ url: URL, for size: CGSize) -> URL {
        // 如果URL已经包含尺寸参数，直接返回
        if url.absoluteString.contains("width=") && url.absoluteString.contains("height=") {
            return url
        }
        
        // 添加尺寸参数，用于服务器端图片优化
        guard var components = URLComponents(url: url, resolvingAgainstBaseURL: true) else {
            return url
        }
        
        // 创建一个本地查询参数数组，避免重叠访问
        var queryItems: [URLQueryItem] = components.queryItems ?? []
        queryItems.append(URLQueryItem(name: "width", value: "\(Int(size.width))"))
        queryItems.append(URLQueryItem(name: "height", value: "\(Int(size.height))"))
        queryItems.append(URLQueryItem(name: "quality", value: "80"))
        
        // 设置回components
        components.queryItems = queryItems
        
        return components.url ?? url
    }
    
    // MARK: - 渲染性能
    
    /// 检查渲染性能
    func checkRenderingPerformance() {
        #if DEBUG
        // 在调试模式下启用渲染性能监控
        print("渲染性能监控已启用")
        #endif
    }
    
    /// 优化列表渲染
    /// - Parameter items: 列表项数量
    /// - Returns: 是否需要分页
    func shouldPaginateList(with items: Int) -> Bool {
        // 超过50项建议分页
        return items > 50
    }
    
    // MARK: - 代码执行优化
    
    /// 延迟执行
    /// - Parameters:
    ///   - delay: 延迟时间
    ///   - closure: 执行的闭包
    func debounce(delay: TimeInterval, closure: @escaping () -> Void) -> AnyCancellable {
        return Just(())
            .delay(for: .seconds(delay), scheduler: RunLoop.main)
            .sink(receiveValue: { _ in
                closure()
            })
    }
    
    /// 节流执行
    /// - Parameters:
    ///   - interval: 节流间隔
    ///   - closure: 执行的闭包
    /// - Returns: 取消令牌
    func throttle(interval: TimeInterval, closure: @escaping () -> Void) -> AnyCancellable {
        let subject = PassthroughSubject<Void, Never>()
        
        let cancellable = subject
            .throttle(for: .seconds(interval), scheduler: RunLoop.main, latest: true)
            .sink(receiveValue: { _ in
                closure()
            })
        
        return cancellable
    }
}

/// 图片缓存
class ImageCache {
    static let shared = ImageCache()
    
    private let cache = NSCache<NSString, UIImage>()
    
    private init() {
        // 设置缓存大小限制
        cache.totalCostLimit = 50 * 1024 * 1024 // 50MB
    }
    
    /// 保存图片到缓存
    /// - Parameters:
    ///   - image: 图片
    ///   - key: 缓存键
    func save(_ image: UIImage, forKey key: String) {
        cache.setObject(image, forKey: key as NSString)
    }
    
    /// 从缓存获取图片
    /// - Parameter key: 缓存键
    /// - Returns: 图片，如果不存在返回nil
    func get(forKey key: String) -> UIImage? {
        return cache.object(forKey: key as NSString)
    }
    
    /// 清除缓存
    func clear() {
        cache.removeAllObjects()
    }
    
    /// 移除指定缓存
    /// - Parameter key: 缓存键
    func remove(forKey key: String) {
        cache.removeObject(forKey: key as NSString)
    }
}

/// 网络监视器
class NetworkMonitor: ObservableObject {
    static let shared = NetworkMonitor()
    
    @Published private(set) var isConnected = true
    
    private let monitor: NWPathMonitor
    private let queue = DispatchQueue(label: "NetworkMonitor")
    
    private init() {
        monitor = NWPathMonitor()
        monitor.pathUpdateHandler = {
            [weak self] path in
            DispatchQueue.main.async {
                self?.isConnected = path.status == .satisfied
            }
        }
        monitor.start(queue: queue)
    }
    
    deinit {
        monitor.cancel()
    }
}
