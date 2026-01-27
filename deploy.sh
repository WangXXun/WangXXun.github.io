#!/bin/bash

# 构建 Next.js 项目
echo "Building Next.js project..."
npm run build

# 将构建产物复制到根目录
echo "Copying build output to root..."
cp -r out/* .

# 添加 .nojekyll 文件（防止 GitHub Pages 使用 Jekyll）
touch .nojekyll

echo "Deployment files ready! Now commit and push:"
echo "  git add ."
echo "  git commit -m 'Deploy to GitHub Pages'"
echo "  git push origin master"
