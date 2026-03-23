//
//  AnimatedChartViews.swift
//  AI-Voice-Interaction-App
//
//  Created by Huang Yuhang on 2026/1/13.
//

import SwiftUI
import Charts

// 雷达图数据点结构体
struct RadarChartDataPoint: Identifiable, Equatable {
    let id: UUID
    let category: String
    let value: Double
    let color: Color
    
    static func == (lhs: RadarChartDataPoint, rhs: RadarChartDataPoint) -> Bool {
        return lhs.id == rhs.id && lhs.category == rhs.category && lhs.value == rhs.value && lhs.color == rhs.color
    }
}

// 柱状图数据点结构体
struct BarChartDataPoint: Identifiable, Equatable {
    let id: UUID
    let category: String
    let value: Double
    let color: Color
    
    static func == (lhs: BarChartDataPoint, rhs: BarChartDataPoint) -> Bool {
        return lhs.id == rhs.id && lhs.category == rhs.category && lhs.value == rhs.value && lhs.color == rhs.color
    }
}

// 饼图数据点结构体
struct PieChartDataPoint: Identifiable, Equatable {
    let id: UUID
    let category: String
    let value: Double
    let color: Color
    let percentage: Double?
    
    static func == (lhs: PieChartDataPoint, rhs: PieChartDataPoint) -> Bool {
        return lhs.id == rhs.id && lhs.category == rhs.category && lhs.value == rhs.value && lhs.color == rhs.color && lhs.percentage == rhs.percentage
    }
}

// 图例项视图
struct LegendItemView: View {
    let color: Color
    let label: String
    let value: String
    
    var body: some View {
        HStack(spacing: 6) {
            Circle()
                .fill(color)
                .frame(width: 12, height: 12)
            Text("\(label): \(value)")
                .font(.caption2)
                .foregroundColor(.secondary)
        }
    }
}

// 动画雷达图组件
struct AnimatedRadarChartView: View {
    let data: [RadarChartDataPoint]
    let title: String
    @State private var animateData: [RadarChartDataPoint]
    @State private var isAnimating = false
    
