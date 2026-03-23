//
//  BarChartView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

/// 柱状图组件
struct BarChartView: View {
    /// 柱状图数据
    let data: BarChartData
    /// 图表大小
    let size: CGSize
    /// 是否显示标签
    let showLabels: Bool = true
    /// 是否显示图例
    let showLegend: Bool = true
    /// 柱子间距
    let barSpacing: CGFloat = 4
    /// 组间距
    let groupSpacing: CGFloat = 16
    
    /// 计算图表边距
    private var chartInsets: EdgeInsets {
        EdgeInsets(top: showLegend ? 20 : 10, leading: 40, bottom: showLabels ? 40 : 20, trailing: 20)
    }
    
    /// 计算图表绘制区域
    private var chartArea: CGRect {
        CGRect(
            x: chartInsets.leading,
            y: chartInsets.top,
            width: size.width - chartInsets.leading - chartInsets.trailing,
            height: size.height - chartInsets.top - chartInsets.bottom
        )
    }
    
    /// 计算最大Y值
    private var maxYValue: Double {
        data.datasets.flatMap { $0.values }.max() ?? 1.0
    }
    
    /// 计算Y轴刻度
    private func yAxisTicks() -> [Double] {
        let max = maxYValue
        let step = max / 5 // 5个刻度
        return (0...5).map { Double($0) * step }
    }
    
    /// 将值转换为Y坐标
    private func valueToY(_ value: Double) -> CGFloat {
        let maxValue = maxYValue
        let normalizedValue = CGFloat(value / maxValue)
        return chartArea.maxY - (normalizedValue * chartArea.height)
    }
    
    /// 计算柱子宽度
    private var barWidth: CGFloat {
        let datasetCount = CGFloat(data.datasets.count)
        let categoryCount = CGFloat(data.categories.count)
        let totalSpacing = barSpacing * (datasetCount - 1) + groupSpacing * (categoryCount - 1)
        let availableWidth = chartArea.width - totalSpacing
        return availableWidth / (datasetCount * categoryCount)
    }
    
    /// 计算柱子X位置
    private func barXPosition(forDataset index: Int, categoryIndex: Int) -> CGFloat {
        let datasetCount = CGFloat(data.datasets.count)
        let categoryOffset = (barWidth * datasetCount + groupSpacing) * CGFloat(categoryIndex)
        let datasetOffset = barWidth * CGFloat(index) + barSpacing * CGFloat(index)
        return chartArea.minX + categoryOffset + datasetOffset
    }
    
    /// 绘制坐标轴
    private func drawAxis() -> some Shape {
        Path {
            path in
            // X轴
            path.move(to: CGPoint(x: chartArea.minX, y: chartArea.maxY))
            path.addLine(to: CGPoint(x: chartArea.maxX, y: chartArea.maxY))
            
            // Y轴
            path.move(to: CGPoint(x: chartArea.minX, y: chartArea.minY))
            path.addLine(to: CGPoint(x: chartArea.minX, y: chartArea.maxY))
            
            // Y轴刻度线
            for tick in yAxisTicks() {
                let y = valueToY(tick)
                path.move(to: CGPoint(x: chartArea.minX - 5, y: y))
                path.addLine(to: CGPoint(x: chartArea.minX, y: y))
            }
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
                    // 背景网格线
                    self.backgroundGridLines
                    
                    // 坐标轴
                    drawAxis()
                        .stroke(Color.gray, lineWidth: 1.5)
                    
                    // 绘制柱状图
                    self.barChartContent
                    
                    // Y轴标签
                    self.yAxisLabels
                    
                    // X轴标签
                    if showLabels {
                        self.xAxisLabels
                    }
                }
                .frame(width: size.width, height: size.height)
            }
            .frame(width: size.width, height: size.height)
            
