import Foundation

/// 网络请求缓存管理器
class NetworkRequestCache {
    /// 共享实例
    static let shared = NetworkRequestCache()
    
    /// 缓存存储
    private let cache = URLCache(memoryCapacity: 50 * 1024 * 1024, diskCapacity: 200 * 1024 * 1024, diskPath: "network_cache")
    
    /// 私有初始化器
    private init() {}
    
    /// 获取缓存的响应数据
    /// - Parameter request: URLRequest对象
    /// - Returns: 缓存的数据，如果没有缓存或缓存过期则返回nil
    func getCachedResponse(for request: URLRequest) -> Data? {
        guard let cachedResponse = cache.cachedResponse(for: request) else {
            return nil
        }
        
        // 检查缓存是否过期（默认5分钟）
        let cacheExpiryTime = cachedResponse.userInfo?["cacheExpiryTime"] as? Date ?? Date.distantPast
        if cacheExpiryTime > Date() {
            return cachedResponse.data
        }
        
        // 缓存过期，移除缓存
        cache.removeCachedResponse(for: request)
        return nil
    }
    
    /// 保存响应数据到缓存
    /// - Parameters:
    ///   - request: URLRequest对象
    ///   - data: 要缓存的数据
    ///   - cacheDuration: 缓存持续时间（秒），默认5分钟
    func saveCachedResponse(for request: URLRequest, with data: Data, cacheDuration: TimeInterval = 300) {
        let userInfo: [String: Any] = [
            "cacheExpiryTime": Date().addingTimeInterval(cacheDuration)
        ]
        
        guard let url = request.url else {
            return
        }
        
        let response = HTTPURLResponse(
            url: url,
            statusCode: 200,
            httpVersion: nil,
            headerFields: nil
        )!
        
        let cachedResponse = CachedURLResponse(
            response: response,
            data: data,
            userInfo: userInfo,
            storagePolicy: .allowed
        )
        
        cache.storeCachedResponse(cachedResponse, for: request)
    }
    
    /// 清除所有缓存
    func clearCache() {
        cache.removeAllCachedResponses()
    }
    
    /// 移除特定请求的缓存
    /// - Parameter request: URLRequest对象
    func removeCachedResponse(for request: URLRequest) {
        cache.removeCachedResponse(for: request)
    }
}