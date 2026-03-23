//
//  ChartData.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation

/// 图表类型枚举
enum ChartType: Codable {
    case radar
    case bar
    case pie
    case network
    case line
}

/// 通用图表数据模型
protocol ChartData {
    var title: String { get }
    var description: String { get }
    var type: ChartType { get }
}

/// 雷达图数据模型
struct RadarChartData: ChartData, Codable, Equatable {
    let title: String
    let description: String
    var type: ChartType = .radar
    let categories: [String]
    let datasets: [RadarDataset]
    
    enum CodingKeys: String, CodingKey {
        case title
        case description
        case categories
        case datasets
        // 排除type属性，使用默认值
    }
}

/// 雷达图数据集
struct RadarDataset: Codable, Equatable {
    let label: String
    let values: [Double]
    let color: String
    let fillColor: String
}

/// 柱状图数据模型
struct BarChartData: ChartData, Codable, Equatable {
    let title: String
    let description: String
    var type: ChartType = .bar
    let categories: [String]
    let datasets: [BarDataset]
    
    enum CodingKeys: String, CodingKey {
        case title
        case description
        case categories
        case datasets
        // 排除type属性，使用默认值
    }
}

/// 柱状图数据集
struct BarDataset: Codable, Equatable {
    let label: String
    let values: [Double]
    let color: String
    let backgroundColor: String
}

/// 饼图数据模型
struct PieChartData: ChartData, Codable, Equatable {
    let title: String
    let description: String
    let type: ChartType = .pie
    let datasets: [PieDataset]
    
    enum CodingKeys: String, CodingKey {
        case title
        case description
        case datasets
        // 排除type属性，使用默认值
    }
}

/// 饼图数据集
struct PieDataset: Codable, Equatable {
    let label: String
    let value: Double
    let color: String
    let backgroundColor: String
}

/// 网络图数据模型
struct NetworkChartData: ChartData, Codable, Equatable {
    let title: String
    let description: String
    let type: ChartType = .network
    let nodes: [NetworkNode]
    let edges: [NetworkEdge]
    
    enum CodingKeys: String, CodingKey {
        case title
        case description
        case nodes
        case edges
        // 排除type属性，使用默认值
    }
}

/// 网络图节点
struct NetworkNode: Codable, Equatable {
    let id: String
    let label: String
    let value: Double
    let color: String
}

/// 网络图边
struct NetworkEdge: Codable, Equatable {
    let source: String
    let target: String
    let value: Double
    let color: String
}

/// 折线图数据模型
struct LineChartData: ChartData, Codable, Equatable {
    let title: String
    let description: String
    let type: ChartType = .line
    let categories: [String]
    let datasets: [LineDataset]
    
    enum CodingKeys: String, CodingKey {
        case title
        case description
        case categories
        case datasets
        // 排除type属性，使用默认值
    }
}

/// 折线图数据集
struct LineDataset: Codable, Equatable {
    let label: String
    let values: [Double]
    let color: String
    let backgroundColor: String
    let borderColor: String
    let borderWidth: Double
    let fill: Bool
}