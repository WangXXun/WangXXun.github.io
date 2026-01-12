# GitHub Pages 部署指南

## 部署步骤

由于你的仓库名是 `WangXXun.github.io`，GitHub Pages 会自动使用 `master` 分支的根目录内容作为网站。

### 方法一：手动部署（推荐）

1. **构建项目**
   ```bash
   npm run build
   ```

2. **将构建文件复制到根目录**
   ```bash
   # 备份旧文件（如果需要）
   # 然后复制 out 目录的内容到根目录
   cp -r out/* .
   ```

3. **提交并推送**
   ```bash
   git add .
   git commit -m "Deploy Next.js site to GitHub Pages"
   git push origin master
   ```

4. **等待部署**
   - 访问 https://wangxxun.github.io
   - 通常需要几分钟时间生效

### 方法二：使用 GitHub Actions 自动部署（推荐用于未来更新）

创建一个 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - master

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### 注意事项

1. **basePath 配置**：由于仓库名是 `WangXXun.github.io`，不需要设置 `basePath`
2. **静态资源**：确保所有资源路径都是相对路径
3. **404 页面**：Next.js 的 404 页面会自动处理
4. **更新内容**：每次更新后需要重新构建并推送

### 故障排除

如果网站无法访问：
1. 检查 GitHub Pages 设置：Settings > Pages
2. 确保源分支是 `master`
3. 检查构建是否有错误
4. 查看 GitHub Actions 日志（如果使用）