            // 图例
            if showLegend && !data.datasets.isEmpty {
                self.legendContent
            }
        }
    }
    
    /// 背景网格线
    private var backgroundGridLines: some View {
        Path {
            path in
            for tick in yAxisTicks() {
                let y = valueToY(tick)
                path.move(to: CGPoint(x: chartArea.minX, y: y))
                path.addLine(to: CGPoint(x: chartArea.maxX, y: y))
            }
        }
        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
    }
    
    /// 柱状图内容
    private var barChartContent: some View {
        ForEach(data.datasets, id: \.label) { dataset in
            ForEach(Array(zip(dataset.values.indices, dataset.values)), id: \.0) { valueIndex, value in
                self.barItem(dataset: dataset, valueIndex: valueIndex, value: value)
            }
        }
    }
    
    /// 单个柱状图元素
    private func barItem(dataset: BarDataset, valueIndex: Int, value: Double) -> some View {
        let datasetIndex = data.datasets.firstIndex(where: { $0.label == dataset.label }) ?? 0
        let x = barXPosition(forDataset: datasetIndex, categoryIndex: valueIndex)
        let y = valueToY(value)
        let height = chartArea.maxY - y
        
        // 先创建基础形状，然后应用修饰符
        let barShape = Rectangle()
            .frame(width: barWidth, height: height)
            .position(x: x + barWidth / 2, y: y + height / 2)
        
        return ZStack {
            // 填充矩形
            barShape.foregroundColor(Color(hex: dataset.backgroundColor))
            
            // 描边矩形 - 重新创建一个矩形用于描边
            Rectangle()
                .stroke(Color(hex: dataset.color), lineWidth: 1)
                .frame(width: barWidth, height: height)
                .position(x: x + barWidth / 2, y: y + height / 2)
            
            // 值标签
            Text(String(format: "%.0f", value))
                .font(.caption2)
                .position(x: x + barWidth / 2, y: y - 8)
        }
    }
    
    /// Y轴标签
    private var yAxisLabels: some View {
        ForEach(yAxisTicks(), id: \.self) { tick in
            let y = valueToY(tick)
            Text(String(format: "%.0f", tick))
                .font(.caption2)
                .position(x: chartArea.minX - 20, y: y)
        }
    }
    
    /// X轴标签
    private var xAxisLabels: some View {
        ForEach(Array(zip(data.categories.indices, data.categories)), id: \.0) { index, category in
            let x = barXPosition(forDataset: 0, categoryIndex: index) + (barWidth * CGFloat(data.datasets.count)) / 2
            Text(category)
                .font(.caption2)
                .rotationEffect(.degrees(-45))
                .position(x: x, y: chartArea.maxY + 20)
        }
    }
    
    /// 图例内容
    private var legendContent: some View {
        HStack {
            ForEach(data.datasets, id: \.label) { dataset in
                HStack {
                    ZStack {
                        // 填充矩形
                        Rectangle()
                            .frame(width: 12, height: 12)
                            .foregroundColor(Color(hex: dataset.backgroundColor))
                        
                        // 描边矩形 - 先应用stroke，再应用frame
                        Rectangle()
                            .stroke(Color(hex: dataset.color), lineWidth: 1)
                            .frame(width: 12, height: 12)
                    }
                    Text(dataset.label)
                        .font(.caption)
                }
                .padding(.horizontal, 8)
            }
        }
        .padding(.top, 8)
    }
}

/// 预览
struct BarChartView_Previews: PreviewProvider {
    static var previews: some View {
        let data = BarChartData(
            title: "知识领域分布",
            description: "不同知识领域的掌握程度",
            categories: ["数学", "物理", "化学", "生物", "计算机"],
            datasets: [
                BarDataset(
                    label: "用户",
                    values: [85, 78, 65, 72, 90],
                    color: "#4F46E5",
                    backgroundColor: "#4F46E5"
                ),
                BarDataset(
                    label: "平均值",
                    values: [75, 80, 70, 78, 82],
                    color: "#EF4444",
                    backgroundColor: "#EF4444"
                )
            ]
        )
        
        BarChartView(data: data, size: CGSize(width: 400, height: 300))
            .padding()
            .previewLayout(.sizeThatFits)
    }
}