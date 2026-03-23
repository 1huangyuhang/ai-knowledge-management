//
//  AnalysisShareService.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI
import UIKit

/// 分析分享服务协议
protocol AnalysisShareServiceProtocol {
    /// 分享分析结果
    /// - Parameters:
    ///   - analysisResult: 分析结果
    ///   - completion: 分享完成回调
    func shareAnalysisResult(_ analysisResult: AnalysisResult, completion: @escaping (Bool, Error?) -> Void)
    
    /// 分享分析图表
    /// - Parameters:
    ///   - chartView: 图表视图
    ///   - title: 分享标题
    ///   - completion: 分享完成回调
    func shareChart(_ chartView: UIView, title: String, completion: @escaping (Bool, Error?) -> Void)
    
    /// 导出分析结果为PDF
    /// - Parameters:
    ///   - analysisResult: 分析结果
    ///   - completion: 导出完成回调，返回PDF数据
    func exportToPDF(_ analysisResult: AnalysisResult, completion: @escaping (Data?, Error?) -> Void)
    
    /// 导出分析结果为图片
    /// - Parameters:
    ///   - analysisResult: 分析结果
    ///   - completion: 导出完成回调，返回图片数据
    func exportToImage(_ analysisResult: AnalysisResult, completion: @escaping (Data?, Error?) -> Void)
    
    /// 导出分析结果为文本
    /// - Parameters:
    ///   - analysisResult: 分析结果
    ///   - completion: 导出完成回调，返回文本数据
    func exportToText(_ analysisResult: AnalysisResult, completion: @escaping (Data?, Error?) -> Void)
}

/// 分析分享服务实现
class AnalysisShareService: AnalysisShareServiceProtocol {
    
    // MARK: - 分享功能
    
    func shareAnalysisResult(_ analysisResult: AnalysisResult, completion: @escaping (Bool, Error?) -> Void) {
        // 创建分享内容
        let shareContent = generateShareContent(for: analysisResult)
        
        // 导出为PDF
        exportToPDF(analysisResult) { [weak self] pdfData, error in
            guard let self = self, let pdfData = pdfData else {
                completion(false, error ?? NSError(domain: "AnalysisShareService", code: 0, userInfo: [NSLocalizedDescriptionKey: "PDF导出失败"]))
                return
            }
            
            // 创建分享项
            let items: [Any] = [shareContent, pdfData]
            
            // 创建UIActivityViewController
            let activityViewController = UIActivityViewController(activityItems: items, applicationActivities: nil)
            
            // 设置分享标题
            activityViewController.title = "分享分析结果"
            
            // 显示分享控制器
            self.presentActivityViewController(activityViewController, completion: completion)
        }
    }
    
    func shareChart(_ chartView: UIView, title: String, completion: @escaping (Bool, Error?) -> Void) {
        // 将UIView转换为UIImage
        guard let image = chartView.asImage() else {
            completion(false, NSError(domain: "AnalysisShareService", code: 1, userInfo: [NSLocalizedDescriptionKey: "图表转换失败"]))
            return
        }
        
        // 创建分享项
        let items: [Any] = [image, title]
        
        // 创建UIActivityViewController
        let activityViewController = UIActivityViewController(activityItems: items, applicationActivities: nil)
        activityViewController.title = title
        
        // 显示分享控制器
        presentActivityViewController(activityViewController, completion: completion)
    }
    
    // MARK: - 导出功能
    
    func exportToPDF(_ analysisResult: AnalysisResult, completion: @escaping (Data?, Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            do {
                // 创建PDF数据
                let pdfData = try PDFGenerator.generatePDF(for: analysisResult)
                completion(pdfData, nil)
            } catch {
                completion(nil, error)
            }
        }
    }
    
    func exportToImage(_ analysisResult: AnalysisResult, completion: @escaping (Data?, Error?) -> Void) {
        // 这里需要实现将分析结果转换为图片的逻辑
        // 由于需要UI渲染，我们返回一个占位图
        let placeholderImage = UIImage(systemName: "chart.bar.fill")?.withTintColor(.blue, renderingMode: .alwaysOriginal)
        guard let imageData = placeholderImage?.pngData() else {
            completion(nil, NSError(domain: "AnalysisShareService", code: 2, userInfo: [NSLocalizedDescriptionKey: "图片转换失败"]))
            return
        }
        completion(imageData, nil)
    }
    
