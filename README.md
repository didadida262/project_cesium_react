# Cesium React + Tailwind 项目

基于 React + TypeScript + Tailwind CSS + Cesium 的现代化 3D 地图可视化应用。

## ✨ 功能特性

- 🗺️ **3D 地图展示**：基于 Cesium 的高性能 3D 地球展示，支持多种底图服务
- 🎨 **现代化 UI**：使用 Tailwind CSS 构建的现代化界面，支持暗色主题
- 📍 **丰富的标注工具**：支持多种地图标注类型
  - 点标注
  - 线段标注
  - 直线箭头
  - 攻击箭头
  - 钳形箭头
- 🚀 **动画演示**：支持 3D 模型飞行路径动画，可自定义动画脚本
- 🏛️ **中国边境线**：自动加载并显示中国各省份边境线，支持动态显示/隐藏
- 🎯 **位置跳转**：快速跳转到预设地理位置（北京、台湾等）
- 🖼️ **图标绘制**：支持在地图上绘制自定义图标（如红旗、绿旗等）
- ⚙️ **可拖拽操作面板**：可拖拽、可折叠的操作面板，用户体验友好
- 🎛️ **通用配置**：提供地图显示配置选项

## 🛠️ 技术栈

### 核心框架
- **React 18** - 现代化 UI 框架
- **TypeScript** - 类型安全的 JavaScript
- **Vite 4** - 快速的前端构建工具

### UI 和样式
- **Tailwind CSS 3** - 实用优先的 CSS 框架
- **DaisyUI** - Tailwind CSS 组件库

### 地图引擎
- **Cesium 1.105.0** - 世界级的 3D 地球和地图引擎
- **vite-plugin-cesium** - Cesium 的 Vite 插件

### 其他工具
- **React Router 6** - 客户端路由
- **ESLint** - 代码质量检查
- **Prettier** - 代码格式化
- **Husky** - Git hooks 管理

## 📁 项目结构

```
project_cesium_react/
├── public/                          # 静态资源目录
│   ├── GeoData.json                # 中国地理边界数据（GeoJSON格式）
│   ├── images/                     # 图片资源
│   │   ├── icon/                   # 图标文件
│   │   │   ├── flagGreen.svg
│   │   │   └── flagRed.svg
│   │   ├── explosion.png
│   │   ├── explosions.jpg
│   │   ├── fire.png
│   │   └── point.png
│   └── models/                     # 3D 模型文件
│       ├── Cesium_Air.glb
│       └── SK_East_Fighter_Su33.glb
├── src/
│   ├── components/                 # 通用组件
│   │   ├── ButtonComponent.tsx    # 按钮组件
│   │   └── TableComponent.tsx     # 表格组件
│   ├── views/                      # 页面组件
│   │   └── CesiumContainer/        # Cesium 地图容器
│   │       ├── index.tsx           # 容器入口
│   │       ├── CesiumMap.tsx       # 主地图组件（React）
│   │       ├── CesiumController.ts # Cesium 控制器（核心逻辑）
│   │       ├── CesiumUtils.ts      # Cesium 工具函数
│   │       ├── const.ts            # 常量定义
│   │       ├── drawGraphic.js      # 图形绘制工具
│   │       ├── animation/          # 动画相关
│   │       │   └── Animations.ts   # 动画处理函数
│   │       ├── tools/              # 绘制工具类
│   │       │   ├── PointTool.ts    # 点绘制工具
│   │       │   ├── LineTool.ts     # 线段绘制工具
│   │       │   ├── IconTool.ts     # 图标绘制工具
│   │       │   ├── StragitArrowTool.ts  # 直线箭头工具
│   │       │   ├── AttackArrow.ts  # 攻击箭头工具
│   │       │   ├── PincerArrow.ts  # 钳形箭头工具
│   │       │   └── drawArrow/      # 箭头绘制算法
│   │       └── components/         # 子组件
│   │           ├── ConfigContainer.tsx          # 配置容器
│   │           ├── DrawAnimationContainer.tsx   # 动画演示容器
│   │           ├── DrawFlagContainer.tsx        # 图标绘制容器
│   │           ├── LocationJumpContainer.tsx    # 位置跳转容器
│   │           ├── MarkContainer.tsx            # 标注模式容器
│   │           ├── AnimationTableComponent.tsx  # 动画表格组件
│   │           ├── LocationJumpTableComponent.tsx # 位置跳转表格
│   │           └── MarkTableComponent.tsx       # 标注表格组件
│   ├── App.tsx                     # 根组件
│   ├── main.tsx                    # 应用入口文件
│   ├── index.css                   # 全局样式
│   └── vite-env.d.ts              # Vite 类型定义
├── .editorconfig                   # 编辑器配置
├── .eslintignore                   # ESLint 忽略文件
├── .gitignore                      # Git 忽略文件
├── index.html                      # HTML 模板
├── package.json                    # 项目配置和依赖
├── postcss.config.js               # PostCSS 配置
├── tailwind.config.js              # Tailwind CSS 配置
├── tsconfig.json                   # TypeScript 配置
├── tsconfig.node.json              # Node.js TypeScript 配置
└── vite.config.js                  # Vite 构建配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0 或 yarn >= 1.22.0 或 pnpm >= 7.0.0

### 安装依赖

```bash
# 使用 npm
npm install

