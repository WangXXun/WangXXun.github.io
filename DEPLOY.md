# GitHub Pages 部署指南

## 重要：禁用 Jekyll

GitHub Pages 默认会尝试使用 Jekyll 构建。对于 Next.js 项目，需要：

1. **创建 `.nojekyll` 文件**（已创建）
2. **删除或忽略 Jekyll 相关文件**：
   - `Gemfile`
   - `_config.yml`
   - `Rakefile`
   - 其他 Jekyll 文件

## 部署步骤

### 方法一：手动部署（推荐）

1. **构建项目**
   ```bash
   npm run build
   ```

2. **确保 .nojekyll 文件存在**
   ```bash
   touch .nojekyll
   ```

3. **删除 Jekyll 相关文件**（如果存在）
   ```bash
   rm -f Gemfile _config.yml Rakefile
   ```

4. **将构建文件复制到根目录**
   ```bash
   cp -r out/* .
   ```

5. **提交并推送**
   ```bash
   git add .
   git commit -m "Deploy Next.js site to GitHub Pages"
   git push origin master
   ```

6. **在 GitHub 设置中**
   - 进入仓库 Settings > Pages
   - Source 选择 `master` 分支，文件夹选择 `/ (root)`
   - **重要**：确保 "Build with Jekyll" 选项是关闭的（如果看到的话）

7. **等待部署**
   - 访问：https://wangxxun.github.io
   - 通常需要 1-2 分钟生效

### 方法二：使用部署脚本

```bash
./deploy-to-gh-pages.sh
```

## 故障排除

### 错误：There was an error parsing `Gemfile`

**原因**：GitHub Pages 检测到 `Gemfile`，尝试使用 Jekyll 构建

**解决方案**：
1. 删除 `Gemfile` 文件
2. 确保 `.nojekyll` 文件存在并已提交
3. 重新提交并推送

```bash
rm -f Gemfile
touch .nojekyll
git add .nojekyll
git rm Gemfile
git commit -m "Remove Jekyll files, add .nojekyll"
git push origin master
```

### 网站显示 404

1. 检查 GitHub Pages 设置是否正确
2. 确保 `.nojekyll` 文件在根目录
3. 检查构建文件是否正确复制到根目录
4. 等待几分钟让 GitHub 完成部署

### 资源加载失败

确保 `next.config.js` 中 `basePath` 和 `assetPrefix` 都设置为空字符串（对于 `username.github.io` 仓库）
