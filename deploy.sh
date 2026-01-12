#!/bin/bash

# GitHub Pages 部署脚本
# 这个脚本会将构建好的静态文件部署到 GitHub Pages

echo "🚀 开始构建项目..."
npm run build

if [ $? -ne 0 ]; then
  echo "❌ 构建失败，请检查错误信息"
  exit 1
fi

echo "✅ 构建成功！"
echo "📦 构建文件在 out/ 目录中"
echo ""
echo "📝 接下来的步骤："
echo "1. 将 out/ 目录中的内容复制到仓库根目录"
echo "2. 提交并推送到 GitHub"
echo ""
echo "或者运行以下命令自动部署："
echo "  git add ."
echo "  git commit -m 'Deploy Next.js site to GitHub Pages'"
echo "  git push origin master"
echo ""
echo "⚠️  注意：由于仓库名是 WangXXun.github.io，GitHub Pages 会自动使用 master 分支的根目录内容"
