//
//  RadarChartView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

/// 雷达图组件
struct RadarChartView: View {
    /// 雷达图数据
    let data: RadarChartData
    /// 图表大小
    let size: CGSize
    /// 网格层数
    let gridLevels: Int = 5
    /// 是否显示标签
    let showLabels: Bool = true
    /// 是否显示图例
    let showLegend: Bool = true
    
    /// 计算中心点
    private var center: CGPoint {
        CGPoint(x: size.width / 2, y: size.height / 2)
    }
    
    /// 计算半径
    private var radius: CGFloat {
        min(size.width, size.height) / 2 - (showLabels ? 30 : 10)
    }
    
    /// 计算每个角度
    private func angleForIndex(_ index: Int) -> CGFloat {
        let angle = (2 * .pi / CGFloat(data.categories.count)) * CGFloat(index)
        return angle - .pi / 2 // 从顶部开始
    }
    
    /// 计算点的位置
    private func pointForValue(_ value: Double, atIndex index: Int) -> CGPoint {
        let angle = angleForIndex(index)
        let maxValue = data.datasets.flatMap { $0.values }.max() ?? 1.0
        let normalizedValue = CGFloat(value / maxValue)
        let x = center.x + cos(angle) * radius * normalizedValue
        let y = center.y + sin(angle) * radius * normalizedValue
        return CGPoint(x: x, y: y)
    }
    
    /// 绘制网格线
    private func drawGrid() -> Path {
        return Path {
            path in
            
            // 绘制同心圆
            for i in 1...gridLevels {
                let levelRadius = radius * CGFloat(i) / CGFloat(gridLevels)
                path.addArc(center: center, radius: levelRadius, startAngle: Angle(degrees: 0), endAngle: Angle(degrees: 360), clockwise: false)
            }
            
            // 绘制轴线
            for index in 0..<data.categories.count {
                let angle = angleForIndex(index)
                let endX = center.x + cos(angle) * radius
                let endY = center.y + sin(angle) * radius
                path.move(to: center)
                path.addLine(to: CGPoint(x: endX, y: endY))
            }
        }
    }
    
    /// 绘制数据集
    private func drawDataset(_ dataset: RadarDataset) -> Path {
        return Path {
            path in
            
            // 移动到第一个点
            let firstPoint = pointForValue(dataset.values[0], atIndex: 0)
            path.move(to: firstPoint)
            
            // 绘制线段到其他点
            for index in 1..<dataset.values.count {
                let point = pointForValue(dataset.values[index], atIndex: index)
                path.addLine(to: point)
            }
            
            // 闭合路径
            path.closeSubpath()
        }
    }
    
    var body: some View {
        VStack {
            // 标题
            Text(data.title)
                .font(.headline)
                .padding(.bottom, 8)
            
            // 图表容器
            GeometryReader {
                geometry in
                ZStack {
                    // 网格线
                    drawGrid()
                        .stroke(Color.gray.opacity(0.3), lineWidth: 1)
                    
                    // 绘制数据集
                    ForEach(data.datasets, id: \.label) { dataset in
                        let datasetPath = drawDataset(dataset)
                        ZStack {
                            datasetPath.fill(Color(hex: dataset.fillColor).opacity(0.3))
                            datasetPath.stroke(Color(hex: dataset.color), lineWidth: 2)
                        }
                    }
                    
                    // 数据点
                    ForEach(data.datasets, id: \.label) { dataset in
                        ForEach(Array(zip(dataset.values.indices, dataset.values)), id: \.0) { valueIndex, value in
                            let point = pointForValue(value, atIndex: valueIndex)
                            Circle()
                                .fill(Color(hex: dataset.color))
                                .frame(width: 6, height: 6)
                                .position(point)
                        }
                    }
                    
                    // 标签
                    if showLabels {
                        ForEach(Array(zip(data.categories.indices, data.categories)), id: \.0) { index, category in
                            let angle = angleForIndex(index)
                            let labelX = center.x + cos(angle) * (radius + 20)
                            let labelY = center.y + sin(angle) * (radius + 20)
                            Text(category)
                                .font(.caption)
                                .position(x: labelX, y: labelY)
                        }
                    }
                }
                .frame(width: size.width, height: size.height)
            }
            .frame(width: size.width, height: size.height)
            
            // 图例
            if showLegend && !data.datasets.isEmpty {
                HStack {
                    ForEach(data.datasets, id: \.label) { dataset in
                        HStack {
                            Circle()
                                .fill(Color(hex: dataset.color))
                                .frame(width: 12, height: 12)
                            Text(dataset.label)
                                .font(.caption)
                        }
                        .padding(.horizontal, 8)
                    }
                }
                .padding(.top, 8)
            }
        }
    }
}



/// 预览
struct RadarChartView_Previews: PreviewProvider {
    static var previews: some View {
        let data = RadarChartData(
            title: "思考类型分析",
            description: "用户思考类型分布",
            categories: ["逻辑思维", "创造性思维", "批判性思维", "系统思维", "情感思维"],
            datasets: [
                RadarDataset(
                    label: "用户",
                    values: [80, 65, 75, 70, 85],
                    color: "#4F46E5",
                    fillColor: "#4F46E5"
                ),
                RadarDataset(
                    label: "平均值",
                    values: [70, 75, 70, 80, 75],
                    color: "#EF4444",
                    fillColor: "#EF4444"
                )
            ]
        )
        
        RadarChartView(data: data, size: CGSize(width: 300, height: 300))
            .padding()
            .previewLayout(.sizeThatFits)
    }
}