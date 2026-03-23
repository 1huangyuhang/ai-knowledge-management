//
//  AnalysisExportViewModel.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation
import Combine

/// 分析导出视图模型
class AnalysisExportViewModel: ObservableObject {
    
    // MARK: - 状态
    
    /// 导出格式选项
    enum ExportFormat: String, CaseIterable, Identifiable {
        case pdf = "PDF"
        case image = "图片"
        case text = "文本"
        
        var id: String { rawValue }
        
        var displayName: String {
            rawValue
        }
        
        var fileExtension: String {
            switch self {
            case .pdf: return "pdf"
            case .image: return "png"
            case .text: return "txt"
            }
        }
        
        var mimeType: String {
            switch self {
            case .pdf: return "application/pdf"
            case .image: return "image/png"
            case .text: return "text/plain"
            }
        }
    }
    
    /// 导出状态
    enum ExportStatus: Equatable {
        case idle
        case exporting
        case success(URL)
        case failure(Error)
        
        static func == (lhs: ExportStatus, rhs: ExportStatus) -> Bool {
            switch (lhs, rhs) {
            case (.idle, .idle), (.exporting, .exporting):
                return true
            case (.success(let lhsURL), .success(let rhsURL)):
                return lhsURL == rhsURL
            case (.failure, .failure):
                // 忽略Error类型的具体内容，只要都是failure状态就认为相等
                return true
            default:
                return false
            }
        }
    }
    
    // MARK: - 属性
    
    /// 分析结果
    let analysisResult: AnalysisResult
    
    /// 导出格式
    @Published var selectedFormat: ExportFormat = .pdf
    
    /// 导出状态
    @Published private(set) var exportStatus: ExportStatus = .idle
    
    /// 分享服务
    private let shareService: AnalysisShareServiceProtocol
    
    /// 取消令牌
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - 初始化
    
    /// 初始化
    /// - Parameters:
    ///   - analysisResult: 分析结果
    ///   - shareService: 分享服务
    init(analysisResult: AnalysisResult, shareService: AnalysisShareServiceProtocol = AnalysisShareService()) {
        self.analysisResult = analysisResult
        self.shareService = shareService
    }
    
    // MARK: - 导出功能
    
    /// 开始导出
    func startExport() {
        exportStatus = .exporting
        
        // 根据选择的格式导出
        switch selectedFormat {
        case .pdf:
            exportToPDF()
        case .image:
            exportToImage()
        case .text:
            exportToText()
        }
    }
    
    /// 导出为PDF
    private func exportToPDF() {
        shareService.exportToPDF(analysisResult) { [weak self] data, error in
            guard let self = self else { return }
            
            if let data = data {
                self.saveFile(data: data, format: .pdf)
            } else {
                self.exportStatus = .failure(error ?? NSError(domain: "AnalysisExportViewModel", code: 0, userInfo: [NSLocalizedDescriptionKey: "PDF导出失败"]))
            }
        }
    }
    
    /// 导出为图片
    private func exportToImage() {
        shareService.exportToImage(analysisResult) { [weak self] data, error in
            guard let self = self else { return }
            
            if let data = data {
                self.saveFile(data: data, format: .image)
            } else {
                self.exportStatus = .failure(error ?? NSError(domain: "AnalysisExportViewModel", code: 0, userInfo: [NSLocalizedDescriptionKey: "图片导出失败"]))
            }
        }
    }
    
    /// 导出为文本
    private func exportToText() {
        shareService.exportToText(analysisResult) { [weak self] data, error in
            guard let self = self else { return }
            
            if let data = data {
                self.saveFile(data: data, format: .text)
            } else {
                self.exportStatus = .failure(error ?? NSError(domain: "AnalysisExportViewModel", code: 0, userInfo: [NSLocalizedDescriptionKey: "文本导出失败"]))
            }
        }
    }
    
    /// 保存文件到本地
    /// - Parameters:
    ///   - data: 文件数据
    ///   - format: 导出格式
    private func saveFile(data: Data, format: ExportFormat) {
        do {
            // 创建文件名
            let fileName = generateFileName(format: format)
            
            // 获取文档目录
            let documentDirectory = try FileManager.default.url(for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: false)
            
            // 创建文件URL
            let fileURL = documentDirectory.appendingPathComponent(fileName)
            
            // 写入文件
            try data.write(to: fileURL)
            
            // 更新状态
            exportStatus = .success(fileURL)
            
        } catch {
            exportStatus = .failure(error)
        }
    }
    
    /// 生成文件名
    /// - Parameter format: 导出格式
    /// - Returns: 文件名
    private func generateFileName(format: ExportFormat) -> String {
        // 创建时间戳
        let timestamp = Date().timeIntervalSince1970
        
        // 创建基本名称
        let baseName = "认知模型分析_\(timestamp)"
        
        // 返回完整文件名
        return "\(baseName).\(format.fileExtension)"
    }
    
    /// 重置状态
    func resetStatus() {
        exportStatus = .idle
    }
    
    /// 获取导出状态描述
    var statusDescription: String {
        switch exportStatus {
        case .idle:
            return "选择导出格式"
        case .exporting:
            return "正在导出..."
        case .success(let url):
            return "导出成功！文件已保存到: \(url.lastPathComponent)"
        case .failure(let error):
            return "导出失败: \(error.localizedDescription)"
        }
    }
    
    /// 获取是否可以导出
    var canExport: Bool {
        exportStatus != .exporting
    }
    
    /// 获取导出按钮标题
    var exportButtonTitle: String {
        switch exportStatus {
        case .exporting:
            return "导出中..."
        default:
            return "开始导出"
        }
    }
}