# 使用 yarn
yarn install

# 使用 pnpm
pnpm install
```

### 启动开发服务器

```bash
# 使用 npm
npm run dev

# 使用 yarn
yarn dev

# 使用 pnpm
pnpm dev
```

开发服务器启动后，访问 `http://localhost:5173` 查看应用。

### 构建生产版本

```bash
# 使用 npm
npm run build

# 使用 yarn
yarn build

# 使用 pnpm
pnpm build
```

构建产物将输出到 `dist` 目录。

### 代码检查

```bash
# 运行 ESLint
npm run lint

# 自动修复 ESLint 错误
npm run lint:fix
```

## 📖 功能使用说明

### 1. 标注模式

点击顶部面板的 **"标注模式"** 按钮，展开标注工具列表：

- **绘制点**：在地图上点击即可添加点标注
- **绘制线段**：在地图上点击两个或多个点绘制线段
- **直线箭头**：绘制直线箭头
- **攻击箭头**：绘制攻击箭头
- **钳形箭头**：绘制钳形箭头

使用说明：
1. 选择对应的标注工具
2. 在地图上点击开始绘制
3. 对于线段和箭头，多次点击添加控制点
4. 右键点击完成绘制

### 2. 图标绘制

点击 **"图标绘制"** 按钮，可以选择不同的图标在地图上绘制：

- **红旗**：红色旗帜图标
- **绿旗**：绿色旗帜图标

使用说明：选择图标后，在地图上点击即可放置图标。

### 3. 动效演示

点击 **"动效演示"** 按钮，可以选择预设的动画脚本：

- **攻T1**：多路径飞行演示
- **攻T2**：单路径飞行演示
- 更多预设动画...

动画将显示 3D 模型沿着指定路径飞行。

### 4. 位置跳转

点击 **"跳转至目标地点"** 按钮，快速跳转到预设位置：

- **北京**：跳转到北京市
- **台湾**：跳转到台湾地区（高雄/台南），并显示爆炸效果

### 5. 通用配置

点击 **"通用配置"** 按钮，可以：

- **显示/隐藏中国边境线**：切换中国各省份边境线的显示状态

### 操作面板

- **拖拽**：点击面板顶部的手柄区域可以拖拽面板
- **折叠/展开**：点击右上角的箭头图标可以折叠/展开面板
- **响应式**：面板会自动调整位置，防止超出屏幕范围

## 💻 开发指南

### Cesium 配置

项目使用 `vite-plugin-cesium` 插件来集成 Cesium：

```javascript
// vite.config.js
import cesium from 'vite-plugin-cesium'

export default {
  plugins: [cesium()],
  // ...
}
```

Cesium 的静态资源（Workers、Assets、Widgets CSS）会自动处理。

### 地图控制器 API

`CesiumController` 类提供了所有 Cesium 相关操作的统一接口：