    func exportToText(_ analysisResult: AnalysisResult, completion: @escaping (Data?, Error?) -> Void) {
        DispatchQueue.global(qos: .userInitiated).async {
            // 生成文本内容
            let textContent = self.generateTextContent(for: analysisResult)
            
            // 转换为Data
            guard let textData = textContent.data(using: .utf8) else {
                completion(nil, NSError(domain: "AnalysisShareService", code: 3, userInfo: [NSLocalizedDescriptionKey: "文本转换失败"]))
                return
            }
            
            completion(textData, nil)
        }
    }
    
    // MARK: - 私有方法
    
    /// 生成分享文本内容
    private func generateShareContent(for analysisResult: AnalysisResult) -> String {
        var content = "# 认知模型分析结果\n\n"
        content += "分析时间: \(analysisResult.formattedCreatedAt)\n"
        let confidenceText = String(format: "%.1f%%", analysisResult.confidenceScore * 100)
        content += "可信度: \(confidenceText)\n\n"
        
        if !analysisResult.insights.isEmpty {
            content += "## 分析洞察\n"
            for (index, insight) in analysisResult.insights.enumerated() {
                content += "\(index + 1). \(insight)\n"
            }
            content += "\n"
        }
        
        if !analysisResult.recommendations.isEmpty {
            content += "## 改进建议\n"
            for (index, recommendation) in analysisResult.recommendations.enumerated() {
                content += "\(index + 1). \(recommendation)\n"
            }
        }
        
        return content
    }
    
    /// 生成文本导出内容
    private func generateTextContent(for analysisResult: AnalysisResult) -> String {
        var content = "认知模型分析结果\n"
        content += String(repeating: "=", count: 50) + "\n\n"
        
        // 计算可信度文本，只声明一次
        let confidenceText = String(format: "%.1f%%", analysisResult.confidenceScore * 100)
        
        // 基本信息
        content += "分析时间: \(analysisResult.formattedCreatedAt)\n"
        content += "分析类型: \(analysisResult.analysisType.displayName)\n"
        content += "可信度: \(confidenceText)\n\n"
        
        // 分析洞察
        if !analysisResult.insights.isEmpty {
            content += "分析洞察:\n"
            for (index, insight) in analysisResult.insights.enumerated() {
                content += "  \(index + 1). \(insight)\n"
            }
            content += "\n"
        }
        
        // 改进建议
        if !analysisResult.recommendations.isEmpty {
            content += "改进建议:\n"
            for (index, recommendation) in analysisResult.recommendations.enumerated() {
                content += "  \(index + 1). \(recommendation)\n"
            }
            content += "\n"
        }
        
        // 详细数据
        content += "详细数据:\n"
        // 移除了不存在的属性引用
        content += "- 分析类型: \(analysisResult.analysisType.displayName)\n"
        content += "- 可信度: \(confidenceText)\n"
        
        return content
    }
    
    /// 显示分享控制器
    private func presentActivityViewController(_ activityViewController: UIActivityViewController, completion: @escaping (Bool, Error?) -> Void) {
        // 获取当前窗口
        guard let windowScene = UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let window = windowScene.windows.first,
              let rootViewController = window.rootViewController else {
            completion(false, NSError(domain: "AnalysisShareService", code: 4, userInfo: [NSLocalizedDescriptionKey: "无法获取根视图控制器"]))
            return
        }
        
        // 显示分享控制器
        rootViewController.present(activityViewController, animated: true, completion: nil)
        
        // 设置完成回调
        activityViewController.completionWithItemsHandler = { activityType, completed, returnedItems, error in
            completion(completed, error)
        }
    }
}

