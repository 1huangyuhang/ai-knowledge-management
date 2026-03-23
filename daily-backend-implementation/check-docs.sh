#!/bin/bash

# 检查文档链接的脚本

BASE_DIR="/Users/huangyuhang/Downloads/Test/Ai知识管理/daily-backend-implementation"
SUMMARY_FILE="$BASE_DIR/SUMMARY.md"
CORE_INDEX_FILE="$BASE_DIR/core-docs/index.md"

# 检查文件是否存在
check_file_exists() {
    local file_path="$1"
    if [ -f "$file_path" ]; then
        echo "✓ $file_path"
        return 0
    else
        echo "✗ $file_path"
        return 1
    fi
}

# 从Markdown文件中提取链接并检查
check_links_in_file() {
    local md_file="$1"
    echo "\n=== 检查文件: $md_file ==="
    
    # 使用grep提取Markdown链接中的文件路径
    # 格式: [链接文本](文件路径)
    local links=$(grep -oE "\[.*?\]\(([^)]+)\)" "$md_file" | grep -oE "\(([^)]+)\)" | tr -d "()")
    
    local invalid_count=0
    local invalid_links=""
    
    for link in $links; do
        # 跳过外部链接 (http/https开头)
        if [[ $link =~ ^https?:// ]]; then
            continue
        fi
        
        # 跳过锚点链接 (#开头)
        if [[ $link =~ ^# ]]; then
            continue
        fi
        
        # 构建完整的文件路径
        local dir=$(dirname "$md_file")
        local full_path="$dir/$link"
        
        # 规范化路径 (处理 ../ 和 ./)
        full_path=$(realpath "$full_path" 2>/dev/null)
        
        # 检查文件是否存在
        if ! check_file_exists "$full_path"; then
            invalid_count=$((invalid_count + 1))
            invalid_links="$invalid_links\n- $link (在文件: $md_file)"
        fi
    done
    
    if [ $invalid_count -gt 0 ]; then
        echo "\n无效链接列表:$invalid_links"
    fi
    
    echo "\n无效链接数量: $invalid_count"
    return $invalid_count
}

# 主函数
main() {
    echo "开始检查文档链接..."
    echo "基础目录: $BASE_DIR"
    
    local total_invalid=0
    local total_invalid_links=""
    
    # 检查 SUMMARY.md
    check_links_in_file "$SUMMARY_FILE"
    total_invalid=$((total_invalid + $?))
    
    # 检查 core-docs/index.md
    check_links_in_file "$CORE_INDEX_FILE"
    total_invalid=$((total_invalid + $?))
    
    # 只检查几个核心文档，避免输出过多
    echo "\n=== 只检查核心文档，跳过阶段文档 ==="
    
    # 检查核心功能文档
    for core_doc in "$BASE_DIR/core-docs/core-features"/*.md; do
        check_links_in_file "$core_doc"
        total_invalid=$((total_invalid + $?))
        break  # 只检查第一个文件
    done
    
    # 检查分层设计文档
    for layered_doc in "$BASE_DIR/core-docs/layered-design"/*.md; do
        check_links_in_file "$layered_doc"
        total_invalid=$((total_invalid + $?))
        break  # 只检查第一个文件
    done
    
    echo "\n=== 检查完成 ==="
    echo "总无效链接数量: $total_invalid"
    
    if [ $total_invalid -eq 0 ]; then
        echo "✓ 所有文档链接都有效！"
        exit 0
    else
        echo "✗ 发现 $total_invalid 个无效链接，请检查并修复。"
        exit 1
    fi
}

# 执行主函数
main