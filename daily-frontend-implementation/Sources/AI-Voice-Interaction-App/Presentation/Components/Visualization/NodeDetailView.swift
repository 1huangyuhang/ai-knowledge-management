//
//  NodeDetailView.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import SwiftUI

struct NodeDetailView: View {
    let node: VisualizationNode
    let onClose: () -> Void
    let onEdit: () -> Void
    let onDelete: () -> Void
    let onViewConcept: () -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // 标题栏
            HStack {
                Text("节点详情")
                    .font(.headline)
                    .foregroundColor(.primary)
                Spacer()
                Button(action: onClose) {
                    Image(systemName: "xmark")
                        .foregroundColor(.secondary)
                }
            }
            
            // 节点基本信息
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Circle()
                        .fill(getNodeColor())
                        .frame(width: 40, height: 40)
                        .overlay(
                            getNodeIcon()
                                .font(.system(size: 20))
                                .foregroundColor(.white)
                        )
                    
                    VStack(alignment: .leading) {
                        Text(node.label)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .foregroundColor(.primary)
                        Text(getNodeTypeName())
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .padding(.leading, 12)
                }
                
                Divider()
                
                // 属性列表
                VStack(alignment: .leading, spacing: 6) {
                    PropertyRow(label: "ID", value: node.id)
                    PropertyRow(label: "概念ID", value: node.conceptId)
                    PropertyRow(label: "类型", value: getNodeTypeName())
                    PropertyRow(label: "大小", value: String(format: "%.0fpx", node.size))
                }
            }
            .padding()
            .background(Color.secondary)
            .cornerRadius(8)
            
            // 操作按钮
            HStack(spacing: 12) {
                Button(action: onEdit) {
                    Label("编辑", systemImage: "pencil")
                        .font(.caption)
                }
                .buttonStyle(PrimaryButtonStyle())
                
                Button(action: onDelete) {
                    Label("删除", systemImage: "trash")
                        .font(.caption)
                }
                .buttonStyle(DangerButtonStyle())
                
                Spacer()
                
                Button(action: onViewConcept) {
                    Label("查看概念", systemImage: "doc.text")
                        .font(.caption)
                }
                .buttonStyle(SecondaryButtonStyle())
            }
        }
        .padding()
        .background(Color.white)
        .cornerRadius(12)
        .shadow(color: .black.opacity(0.1), radius: 10, x: 0, y: 5)
        .frame(maxWidth: 300)
    }
    
    // 属性行组件
    struct PropertyRow: View {
        let label: String
        let value: String
        
        var body: some View {
            HStack {
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(width: 60, alignment: .leading)
                Text(value)
                    .font(.caption)
                    .foregroundColor(.primary)
                    .lineLimit(1)
                    .truncationMode(.tail)
            }
        }
    }
    
    // 获取节点颜色
    private func getNodeColor() -> Color {
        switch node.type {
        case .core:
            return .blue
        case .secondary:
            return .green
        case .related:
            return .purple
        case .external:
            return .gray
        }
    }
    
    // 获取节点图标
    private func getNodeIcon() -> Image {
        switch node.type {
        case .core:
            return Image(systemName: "star.fill")
        case .secondary:
            return Image(systemName: "circle.fill")
        case .related:
            return Image(systemName: "link")
        case .external:
            return Image(systemName: "arrow.up.right.square.fill")
        }
    }
    
    // 获取节点类型名称
    private func getNodeTypeName() -> String {
        switch node.type {
        case .core:
            return "核心概念"
        case .secondary:
            return "次要概念"
        case .related:
            return "相关概念"
        case .external:
            return "外部概念"
        }
    }
}