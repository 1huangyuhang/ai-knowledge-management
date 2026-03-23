import Foundation
import Combine

/// 请求节流器，用于合并和防抖请求
class RequestThrottler {
    /// 共享实例
    static let shared = RequestThrottler()
    
    /// 挂起的请求字典
    private var pendingRequests = [String: AnyCancellable]()
    
    /// 防抖定时器字典
    private var debounceTimers = [String: Timer]()
    
    /// 串行队列，用于管理请求和定时器
    private let queue = DispatchQueue(label: "com.aivoice.requestthrottler")
    
    /// 私有初始化器
    private init() {}
    
    /// 防抖请求
    /// - Parameters:
    ///   - key: 请求的唯一标识
    ///   - delay: 防抖延迟时间（秒），默认0.3秒
    ///   - request: 请求闭包，返回一个Publisher
    /// - Returns: 包含请求结果的Publisher
    func debounceRequest<T>(
        key: String,
        delay: TimeInterval = 0.3,
        request: @escaping () -> AnyPublisher<T, Error>
    ) -> AnyPublisher<T, Error> {
        return Future<T, Error> { promise in
            self.queue.async {
                // 取消之前的定时器
                if let timer = self.debounceTimers[key] {
                    timer.invalidate()
                    self.debounceTimers.removeValue(forKey: key)
                }
                
                // 取消之前的请求
                if let pendingRequest = self.pendingRequests[key] {
                    pendingRequest.cancel()
                    self.pendingRequests.removeValue(forKey: key)
                }
                
                // 创建新的防抖定时器
                let timer = Timer.scheduledTimer(withTimeInterval: delay, repeats: false) { [weak self] _ in
                    self?.queue.async {
                        // 执行请求
                        let cancellable = request()
                            .sink {
                                switch $0 {
                                case .finished:
                                    break
                                case .failure(let error):
                                    promise(.failure(error))
                                }
                                // 清理资源
                                self?.pendingRequests.removeValue(forKey: key)
                                self?.debounceTimers.removeValue(forKey: key)
                            } receiveValue: { value in
                                promise(.success(value))
                            }
                        
                        self?.pendingRequests[key] = cancellable
                    }
                }
                
                self.debounceTimers[key] = timer
                RunLoop.main.add(timer, forMode: .common)
            }
        }
        .eraseToAnyPublisher()
    }
    
    /// 合并请求
    /// - Parameters:
    ///   - key: 请求的唯一标识
    ///   - request: 请求闭包，返回一个Publisher
    /// - Returns: 包含请求结果的Publisher
    func mergeRequest<T>(
        key: String,
        request: @escaping () -> AnyPublisher<T, Error>
    ) -> AnyPublisher<T, Error> {
        return Future<T, Error> { promise in
            self.queue.async {
                // 如果已有相同请求正在进行，直接等待其完成
                if let _ = self.pendingRequests[key] {
                    // 简化实现，实际项目中可以使用Subject来合并多个订阅
                    // 这里返回一个失败，提示请求已合并
                    promise(.failure(APIError.requestMerged))
                    return
                }
                
                // 执行新请求
                let cancellable = request()
                    .sink {
                        switch $0 {
                        case .finished:
                            break
                        case .failure(let error):
                            promise(.failure(error))
                        }
                        // 清理资源
                        self.pendingRequests.removeValue(forKey: key)
                    } receiveValue: { value in
                        promise(.success(value))
                    }
                
                self.pendingRequests[key] = cancellable
            }
        }
        .eraseToAnyPublisher()
    }
    
    /// 取消特定key的请求
    /// - Parameter key: 请求的唯一标识
    func cancelRequest(key: String) {
        queue.async {
            if let timer = self.debounceTimers[key] {
                timer.invalidate()
                self.debounceTimers.removeValue(forKey: key)
            }
            
            if let pendingRequest = self.pendingRequests[key] {
                pendingRequest.cancel()
                self.pendingRequests.removeValue(forKey: key)
            }
        }
    }
    
    /// 取消所有请求
    func cancelAllRequests() {
        queue.async {
            // 取消所有定时器
            self.debounceTimers.values.forEach { $0.invalidate() }
            self.debounceTimers.removeAll()
            
            // 取消所有请求
            self.pendingRequests.values.forEach { $0.cancel() }
            self.pendingRequests.removeAll()
        }
    }
}