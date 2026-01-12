#!/bin/bash

# GitHub Pages 部署脚本
# 将构建好的静态文件部署到 GitHub Pages

set -e

echo "🚀 开始部署到 GitHub Pages..."

# 1. 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败，请检查错误信息"
  exit 1
fi

echo "✅ 构建成功！"

# 2. 检查 out 目录
if [ ! -d "out" ]; then
  echo "❌ out 目录不存在，构建可能失败"
  exit 1
fi

# 3. 创建 .nojekyll 文件（GitHub Pages 需要）
touch out/.nojekyll

echo ""
echo "📝 接下来的步骤："
echo ""
echo "选项 1：手动复制文件到根目录（推荐用于首次部署）"
echo "  cp -r out/* ."
echo "  git add ."
echo "  git commit -m 'Deploy Next.js site to GitHub Pages'"
echo "  git push origin master"
echo ""
echo "选项 2：使用 gh-pages 分支（推荐用于后续更新）"
echo "  git subtree push --prefix out origin gh-pages"
echo ""
echo "⚠️  注意："
echo "  - 由于仓库名是 WangXXun.github.io，GitHub Pages 会使用 master 分支的根目录"
echo "  - 如果使用选项 1，需要在 GitHub 设置中将 Pages 源设置为 master 分支"
echo "  - 如果使用选项 2，需要在 GitHub 设置中将 Pages 源设置为 gh-pages 分支"
echo ""
echo "🌐 部署后访问：https://wangxxun.github.io"
