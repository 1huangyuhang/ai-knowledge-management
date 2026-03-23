#!/bin/bash

# 文档链接检查脚本
# 用于检查所有Markdown文档中的链接是否有效

set -e

echo "=== 开始检查文档链接 ==="

# 检查当前目录是否存在
if [ ! -d "." ]; then
    echo "错误：当前目录不存在"
    exit 1
fi

# 查找所有Markdown文件
echo "查找所有Markdown文件..."
MARKDOWN_FILES=$(find . -name "*.md" | grep -v "node_modules" | grep -v ".git" | sort)

# 检查每个Markdown文件中的链接
echo "检查文档链接..."
ERROR_COUNT=0

for file in $MARKDOWN_FILES; do
    echo "处理文件: $file"
    
    # 提取文件所在目录
    file_dir=$(dirname "$file")
    
    # 提取Markdown链接 [text](url)
    links=$(grep -oE "\[.*\]\(([^)]+)\)" "$file" | grep -oE "\(([^)]+)\)" | sed 's/[()]//g')
    
    # 检查每个链接
    for link in $links; do
        # 跳过锚点链接
        if [[ $link == *"#"* ]]; then
            continue
        fi
        
        # 跳过HTTP/HTTPS链接
        if [[ $link == http* || $link == www* || $link == mailto:* || $link == tel:* ]]; then
            continue
        fi
        
        # 跳过空链接
        if [[ -z $link ]]; then
            continue
        fi
        
        # 检查文件是否存在
        if [ -f "$file_dir/$link" ] || [ -d "$file_dir/$link" ]; then
            continue
        else
            echo "错误：文件 '$file' 中的链接 '$link' 指向的文件不存在"
            ERROR_COUNT=$((ERROR_COUNT+1))
        fi
    done
done

# 输出结果
echo "=== 文档链接检查完成 ==="
if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ 所有链接都有效！"
    exit 0
else
    echo "❌ 发现 $ERROR_COUNT 个无效链接！"
    exit 1
fi
