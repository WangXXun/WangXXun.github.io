# Wang Xun's Personal Website

一个使用 Next.js 和 Three.js 构建的个人网站，展示全球视野和项目经历。

## 技术栈

- **Next.js 14** - React 框架
- **Three.js** - 3D 图形库
- **React Three Fiber** - Three.js 的 React 渲染器
- **React Three Drei** - 有用的 Three.js 辅助组件
- **Leaflet** - 交互式地图
- **TypeScript** - 类型安全

## 功能特性

- 🌍 首页展示 3D 地球，表达全球视野
- 🗺️ 交互式地图，展示项目信息和旅行记录
- 📍 POI 标记，点击查看详细信息
- 🎨 极简设计，体现建筑师美学
- 📱 响应式布局
- 🎯 流畅的滚动动画

## 本地开发

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看网站。

### 构建生产版本

```bash
npm run build
```

构建完成后，静态文件将输出到 `out` 目录。

## 部署到 GitHub Pages

### 快速部署

1. **构建项目**
   ```bash
   npm run build
   ```

2. **将构建文件复制到根目录**
   ```bash
   cp -r out/* .
   ```

3. **提交并推送**
   ```bash
   git add .
   git commit -m "Deploy Next.js site to GitHub Pages"
   git push origin master
   ```

4. **在 GitHub 设置中启用 Pages**
   - 进入仓库 Settings > Pages
   - Source 选择 `master` 分支
   - 保存

5. **访问网站**
   - 等待几分钟后访问：https://wangxxun.github.io

### 使用部署脚本

```bash
./deploy-to-gh-pages.sh
```

然后按照提示完成部署。

## 项目结构

```
├── app/
│   ├── components/
│   │   ├── Earth.tsx      # 地球 3D 组件
│   │   ├── Scene.tsx      # Three.js 场景组件
│   │   └── Map.tsx        # 地图组件（含 POI）
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 主页面
│   └── page.module.css    # 页面样式
├── package.json
├── tsconfig.json
└── next.config.js
```

## 自定义 POI

编辑 `app/components/Map.tsx` 中的 `pois` 数组来添加或修改地图标记点：

```typescript
const pois = [
  {
    id: 1,
    position: [39.9042, 116.4074], // 经纬度
    title: '项目标题',
    description: '项目描述',
    type: 'project', // 'project' | 'travel' | 'home'
  },
  // 添加更多 POI...
]
```

## 许可证

MIT
