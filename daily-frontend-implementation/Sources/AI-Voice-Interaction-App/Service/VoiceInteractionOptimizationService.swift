//
//  VoiceInteractionOptimizationService.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/01/13.
//

import Foundation

/// 语音命令类型枚举
enum VoiceCommandType {
    case startRecording
    case stopRecording
    case cancelRecording
    case playSpeech
    case pauseSpeech
    case resumeSpeech
    case stopSpeech
    case reset
    case unknown
}

/// 语音命令结构体
struct VoiceCommand {
    let type: VoiceCommandType
    let confidence: Float
    let originalText: String
}

/// 语音交互优化服务协议
protocol VoiceInteractionOptimizationServiceProtocol {
    /// 初始化语音交互优化服务
    init()
    
    /// 识别语音命令
    /// - Parameter text: 语音识别结果文本
    /// - Returns: 识别出的语音命令
    func recognizeCommand(from text: String) -> VoiceCommand
    
    /// 优化语音识别文本
    /// - Parameter text: 原始语音识别文本
    /// - Returns: 优化后的文本
    func optimizeRecognizedText(_ text: String) -> String
    
    /// 评估语音识别质量
    /// - Parameter text: 语音识别结果文本
    /// - Returns: 质量评分 (0-1)
    func evaluateRecognitionQuality(_ text: String) -> Float
    
    /// 语音命令识别回调
    var onCommandRecognized: ((VoiceCommand) -> Void)? { get set }
    
    /// 可用语音命令列表
    func getAvailableCommands() -> [String]
}

/// 语音交互优化服务
class VoiceInteractionOptimizationService: VoiceInteractionOptimizationServiceProtocol {
    
    // MARK: - Properties
    
    /// 语音命令识别回调
    var onCommandRecognized: ((VoiceCommand) -> Void)?
    
    /// 语音命令映射表
    private let commandMappings: [VoiceCommandType: [String]]
    
    // MARK: - Initialization
    
    /// 初始化语音交互优化服务
    required init() {
        // 初始化语音命令映射表
        self.commandMappings = [
            .startRecording: ["开始录音", "录音", "开始", "启动录音", "启动语音识别"],
            .stopRecording: ["停止录音", "结束录音", "停止", "结束"],
            .cancelRecording: ["取消录音", "取消", "放弃"],
            .playSpeech: ["播放", "开始播放", "继续播放"],
            .pauseSpeech: ["暂停", "暂停播放"],
            .resumeSpeech: ["继续", "恢复", "恢复播放"],
            .stopSpeech: ["停止", "停止播放", "结束播放"],
            .reset: ["重置", "重新开始", "清空"]
        ]
    }
    
    // MARK: - Public Methods
    
    /// 识别语音命令
    /// - Parameter text: 语音识别结果文本
    /// - Returns: 识别出的语音命令
    func recognizeCommand(from text: String) -> VoiceCommand {
        let normalizedText = text.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        
        // 遍历命令映射表，查找匹配的命令
        for (commandType, keywords) in commandMappings {
            for keyword in keywords {
                if normalizedText.contains(keyword.lowercased()) {
                    let command = VoiceCommand(
                        type: commandType,
                        confidence: 0.9,
                        originalText: text
                    )
                    // 触发命令识别回调
                    onCommandRecognized?(command)
                    return command
                }
            }
        }
        
        // 无法识别的命令
        return VoiceCommand(
            type: .unknown,
            confidence: 0.1,
            originalText: text
        )
    }
    
    /// 优化语音识别文本
    /// - Parameter text: 原始语音识别文本
    /// - Returns: 优化后的文本
    func optimizeRecognizedText(_ text: String) -> String {
        var optimizedText = text
        
        // 简单的文本优化规则
        optimizedText = applyPunctuationRules(optimizedText)
        optimizedText = applyCapitalizationRules(optimizedText)
        optimizedText = applyCommonCorrections(optimizedText)
        
        return optimizedText
    }
    
    /// 评估语音识别质量
    /// - Parameter text: 语音识别结果文本
    /// - Returns: 质量评分 (0-1)
    func evaluateRecognitionQuality(_ text: String) -> Float {
        // 简单的质量评估规则
        let length = Float(text.count)
        
        // 检查文本长度
        if length < 2 {
            return 0.2
        }
        
        // 检查是否包含常见的识别错误模式
        let errorPatterns = ["...", "——", "   "]
        for pattern in errorPatterns {
            if text.contains(pattern) {
                return 0.5
            }
        }
        
        // 检查是否包含有效字符
        let validCharacterRatio = calculateValidCharacterRatio(text)
        
        // 综合评分
        let score = min(1.0, max(0.1, validCharacterRatio * 0.8 + 0.2))
        
        return score
    }
    
    /// 可用语音命令列表
    func getAvailableCommands() -> [String] {
        var commands: [String] = []
        
        // 收集所有可用命令
        for (_, keywords) in commandMappings {
            commands.append(contentsOf: keywords)
        }
        
        // 去重并排序
        return Array(Set(commands)).sorted()
    }
    
    // MARK: - Private Methods
    
    /// 应用标点符号规则
    private func applyPunctuationRules(_ text: String) -> String {
        var result = text
        
        // 在句子末尾添加句号（如果没有的话）
        if !result.isEmpty && ![".", "。", "!", "！", "?", "？"].contains(result.last) {
            result += "。"
        }
        
        // 替换英文标点为中文标点
        result = result.replacingOccurrences(of: ".", with: "。")
        result = result.replacingOccurrences(of: "!", with: "！")
        result = result.replacingOccurrences(of: "?", with: "？")
        
        return result
    }
    
    /// 应用大小写规则
    private func applyCapitalizationRules(_ text: String) -> String {
        var result = text
        
        // 中文文本不需要大小写调整，主要处理英文
        if !result.isEmpty {
            // 首字母大写
            let firstCharacter = result.prefix(1).uppercased()
            let rest = result.dropFirst()
            result = firstCharacter + rest
        }
        
        return result
    }
    
    /// 应用常见修正
    private func applyCommonCorrections(_ text: String) -> String {
        var result = text
        
        // 常见识别错误修正
        let corrections = [
            "枝术": "技术",
            "知能": "智能",
            "认之": "认知",
            "莫型": "模型",
            "已前": "以前",
            "以经": "已经",
            "在次": "再次"
        ]
        
        for (incorrect, correct) in corrections {
            result = result.replacingOccurrences(of: incorrect, with: correct)
        }
        
        return result
    }
    
    /// 计算有效字符比例
    private func calculateValidCharacterRatio(_ text: String) -> Float {
        guard !text.isEmpty else { return 0.0 }
        
        // 计算有效字符数
        let validCharacters = text.filter { char in
            return char.isLetter || char.isNumber || ["。", "，", "！", "？", "、", "；", "：", "（", "）"].contains(char)
        }
        
        return Float(validCharacters.count) / Float(text.count)
    }
}