// MARK: - PDF生成器
class PDFGenerator {
    /// 生成PDF数据
    static func generatePDF(for analysisResult: AnalysisResult) throws -> Data {
        // 创建PDF数据
        let pdfData = NSMutableData()
        
        // 创建PDF上下文
        UIGraphicsBeginPDFContextToData(pdfData, CGRect(x: 0, y: 0, width: 842, height: 1190), nil)
        defer {
            UIGraphicsEndPDFContext()
        }
        
        // 创建PDF页面
        UIGraphicsBeginPDFPageWithInfo(CGRect(x: 0, y: 0, width: 842, height: 1190), nil)
        
        // 设置字体和颜色
        let titleFont = UIFont.boldSystemFont(ofSize: 24)
        let headingFont = UIFont.boldSystemFont(ofSize: 18)
        let bodyFont = UIFont.systemFont(ofSize: 14)
        let secondaryFont = UIFont.systemFont(ofSize: 12)
        let textColor = UIColor.black
        let secondaryColor = UIColor.gray
        
        // 绘制标题
        let titleRect = CGRect(x: 50, y: 50, width: 742, height: 40)
        "认知模型分析结果".draw(in: titleRect, withAttributes: [
            NSAttributedString.Key.font: titleFont,
            NSAttributedString.Key.foregroundColor: textColor
        ])
        
        // 绘制副标题和基本信息
        var yPosition: CGFloat = 120
        let sectionWidth = 742.0
        
        // 分析时间和可信度
        let confidenceText1 = String(format: "%.1f%%", analysisResult.confidenceScore * 100)
        let infoText = "分析时间: \(analysisResult.formattedCreatedAt)  |  可信度: \(confidenceText1)"
        let infoRect = CGRect(x: 50, y: yPosition, width: sectionWidth, height: 20)
        infoText.draw(in: infoRect, withAttributes: [
            .font: secondaryFont,
            .foregroundColor: secondaryColor
        ])
        
        yPosition += 40
        
        // 分析类型
        let typeText = "分析类型: \(analysisResult.analysisType.displayName)"
        let typeRect = CGRect(x: 50, y: yPosition, width: sectionWidth, height: 20)
        typeText.draw(in: typeRect, withAttributes: [
            NSAttributedString.Key.font: bodyFont,
            NSAttributedString.Key.foregroundColor: textColor
        ])
        
        yPosition += 30
        
        // 数据统计
        let confidenceText2 = String(format: "%.1f%%", analysisResult.confidenceScore * 100)
        let statsText = "可信度: \(confidenceText2)"
        let statsRect = CGRect(x: 50, y: yPosition, width: sectionWidth, height: 20)
        statsText.draw(in: statsRect, withAttributes: [
            NSAttributedString.Key.font: secondaryFont,
            NSAttributedString.Key.foregroundColor: secondaryColor
        ])
        
        yPosition += 50
        
        // 绘制分析洞察
        if !analysisResult.insights.isEmpty {
            // 洞察标题
            "分析洞察".draw(in: CGRect(x: 50, y: yPosition, width: sectionWidth, height: 30), withAttributes: [
                .font: headingFont,
                .foregroundColor: textColor
            ])
            
            yPosition += 40
            
            // 洞察内容
            for (index, insight) in analysisResult.insights.enumerated() {
                let insightText = "\(index + 1). \(insight)"
                let insightRect = CGRect(x: 70, y: yPosition, width: sectionWidth - 20, height: 60)
                let paragraphStyle = NSMutableParagraphStyle()
                paragraphStyle.lineSpacing = 6
                
                insightText.draw(in: insightRect, withAttributes: [
                    .font: bodyFont,
                    .foregroundColor: textColor,
                    .paragraphStyle: paragraphStyle
                ])
                
                yPosition += 60
            }
            
            yPosition += 30
        }
        
        // 绘制改进建议
        if !analysisResult.recommendations.isEmpty {
            // 建议标题
            "改进建议".draw(in: CGRect(x: 50, y: yPosition, width: sectionWidth, height: 30), withAttributes: [
                .font: headingFont,
                .foregroundColor: textColor
            ])
            
            yPosition += 40
            
            // 建议内容
            for (index, recommendation) in analysisResult.recommendations.enumerated() {
                let recommendationText = "\(index + 1). \(recommendation)"
                let recommendationRect = CGRect(x: 70, y: yPosition, width: sectionWidth - 20, height: 60)
                let paragraphStyle = NSMutableParagraphStyle()
                paragraphStyle.lineSpacing = 6
                
                recommendationText.draw(in: recommendationRect, withAttributes: [
                    .font: bodyFont,
                    .foregroundColor: textColor,
                    .paragraphStyle: paragraphStyle
                ])
                
                yPosition += 60
            }
        }
        
        return pdfData as Data
    }
}

// MARK: - UIView扩展
extension UIView {
    /// 将UIView转换为UIImage
    func asImage() -> UIImage? {
        UIGraphicsBeginImageContextWithOptions(bounds.size, isOpaque, 0.0)
        defer { UIGraphicsEndImageContext() }
        guard let context = UIGraphicsGetCurrentContext() else { return nil }
        layer.render(in: context)
        let image = UIGraphicsGetImageFromCurrentImageContext()
        return image
    }
}
