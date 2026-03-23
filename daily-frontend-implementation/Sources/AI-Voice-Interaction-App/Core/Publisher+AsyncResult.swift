import Foundation
import Combine

/// Publisher扩展，添加asyncResult()方法，将Publisher转换为可await的Result
public extension Publisher {
    /// 将Publisher转换为可await的Result
    /// - Returns: Result<T, Failure>
    func asyncResult() async -> Result<Output, Failure> {
        await withCheckedContinuation { continuation in
            var cancellable: AnyCancellable?
            cancellable = sink(
                receiveCompletion: { completion in
                    switch completion {
                    case .finished:
                        // 不会到达这里，因为receiveValue会处理值
                        break
                    case .failure(let error):
                        continuation.resume(returning: .failure(error))
                    }
                    cancellable?.cancel()
                },
                receiveValue: { value in
                    continuation.resume(returning: .success(value))
                }
            )
        }
    }
}