//
//  PieChartView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

/// 饼图组件
struct PieChartView: View {
    /// 饼图数据
    let data: PieChartData
    /// 图表大小
    let size: CGSize
    /// 是否显示图例
    let showLegend: Bool = true
    /// 是否显示百分比标签
    let showPercentageLabels: Bool = true
    /// 内边距
    let innerPadding: CGFloat = 10
    
    /// 计算图表中心点
    private var center: CGPoint {
        CGPoint(x: size.width / 2, y: size.height / 2)
    }
    
    /// 计算图表半径
    private var radius: CGFloat {
        min(size.width, size.height) / 2 - innerPadding
    }
    
    /// 计算总数值
    private var totalValue: Double {
        data.datasets.map { $0.value }.reduce(0, +)
    }
    
    /// 计算每个扇区的角度
    private func angles() -> [(start: CGFloat, end: CGFloat)] {
        var angles: [(start: CGFloat, end: CGFloat)] = []
        var currentAngle: CGFloat = -90 // 从顶部开始
        
        for dataset in data.datasets {
            let percentage = dataset.value / totalValue
            let angle = CGFloat(percentage) * 360
            angles.append((start: currentAngle, end: currentAngle + angle))
            currentAngle += angle
        }
        
        return angles
    }
    
    /// 角度转弧度
    private func toRadians(_ degrees: CGFloat) -> CGFloat {
        degrees * .pi / 180.0
    }
    
    /// 计算扇区的路径
    private func sectorPath(startAngle: CGFloat, endAngle: CGFloat) -> Path {
        Path {
            path in
            path.move(to: center)
            path.addArc(
                center: center,
                radius: radius,
                startAngle: Angle(radians: toRadians(startAngle)),
                endAngle: Angle(radians: toRadians(endAngle)),
                clockwise: false
            )
            path.closeSubpath()
        }
    }
    
    /// 计算标签位置
    private func labelPosition(startAngle: CGFloat, endAngle: CGFloat) -> CGPoint {
        let midAngle = (startAngle + endAngle) / 2
        let labelRadius = radius * 0.6 // 标签位于扇区的60%位置
        let x = center.x + cos(toRadians(midAngle)) * labelRadius
        let y = center.y + sin(toRadians(midAngle)) * labelRadius
        return CGPoint(x: x, y: y)
    }
    
    /// 计算百分比文本
    private func percentageText(for value: Double) -> String {
        let percentage = (value / totalValue) * 100
        return String(format: "%.1f%%", percentage)
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
                    // 绘制饼图
                    let chartAngles = angles()
                    ForEach(Array(zip(data.datasets, chartAngles)), id: \.0.label) { dataset, angleRange in
                        let path = sectorPath(startAngle: angleRange.start, endAngle: angleRange.end)
                        ZStack {
                            path.fill(Color(hex: dataset.backgroundColor))
                            path.stroke(Color(hex: dataset.color), lineWidth: 1)
                        }
                        
                        // 百分比标签
                        if showPercentageLabels {
                            let labelPos = labelPosition(startAngle: angleRange.start, endAngle: angleRange.end)
                            Text(percentageText(for: dataset.value))
                                .font(.caption)
                                .fontWeight(.semibold)
                                .foregroundColor(.white)
                                .position(labelPos)
                        }
                    }
                }
                .frame(width: size.width, height: size.height)
            }
            .frame(width: size.width, height: size.height)
            
            // 图例
            if showLegend && !data.datasets.isEmpty {
                VStack(alignment: .leading, spacing: 8) {
                    ForEach(data.datasets, id: \.label) {
                        dataset in
                        HStack {
                            ZStack {
                                Rectangle()
                                    .fill(Color(hex: dataset.backgroundColor))
                                Rectangle()
                                    .stroke(Color(hex: dataset.color), lineWidth: 1)
                            }
                            .frame(width: 12, height: 12)
                            Text(dataset.label)
                                .font(.caption)
                            Spacer()
                            Text(percentageText(for: dataset.value))
                                .font(.caption)
                        }
                    }
                }
                .padding(.top, 16)
                .padding(.horizontal, 20)
            }
        }
    }
}

/// 预览
struct PieChartView_Previews: PreviewProvider {
    static var previews: some View {
        let data = PieChartData(
            title: "知识领域分布",
            description: "用户知识领域分布",
            datasets: [
                PieDataset(
                    label: "数学",
                    value: 85,
                    color: "#4F46E5",
                    backgroundColor: "#4F46E5"
                ),
                PieDataset(
                    label: "物理",
                    value: 78,
                    color: "#EF4444",
                    backgroundColor: "#EF4444"
                ),
                PieDataset(
                    label: "化学",
                    value: 65,
                    color: "#10B981",
                    backgroundColor: "#10B981"
                ),
                PieDataset(
                    label: "生物",
                    value: 72,
                    color: "#F59E0B",
                    backgroundColor: "#F59E0B"
                ),
                PieDataset(
                    label: "计算机",
                    value: 90,
                    color: "#8B5CF6",
                    backgroundColor: "#8B5CF6"
                )
            ]
        )
        
        PieChartView(data: data, size: CGSize(width: 300, height: 300))
            .padding()
            .previewLayout(.sizeThatFits)
    }
}