# Restructure Vision – RV-Agent

**AI 驱动的企业重组智能平台**

## 📋 项目简介

RV-Agent 是一个为企业重组业务设计的智能体平台，参考 [LawFlow AI](https://flow-law-ai.onrender.com/) 的现代化设计风格，包含两大角色工作区：

- **债务人/管理人工作区**：文档解析、方案生成、会议报告管理
- **债权人/投资人分析区**：企业价值分析、风险评估、可行性研究

## 🎨 设计风格

本项目完全参考 LawFlow AI 的专业设计：

- **🌐 现代化导航栏**：深色背景 + Logo + 导航菜单 + 操作按钮
- **🎯 Hero 大屏**：渐变蓝色背景 + 浮动装饰 + 大标题 + CTA 按钮
- **📊 卡片式布局**：干净的白色卡片 + 悬停效果
- **✨ 专业配色**：蓝色系主题（#2563eb）+ 灰色辅助色
- **📱 完全响应式**：适配桌面、平板、手机

## 📁 项目结构

```
RV-agent/
├── index.html          # 首页（Hero + 功能介绍 + 工作流程）
├── manager.html        # 债务人/管理人工作区
├── creditor.html       # 债权人/投资人分析区
├── style.css           # 全站样式（参考 LawFlow AI）
├── main.js             # 前端交互逻辑 + API调用
├── api-server.js       # 后端API服务器（DeepSeek集成）
├── package.json        # 依赖管理配置
├── start-server.sh     # Linux/Mac启动脚本
├── assets/             # 资源文件夹（logo、图标等）
├── uploads/            # 文件上传临时目录（自动创建）
├── node_modules/       # 依赖包（npm install后生成）
└── README.md           # 项目说明
```

## ⚡ 快速开始

### 🚀 方法 1：完整AI功能（推荐）

**需要安装Node.js以启用DeepSeek AI分析**

1. **安装 Node.js**
   - 访问：https://nodejs.org/
   - 下载LTS版本
   - 安装时确保勾选"Add to PATH"

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动服务**
   ```bash
   # 方法1：使用npm（推荐）
   npm start
   
   # 方法2：直接运行Node.js
   node api-server.js
   
   # Linux/Mac用户也可以使用启动脚本
   chmod +x start-server.sh
   ./start-server.sh
   ```

4. **访问应用**
   - 打开浏览器访问：http://localhost:3000
   - 开始使用DeepSeek AI文档分析功能
   - 服务启动后会显示：`🚀 RV-Agent API服务已启动`

### 📱 方法 2：界面预览（无AI功能）

```bash
# 直接打开查看界面
双击 index.html

# 或使用Python服务器
python -m http.server 8000
# 访问 http://localhost:8000
```

**注意**：此方法只能查看界面，AI分析功能需要启动后端服务器。

### 🛠️ 方法 3：VS Code Live Server

1. 安装 "Live Server" 扩展
2. 右键 `index.html` → Open with Live Server

## 🚀 功能特性

### 首页（index.html）

- ✅ 固定导航栏（Logo + 菜单 + 登录/开始体验）
- ✅ Hero 大屏（渐变背景 + 动态装饰 + 主标题）
- ✅ "为什么选择" 4个特性卡片
- ✅ 核心功能展示（2个大卡片）
- ✅ 工作流程 5步骤 + 详细说明
- ✅ 页脚（4栏链接）

### 管理人工作区（manager.html）

- 📤 **文档上传**：支持 PDF、Word，拖拽上传，支持中文文件名
- 🤖 **智能操作**（已集成DeepSeek AI）：
  - ✅ 生成庭外重组协议（AI自动生成）
  - ⏳ 生成预重整方案（开发中）
  - ⏳ 提取第一次会议字段（开发中）
  - ⏳ 生成债权人会议报告（开发中）
- 📊 **展示区域**：文本解析 + 结构化字段
- 📄 **文档预览**：点击"打开"按钮可预览完整文档内容
- 💾 **文档下载**：支持下载上传的文档文件

### 债权人分析区（creditor.html）

- 📤 **文档上传**：支持 PDF、Excel、Word，拖拽上传，支持中文文件名
- 🤖 **智能分析**（已集成DeepSeek AI）：
  - ✅ 企业价值分析（AI深度分析）
  - ✅ 提取风险指标（AI智能识别）
  - ✅ 生成重组可行性报告（AI综合评估）
- 📊 **数据可视化**：3个图表占位区
- 📋 **分析报告**：详细报告展示，支持复制和导出
- 📄 **文档预览**：点击"打开"按钮可预览完整文档内容

## 🎯 核心特点

### 视觉设计
- **导航栏**：深色背景（#0f172a）+ 白色文字
- **Hero 区**：蓝色渐变（#1e3a8a → #3b82f6）+ 浮动圆形装饰
- **按钮**：蓝色主按钮 + 透明次要按钮 + 悬停效果
- **卡片**：白色背景 + 边框 + 阴影 + 悬停提升
- **字体**：系统默认字体栈，优先 -apple-system

### 交互效果
- ✨ 导航栏链接悬停变色
- ✨ 按钮悬停提升 + 阴影加深
- ✨ 卡片悬停提升效果
- ✨ 滚动指示器跳动动画
- ✨ Hero 背景浮动装饰
- ✨ 文件拖拽上传

### 响应式设计
- 📱 **移动端**：导航栏简化，卡片单列
- 💻 **平板**：网格自适应调整
- 🖥️ **桌面**：完整布局展示

## 🔌 API 接口说明

### 已集成的API接口

#### 文档处理
- `POST /api/upload` - 文件上传（支持PDF、Word、Excel）
- `POST /api/preview` - 文档预览（返回完整内容）
- `GET /api/download/:filename` - 文档下载

#### AI分析功能
- `POST /api/analyze` - DeepSeek AI文档分析
  - `analysisType: 'enterprise-value'` - 企业价值分析
  - `analysisType: 'risk-indicators'` - 风险指标提取
  - `analysisType: 'restructure-feasibility'` - 重组可行性分析
  - `analysisType: 'outside-agreement'` - 庭外重组协议生成

#### 系统接口
- `GET /api/health` - 健康检查

### 前端调用示例
```javascript
// 企业价值分析
await callAPI('/analyze', {
    files: uploadedFiles,
    analysisType: 'enterprise-value'
});

// 文档预览
await fetch('/api/preview', {
    method: 'POST',
    body: JSON.stringify({ files: uploadedFiles })
});
```

## 🌐 部署指南

### Netlify
1. 推送代码到 GitHub
2. 在 Netlify 连接仓库
3. Build settings: 留空
4. Publish directory: `/`
5. Deploy

### Render
1. 创建 Static Site
2. 连接 GitHub 仓库
3. Build Command: 留空
4. Publish Directory: `.`
5. Deploy

### 腾讯云 COS
1. 创建存储桶（公有读）
2. 上传所有文件
3. 开启静态网站
4. 设置 index.html 为首页

## 📝 技术栈

### 前端
- **HTML5 + CSS3 + Vanilla JavaScript**
- **CSS 特性**：
  - CSS Grid + Flexbox 布局
  - CSS 变量系统
  - 渐变和动画
  - 响应式媒体查询
- **JavaScript 功能**：
  - 文件上传与拖拽
  - DOM 操作
  - 异步API调用
  - 文档预览与下载

### 后端
- **Node.js + Express** - 服务器框架
- **DeepSeek API** - AI文档分析引擎
- **文档解析库**：
  - `pdf-parse` - PDF文件解析
  - `mammoth` - Word文档解析
  - `xlsx` - Excel表格解析
- **文件处理**：
  - `multer` - 文件上传处理
  - `cors` - 跨域支持

## 🎨 配色方案

```css
--primary-color: #2563eb;      /* 主蓝色 */
--primary-dark: #1e40af;       /* 深蓝色 */
--text-dark: #1e293b;          /* 深色文字 */
--text-light: #64748b;         /* 浅色文字 */
--bg-white: #ffffff;           /* 白色背景 */
--bg-gray: #f8fafc;            /* 灰色背景 */
--bg-dark: #0f172a;            /* 深色背景 */
```

## 📖 参考设计

本项目设计完全参考：
- **LawFlow AI**：https://flow-law-ai.onrender.com/
- 采用相同的布局结构、配色方案和交互方式
- 适配企业重组业务场景

## 📄 许可证

© 2025 Restructure Vision. 保留所有权利.

## 🆘 常见问题

### Q: 如何启动服务器？
**A**: 安装Node.js后，运行 `npm install` 安装依赖，然后运行 `npm start` 或 `node api-server.js`

### Q: AI分析功能无法使用？
**A**: 确保：
1. Node.js已正确安装
2. 已运行 `npm install` 安装依赖
3. 后端服务器已启动（运行 `npm start`）
4. 浏览器访问 http://localhost:3000

### Q: 文件上传失败？
**A**: 检查：
- 文件格式：仅支持PDF、Word、Excel
- 文件大小：单个文件不超过10MB
- 服务器是否正常运行

### Q: 文档预览显示乱码？
**A**: 已修复中文文件名编码问题，如仍有问题请刷新页面重新上传

## 📞 技术支持

- **邮箱**：rjasmine756@163.com
- **团队**：华东政法大学 RV-Agent 研发团队

---

**✅ 当前版本已集成DeepSeek AI，所有智能分析功能均可正常使用！**
