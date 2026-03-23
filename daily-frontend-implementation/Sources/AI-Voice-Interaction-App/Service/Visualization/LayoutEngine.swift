//
//  LayoutEngine.swift
//  AI Voice Interaction App
//
//  Created by AI Assistant on 2026-01-13.
//

import Foundation
import CoreGraphics

// MARK: - Layout Engine Protocol
protocol LayoutEngineProtocol {
    func calculateLayout(nodes: [VisualizationNode], edges: [VisualizationEdge]) -> [VisualizationNode]
    func updateLayout(nodes: [VisualizationNode], edges: [VisualizationEdge], iteration: Int) -> [VisualizationNode]
    func reset()
}

// MARK: - Force Directed Layout
class ForceDirectedLayout: LayoutEngineProtocol {
    // Force-directed layout parameters
    private var repulsionForce: Double = 1000.0
    private var attractionForce: Double = 0.1
    private var dampingFactor: Double = 0.9
    private var convergenceThreshold: Double = 0.1
    private var maxIterations: Int = 100
    
    // State
    private var velocities: [String: CGPoint] = [:]
    
    func calculateLayout(nodes: [VisualizationNode], edges: [VisualizationEdge]) -> [VisualizationNode] {
        reset()
        
        var currentNodes = nodes
        
        // Initialize velocities
        for node in currentNodes {
            velocities[node.id] = CGPoint.zero
        }
        
        // Run multiple iterations to stabilize layout
        for iteration in 0..<maxIterations {
            let updatedNodes = updateLayout(nodes: currentNodes, edges: edges, iteration: iteration)
            currentNodes = updatedNodes
            
            // Check for convergence
            let totalVelocity = velocities.values.reduce(0.0) { $0 + sqrt(pow($1.x, 2) + pow($1.y, 2)) }
            if totalVelocity < convergenceThreshold {
                break
            }
        }
        
        return currentNodes
    }
    
    func updateLayout(nodes: [VisualizationNode], edges: [VisualizationEdge], iteration: Int) -> [VisualizationNode] {
        var forces: [String: CGPoint] = [:]
        for node in nodes {
            forces[node.id] = CGPoint.zero
        }
        
        // Calculate repulsive forces between all nodes
        for i in 0..<nodes.count {
            for j in i+1..<nodes.count {
                let node1 = nodes[i]
                let node2 = nodes[j]
                
                let deltaX = node1.position.x - node2.position.x
                let deltaY = node1.position.y - node2.position.y
                let distance = sqrt(deltaX * deltaX + deltaY * deltaY)
                
                if distance > 0 {
                    let force = repulsionForce / (distance * distance)
                    let directionX = deltaX / distance
                    let directionY = deltaY / distance
                    
                    forces[node1.id]?.x += directionX * force
                    forces[node1.id]?.y += directionY * force
                    
                    forces[node2.id]?.x -= directionX * force
                    forces[node2.id]?.y -= directionY * force
                }
            }
        }
        
        // Calculate attractive forces for connected nodes
        for edge in edges {
            guard let fromNode = nodes.first(where: { $0.id == edge.sourceId }),
                  let toNode = nodes.first(where: { $0.id == edge.targetId }) else {
                continue
            }
            
            let deltaX = toNode.position.x - fromNode.position.x
            let deltaY = toNode.position.y - fromNode.position.y
            let distance = sqrt(deltaX * deltaX + deltaY * deltaY)
            
            let force = attractionForce * distance
            let directionX = deltaX / distance
            let directionY = deltaY / distance
            
            forces[fromNode.id]?.x += directionX * force
            forces[fromNode.id]?.y += directionY * force
            
            forces[toNode.id]?.x -= directionX * force
            forces[toNode.id]?.y -= directionY * force
        }
        
        // Update velocities and positions
        var updatedNodes: [VisualizationNode] = []
        for node in nodes {
            guard var velocity = velocities[node.id],
                  let force = forces[node.id] else {
                updatedNodes.append(node)
                continue
            }
            
            // Update velocity
            velocity.x = (velocity.x + force.x) * dampingFactor
            velocity.y = (velocity.y + force.y) * dampingFactor
            velocities[node.id] = velocity
            
            // Update position
            let newPosition = CGPoint(
                x: node.position.x + velocity.x,
                y: node.position.y + velocity.y
            )
            
            let updatedNode = VisualizationNode(
                id: node.id,
                label: node.label,
                type: node.type,
                position: newPosition,
                size: node.size,
                conceptId: node.conceptId,
                level: node.level,
                description: node.description
            )
            
            updatedNodes.append(updatedNode)
        }
        
        return updatedNodes
    }
    
