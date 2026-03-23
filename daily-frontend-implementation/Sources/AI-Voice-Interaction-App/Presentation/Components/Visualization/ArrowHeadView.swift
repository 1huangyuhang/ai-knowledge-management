import SwiftUI

struct ArrowHeadView: View {
    let startPoint: CGPoint
    let endPoint: CGPoint
    let color: Color
    let thickness: CGFloat
    
    private let arrowHeadSize: CGFloat = 10
    
    var body: some View {
        Path {
            $0.move(to: endPoint)
            
            // 计算箭头的两个端点
            let angle = atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x)
            
            // 箭头左侧端点
            let leftPoint = CGPoint(
                x: endPoint.x - arrowHeadSize * cos(angle - .pi / 6),
                y: endPoint.y - arrowHeadSize * sin(angle - .pi / 6)
            )
            
            // 箭头右侧端点
            let rightPoint = CGPoint(
                x: endPoint.x - arrowHeadSize * cos(angle + .pi / 6),
                y: endPoint.y - arrowHeadSize * sin(angle + .pi / 6)
            )
            
            $0.addLine(to: leftPoint)
            $0.addLine(to: rightPoint)
            $0.closeSubpath()
        }
        .fill(color)
    }
}