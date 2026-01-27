# wangxun's website

个人网站，从零开始设计。

## 技术栈

- Next.js 14
- React 18
- TypeScript

## 开发

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看。

## 构建

```bash
npm run build
```

构建完成后，静态文件将输出到 `out` 目录。

## 部署到 GitHub Pages

### 方法一：使用部署脚本（推荐）

**Windows (PowerShell):**
```powershell
.\deploy.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy.sh
./deploy.sh
```

然后提交并推送：
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin master
```

### 方法二：手动部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **复制构建文件到根目录**
   ```bash
   # Windows (PowerShell)
   Copy-Item -Path "out\*" -Destination "." -Recurse -Force
   
   # Linux/Mac
   cp -r out/* .
   ```

3. **创建 .nojekyll 文件**（防止 GitHub Pages 使用 Jekyll）
   ```bash
   # Windows
   New-Item -ItemType File -Path ".nojekyll"
   
   # Linux/Mac
   touch .nojekyll
   ```

4. **提交并推送**
   ```bash
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin master
   ```

5. **在 GitHub 设置中启用 Pages**
   - 进入仓库 Settings > Pages
   - Source 选择 `master` 分支
   - 保存

6. **访问网站**
   - 等待几分钟后访问：https://wangxxun.github.io

## 许可证

MIT