```typescript
// 初始化 Cesium 场景
CesiumController.init_world(containerId: string)

// 添加标注
CesiumController.mark(type: string, data?: any)
// type: 'Point' | 'Line' | 'PointIcon' | 'StraightArrow' | 'AttackArrow' | 'PincerArrow'

// 绘制中国边境线
CesiumController.drawChinaBorder(geoJsonUrl?: string)

// 跳转到指定位置
CesiumController.flyToLocation(
  position: Cesium.Cartesian3,
  height?: number,
  showExplosionEffect?: boolean,
  explosionPosition?: Cesium.Cartesian3
)

// 显示动画演示
CesiumController.showSituation(item: any)

// 清除所有标注
CesiumController.clearAllMark()

// 移除当前工具的事件监听
CesiumController.remove()

// 导出绘制数据
CesiumController.exportData()

// 切换边境线显示
CesiumController.toggleChinaBorder(show: boolean)
```

### 样式开发

项目使用 Tailwind CSS 进行样式管理：

- 所有组件都使用 Tailwind 工具类
- 自定义样式可以在 `src/index.css` 中添加
- 主题配置在 `tailwind.config.js` 中

### 添加新的标注工具

1. 在 `src/views/CesiumContainer/tools/` 目录下创建新的工具类
2. 实现 `activate()` 和 `_removeAllEvent()` 方法
3. 在 `CesiumController.mark()` 中添加对应的 case

示例：

```typescript
// tools/MyTool.ts
export default class MyTool {
  private viewer: Cesium.Viewer
  
  constructor(viewer: Cesium.Viewer) {
    this.viewer = viewer
  }
  
  activate(type?: string, callback?: () => void): void {
    // 实现工具逻辑
  }
  
  _removeAllEvent(): void {
    // 清理事件监听
  }
}
```

### 添加新的位置跳转

在 `src/views/CesiumContainer/const.ts` 中定义位置，然后在 `CesiumMap.tsx` 的 `handleSelectLocation` 函数中添加配置。

## ⚠️ 注意事项

1. **Cesium Access Token**：
   - 项目默认使用第三方底图服务（ArcGIS World Imagery）
   - 如果需要使用 Cesium Ion 的默认底图，需要在 `CesiumController.ts` 中配置 Access Token
   - 获取 Token：https://cesium.com/ion/tokens

2. **静态资源**：
   - 确保 `public/GeoData.json` 文件存在（用于显示中国边境线）
   - 确保 `public/models/` 目录下有 3D 模型文件（用于动画演示）
   - 确保 `public/images/` 目录下有图标文件（用于图标绘制）

3. **浏览器兼容性**：
   - Cesium 需要支持 WebGL 的现代浏览器
   - 推荐使用 Chrome、Firefox、Edge 最新版本
   - 移动端浏览器可能性能较差

4. **性能优化**：
   - 大量标注可能影响性能，建议定期清理不需要的标注
   - 使用 `clearAllMark()` 清除所有标注
   - 3D 模型文件较大，注意加载时间

5. **开发环境**：
   - 确保 Node.js 版本 >= 16.0.0
   - 建议使用 npm 8+ 或 yarn 2+ 或 pnpm 7+
   - 如果遇到依赖安装问题，尝试清除缓存后重新安装

## 🐛 故障排除

### 问题：地图不显示

- 检查浏览器控制台是否有错误信息
- 确认 Cesium 依赖是否正确安装
- 检查 `cesiumContainer` 元素是否存在

### 问题：功能按钮无效

- 打开浏览器控制台查看是否有错误
- 确认 Cesium viewer 是否成功初始化（查看控制台日志）
- 检查相关静态资源文件是否存在

### 问题：标注工具无法使用

- 确认已选择对应的标注工具
- 检查地图是否加载完成
- 查看控制台是否有错误信息

### 问题：位置跳转无效

- 检查控制台日志，查看传入的参数是否正确
- 确认位置常量定义是否正确
- 验证 viewer 是否已初始化

## 📝 更新日志

### v0.0.0 (当前版本)

- ✅ 从 Vue 3 迁移到 React 18
- ✅ 实现完整的 3D 地图展示功能
- ✅ 支持多种标注工具
- ✅ 实现动画演示功能
- ✅ 支持中国边境线显示/隐藏
- ✅ 实现位置跳转功能
- ✅ 实现图标绘制功能
- ✅ 可拖拽操作面板
- ✅ 完整的 TypeScript 类型支持
- ✅ 使用 Tailwind CSS 构建现代化 UI

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📮 联系方式

如有问题或建议，请提交 Issue。

---

**Happy Coding! 🚀**