    init(data: [RadarChartDataPoint], title: String) {
        self.data = data
        self.title = title
        // 初始化动画数据，所有值为0
        self._animateData = State(initialValue: data.map { 
            RadarChartDataPoint(
                id: $0.id,
                category: $0.category,
                value: 0,
                color: $0.color
            )
        })
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            
            // 动画雷达图
            Chart {
                ForEach(animateData) { dataPoint in
                    AreaMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(LinearGradient(
                        gradient: Gradient(colors: [dataPoint.color, dataPoint.color.opacity(0.3)]),
                        startPoint: .top,
                        endPoint: .bottom
                    ))
                    .interpolationMethod(.catmullRom)
                    
                    LineMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(dataPoint.color)
                    .lineStyle(StrokeStyle(lineWidth: 2))
                    .interpolationMethod(.catmullRom)
                    
                    PointMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(dataPoint.color)
                    .symbolSize(80)
                }
            }
            .frame(height: 300)
            .chartLegend(.hidden)
            .chartYScale(domain: 0...100)
            .onAppear {
                startAnimation()
            }
            .onChange(of: data) { _ in
                startAnimation()
            }
            
            // 图例
            HStack(spacing: 12) {
                ForEach(data) { dataPoint in
                    LegendItemView(
                        color: dataPoint.color,
                        label: dataPoint.category,
                        value: String(format: "%.1f", dataPoint.value)
                    )
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.leading, 16)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // 开始动画
    private func startAnimation() {
        isAnimating = true
        
        // 动画时长
        let duration: Double = 1.5
        let startTime = Date()
        
        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { timer in
            let elapsedTime = Date().timeIntervalSince(startTime)
            let progress = min(elapsedTime / duration, 1.0)
            
            // 使用缓动函数
            let easeOutProgress = 1.0 - pow(1.0 - progress, 3)
            
            // 更新动画数据
            animateData = data.enumerated().map { index, original in
                let animatedValue = original.value * easeOutProgress
                return RadarChartDataPoint(
                    id: original.id,
                    category: original.category,
                    value: animatedValue,
                    color: original.color
                )
            }
            
            // 动画结束
            if progress >= 1.0 {
                timer.invalidate()
                isAnimating = false
            }
        }
    }
}

// 动画柱状图组件
struct AnimatedBarChartView: View {
    let data: [BarChartDataPoint]
    let title: String
    @State private var animateData: [BarChartDataPoint]
    @State private var isAnimating = false
    
    init(data: [BarChartDataPoint], title: String) {
        self.data = data
        self.title = title
        // 初始化动画数据，所有值为0
        self._animateData = State(initialValue: data.map { 
            BarChartDataPoint(
                id: $0.id,
                category: $0.category,
                value: 0,
                color: $0.color
            )
        })
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            chartTitle
            
            // 动画柱状图
            chartContent
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // MARK: - Helper Views
    
    private var chartTitle: some View {
        Text(title)
            .font(.headline)
            .foregroundColor(.primary)
    }
    
    private var chartContent: some View {
        Chart {
            ForEach(animateData) { dataPoint in
                BarMark(
                    x: .value("Category", dataPoint.category),
                    y: .value("Value", dataPoint.value)
                )
                .foregroundStyle(dataPoint.color)
                .annotation(position: .top, alignment: .center) {
                    Text(String(format: "%.1f", dataPoint.value))
                        .font(.caption)
                        .foregroundColor(.primary)
                }
            }
        }
        .frame(height: 300)
        .chartLegend(.hidden)
        .chartYScale(domain: 0...100)
        .onAppear {
            startAnimation()
        }
        .onChange(of: data) { _ in
            startAnimation()
        }
    }
    
    // 开始动画
    private func startAnimation() {
        isAnimating = true
        
        // 动画时长
        let duration: Double = 1.5
        let startTime = Date()
        
        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) {
            timer in
            let elapsedTime = Date().timeIntervalSince(startTime)
            let progress = min(elapsedTime / duration, 1.0)
            
            // 使用缓动函数
            let easeOutProgress = 1.0 - pow(1.0 - progress, 3)
            
            // 更新动画数据
            animateData = data.enumerated().map { index, original in
                let animatedValue = original.value * easeOutProgress
                return BarChartDataPoint(
                    id: original.id,
                    category: original.category,
                    value: animatedValue,
                    color: original.color
                )
            }
            
            // 动画结束
            if progress >= 1.0 {
                timer.invalidate()
                isAnimating = false
            }
        }
    }
}

// 简化的动画饼图组件
struct AnimatedPieChartView: View {
    let data: [PieChartDataPoint]
    let title: String
    @State private var animateData: [PieChartDataPoint]
    @State private var isAnimating = false
    
    init(data: [PieChartDataPoint], title: String) {
        self.data = data
        self.title = title
        // 初始化动画数据，所有值为0
        self._animateData = State(initialValue: data.map { 
            PieChartDataPoint(
                id: $0.id,
                category: $0.category,
                value: 0,
                color: $0.color,
                percentage: 0
            )
        })
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题
            Text(title)
                .font(.headline)
                .foregroundColor(.primary)
            
            // 简化的饼图 - 使用 Charts BarMark 配合极坐标
            Chart {
                ForEach(animateData) { dataPoint in
                    BarMark(
                        x: .value("Category", dataPoint.category),
                        y: .value("Value", dataPoint.value)
                    )
                    .foregroundStyle(dataPoint.color)
                }
            }
            .frame(height: 300)
            .chartLegend(.hidden)
            .onAppear {
                startAnimation()
            }
            .onChange(of: data) { _ in
                startAnimation()
            }
            
            // 图例
            VStack(spacing: 8) {
                ForEach(data) { dataPoint in
                    HStack(spacing: 12) {
                        LegendItemView(
                            color: dataPoint.color,
                            label: dataPoint.category,
                            value: String(format: "%.1f%%", dataPoint.percentage ?? 0)
                        )
                        Spacer()
                    }
                }
            }
            .padding(.horizontal, 16)
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(radius: 2)
    }
    
    // 开始动画
    private func startAnimation() {
        isAnimating = true
        
        // 计算总和
        let total = data.reduce(0) { $0 + $1.value }
        
        // 动画时长
        let duration: Double = 1.5
        let startTime = Date()
        
        Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) {
            timer in
            let elapsedTime = Date().timeIntervalSince(startTime)
            let progress = min(elapsedTime / duration, 1.0)
            
            // 使用缓动函数
            let easeOutProgress = 1.0 - pow(1.0 - progress, 3)
            
            // 更新动画数据
            animateData = data.enumerated().map { index, original in
                let animatedValue = original.value * easeOutProgress
                let percentage = (animatedValue / total) * 100
                return PieChartDataPoint(
                    id: original.id,
                    category: original.category,
                    value: animatedValue,
                    color: original.color,
                    percentage: percentage
                )
            }
            
            // 动画结束
            if progress >= 1.0 {
                timer.invalidate()
                isAnimating = false
            }
        }
    }
}

