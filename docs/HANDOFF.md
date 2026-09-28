---
cursor:
  subagentId: "bc-3571d58d-7915-5841-93a4-f45b0c53d624"
---

# xun's studio：资产化重建交接提纲

> 版本：v1 · 2026-09-28
>
> 适用对象：接手实现的 AI 模型或工程师。
>
> 仓库：`WangXXun/WangXXun.github.io`，分支 `cursor/studio-rebuild-d624`（[PR #15](https://github.com/WangXXun/WangXXun.github.io/pull/15)）。本文件在仓库里的副本是 `docs/HANDOFF.md`。
>
> 叙事依据：`narrative-design.md` v3.1（仓库外，在项目资料库 `docs/` 目录；本文第 0 节摘录了执行需要的全部规则）。
>
> **本文与叙事文档的关系**：画面、转场、文案规则、比例尺、配色，以叙事文档为准。叙事文档第 5.1 节写的是“全部程序化 / 示意”，**这一条被本文取代**：v1 的程序化建模质感太粗，后续改用真实素材和外部高质量模型资产，代码只负责编排、材质过渡、数据可视化和交互。

---

## 目录

0. 必须遵守的硬规则
1. 现有代码结构说明
2. 保留、改造和替换清单
3. 资产规范（格式、面数、贴图、压缩、许可）
4. 分幕实施方案（序幕 → 索引）
5. 素材收集清单（给用户填写）
6. 素材放置约定（仓库路径与命名）
7. 分阶段执行顺序与提示词模板
8. 质量标准与常见坑
9. 附录：常用命令

---

## 0. 必须遵守的硬规则

这些规则来自叙事文档 v3.1 和用户的明确要求，任何阶段都不能违反。

1. **站名** `xun's studio`（全小写）。**联系方式只放邮箱** `wangxun_arch@163.com`。
2. **每幕只有一个标题**，写作 `EN / 中`，页面一次只显示一种语言。首页不放句子，也不放“查看项目”链接。
3. **其他信息只用 HUD 标签**：英文和数字，不翻译。例如 `1:50`、`CARDBOARD`、`NANJING 2020`、`w/ RoboticPlus.AI`、`NODE 047`、`DEEPARCH`、`3DGS`、`PCG`、`VLA`。
4. **设计和建造的边界**：凡是缩尺的都属于设计，包括图纸、卡纸、花泥、木板、木模型、3D 打印和数字模型，比例尺是 `1:100 → 1:50`。建造只指 1:1 的机械臂建造参数化木吊顶，画面里只有机械臂和木吊顶，比例尺是 `1:1`。两幕之间用“比例跳变”转场：桌上的 1:50 小模型放大到 1:1，镜头不动，房间墙壁退去，比例尺从 `1:50` 跳到 `1:1`。
5. **木吊顶不写细节**。网站上只出现项目名、地点、年份、合作方：`Parametric Timber Ceiling · Gate 2, Nanjing Garden Expo Park · 2020 · with RoboticPlus.AI`。不写面积、构件数、工期。
6. **全站不出现“建筑行业下行”等行业背景**，包括 `/about`。
7. **数据全部是示意**。分析图、流线、点云旁标 `Illustrative`，中文模式标 `示意数据`。
8. **双语**：默认 `/en`，可切到 `/zh`。首页切换语言时不重置滚动位置，也不重建 3D Canvas。所有文字都是 DOM，**不要把文字烘焙进贴图或模型**。
9. **静态导出**：必须能 `next build` 成纯静态站并部署到 GitHub Pages。不能依赖服务端，也不能依赖自定义响应头。
10. **不依赖 Google 或其他在中国大陆被屏蔽的 CDN 运行**。Draco、Basis 解码器、字体、库都要自托管。
11. **许可**：只用 CC0、CC-BY、MIT、Apache、BSD、ODbL 这类允许公开展示的素材。不要用 NC（非商用）、ND（禁止演绎）或 Editorial（仅限编辑用途）许可的素材。每个外部素材都要登记到 `public/assets/CREDITS.md`（见第 6 节）。

---

## 1. 现有代码结构说明

### 1.1 技术栈

| 项 | 版本 / 说明 |
|---|---|
| 框架 | Next.js 16（App Router、TypeScript、`output: "export"`、`trailingSlash: true`、`images.unoptimized`） |
| UI | React 19 |
| 3D | three 0.186、@react-three/fiber 9、@react-three/drei 10、@react-three/postprocessing 3（postprocessing 6） |
| 滚动 | Lenis 1.3（关闭自带 rAF）+ GSAP 3.15 ScrollTrigger |
| 内容 | MDX（next-mdx-remote 6 + gray-matter） |
| 测试工具 | puppeteer-core（需要本机 Chrome，路径由 `CHROME_PATH` 指定，默认 `/usr/local/bin/google-chrome`） |
| Node | 22（和 `deploy.yml` 一致） |

### 1.2 目录

```
app/
  (root)/layout.tsx, page.tsx      "/"：读取 localStorage 的语言偏好，跳到 /en 或 /zh；带 <noscript> 兜底链接
  [lang]/layout.tsx                <html lang>、字体、LangProvider、Header/Footer、hreflang
  [lang]/page.tsx                  首页（滚动叙事），把精选作品元数据传给 <Home>
  [lang]/works/page.tsx            作品列表（p5aholic 式纯文字，按 6 类筛选）
  [lang]/works/[slug]/page.tsx     作品详情（MDX 渲染；缺当前语言时回退，并显示提示）
  [lang]/about/page.tsx            一句话定位 + 时间线 + 邮箱
  fonts.ts                         Inter Tight（展示字）/ JetBrains Mono（HUD）/ Noto Sans SC（只在 zh 样式里用到）
  globals.css                      全站样式（xs- 前缀）
components/
  chrome/Header.tsx, Footer.tsx    右上导航（Works · About · EN/中 · Skip）、页脚邮箱
  home/Home.tsx                    首页根：初始化滚动、注册 ScrollTrigger 区段、挂 Canvas、遮罩、标题、HUD、索引
  home/StoryTitles.tsx             每幕唯一标题（DOM，固定定位，由 ScrollBus 驱动显隐）
  home/Hud.tsx                     比例尺、坐标、太阳时刻、章节进度、HUD 标签（带 scramble 解码动效）
  home/IndexSection.tsx            索引幕 DOM：精选列表、All works、邮箱复制
  providers/LangProvider.tsx       语言上下文：原地切换（replaceState）或路由切换
  ui/EmailCopy.tsx, Scramble.tsx   邮箱复制、字符解码
  works/WorksList.tsx              作品列表客户端组件（筛选）
  three/
    Experience.tsx                 <Canvas>、渲染档位、PerformanceMonitor、R3F addEffect 帧驱动
    Scene.tsx                      场景根：雾、镜头、灯光、各幕组件
    CameraRig.tsx                  读取导演状态 S 设置相机（阻尼、FOV、near，竖屏加宽视角）
    Lights.tsx                     太阳（方向光，阴影视锥随尺度变化）、半球光、Lightformer 环境
    Effects.tsx                    高档位后处理：N8AO、SMAA、ToneMapping(NEUTRAL)、Vignette、Noise
    bgTone.ts                      背景色预补偿：让经过色调映射的纸白背景和 DOM 颜色一致
    quality.ts                     渲染档位上下文 high / mid / low
    materials/modelMaterial.ts     程序化模型材质（7 种变体 + 高度扫描过渡 + 溶解切口 + 等参线）
    materials/glsl.ts              噪声 GLSL
    lines/DrawLines.tsx            可逐笔描绘的线段几何与材质（图纸、线框、参数线网）
    canopy/field.ts                参数化木吊顶生成器（1:50 模型和 1:1 吊顶共用）
    parts/PrologueBlock.tsx        序幕体块、12 棱画线、点击切换材质彩蛋
    parts/Room.tsx                 纸盒展开的工作室、桌子、窗、图纸、主角模型的材质轮换与参数化变形
    parts/drawing.ts               程序化平面 / 剖面线稿
    parts/Site.tsx                 1:1 场地、木吊顶、补梁动画、配景人、程序化城市、03–06 幕占位
    parts/RobotArm.tsx             程序化六轴机械臂 + 解析 IK
    parts/IndexStage.tsx           索引幕标本体块阵列 + 回顶部的体块
    parts/DatumEdge.tsx            橙色基准棱
content/
  i18n/en.json, zh.json            全部界面文字，key 一一对应
  works/<slug>/index.{en,zh}.mdx   作品，一个项目一个文件夹
lib/
  scroll/bus.ts                    ScrollBus：每帧一份滚动 + 时间快照
  scroll/driver.ts                 Lenis → ScrollTrigger → bus 的驱动；capture 模式的虚拟时钟
  director/state.ts                导演：把滚动游标换算成整站场景状态 S（镜头关键帧、各阶段进度、HUD）
  director/constants.ts            空间常量（房间尺寸、桌子、主角位置、1:50 原点、跳变视点、机械臂位置、索引原点）
  director/math.ts                 clamp / smooth / damp 等
  story.ts                         8 段的定义（id、标签、滚动长度 vh、背景主题、比例尺、是否已完成）和配色
  i18n.ts                          语言列表、字典、EMAIL 常量、路径换语言
  works.ts / works-shared.ts       MDX 读取（仅服务端，使用 fs）/ 共享类型和类别（客户端可用）
scripts/
  capture.mjs                      无头 Chrome 按虚拟时间逐帧截图、录帧（shots / video 两种模式）
  smoke.mjs                        冒烟测试（路由、回退、语言切换、HUD、reduced-motion、移动端）
.github/workflows/deploy.yml       push 到 master 时 lint + build 并发布到 GitHub Pages
```

### 1.3 滚动与场景同步架构（最重要，不要推翻）

整站只有**一个滚动源**，DOM 和 WebGL 在**同一帧**里读同一份状态：

```
R3F addEffect（每帧，WebGL 渲染之前）
  └─ driver.tick(ms)
       ├─ lenis.raf(ms)                   Lenis 平滑滚动（关闭了自带 rAF）
       ├─ ScrollTrigger.update             由 lenis 'scroll' 事件触发
       └─ bus.writeFrame(y, limit, v, t)
            ├─ 算出每幕局部进度 acts[id]（0–1）和连续游标 cursor（幕序号 + 局部进度，如 1.5 = 设计幕中段）
            ├─ deriver = director.derive(bus) → 写入全局场景状态 S
            └─ listeners：StoryTitles / Hud / Veil 等 DOM 订阅者直接改 style / textContent（不经过 React 重渲染）
R3F 渲染：各场景组件在 useFrame 里只读 S
```

要点：

- **幕的区段**：`Home.tsx` 为每幕渲染一个空的 `<section id=...>`，高度 `--act-vh`（来自 `lib/story.ts`，移动端乘 0.65）。ScrollTrigger 测量每个 section 的起止像素，写入 `ranges`，resize 和字体加载后自动 refresh。
- **导演状态 `S`**（`lib/director/state.ts`）是唯一的场景真相。所有组件只读 `S`，不自己算滚动。新增画面时，先在 `SceneState` 加字段，在 `derive()` 里按 `S.view`（游标）计算，再在组件里读取。
- **镜头**：`KEYS` 是按游标排列的关键帧，每个关键帧属于三种空间之一：
  - `room`：房间空间。序幕时房间整体缩成体块，比例 `K0`。
  - `site`：场地空间，单位是 1:1 的米，按 `siteS` 缩放、以 `siteOrigin` 为原点。
  - `index`：索引舞台，在 `INDEX_ORIGIN` 远处。

  关键帧之间用 Catmull-Rom / Hermite 插值；`hold` 表示镜头停住，`cut` 表示硬切，用遮罩盖住。
- **比例跳变**：1:50 模型就是 1:1 场地乘 `SITE_SCALE_0 = 1/50`，放在桌上。跳变时 `siteS` 从 1/50 指数插值到 1，并以镜头视点 `JUMP_EYE` 为不动点（`JUMP_PIVOT`）。所以镜头不动，模型放大到把镜头包住。**替换模型时，1:50 模型和 1:1 吊顶必须是同一个文件、同一个原点**，这套机制才能继续工作。
- **时间**：所有动画用 `bus.time` / `bus.delta`，不用 `clock` 或 `Date.now()`。capture 模式靠虚拟时钟逐帧推进，保证录屏确定、可重复。
- **reduced-motion**：`derive()` 把游标吸附到 `STOPS` 里最近的静态关键帧，两帧之间用 0.3 秒遮罩淡入淡出，同时关闭 Lenis。

### 1.4 i18n

- 路由：`app/[lang]` + `generateStaticParams` 生成 `/en/...` 和 `/zh/...` 两套静态页面。`/` 按 `localStorage["xs-lang"]` 跳转。
- 字典：`content/i18n/{en,zh}.json`，类型由 `en.json` 推导（`Dict`），两份 key 必须一致。
- 首页原地切换：`Home` 调用 `registerInPlace()`，`setLang` 只替换字典并 `history.replaceState` 改 URL。Canvas 挂在不随语言变化的位置，所以滚动和 3D 都不重置。其他页面走 `router.replace(..., { scroll: false })`。
- HUD 标签全部硬编码为英文（在 `derive()` 的 `tags`、`VARIANT_LABEL` 等处），不进字典。
- 中文字体 Noto Sans SC 只在 `html[lang^="zh"]` 的样式里引用，所以只有 `/zh` 会下载。

### 1.5 MDX 作品

- 位置：`content/works/<slug>/index.en.mdx`、`index.zh.mdx`。缺某种语言时回退到另一种，并显示 `fallbackNotice`。
- frontmatter 字段（`lib/works-shared.ts` 的 `WorkMeta`）：`title`、`year`、`category`（`design | build | city | evaluate | reconstruct | embody`）、`role`、`place`、`collaborators`、`featured`（进入首页索引）、`order`、`cover`。
- 现有 6 个示意作品：`physical-models`、`nanjing-timber-ceiling`、`urban-data`、`deeparch`、`reconstruction-pcg`、`vla`。正文都是占位，等用户提供真实内容。
- `lib/works.ts` 使用 `node:fs`，**只能在服务端组件里 import**。客户端组件只能从 `lib/works-shared.ts` 取类型和常量，否则 Turbopack 会把 fs 打进客户端包。

### 1.6 降级机制

| 情况 | 现有行为 |
|---|---|
| `prefers-reduced-motion` 或 `?motion=reduce` | 关闭 Lenis；每小节一张静态关键帧（`STOPS`），切换时 0.3 秒遮罩；序幕不画线 |
| 移动端（`max-width: 760px` 或 `pointer: coarse`） | 滚动长度 × 0.65；默认 `low` 档；竖屏自动加宽垂直视角 |
| 掉帧 | Drei `PerformanceMonitor` 从 high 自动降到 mid，再降到 low |
| 档位差异 | high：DPR 最高 2、4096 阴影、后处理全开；mid：DPR 1.5、2048 阴影、无后处理；low：DPR 1.25、1024 阴影 |
| 无 WebGL | 显示 CSS 静态体块占位，DOM 文字不受影响 |
| 调试参数 | `?q=high|mid|low` 强制档位；`?capture` 冻结时钟，暴露 `window.__studio` 供脚本控制 |

### 1.7 本地运行、构建、部署

```bash
npm install
npm run dev                      # http://localhost:3000 → /en
npm run lint && npm run typecheck
npm run build                    # 静态导出到 ./out
npm start                        # 用 serve 在 :3000 提供 ./out
npm run smoke                    # 需先 build + start；冒烟测试
node scripts/capture.mjs shots --url http://localhost:3000/en/ --at 0.2,1.5,2.4 --out capture/shots
node scripts/capture.mjs video --url http://localhost:3000/en/ --from 0 --to 3.2 --seconds 40 --fps 30 --out capture/frames
# 帧序列转视频：ffmpeg -framerate 30 -i capture/frames/%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 demo.mp4
```

部署：`.github/workflows/deploy.yml` 在 push 到 `master` 时执行 `npm ci → lint → build → 发布 out/`。仓库 Settings → Pages 的 Source 要设为 **GitHub Actions**。仓库名是 `WangXXun.github.io`，站点挂在域名根路径，所以资源可以用 `/assets/...` 绝对路径。如果以后改成项目站点（子路径），要加 `basePath`，并把所有资源 URL 改为基于 `basePath` 拼接。

---

## 2. 保留、改造和替换清单

原则：**保留骨架和编排，替换几何与贴图**。导演状态 `S` 的接口尽量不变，新组件读同样的字段。

| 模块 | 处理 | 说明 |
|---|---|---|
| `lib/scroll/*`、`lib/story.ts`、`lib/director/math.ts` | **保留** | 滚动同步架构不要推翻。`story.ts` 里各幕的 `vh` 可以微调（现在设计 190、建造 150，和叙事文档的 155 / 155 不同，是调过的），总长保持在约 1300vh |
| `lib/director/state.ts` | **保留并扩展** | 镜头关键帧要按新模型的真实尺寸重调；03–06 幕的新状态字段加在这里 |
| `lib/director/constants.ts` | **改造** | 房间、桌子、主角、机械臂、工作台的位置改成从模型里读出（或和模型约定一致），见 6.3 节 |
| `lib/i18n.ts`、`content/i18n/*`、`LangProvider` | **保留** | 只增补界面词 |
| `app/*`、`components/chrome/*`、`components/ui/*`、`components/works/*` | **保留** | 作品详情页要增加图片 / 视频画廊组件（第 4.9 节） |
| `components/home/*` | **保留** | HUD、标题、索引 DOM 都能直接用 |
| `Experience.tsx` | **改造** | 加 KTX2 / Draco 加载器初始化、按幕分 Suspense、真实加载进度 |
| `CameraRig.tsx` | **保留** | — |
| `Lights.tsx` | **改造** | 保留太阳轨迹和阴影视锥逻辑；环境光改成 HDRI（只用于反射，背景仍是纸白）；按新材质重新调光 |
| `Effects.tsx`、`bgTone.ts` | **保留并调参** | 04–06 幕加选择性 Bloom；改色调映射时必须同步 `bgTone` |
| `quality.ts` | **扩展** | 档位同时决定加载哪套资产（桌面 / 移动变体） |
| `materials/modelMaterial.ts` | **改造** | 保留“高度扫描过渡 + 橙色接缝 + 溶解切口 + 等参线”的着色器补丁，改为用 `onBeforeCompile` 注入到读取 PBR 贴图的 `MeshStandardMaterial` / `MeshPhysicalMaterial`。删除程序化表面（噪声木纹、花泥孔洞等），这正是“质感粗糙”的主要来源 |
| `materials/glsl.ts` | **保留** | 噪声只用于溶解边缘等特效 |
| `lines/DrawLines.tsx` | **保留** | 数据源改为真实图纸和模型中心线 |
| `parts/drawing.ts` | **替换** | 改为读取由用户真实 DXF / SVG 转出的线段 JSON |
| `canopy/field.ts` | **替换为数据** | 几何改用用户的 Rhino 模型。可保留作为无素材时的兜底 |
| `parts/PrologueBlock.tsx` | **改造** | 几何换成主角体块 GLB；12 棱画线改为跟随真实加载进度 |
| `parts/Room.tsx` | **替换几何** | 房间、家具换成 GLB（带烘焙 AO / 间接光）；保留纸盒展开的铰链逻辑（需要模型按铰链拆分，见 4.2） |
| `parts/Site.tsx` | **拆分并替换** | 拆成 `acts/Build.tsx`、`acts/City.tsx` 等；木吊顶、场地、配景人、城市都换成 GLB；保留补梁节奏（`cycle`、`gapsFilled`） |
| `parts/RobotArm.tsx` | **替换几何** | 用真实机械臂 GLB（关节层级）；保留解析 IK，按真实连杆长度重新标定 |
| `parts/IndexStage.tsx` | **改造** | 标本体块改用主角 GLB 的各材质变体 |
| `scripts/capture.mjs`、`smoke.mjs` | **保留并扩展** | 截图前等待资产加载完成；冒烟测试增加资产 404 检查 |

建议的新目录（逐步迁移，不必一次到位）：

```
components/three/
  assets/loaders.ts        统一配置 GLTFLoader（Draco + KTX2 + Meshopt，解码器自托管）
  assets/useAsset.ts       按档位选择桌面 / 移动变体 URL，封装 useGLTF / useKTX2
  acts/Prologue.tsx  acts/Design.tsx  acts/Build.tsx  acts/City.tsx
  acts/Evaluate.tsx  acts/Reconstruct.tsx  acts/Embody.tsx  acts/Index.tsx
  shared/Robot.tsx         02 和 06 共用的机械臂
  shared/HeroBlock.tsx     序幕、设计、索引共用的主角体块
  shared/patchMaterial.ts  扫描过渡 / 溶解着色器补丁
lib/assets.ts              资产清单（key → 各档位 URL、预估大小），唯一的资源路径来源
```

---

## 3. 资产规范

### 3.1 来源与许可

| 类型 | 推荐来源 | 许可 | 用途 |
|---|---|---|---|
| 用户真实素材 | 用户提供（第 5 节清单） | 用户所有 | 图纸、木吊顶模型、实体模型扫描、项目照片与视频、3DGS、VLA 演示 |
| HDRI | [Poly Haven](https://polyhaven.com/hdris) | CC0 | 反射环境（室内工作室 + 户外阴天 / 晴天各一张） |
| PBR 材质 | [Poly Haven Textures](https://polyhaven.com/textures)、[ambientCG](https://ambientcg.com) | CC0 | 卡纸、纸、胶合板、实木、混凝土、铺地、金属 |
| 家具与道具 | [Poly Haven Models](https://polyhaven.com/models)（CC0）、[Sketchfab](https://sketchfab.com)（只选 CC0 / CC-BY 且可下载） | CC0 / CC-BY | 绘图桌、椅子、台灯、书架、模型工具 |
| 机械臂 | 厂商官方 CAD（KUKA / ABB / FANUC 下载中心，**需逐条核对许可**）；ROS-Industrial 描述包的网格（如 `kuka_experimental`、`abb_experimental`，Apache-2.0 / BSD） | 视来源 | 02、06 幕同一台 |
| 配景人 | CC0 扫描人像（Sketchfab CC0、[Poly Pizza](https://poly.pizza) CC0）、Blender + MakeHuman（导出 CC0） | CC0 | 白色剪影 |
| 城市 | [OpenStreetMap](https://www.openstreetmap.org) 建筑轮廓（Blender 插件 blender-osm / BlenderGIS 拉伸） | ODbL，需署名 `© OpenStreetMap contributors` | 03–05 幕白模城市 |
| 气象数据 | [climate.onebuilding.org](https://climate.onebuilding.org) 南京 EPW | 免费使用 | 04 幕日轨、风玫瑰、示意分析 |
| 自建 | Blender 4.x | 自有 | 主角体块、房间壳体、纸盒铰链、PCG 房间套件 |
| Spline | 只用于快速做造型草稿，**导出 GLB 后走同一条压缩管线**；不要把 Spline 运行时嵌进站点（体积大，也不能接入 ScrollBus） | — | 可选 |

禁止：NC、ND、Editorial、“仅限个人使用”的素材；带 Logo 或品牌标识的模型（机械臂要去掉厂商 Logo，或确认可以展示）；从渲染图、游戏里提取的模型。

### 3.2 建模与导出规范（Blender → glTF）

- **单位**：米。**+Y 向上**（Blender 导出 glTF 时默认转换）。导出前 Apply All Transforms，不能有负缩放。
- **原点**：放在约定位置（见 6.3 节）。需要旋转的部件，原点放在旋转轴上，例如纸盒铰链、机械臂关节。
- **命名**：节点名 `snake_case`，按功能加前缀，例如 `room_wall_front`、`robot_j1`、`ceiling_member_0047`。代码按名字查找节点，**导出后不要改名**。
- **UV**：UV0 用于材质贴图，UV1 用于烘焙光照 / AO（需要的话）。不要有重叠 UV 岛，除非是平铺材质。
- **面数**：见 3.4 节预算。倒角用几何倒角加加权法线（Weighted Normal 修改器），不要靠高面数细分。
- **材质**：glTF PBR 金属度-粗糙度模型。贴图打包方式：
  - `baseColor`：sRGB
  - `normal`：线性，OpenGL（+Y）约定
  - `ORM`：线性，R = AO、G = Roughness、B = Metallic
  - `emissive`：sRGB，仅在需要时使用

  不要使用 Blender 专有节点，比如程序化纹理，导出时会丢失；需要的话先烘焙成贴图。
- **重复构件**：木梁、城市建筑、PCG 房间这类重复件，用 `EXT_mesh_gpu_instancing` 导出（Blender 4.x 导出器支持），或在代码里用 `InstancedMesh` 重建。不要导出成上千个独立网格。
- **动画**：机械臂不导出动画，由代码驱动关节。其他动画用 glTF 动画通道导出，并在清单里注明片段名。

### 3.3 压缩管线（gltf-transform + Draco + KTX2）

工具：`@gltf-transform/cli` v4（作为 devDependency 安装），以及 [KTX-Software](https://github.com/KhronosGroup/KTX-Software) 4.3+ 的 `ktx` 命令（KTX2 编码需要，放进 PATH）。

标准流程，把 `scripts/assets/build.mjs` 写成可重复执行的脚本：

```bash
# 1) 清理、合并、实例化、焊接
gltf-transform dedup   in.glb  a.glb
gltf-transform instance a.glb  b.glb            # 自动把重复网格转为 GPU instancing
gltf-transform prune    b.glb  c.glb
gltf-transform weld     c.glb  d.glb
# 2) 贴图尺寸上限（桌面 2048，移动 1024）
gltf-transform resize   d.glb  e.glb --width 2048 --height 2048
# 3) KTX2：颜色贴图用 ETC1S，法线 / ORM 用 UASTC（数据贴图用 ETC1S 会出块状伪影）
gltf-transform etc1s    e.glb  f.glb --slots "{baseColorTexture,emissiveTexture}" --quality 255
gltf-transform uastc    f.glb  g.glb --slots "{normalTexture,occlusionTexture,metallicRoughnessTexture}" --level 2 --zstd 18
# 4) 几何压缩：静态网格用 Draco
gltf-transform draco    g.glb  out.glb --method edgebreaker
```

`gltf-transform optimize in.glb out.glb --compress draco --texture-compress ktx2 --texture-size 2048` 可以一步完成类似效果，但不区分颜色贴图和数据贴图，只适合快速验证。

约定：

- 每个资产产出两份：`<name>.glb`（桌面）和 `<name>.mobile.glb`（移动端，贴图 1024，面数约为桌面的 40%，可以先用 `gltf-transform simplify --ratio 0.4 --error 0.001` 生成再人工检查）。
- 带蒙皮或变形动画的模型改用 Meshopt（`gltf-transform meshopt`），因为 Draco 不压缩动画数据。
- 单独使用的贴图，比如图纸纹理、烘焙光照图、视频封面，用 `ktx create`（`--encode uastc` 或 `--encode basis-lz`）或 `gltf-transform` 的同类命令转成 `.ktx2`。照片类 DOM 图片用 AVIF / WebP，不用 KTX2。
- **解码器自托管**：
  - Draco：从 `three/examples/jsm/libs/draco/gltf/` 复制到 `public/decoders/draco/`
  - Basis：从 `three/examples/jsm/libs/basis/` 复制到 `public/decoders/basis/`

  在 `components/three/assets/loaders.ts` 里设置 `DRACOLoader.setDecoderPath('/decoders/draco/')`、`KTX2Loader.setTranscoderPath('/decoders/basis/').detectSupport(gl)`，通过 `useGLTF(url, '/decoders/draco/', true, (loader) => loader.setKTX2Loader(ktx2))` 注入。**不要用 Drei 默认的 gstatic CDN**，大陆访问不到。
- 用 `gltf-transform inspect out.glb` 检查面数、贴图尺寸和格式，并把结果写进构建日志。

### 3.4 性能预算

目标设备：桌面为 M1 MacBook Air 或 GTX 1660 级别，要求 60 fps；移动端为 iPhone 12 或同级 Android，要求 ≥ 30 fps。

| 项 | 桌面 | 移动 |
|---|---|---|
| 首屏（HTML + JS + 字体 + 序幕和设计幕资产，gzip 后） | ≤ 3 MB | ≤ 2 MB |
| 任一时刻屏幕内三角形 | ≤ 1.5 M | ≤ 400 k |
| Draw calls | ≤ 150 | ≤ 80 |
| GPU 贴图显存（KTX2 后） | ≤ 256 MB | ≤ 96 MB |
| 单张贴图上限 | 2048²（主角特写可用 4096² 但只允许 1 张） | 1024² |
| 阴影贴图 | 4096（high）/ 2048（mid） | 1024 |
| 单个文件 | ≤ 25 MB（GitHub 单文件硬上限 100 MB） | — |
| 全站 `out/` 总大小 | ≤ 400 MB（GitHub Pages 站点上限 1 GB） | — |

各幕资产预算（压缩后，桌面 / 移动）：

| 幕 | 大小 | 三角形 | 说明 |
|---|---|---|---|
| 序幕 | 0.8 / 0.5 MB | 10 k | 主角体块 + 白模材质 |
| 01 设计 | 6 / 3 MB | 250 k / 90 k | 房间 150 k；5 个材质模型每个 ≤ 20 k，同一时刻最多 2 个可见；1:50 吊顶复用 02 的文件 |
| 02 建造 | 8 / 3.5 MB | 400 k / 150 k | 吊顶 ≤ 250 k（实例化）；机械臂 ≤ 60 k；场地、立柱、配景人 |
| 03 城市 | 4 / 1.5 MB | 250 k / 70 k | OSM 城市合并成少量网格 + 数据线 JSON |
| 04 评估 | 4 / 1.5 MB | 复用城市 | 预计算的热力贴图、流线 JSON、365×24 能耗数据 |
| 05 空间重建 | 25 / 6 MB | 1.0 M / 250 k 个高斯点 | 3DGS 分块渐进加载；PCG 房间套件 ≤ 3 MB |
| 06 具身智能 | 6 / 2.5 MB | 150 k | 复用机械臂；VLA 视频 ≤ 3 MB |
| 索引 | 1.5 / 0.8 MB | 60 k | 复用主角体块和材质 |

**加载策略**：

- 首屏只阻塞序幕资产，序幕的 12 棱画线就是加载进度（Drei `useProgress`）。
- 设计幕资产在序幕期间后台加载。
- 其余各幕在游标距该幕起点 < 0.6 时 `useGLTF.preload`。
- 每幕组件包在自己的 `<Suspense>` 里，某幕未加载完成时显示前一状态或占位，不要让整棵场景树卡住。
- 已经离开很远的幕设为 `visible = false`，不必卸载。

---

## 4. 分幕实施方案

每幕都按四项组织：**目标画面**、**素材**（U = 用户提供，E = 外部获取或自建）、**实现步骤**、**验收标准**。游标值指 `S.view`（幕序号 + 局部进度），与现有 `KEYS`、`STOPS` 一致。

### 4.1 序幕（游标 0 – 1，比例尺 `1:100`）

**目标画面**：纸白背景上悬浮一块白色圆角体块，缓慢自转，带接触阴影和鼠标视差。12 条棱逐笔画出作为加载进度，加载完成后填充成实体。点击体块在卡纸、花泥、木、3D 打印之间循环（彩蛋）。标题 `xun's studio`。随后“纸盒展开”：顶面和正面沿棱翻开，镜头穿入，四壁推成房间。

**素材**：

- E：主角体块 `hero-block.glb`。Blender 自建：边长 1 m 的立方体，倒角约 4%（和房间比例一致），≤ 5 k 三角形，UV0 展开完整。一条棱单独作为 `datum_edge` 网格（橙色 `#FF4F1A`，自发光）。
- E：白模材质。石膏 / 白卡纸类 PBR 贴图（ambientCG 的 Paper 或 Plaster 系列，CC0），1024²，颜色调到 `#FAFAF7`，粗糙度约 0.8。
- E：室内 HDRI 一张（Poly Haven，1k 或 2k，只用于反射）。

**实现步骤**：

1. 建 `components/three/assets/loaders.ts` 和 `lib/assets.ts`（第 7 节阶段 P0）。
2. `shared/HeroBlock.tsx`：加载 GLB，套用 `patchMaterial` 补丁后的 PBR 材质，接受 `variant` 和过渡参数。
3. 12 棱画线：边线几何用 `DrawLines`，根据 `hero-block.glb` 的包围盒生成。进度 = `max(时间动画, useProgress().progress / 100)`，并保证至少播放 1.9 秒。
4. 彩蛋：点击时切换到设计幕的 5 个材质模型（与 4.2 共用资产，按需懒加载）。
5. 纸盒展开：房间 GLB 的 `room_wall_front`、`room_ceiling_a/b` 以铰链为原点，旋转量沿用 `S.flapFront`、`S.flapTop`。

**验收**：

- 首屏 LCP ≤ 2.5 s（桌面，Fast 4G）。
- 12 棱画线和真实加载进度同步，加载完成前不出现实体。
- 纸白背景色和 DOM 背景色在截图上的差值 ≤ 2/255。
- 体块边缘倒角有高光，接触阴影柔和，没有锯齿。
- reduced-motion 下直接显示实体，不画线、不自转。

### 4.2 01 设计（游标 1 – 2，比例尺 `1:100 → 1:50`）

**目标画面**：极简工作室（一扇窗、一张长桌），窗外日光斑随滚动移动。

1. **画图**：桌面图纸上，平面和剖面线条一笔一笔画出，比例尺 `1:100`，HUD `DRAWING`。
2. **实体模型**：主角体块依次换成 `CARDBOARD` → `FLORAL FOAM` → `WOOD BOARD` → `TIMBER MODEL` → `3D PRINT`，比例尺 `1:50`。
3. **建模**：体块褪成线框，表面浮现参数化曲线网，线网把它变形成木吊顶的 1:50 小模型，HUD `PARAMETRIC MODEL`。

镜头：从窗户摇到桌面特写，绕体块旋转约 90°，最后停在参数化小模型上方。标题 `Design / 设计`。

**素材**：

- U：**真实图纸**。一个可公开的项目的平面图和剖面图各一张，DXF / DWG / SVG / 矢量 PDF 均可。线条越干净越好，最好只保留墙线、门窗、轴线三类图层。
- U：**实体模型照片**。卡纸、花泥、木板、木模型、3D 打印各一组，每组 4–8 张多角度照片，作为质感参考和作品页配图。
- U（强烈推荐）：如果实体模型还在，用手机扫描（Polycam / RealityScan / Scaniverse 均可），导出 GLB 或 OBJ + 贴图。这是最真实的质感来源。
- E：**房间**。Blender 自建壳体：3.6 m 立方体，与 `ROOM` 常量一致。墙体按铰链拆成 `room_wall_front`（沿底边铰接）、`room_ceiling_a`、`room_ceiling_b`（沿侧边铰接）、`room_wall_back`、`room_wall_left`、`room_wall_right`、`room_floor`。窗洞位置和 `WINDOW` 常量一致。
- E：**家具**。绘图长桌（桌面尺寸和 `TABLE` 常量一致：2.6 × 0.9 m，高 0.765 m）、椅子、台灯、靠墙书架（放几件小模型当背景），从 Poly Haven Models 或 Sketchfab CC0 获取后统一改成白、浅木、黑钢三种材质。
- E：**5 个材质模型**。以主角体块为基础，在 Blender 里分别做出真实构造细节。5 个模型包围盒完全一致（0.3 m 立方，底面中心为原点）：
  - `model-cardboard.glb`：卡纸板片拼接，边缘露出瓦楞或灰板厚度层；贴图用 ambientCG Cardboard / Paper。
  - `model-foam.glb`：灰绿色花泥，粗糙多孔。用法线贴图 + AO 表现孔隙，高模烘焙到低模。
  - `model-board.glb`：薄木板片拼接，露出层板切边；贴图用 Poly Haven Plywood。
  - `model-timber.glb`：实木块体；贴图用 Poly Haven Wood 系列，纹理方向要对齐。
  - `model-print.glb`：水平层纹，通过法线贴图实现，层高约 0.2 mm 等效；微光泽塑料，clearcoat 约 0.3。

  如果有用户扫描件，优先用扫描件：重拓扑到 ≤ 20 k 三角形，再把扫描贴图烘焙过去。
- E：**光照烘焙**。房间和家具在 Blender Cycles 里烘焙 AO + 间接光到 UV1（2048²，KTX2 UASTC）。太阳直射仍由实时方向光产生，因为日光斑要随滚动移动，不能烘焙进贴图。
- U / E：**参数化线网与 1:50 模型**。与 4.3 共用 `ceiling.glb`；线网用吊顶构件的中心线（从 Rhino 导出为 JSON 折线，见 4.3）。

**实现步骤**：

1. 写 `scripts/assets/dxf-to-lines.mjs`：把 DXF / SVG 转成 `public/assets/data/design/drawing-plan.json` 和 `drawing-section.json`，格式为 `{ ink: [[x1,y1,x2,y2],...], accent: [...] }`，单位是图纸米数，按描绘顺序排列。替换 `parts/drawing.ts`，`DrawLines` 继续负责逐笔描绘。
2. `acts/Design.tsx`：加载房间 + 家具，用 `traverse` 设置 `castShadow` / `receiveShadow`，把 UV1 的烘焙贴图作为 `lightMap` 挂上（`lightMap.channel = 1`）。
3. 材质轮换：同一位置上下叠放相邻两个材质模型，用 `patchMaterial` 的高度扫描过渡（沿用 `S.vFrom`、`S.vTo`、`S.vMix`）：切口以上显示新模型，以下显示旧模型，切口处有一条橙色接缝。
4. 建模段：主角褪成线框（`S.wire`、`S.heroCut`）→ 中心线网浮现（`S.net`）→ 线网插值到 1:50 吊顶构件的中心线（`S.netMorph`）→ 吊顶构件按生长顺序出现（`S.canopyGrow`）。1:50 吊顶就是 `ceiling.glb` 乘以 1/50，放在 `SITE_ORIGIN_0`。
5. 按新房间尺寸重调 `KEYS` 中 1.04 – 1.96 的关键帧。

**验收**：

- 5 种材质在 1440×900 特写下能直接分辨质感：卡纸的层边、花泥的孔、板的切边、木纹、打印层纹都清晰可见，没有噪声感的程序化纹理。
- 图纸线条来自用户真实图纸，描绘顺序自然：先外墙，再内墙，最后门窗。
- 窗光斑随滚动移动；阴影无漏光（墙角没有亮缝）、无彼得潘现象（阴影与物体不脱离）。
- HUD 标签按阶段切换：`DRAWING` → 5 种材质标签 → `PARAMETRIC MODEL`；比例尺 `1:100 → 1:50`。
- 移动端：关闭 AO，房间用 `.mobile.glb`，帧率 ≥ 30。

### 4.3 设计 → 建造：比例跳变 + 02 建造（游标 2 – 3，比例尺 `1:50 → 1:1`）

**目标画面**：

- **跳变**：桌上的参数化小模型开始放大，镜头保持不动，模型放大到包住镜头、悬在头顶；房间墙壁向外倒下、下沉消失；比例尺从 `1:50` 快速跳到 `1:1`。
- **建造**：1:1 户外入口雨棚下方，头顶是参数化胶合木吊顶，还留着一些空位。地面上一台工业机械臂（哑光白 + 橙色关节环）在工作台上加工一根木梁，加工好的木梁升上去嵌进空位，随滚动一根接一根，吊顶逐渐补全。旁边站一个白色配景人。镜头从头顶的吊顶摇下来看到机械臂，再绕机械臂环绕半圈。
- 标题 `Build / 建造`，HUD `1:1` · `NANJING 2020` · `w/ RoboticPlus.AI`，每嵌入一根时闪一下 `NODE 047`。

**素材**：

- U：**木吊顶 Rhino / Grasshopper 模型**（`.3dm`），这是本幕质感的关键。需要包括：
  - 全部木梁（每根一个实体，最好带编号）；
  - 立柱、雨棚屋面和主结构；
  - 建造顺序（编号顺序即可）；
  - 每根木梁的中心线（Grasshopper 里输出成曲线，给 4.2 的线网用）。

  如果不能提供原模型，至少提供可公开的照片和大致尺寸，由 E 在 Blender 里按照片重建。
- U：**建成照片与施工照片**（有机器人加工的现场照更好），用于质感参考和作品页。
- U：**机械臂型号**（品牌 / 型号 / 末端工具类型，如铣削主轴）。如果不方便公开型号，就用通用六轴臂外形，去掉 Logo。
- E：**机械臂模型**。厂商 CAD（STEP）或 ROS-Industrial 网格，在 Blender 里减面到 ≤ 60 k 三角形。
  - 层级：`robot_base > robot_j1 > robot_j2 > robot_j3 > robot_j4 > robot_j5 > robot_j6 > robot_tool0`，每个节点的原点在关节轴上，局部轴向统一：j1 绕 Y；j2、j3、j5 绕 X；j4、j6 绕 Z。
  - 材质重做为哑光白外壳（clearcoat 约 0.4）、深灰关节、橙色 `#FF4F1A` 关节环（独立网格 `robot_ring_*`）。
  - 末端工具两个独立节点：`tool_spindle`（02 幕）和 `tool_gripper`（06 幕）。
- E：**胶合木贴图**。Poly Haven / ambientCG 的 Glulam、Laminated Wood 或普通木材，2048²；要能看到胶合层线。
- E：**场地**。铺地（混凝土或石材 PBR）、远景简单建筑体块、户外 HDRI（Poly Haven 阴天 / 晴天，只用于反射）。
- E：**配景人**。CC0 人像，统一白色材质，≤ 10 k 三角形，身高 1.75 m。
- E：**工作台**，以及加工中的木梁（与吊顶构件同一截面）。

**实现步骤**：

1. **Rhino → glTF**：Rhino 8 自带 glTF 导出。每根木梁一个网格，命名 `ceiling_member_####`，按建造顺序编号。立柱、屋面、主结构分别命名 `ceiling_column_*`、`ceiling_roof`、`ceiling_frame`。原点放在吊顶平面投影中心的地面点，也就是现在的 `site` 空间原点。
   - 如果木梁都是同截面的直梁，用脚本把它们转成 `InstancedMesh`，存 `ceiling-members.bin`（每根一个 4×4 矩阵 + 长度），截面网格只存一份。
   - 如果是异形梁，就合并成少量网格，并加一个顶点属性 `_member`（木梁编号），着色器按编号控制显隐和升起。
2. **中心线**：Grasshopper 导出为 `public/assets/data/build/ceiling-centerlines.json`，编号和木梁一一对应。
3. **空位**：从建造顺序末尾选 6 根（`GAP_COUNT`）作为“待补”的木梁。现在 `canopy/field.ts` 的 `gapMembers()` 是在程序化网格上手选的固定位置，改为从真实模型的编号数据读取。
4. **比例跳变**：沿用 `S.jump`、`S.siteS`、`S.siteOrigin` 与 `JUMP_EYE` 机制，只需要保证 `ceiling.glb` 的原点和单位正确。房间墙体在 `S.roomAway` 期间向外倒下并下沉。
5. **机械臂**：`shared/Robot.tsx` 加载 GLB，按节点名拿到关节对象。从 GLB 里量出真实连杆长度（j2 到 j3、j3 到 j5 的距离、肩高、工具长度），替换 `ARM` 常量，继续用现有的解析 IK（偏航 + 平面两连杆 + 腕部保持工具朝下）。如果真实机械臂有肩部偏置（大多数工业臂都有），要在 IK 里补偿。
6. **补梁循环**：沿用 `S.cycle`、`S.cyclePhase`、`S.gapsFilled`。每个循环分为：加工（主轴旋转，木梁在工作台上）→ 抓取 → 升起 → 对位 → 嵌入 → `NODE ###` 闪现。
7. 重调 `KEYS` 中 2.0 – 2.97 的关键帧（跳变停住、仰视吊顶、下摇到机械臂、环绕半圈）。

**验收**：

- 跳变过程中镜头位置不动，没有穿模和闪烁。1:50 到 1:1 过渡平滑，不出现 z-fighting；near 平面随 `siteS` 调整，现有 `CameraRig` 已处理。
- 1:1 仰视时，胶合木的层线、倒角和木纹清晰；木梁之间有 AO，不是平涂。
- 机械臂关节运动合理：无自穿插，末端始终对准木梁；关节环是橙色。
- HUD 只有 `1:1`、`NANJING 2020`、`w/ RoboticPlus.AI`、`NODE ###`，**没有任何面积、构件数、工期**。
- 移动端：吊顶用移动变体，取消木梁升起动画（直接出现）；帧率 ≥ 30。

### 4.4 03 城市（游标 3 – 4，比例尺 `1:1 → 1:500 → 1:5000`）

**目标画面**：02 → 03 用“Powers of Ten”转场：镜头从雨棚下连续拉远，依次看到雨棚、建筑、街区、城市，不切镜。雨棚所在的建筑保留橙色基准棱。进入城市后是约 45° 轴测俯视的白模城市，随滚动绕中心旋转约 60°，太阳划过、阴影旋转。随后街道上亮起墨线式城市数据：沿路网流动的墨点（人流）、升起的六边形柱（POI 密度）、几条 OD 弧线，黑墨 + 橙色，画在纸白背景上。标题 `City / 城市`，HUD `URBAN DATA`。

**素材**：

- U：城市数据研究项目的说明、图片，以及希望用哪座城市、哪个片区（默认南京园博园周边）。
- E：OSM 建筑轮廓和路网（该片区约 2 × 2 km）。用 Blender blender-osm / BlenderGIS 按层数拉伸，统一白模材质，合并成 4–8 个网格。雨棚所在的建筑单独一个节点 `city_subject`，给基准棱用。
- E：数据（示意）：路网折线 JSON（从 OSM 导出）、POI 六边形网格（H3 分辨率 9，数值示意）、10–20 条 OD 弧线（起止点 + 权重）。

**实现步骤**：

1. `scripts/assets/osm-to-city.md`：记录在 Blender 里生成城市的步骤；另写一个脚本把路网转成 `public/assets/data/city/roads.json`（局部 ENU 米坐标，原点对齐 `site` 空间原点）。
2. `acts/City.tsx`：城市 GLB、`InstancedMesh` 六边形柱、沿路网的 GPU 粒子（墨点，移动端数量降到 1/4），OD 弧线用 `Line2`（移动端去掉）。
3. Powers of Ten 镜头：沿用 3.12 – 4.0 的关键帧，拉远时要保证 1:1 场景和城市是同一个坐标系，雾距随 `city` 渐变。
4. 城市几何也给 04、05 幕使用。

**验收**：

- 拉远过程连续，不切镜；雨棚建筑始终可辨认（橙色棱）。
- 城市阴影随太阳旋转；1:5000 时远处建筑不闪烁（阴影视锥覆盖范围正确）。
- 数据图例旁标 `Illustrative` / `示意数据`。
- 移动端建筑和粒子数量降到 1/4，帧率 ≥ 30。

### 4.5 04 评估 DeepArch（游标 4 – 5，比例尺 `1:5000`）

**目标画面**：本幕钉住，镜头停在城市上空，背景变为深夜蓝 `#0A0E14`。4 个小节只切换 HUD 标签和图例，不加句子：

| 小节 | HUD | 画面 |
|---|---|---|
| 气候 | `CLIMATE` | 天穹上的太阳轨迹图（冬至到夏至的日轨弧线），地面风玫瑰 |
| 微气候 | `MICROCLIMATE` | 日照时数热力图随太阳走过全天逐步累积；然后出现青白色风环境流线，绕过建筑，在街谷中加速 |
| 舒适度 | `COMFORT` | 人行高度的热舒适地图（冷蓝 → 舒适绿 → 炎热红），地图上的小人点按舒适度变色 |
| 能碳 | `ENERGY & CARBON` | 每栋楼按能耗强度着色；主体建筑旁铺开一张 365 × 24 逐时能耗地毯图，从 1 月逐列“织”到 12 月 |

建筑变成半透明深灰体块，只有数据是亮的；使用色带图例、等宽字、`Illustrative` 标注和选择性 Bloom。主体建筑用细引线标出 `SUBJECT BUILDING`。03 → 04 转场用“扫描涂色”：一道发光扫描面扫过城市，白模变成数据色，墨线淡出，背景从纸白变为深夜蓝。标题 `Evaluate / 评估`，HUD 常驻 `DEEPARCH`。

**素材**：

- U：DeepArch 可公开的截图、录屏、输出示例（给作品页用，也作为配色参考）。
- E：南京 EPW 气象文件。
- E：**预计算**的分析结果。用 Ladybug Tools（Grasshopper）或 Python（ladybug-core、pvlib）在 03 幕的城市网格上离线计算，结果都是示意：
  - 日轨弧线：JSON，12 个月的日轨折线；
  - 风玫瑰：JSON，16 个方向 × 风速分档；
  - 日照时数：逐顶点数值，写进城市 GLB 的 `_sunhours` 顶点属性，或存成地面热力贴图（1024² 的 16 位 PNG / KTX2）；
  - 风流线：离线 CFD（Eddy3D / Butterfly）或程序化速度场，导出 2000–5000 条流线折线，压成二进制 `.bin`；
  - 热舒适：地面贴图（1024²）；
  - 能耗地毯：365 × 24 的 Float32 `.bin`。

**实现步骤**：

1. `acts/Evaluate.tsx`，每个小节一个子组件，只读 `S.a.evaluate` 的局部进度。
2. 日照累积：着色器按 `uHour` 对逐顶点日照数值做累积显示。
3. 流线：`InstancedMesh` 粒子沿预计算流线移动，带拖尾（桌面 6.5 万粒子；移动端 4 千，只画点、无拖尾）。
4. 能耗地毯：`DataTexture` + 按列显现的着色器。
5. 选择性 Bloom：postprocessing 的 `SelectiveBloom`，或按 layer 分离后合成；只在 04–06 幕、且仅 high 档启用。
6. 扫描涂色转场：城市材质加一个 `uScanY` 补丁。

**验收**：4 个小节画面切换清晰，数据色彩和深夜蓝背景对比足够；流线在街谷中能看出加速；图例带 `Illustrative`；移动端和 reduced-motion 按叙事文档 5.2 节降级（热力图直接显示终态，每小节一张静态图）。

### 4.6 05 空间重建（游标 5 – 6，比例尺 `1:1 RECON → ×10,000 SCENES`）

**目标画面**：04 → 05 用“LiDAR 扫描”转场：冷白扫描光从天空垂直扫下，扫过的一切溶解成点云，同时有一下色差脉冲。背景为近黑 `#05070A`。

1. **重建**（`3DGS`）：主体建筑和周边街区变成点云，悬浮在发光网格地面上；四周浮现一圈相机位姿线框四棱锥；点逐渐“长”成柔和、带方向的高斯点。镜头下降到人视高度，在点云街道里穿行一小段。
2. **生成**（`PCG`）：主角体块体素化成一个小房间（01 幕房间的虚拟版），然后被 PCG 复制：两侧展开成开窗、隔墙、家具各不相同的房间阵列，一直延伸到远处。HUD 计数器飞速跳动 `SCENES 00001 → 10,000+`。

标题 `Reconstruct / 空间重建`。

**素材**：

- U：**用户自己的 3DGS 重建结果**（`.ply`，来自 gsplat / nerfstudio / Postshot / Polycam 等），最好是一段街道或建筑外观，以及对应的相机位姿（COLMAP `images.txt` / `cameras.txt` 或 nerfstudio 的 `transforms.json`）。**必须确认有公开展示权**。
- U：PCG 管线的输出示例：几个生成的房间模型（GLB / OBJ）或截图，以及能公开的参数维度（开窗、隔墙、家具等）。
- E：如果没有合适的 3DGS，从 03 幕的城市网格用 `MeshSurfaceSampler` 采样生成示意点云作为兜底。
- E：PCG 房间套件：Blender 自建模块化部件（墙段、窗洞墙、门、桌、椅、柜等 20–30 件，每件 ≤ 2 k 三角形），运行时按种子随机组装；远处用单体块做 LOD。

**实现步骤**：

1. 3DGS 渲染库推荐 [Spark](https://sparkjs.dev)（`@sparkjsdev/spark`，three.js 原生，支持 `.ply`、`.spz`、`.splat`、`.ksplat`）。用 `.spz` 压缩存储，桌面 ≤ 1 M 个高斯点，移动端 ≤ 250 k，放两个文件。**上线前确认它不依赖 SharedArrayBuffer**：GitHub Pages 不能设置 COOP / COEP 响应头。
2. 高斯点的“生长”：在 Spark 的着色器钩子里控制点的尺度 / 不透明度随 `S.a.reconstruct` 渐变；前半段先用普通点精灵表现点云，再交叉淡入到高斯点。
3. 相机四棱锥：从位姿文件生成 `InstancedMesh` 线框。
4. PCG 阵列：`InstancedMesh` × 部件类型，房间布局由确定性伪随机数生成（固定种子，保证录屏可重复）；计数器由 DOM HUD 显示。
5. LiDAR 扫描转场：城市材质加扫描平面补丁 + 溶解，粒子交接到点云；色差效果只在转场时启用。

**验收**：3DGS 真实可辨（不是一团噪点）；穿行时帧率桌面 ≥ 45、移动 ≥ 30；PCG 房间之间的差异肉眼可见；计数器从 `00001` 到 `10,000+`；`3DGS` / `PCG` 标签按段切换。

### 4.7 06 具身智能 VLA（游标 6 – 7，比例尺 `1:1`）

**目标画面**：05 → 06 转场：镜头俯冲进阵列中的一个房间，房间从体素凝固成实体；角落的体素飞起，组装成一台机械臂（和 02 幕同一型号）。本幕按 VLA 结构分三拍：

1. **语言**：画面中央像终端一样逐字打出 `> place the block on the table`（中文模式 `> 把白模放到桌上`），`block` 和 `table` 高亮，各引出一条细线指向场景里的物体。这句是 DOM 叠加层，属于场景的一部分，不算叙事文案。
2. **视觉**：机械臂末端相机射出半透明视锥，扫过的物体出现 3D 包围框和标签 `block · table · window`；右下角弹出机器人视角小窗，叠一层 patch 网格，被关注的格子变亮。
3. **动作**：先出现一串半透明“幽灵”关键姿态连成的轨迹，机械臂随后沿轨迹抓起主角体块放到桌上，落下时桌面亮起一圈脉冲。

背景近黑，标题 `Embody / 具身智能`，HUD `VLA`。

**素材**：

- U：VLA 演示视频（机器人视角或第三人称），以及可公开程度：只写方向，还是可以放演示视频。
- U：实际使用的机械臂型号（如果和 02 幕不同，叙事上仍然用同一台）。
- E：复用 `robot.glb`（换 `tool_gripper`）、`hero-block.glb`、设计幕的桌子。

**实现步骤**：

1. 指令打字用 DOM（字典里加 `embody.command`，中英两份），引线端点每帧从 3D 物体投影到屏幕坐标（在 ScrollBus listener 中更新，和 WebGL 同帧）。
2. 视锥和包围框：线框几何；机器人视角小窗用 256² 的 FBO 渲染（移动端关闭），叠加 patch 网格着色器。如果用户有真实 VLA 视频，可以用视频纹理替代 FBO，更真实。
3. 幽灵姿态：同一机械臂 GLB 克隆 5–7 份，半透明材质，每份一组预设关节角。
4. 抓取：IK 目标沿贝塞尔轨迹移动，主角体块在抓取帧挂到 `robot_tool0` 下，放下时再挂回场景。
5. 06 → 索引转场：“升起成平面图”，镜头垂直升起，FOV 渐变到接近正交（dolly zoom），点阵擦除从近黑翻回纸白。

**验收**：三拍节奏清楚；中英切换时指令文字跟着切换，但 3D 不重置；抓放过程无穿模；移动端关闭小窗，轨迹只显示终点姿态。

### 4.8 索引（游标 7 – 8，比例尺 `1:100`）

**目标画面**：正交轴测视角。主角体块落进一排体块阵列，每块代表一个项目，外形和材质由类别决定（`design` 用 5 种模型材质之一；`build` 用木梁阵列 + 机械臂缩影；`city` 用白模城市簇；`evaluate` 用热力色；`reconstruct` 用高斯点 / 体素；`embody` 用体素 + 橙色关节）。悬停时体块升起，DOM 列表对应行高亮；点击进入详情页。页脚处主角体块回到序幕状态缓慢自转，点击回到顶部。标题 `Index / 索引`。DOM 部分：精选 3–5 个项目（标题 · 年份 · 类别）、`All works →`、邮箱（点击复制）、`© xun's studio`。

**素材**：复用各幕资产的缩略版本（每个类别一个 ≤ 5 k 三角形的“标本”GLB），以及 U 提供的作品封面图。

**实现步骤**：`acts/Index.tsx`；体块和 DOM 行通过 `slug` 双向联动（hover 状态放进一个小 store，不走 React 全局重渲染）；06 → 索引的 dolly zoom 在 `CameraRig` 里对 FOV 做特殊插值。

**验收**：体块和列表一一对应；键盘可访问（Tab 聚焦列表行，对应体块高亮）；移动端体块改为单列、点击代替悬停。

### 4.9 作品页、`/about` 与 OG

- **作品 frontmatter 扩展**：`cover`（封面）、`gallery`（图片数组，含 `src`、`alt`、`w`、`h`）、`video`（`src`、`poster`）。详情页加画廊组件：图片进入视口时做负片显影；底部 `Prev / Next`。
- **`/works` 标本体块**：右侧固定一个小 Canvas，复用各类别的标本 GLB；悬停列表行时切换。封面用点阵显现在它身后。移动端改为跟随当前滚动到的行切换。
- **图片规范**：DOM 图片存 AVIF + WebP 两份，宽度 800 / 1600 / 2400 三档，用 `<picture>` + `srcset`。`next/image` 在静态导出下不做优化，所以要预先生成，写一个 `scripts/assets/images.mjs`（sharp）。
- **视频**：H.264 MP4（兼容性）+ 可选 WebM（VP9），1080p，码率约 4 Mbps，≤ 15 MB；自动播放时要加 `muted playsinline loop`；另备一张 poster 图。
- **`/about`**：一句话定位 + 按比例尺刻度排布的时间线（年份和机构来自用户）+ 邮箱。不写行业背景。
- **OG 图**：每种语言一张 1200×630，从序幕截图生成，放在 `public/og/og-en.png`、`og-zh.png`。
- **署名**：`/about` 底部加一个小字 Credits 区，列出 CC-BY 和 ODbL 素材的署名（从 `CREDITS.md` 生成）。

### 4.10 无 WebGL 与 reduced-motion 的海报图

所有幕做完后，用 `capture.mjs shots` 在 `STOPS` 的每个游标位置截图，输出到 `public/assets/posters/<stop>.avif`（1600 宽）。无 WebGL 时按滚动位置切换这些海报；reduced-motion 仍然用实时渲染的静态关键帧。

---

## 5. 素材收集清单（给用户逐项填写）

填写方式：在“状态”列写 `✅ 已提供` / `⏳ 准备中` / `❌ 无，请代做` / `🚫 不公开`；在“备注”列写文件位置（网盘链接或仓库 `assets-src/` 下的路径）和任何限制。**优先级**：P1 = 没有它这一幕的质感上不去；P2 = 明显加分；P3 = 可选。

### 5.1 通用信息

| # | 项目 | 说明 / 格式 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|---|
| G1 | 首批上架作品清单 | 3–8 个，每个写：英文名、中文名、年份、类别（6 类之一）、你的角色、地点、合作方、是否精选 | P1 | | |
| G2 | 每个作品的正文 | 英文为主，中文可选；可以只写 2–4 行 | P2 | | |
| G3 | 作品封面图 | 每个作品 1 张，≥ 2400 px 宽，JPG / PNG / TIFF 原图 | P1 | | |
| G4 | 作品图集 / 视频 | 每个作品 3–10 张图；视频 MP4 原片 | P2 | | |
| G5 | `/about` 时间线 | 6 段经历各自的年份和机构（可选，不写也行） | P3 | | |
| G6 | 可公开程度 | 各项目（尤其 VLA、DeepArch、PCG）可以写到什么程度，能否放截图或视频 | P1 | | |
| G7 | 合作方名称写法 | 确认 `RoboticPlus.AI` 的写法；是否允许出现其他合作方名字 | P2 | | |

### 5.2 设计幕

| # | 项目 | 说明 / 格式 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|---|
| D1 | 平面图 | 一个可公开项目，DXF / DWG / SVG / 矢量 PDF；只留墙、门窗、轴线 | P1 | | |
| D2 | 剖面图 | 同上 | P1 | | |
| D3 | 卡纸模型照片 | 4–8 张多角度，自然光，背景干净 | P1 | | |
| D4 | 花泥模型照片 | 同上 | P1 | | |
| D5 | 木板模型照片 | 同上 | P1 | | |
| D6 | 木模型照片 | 同上 | P1 | | |
| D7 | 3D 打印模型照片 | 同上 | P1 | | |
| D8 | 实体模型扫描 | 如果模型还在：Polycam / RealityScan / Scaniverse 扫描，导出 GLB 或 OBJ + 贴图（每种一个即可） | P2 | | |
| D9 | 工作室氛围参考 | 你喜欢的工作室 / 书桌照片（只作风格参考） | P3 | | |

### 5.3 建造幕

| # | 项目 | 说明 / 格式 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|---|
| B1 | 木吊顶 Rhino 模型 | `.3dm`：木梁（每根独立实体）、立柱、雨棚、主结构 | P1 | | |
| B2 | 木梁编号 / 建造顺序 | 模型里的编号即可，或一张 CSV | P2 | | |
| B3 | 木梁中心线 | Grasshopper 输出的曲线（放在 B1 的单独图层里即可） | P2 | | |
| B4 | Grasshopper 定义 | `.gh`（只用于理解生成逻辑，不公开） | P3 | | |
| B5 | 建成照片 | 5–15 张，含仰视吊顶的照片 | P1 | | |
| B6 | 施工 / 机器人加工照片或视频 | 有就提供 | P2 | | |
| B7 | 机械臂型号与末端工具 | 品牌、型号、工具类型；是否介意画面里出现厂商外形 | P1 | | |

### 5.4 城市、评估、空间重建、具身智能

| # | 项目 | 说明 / 格式 | 优先级 | 状态 | 备注 |
|---|---|---|---|---|---|
| C1 | 城市与片区 | 用哪座城市哪一片（默认南京园博园周边） | P2 | | |
| C2 | 城市数据项目图片 | 可公开的分析图、地图截图 | P2 | | |
| E1 | DeepArch 截图 / 录屏 | 界面、分析结果（会模糊处理敏感信息） | P1 | | |
| E2 | DeepArch 配色 / 图例偏好 | 有现成色带就提供 | P3 | | |
| R1 | 3DGS 结果 | `.ply` + 相机位姿（COLMAP 或 `transforms.json`），确认可公开 | P1 | | |
| R2 | 3DGS 录屏 | 查看器里的飞行录屏（作品页用） | P2 | | |
| R3 | PCG 输出样例 | 5–20 个生成的房间（GLB / OBJ）或截图；可公开的参数维度 | P2 | | |
| V1 | VLA 演示视频 | 机器人视角 / 第三人称，MP4 | P1 | | |
| V2 | VLA 指令示例 | 如果想换掉 `place the block on the table` | P3 | | |
| V3 | 实际使用的机器人型号 | 用于判断 06 幕是否与 02 同型号 | P3 | | |

### 5.5 由执行模型获取（用户无需准备，但需要最终确认风格）

| # | 项目 | 来源 |
|---|---|---|
| X1 | 主角体块、房间壳体、5 个材质模型的基础几何 | Blender 自建 |
| X2 | 室内 / 户外 HDRI | Poly Haven（CC0） |
| X3 | 卡纸、胶合板、实木、胶合木、混凝土、铺地 PBR 贴图 | Poly Haven、ambientCG（CC0） |
| X4 | 绘图桌、椅子、台灯、书架 | Poly Haven Models、Sketchfab CC0 / CC-BY |
| X5 | 机械臂网格 | ROS-Industrial 或厂商 CAD（按 B7 选型号） |
| X6 | 配景人 | CC0 人像 |
| X7 | 城市建筑与路网 | OpenStreetMap（ODbL，需署名） |
| X8 | 南京 EPW | climate.onebuilding.org |
| X9 | PCG 房间套件 | Blender 自建 |

**交付方式建议**：大文件（`.3dm`、`.ply`、原始照片和视频）放网盘，把链接写在备注里；或者直接放进仓库 `assets-src/`（见 6.1，按 Git LFS 规则提交）。

---

## 6. 素材放置约定

### 6.1 目录

```
assets-src/                      原始素材（不参与构建，不发布）
  README.md                      来源、日期、注意事项
  user/<编号>-<简述>/            用户提供，编号对应第 5 节，例如 user/B1-ceiling-rhino/
  external/<来源>-<名称>/        外部下载的原始文件，例如 external/polyhaven-plywood/
  blender/<act>/<name>.blend     Blender 工程
public/
  decoders/draco/                Draco 解码器（从 three/examples 复制）
  decoders/basis/                Basis 转码器
  assets/
    CREDITS.md                   许可登记表（每个外部素材一行）
    models/<act>/<name>.glb
    models/<act>/<name>.mobile.glb
    textures/<act>/<name>.ktx2   单独加载的贴图（烘焙光照、图纸纸张）
    hdri/<name>-1k.hdr           或预过滤后的 .ktx2 / .exr
    splats/reconstruct/<name>.spz
    splats/reconstruct/<name>.mobile.spz
    data/<act>/<name>.json|bin   线稿、中心线、路网、分析结果、位姿
    video/<act>/<name>.mp4
    posters/<stop>.avif          无 WebGL 海报
  works/<slug>/cover-{800,1600,2400}.{avif,webp}
  works/<slug>/NN-{800,1600,2400}.{avif,webp}
  works/<slug>/video.mp4, video-poster.webp
  og/og-en.png, og-zh.png
content/works/<slug>/index.{en,zh}.mdx
lib/assets.ts                    资产清单（代码只通过它引用 URL）
scripts/assets/                  build.mjs（GLB 管线）、images.mjs（图片）、dxf-to-lines.mjs、check.mjs（预算检查）
```

`<act>` 取值：`prologue | design | build | city | evaluate | reconstruct | embody | index | shared`。跨幕共用的资产，比如主角体块和机械臂，放在 `shared/`。

**Git 规则**：

- `assets-src/` 下单个文件 > 10 MB 的，用 Git LFS 提交（在 `.gitattributes` 里登记 `*.3dm *.ply *.blend *.psd *.tif *.mov`）。部署工作流 `actions/checkout` 默认不拉 LFS，不影响发布。注意 GitHub LFS 免费额度是 1 GB 存储、每月 1 GB 流量；超过的话改放网盘，在 `assets-src/README.md` 里写链接。
- `public/assets/` 里只放压缩后的最终文件，普通 git 提交；单文件 ≤ 25 MB。

### 6.2 命名

- 文件名和目录名：小写 `kebab-case`，英文，不带空格和中文。例如 `hero-block.glb`、`model-cardboard.glb`、`ceiling.glb`、`ceiling-centerlines.json`、`robot.glb`、`studio-room.glb`、`studio-room-lightmap.ktx2`。
- 移动端变体后缀 `.mobile`（放在扩展名前）；LOD 后缀 `-lod1`、`-lod2`。
- 不在文件名里写版本号。需要强制更新缓存时，在 `lib/assets.ts` 的 URL 后加 `?v=<短哈希>`，由 `scripts/assets/build.mjs` 自动写入。
- GLB 节点名：`snake_case`，前缀为所属对象，例如 `room_wall_front`、`robot_j3`、`ceiling_member_0047`、`city_subject`。
- 作品图片：`cover`、`01`、`02`……按展示顺序编号。

### 6.3 坐标与原点约定（代码依赖这些约定）

| 资产 | 原点 | 尺寸约定 | 对应常量 |
|---|---|---|---|
| `hero-block.glb` | 底面中心 | 边长 1 m（代码按需缩放） | `HERO_SIZE`、`PROLOGUE_LIFT` |
| `model-*.glb` | 底面中心 | 边长 0.3 m | `HERO_SIZE = 0.3` |
| `studio-room.glb` | 地面中心 | 3.6 m 立方体；桌子、窗洞位置与常量一致 | `ROOM`、`TABLE`、`WINDOW`、`SHEET`、`HERO_POS` |
| `ceiling.glb` | 吊顶平面投影中心的地面点 | 1:1 米 | `site` 空间原点、`SITE_ORIGIN_0`、`JUMP_EYE` |
| `robot.glb` | 底座底面中心 | 真实尺寸 | `ARM_BASE`、`ARM`（按模型重新标定） |
| `site-*.glb`、`human.glb`、`bench.glb` | 与 `ceiling.glb` 同一原点 | 1:1 米 | `BENCH`、`HUMAN` |
| `city.glb` | 与 `ceiling.glb` 同一原点（ENU 局部坐标） | 1:1 米 | — |

如果真实模型和现有常量对不上，**改常量去适配模型**，不要去缩放模型。改完后重调 `KEYS`。

### 6.4 `CREDITS.md` 格式

```markdown
| 文件 | 来源 URL | 作者 | 许可 | 修改 |
|---|---|---|---|---|
| models/shared/robot.glb | https://github.com/ros-industrial/kuka_experimental | ROS-Industrial | Apache-2.0 | 减面、重做材质、去 Logo |
| textures/design/plywood.ktx2 | https://polyhaven.com/a/plywood | Poly Haven | CC0 | 调色、KTX2 |
| models/city/city.glb | https://www.openstreetmap.org | © OpenStreetMap contributors | ODbL | 拉伸、合并 |
```

---

## 7. 分阶段执行顺序与提示词模板

每个阶段都可以独立交给一个模型完成，在自己的分支上开 PR，合并后再开始依赖它的阶段。标 ∥ 的阶段可以并行。

| 阶段 | 内容 | 依赖 | 需要的用户素材 |
|---|---|---|---|
| **P0** | 资产管线与加载基础设施 | — | 无 |
| **P1** | 光照、后处理、色彩管理基线；材质库 | P0 | 无（D3–D8 照片作参考更好） |
| **P2** | 序幕 + 01 设计（主角体块、5 个材质模型、房间、真实图纸） | P1 | D1–D8 |
| **P3** | 比例跳变 + 02 建造（木吊顶、机械臂、场地） | P1（1:50 段与 P2 衔接） | B1–B7 |
| **P4** ∥ | 03 城市 + Powers of Ten | P3 | C1–C2 |
| **P5** ∥ | 04 评估 | P4 | E1–E2 |
| **P6** ∥ | 05 空间重建 | P4 | R1–R3 |
| **P7** | 06 具身智能 | P3（机械臂）、P6（转场） | V1–V3 |
| **P8** ∥ | 索引、/works、详情页、/about、OG（真实内容） | P1 | G1–G7 |
| **P9** | 全站性能、移动端、降级、海报图、QA、上线 | 全部 | — |

P2 和 P3 可以由两个模型同时做：P3 先按 1:1 做吊顶和机械臂，P2 完成后再统一联调比例跳变。P8 只依赖 P1 和用户内容，可以最早开始。

### 7.1 通用提示词模板

把 `{}` 里的内容替换后发给执行模型：

```text
你在仓库 WangXXun/WangXXun.github.io 工作，基础分支为 {基础分支，例如 cursor/studio-rebuild-d624 或 master}。
请新建分支 {分支名}，完成阶段 {阶段编号：阶段名}。

必读：
1. docs/HANDOFF.md（交接提纲）：第 0 节硬规则、第 1 节架构、第 3 节资产规范、第 6 节放置约定，以及第 4.{x} 节本幕方案。
2. 与本阶段相关的代码：{列出文件，如 lib/director/state.ts、components/three/parts/Room.tsx}。

目标：
{从第 4 节复制本幕“目标画面”}

输入素材：
{列出 assets-src/ 下的路径或网盘链接；缺失的素材按第 3.1 节自行从 CC0 来源获取，并登记到 public/assets/CREDITS.md}

约束：
- 不推翻 ScrollBus / director 架构；场景状态只在 lib/director/state.ts 的 derive() 里计算，组件只读 S。
- 动画只用 bus.time / S，不用 Clock 或 Date.now，保证 capture 可复现。
- 每幕只有一个标题；其余信息只用英文 HUD 标签；不写木吊顶细节；不提行业背景；文字不烘焙进贴图。
- 资产按第 3.3 节压缩（Draco + KTX2，桌面 / 移动两份），解码器自托管；符合第 3.4 节预算。
- 只用 CC0 / CC-BY / 宽松开源许可的外部素材。

交付：
- 代码 + public/assets 下的最终资产 + scripts/assets 下可重复执行的转换脚本 + CREDITS.md 更新。
- 通过 npm run lint、npm run typecheck、npm run build、npm run smoke。
- 用 scripts/capture.mjs 在 {游标列表，如 1.1,1.3,1.5,1.9} 处截图，并录一段本幕滚动视频，附在 PR 里。
- PR 描述（中文）写明：做了什么、资产清单与大小、三角形数和 draw calls（高档位 / 移动端）、验收标准逐条的完成情况、未完成项。

验收标准：
{从第 4 节复制本幕验收，再加上第 8.1 节通用标准}
```

### 7.2 各阶段补充说明（附加到通用模板）

**P0 资产管线与加载基础设施**

```text
本阶段不改画面，只做基础设施：
1. devDependencies 加 @gltf-transform/cli、@gltf-transform/core、@gltf-transform/extensions、@gltf-transform/functions、sharp；在 README 写明需要系统安装 KTX-Software 4.3+（ktx 命令）。
2. 把 three/examples/jsm/libs/draco/gltf 和 libs/basis 复制到 public/decoders/，用 postinstall 或 scripts/copy-decoders.mjs 完成，保证版本和 three 一致。
3. components/three/assets/loaders.ts：单例 DRACOLoader、KTX2Loader（在 Canvas onCreated 里用 gl 做 detectSupport）、MeshoptDecoder；封装 useAsset(key) 按档位选桌面 / 移动 URL。
4. lib/assets.ts：资产清单（key、desktop、mobile、预估字节、所属幕）。
5. scripts/assets/build.mjs：读取 scripts/assets/pipeline.json（每项：源文件、输出名、贴图上限、是否 instancing、颜色槽和数据槽），执行第 3.3 节流程，输出 inspect 报告。
6. scripts/assets/check.mjs：检查 lib/assets.ts 的每个 URL 在 public/ 下存在、大小在预算内、CREDITS.md 有登记；加入 npm run assets:check，并接入 deploy.yml 的 build 之前。
7. Experience.tsx：按幕分 Suspense；序幕 12 棱画线读 useProgress。
8. capture.mjs 和 smoke.mjs：截图前等待 window.__studio.ready()（所有已请求的资产加载完成）；smoke 增加“无 404 请求”检查。
9. 用 Poly Haven 的一个 CC0 小模型做一次端到端验证（Draco + KTX2，在静态导出后的 out/ 中能加载），验证完删除该模型。
验收：npm run build 后 serve out/，控制台无错误；Network 面板里 .glb 和 .ktx2 来自本站，没有外部 CDN 请求。
```

**P1 光照、后处理、色彩管理基线；材质库**

```text
1. Lights.tsx：保留太阳轨迹和阴影视锥逻辑；环境改为 Poly Haven HDRI（室内一张、户外一张，按 S.view 交叉淡入），只用于 scene.environment，背景仍是 S.bg 纸白。
2. 统一色彩：renderer.outputColorSpace = SRGBColorSpace；颜色贴图 SRGBColorSpace，数据贴图 NoColorSpace（KTX2 由 gltf-transform 写入正确的色彩空间标记）。
3. 色调映射保持 Khronos Neutral。改动时同步检查 components/three/bgTone.ts：截图中背景像素和 CSS #F2F0EB 的差值 ≤ 2/255。
4. components/three/shared/patchMaterial.ts：从 materials/modelMaterial.ts 提取高度扫描过渡、橙色接缝、溶解切口、等参线，改为给 MeshStandardMaterial / MeshPhysicalMaterial 用的 onBeforeCompile 补丁（用 customProgramCacheKey 区分变体）。
5. 材质库：white、paper、foam、board、wood、print、glulam 七种，都用真实 PBR 贴图（KTX2），做一个 ?debug=materials 的材质球展示页（只在开发模式启用）。
6. 阴影：PCFSoft 或 VSM 二选一并说明理由；导入的模型统一 castShadow / receiveShadow；接触阴影可用 Drei ContactShadows（只在序幕和索引）。
验收：材质球截图中 7 种材质质感明确；与 v1 同位置截图对比，纸白背景一致。
```

**P2 序幕 + 01 设计**

```text
按第 4.1 和 4.2 节执行。关键点：
- 房间 GLB 按铰链拆分墙体，沿用 S.flapFront / S.flapTop / S.roomAway。
- 5 个材质模型包围盒完全一致，过渡沿用 S.vFrom / S.vTo / S.vMix。
- 图纸来自 assets-src/user/D1-*、D2-*，写 scripts/assets/dxf-to-lines.mjs 转换，替换 parts/drawing.ts。
- 烘焙 AO / 间接光到 UV1；太阳直射保持实时。
- 重调 KEYS 中游标 0–1.96 的关键帧。
截图游标：0.0, 0.7, 1.1, 1.27, 1.36, 1.44, 1.52, 1.6, 1.68, 1.8, 1.9。
```

**P3 比例跳变 + 02 建造**

```text
按第 4.3 节执行。关键点：
- ceiling.glb 由 assets-src/user/B1-* 的 Rhino 模型导出，原点和单位按第 6.3 节；1:50 模型和 1:1 吊顶是同一个文件。
- 待补的 6 根木梁从建造顺序末尾选取，替换 canopy/field.ts 里手选的固定位置。
- robot.glb 层级 robot_base > robot_j1 … robot_j6 > robot_tool0，从模型量出连杆长度替换 ARM 常量，处理肩部偏置。
- HUD 只允许 1:1、NANJING 2020、w/ RoboticPlus.AI、NODE ###。
- 重调 KEYS 中游标 1.96–3.0 的关键帧，保证跳变期间镜头不动（hold）。
截图游标：1.96, 2.0, 2.06, 2.12, 2.2, 2.32, 2.44, 2.6, 2.75, 2.9。
```

**P4 – P7（03 城市、04 评估、05 空间重建、06 具身智能）**

```text
按第 4.4 / 4.5 / 4.6 / 4.7 节执行。
- 新建 components/three/acts/<Act>.tsx，从 parts/Site.tsx 中移除对应的占位代码。
- 新状态字段加到 SceneState / derive()；lib/story.ts 中本幕 ready 改为 true；删除本幕的 SCENE IN PROGRESS 标签。
- 本幕的 reduced-motion 静态关键帧加入 STOPS。
- 数据类画面在图例旁显示字典中的 illustrative 文案。
截图游标：本幕每个小节的中点，以及进入 / 离开本幕的转场各 3 帧。
```

**P8 索引与内容页**

```text
按第 4.8、4.9 节执行。
- 把用户提供的 G1–G7 内容写进 content/works/<slug>/index.{en,zh}.mdx；图片经 scripts/assets/images.mjs 生成三档 AVIF / WebP。
- WorkMeta 增加 gallery、video；详情页加画廊（负片显影）、Prev / Next。
- /works 右侧标本体块 Canvas（独立小 Canvas，DPR 上限 1.5，不在屏幕内时停止渲染）。
- /about 时间线和 Credits；OG 图两张。
- 木吊顶详情页只写：Parametric Timber Ceiling · Gate 2, Nanjing Garden Expo Park · 2020 · with RoboticPlus.AI + 图片。
```

**P9 全站优化与上线**

```text
1. 在真实设备上测（至少一台 iPhone、一台中端 Android、一台集成显卡笔记本），记录各幕 FPS、draw calls、三角形、显存（r3f-perf，仅 ?debug 时加载）。
2. 超预算的项按第 8 节处理；移动端全程 ≥ 30 fps，且无崩溃、无白屏。
3. 生成 STOPS 海报图，用于无 WebGL 回退。
4. Lighthouse（移动）：Performance ≥ 70、Accessibility ≥ 95、SEO ≥ 95。
5. 合并到 master，确认 GitHub Pages 发布成功；/en、/zh、/works、/about 与每个作品页可访问。
```

---

## 8. 质量标准与常见坑

### 8.1 通用验收标准（每个阶段都要满足）

- `npm run lint`、`npm run typecheck`、`npm run build`、`npm run smoke`、`npm run assets:check` 全部通过。
- 浏览器控制台无错误、无 WebGL 警告；Network 无 404，也没有对外部 CDN 的请求。
- 首页 `/en` ↔ `/zh` 切换后：滚动位置不变、Canvas 不重建、URL 更新。
- 桌面 1440×900 和移动 390×844 两个视口截图都没有文字与画面重叠。
- reduced-motion（`?motion=reduce`）下每个小节都有静态画面，信息不减少。
- 符合第 0 节全部硬规则。

### 8.2 性能

- **Draw calls 是桌面瓶颈，显存是移动端瓶颈。** 合并静态网格、用实例化、用贴图图集；移动端一律 KTX2，不要有 PNG / JPG 贴图进 GPU。
- iOS Safari 的 WebGL 内存上限约 256–384 MB，超过会直接刷新页面。移动端贴图 ≤ 1024²，阴影 1024，DPR ≤ 1.5。
- 不可见的幕设 `visible = false`（现有代码已这样做）。离开很远的幕也不要卸载资源，否则回滚时会重新解码卡顿。
- 大资产的解码（Draco、KTX2、3DGS 排序）放在 Worker 里，three 的加载器默认就在 Worker 里跑。不要在滚动时首次创建材质：着色器编译会卡帧，要在加载后用 `gl.compile(scene, camera)` 预编译。
- 后处理只在 high 档启用。N8AO 只在 01–03 幕；Bloom 只在 04–06 幕。
- 阴影贴图不要每帧改尺寸，只在范围变化超过阈值时更新投影矩阵（现有 `Lights.tsx` 已这样做）。

### 8.3 移动端

- 滚动长度 × 0.65；文字放在底部 1/3，避开 HUD。
- 触屏使用原生惯性（Lenis `syncTouch: false`，现状即如此）。
- 视频必须 `muted playsinline`，否则 iOS 不自动播放。
- 横竖屏切换会触发 ScrollTrigger refresh，已经设置了 `ignoreMobileResize`，不要去掉。
- 竖屏时 `CameraRig` 会加宽垂直 FOV。新镜头关键帧要在 390×844 下检查构图。

### 8.4 光照与后处理

- 纸白背景是品牌色，**背景不要用 HDRI**，HDRI 只作为 `scene.environment`。
- 烘焙贴图只包含 AO 和间接光，直射阳光保持实时，因为太阳要随滚动移动。烘焙时太阳关掉，只保留天空 / 环境光。
- 阴影 acne 和彼得潘现象：`normalBias` 随阴影范围缩放（现有代码是 `extent * 0.0035`），导入模型后要重调。
- 比例跳变期间尺度跨度是 50 倍，城市拉远时是 5000 倍。near / far、阴影范围、AO 半径、雾距都随尺度变化（现有代码已处理）。新增效果也要随 `S.siteS` 或游标调整参数。
- 深色幕（04–06）的亮度来自自发光和 Bloom，不要靠提高灯光强度。现有 `S.dark` 会自动压暗太阳和环境光。

### 8.5 色彩管理

- 颜色贴图（baseColor、emissive）用 sRGB；法线、ORM、光照图、数据贴图用线性（`NoColorSpace`）。KTX2 编码时要带上正确的色彩空间标记，gltf-transform 按槽位自动处理，单独编码时 `ktx create` 需要手动加 `--assign-oetf srgb` 或 `linear`。
- 代码里的 `THREE.Color('#F2F0EB')` 会按 sRGB 转成线性，这是对的；不要手动做 gamma。
- 色调映射只能做一次。渲染器设置了 `NeutralToneMapping`；high 档的后处理链末尾有 `ToneMapping(NEUTRAL)`，`bgTone.ts` 会为后处理路径预补偿背景色。修改任意一处，都要用截图取色验证背景色与 DOM 一致。
- 3DGS 的颜色通常已经是 sRGB 显示值，渲染时不要再做色调映射，或按库的建议设置，否则会发灰。

### 8.6 静态导出与 GitHub Pages

- 不能设置自定义响应头，所以不能用 SharedArrayBuffer（需要 COOP / COEP），也不能手动设置缓存策略。选库时要确认不依赖这些。
- GitHub Pages 对 `.glb`、`.ktx2`、`.bin` 不一定做 gzip，所以压缩只能靠 Draco、KTX2 的 zstd 和 `.spz` 自身。
- 单文件硬上限 100 MB，站点 1 GB，每月流量软上限 100 GB。
- `next/image` 在静态导出下不优化图片，要自己生成多尺寸。
- `trailingSlash: true`：内部链接要带结尾斜杠，否则会多一次重定向。
- `lib/works.ts` 使用 fs，只能在服务端组件里 import。

### 8.7 叙事与文案

- 每次新增画面都自问：这是标题，还是 HUD 标签？如果是一句话，就删掉。
- 专有名词两种语言都保持原文：DeepArch、VLA、3DGS、PCG、RoboticPlus.AI。
- 数据类画面都要有 `Illustrative` / `示意数据`。
- 木吊顶相关的任何位置（HUD、作品页、alt 文本、OG）都不写面积、构件数、工期。

### 8.8 其他常见坑

- Blender 导出 glTF 时勾选 “+Y Up”，并 Apply Modifiers；Custom Properties 按需勾选（可以用来传木梁编号）。
- Rhino 导出前把 Mesh 设置调到合适精度，太密会导致面数爆炸；木梁这类简单实体用 “Jagged & faster” 再加倒角即可。
- 扫描模型的贴图常带有烘焙进去的阴影，要做去光照处理，否则和实时阴影叠加会显脏。
- 多个 GLB 共用同一张贴图时，在 `useAsset` 层做缓存，不要各自解码一份。
- `useGLTF` 返回的场景是共享缓存。需要多份实例（幽灵姿态、索引标本）时用 `clone()`（蒙皮模型用 `SkeletonUtils.clone`）；修改材质前先克隆材质。
- 录屏脚本依赖虚拟时间：Spark 等第三方库如果内部用 `performance.now()` 做动画，需要把时间注入进去，或在 capture 模式下关掉这些动画。

---

## 9. 附录：常用命令

```bash
# 开发
npm run dev
open "http://localhost:3000/en/?q=high"            # 强制高档
open "http://localhost:3000/en/?motion=reduce"     # reduced-motion

# 构建与测试
npm run lint && npm run typecheck && npm run build
npm start &                                         # serve out/ on :3000
CHROME_PATH=/path/to/chrome npm run smoke

# 截图 / 录屏（游标 = 幕序号 + 局部进度）
node scripts/capture.mjs shots --url http://localhost:3000/en/ --at 0,1.3,2.1,2.6 --out capture/shots --w 1440 --h 900
node scripts/capture.mjs video --url http://localhost:3000/en/ --from 0 --to 3.2 --seconds 36 --fps 24 --out capture/frames
ffmpeg -framerate 24 -i capture/frames/%05d.png -c:v libx264 -pix_fmt yuv420p -crf 18 capture/demo.mp4

# 资产（P0 之后可用）
npm run assets:build            # scripts/assets/build.mjs
npm run assets:check            # 预算、存在性、许可登记
npx gltf-transform inspect public/assets/models/shared/robot.glb
```

**各幕游标对照**：序幕 0–1 · 设计 1–2（画图 1.12–1.3，材质 1.3–1.68，建模 1.68–2.0）· 跳变 2.0–2.2 · 建造 2.2–3.0 · 城市 3–4 · 评估 4–5 · 空间重建 5–6 · 具身智能 6–7 · 索引 7–8。