    func reset() {
        velocities.removeAll()
    }
}

// MARK: - Hierarchical Layout
class HierarchicalLayout: LayoutEngineProtocol {
    // Hierarchical layout parameters
    private var levelSpacing: CGFloat = 200.0
    private var nodeSpacing: CGFloat = 150.0
    private var alignment: Bool = true
    
    // State
    private var nodeLevels: [String: Int] = [:]
    private var levelNodes: [Int: [String]] = [:]
    
    func calculateLayout(nodes: [VisualizationNode], edges: [VisualizationEdge]) -> [VisualizationNode] {
        reset()
        
        // Assign levels to nodes based on hierarchical edges
        assignLevels(nodes: nodes, edges: edges)
        
        // Calculate positions based on levels
        return calculatePositions(nodes: nodes)
    }
    
    func updateLayout(nodes: [VisualizationNode], edges: [VisualizationEdge], iteration: Int) -> [VisualizationNode] {
        // Hierarchical layout is mostly static, but can be refined
        return calculateLayout(nodes: nodes, edges: edges)
    }
    
    func reset() {
        nodeLevels.removeAll()
        levelNodes.removeAll()
    }
    
    private func assignLevels(nodes: [VisualizationNode], edges: [VisualizationEdge]) {
        // Identify root nodes (nodes with no incoming hierarchical edges)
        let allNodeIds = Set(nodes.map { $0.id })
        let incomingEdgeNodes = Set(edges
            .filter { $0.type == .hierarchical }
            .map { $0.targetId })
        let rootNodeIds = allNodeIds.subtracting(incomingEdgeNodes)
        
        // Assign level 0 to root nodes
        for rootNodeId in rootNodeIds {
            assignLevel(nodeId: rootNodeId, level: 0, edges: edges)
        }
        
        // Assign levels to remaining nodes (non-hierarchical)
        for node in nodes {
            if nodeLevels[node.id] == nil {
                nodeLevels[node.id] = 0
                levelNodes[0, default: []].append(node.id)
            }
        }
    }
    
    private func assignLevel(nodeId: String, level: Int, edges: [VisualizationEdge]) {
        // Skip if already assigned a lower or equal level
        if let existingLevel = nodeLevels[nodeId], existingLevel <= level {
            return
        }
        
        // Assign level
        nodeLevels[nodeId] = level
        levelNodes[level, default: []].append(nodeId)
        
        // Recursively assign levels to children
        let outgoingEdges = edges.filter { $0.type == .hierarchical && $0.sourceId == nodeId }
        for edge in outgoingEdges {
            assignLevel(nodeId: edge.targetId, level: level + 1, edges: edges)
        }
    }
    
    private func calculatePositions(nodes: [VisualizationNode]) -> [VisualizationNode] {
        var updatedNodes: [VisualizationNode] = []
        
        // Calculate positions for each level
        let sortedLevels = levelNodes.keys.sorted()
        for level in sortedLevels {
            guard let levelNodeIds = levelNodes[level] else {
                continue
            }
            
            let y = CGFloat(level) * levelSpacing
            let totalWidth = CGFloat(levelNodeIds.count - 1) * nodeSpacing
            let startX = -totalWidth / 2
            
            for (index, nodeId) in levelNodeIds.enumerated() {
                guard let node = nodes.first(where: { $0.id == nodeId }) else {
                    continue
                }
                
                let x = startX + CGFloat(index) * nodeSpacing
                
                let updatedNode = VisualizationNode(
                    id: node.id,
                    label: node.label,
                    type: node.type,
                    position: CGPoint(x: x, y: y),
                    size: node.size,
                    conceptId: node.conceptId,
                    level: level,
                    description: node.description
                )
                
                updatedNodes.append(updatedNode)
            }
        }
        
        return updatedNodes
    }
}

// MARK: - Layout Engine Factory
class LayoutEngineFactory {
    static func createLayoutEngine(for type: VisualizationViewType) -> LayoutEngineProtocol {
        switch type {
        case .forceDirected:
            return ForceDirectedLayout()
        case .hierarchical:
            return HierarchicalLayout()
        case .network:
            return ForceDirectedLayout() // Network layout uses force-directed with different parameters
        }
    }
}
