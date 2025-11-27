# 🚀 Render 部署指南

本指南将帮助您将 RV-Agent 项目部署到 Render 平台。

## 📋 部署前准备

### 1. 创建 GitHub 仓库

1. 在 GitHub 上创建新仓库（如：`rv-agent`）
2. 将项目代码推送到 GitHub：

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: RV-Agent project"

# 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/您的用户名/rv-agent.git

# 推送到GitHub
git push -u origin main
```

### 2. 准备环境变量

需要设置以下环境变量：
- `DEEPSEEK_API_KEY`: DeepSeek API密钥（必需）
- `NODE_ENV`: 设置为 `production`（可选）

## 🎯 部署步骤

### 方法 1：使用 Render Dashboard（推荐）

1. **登录 Render**
   - 访问 https://render.com
   - 使用 GitHub 账号登录

2. **创建新 Web Service**
   - 点击 "New +" → "Web Service"
   - 连接您的 GitHub 仓库
   - 选择 `rv-agent` 仓库

3. **配置服务**
   - **Name**: `rv-agent`（或您喜欢的名称）
   - **Region**: 选择离您最近的区域（如 `Singapore`）
   - **Branch**: `main`（或您的主分支）
   - **Root Directory**: 留空（项目在根目录）
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

4. **设置环境变量**
   - 在 "Environment" 部分点击 "Add Environment Variable"
   - 添加以下变量：
     ```
     DEEPSEEK_API_KEY = sk-11a15d0858604a3ba89f77dcbf83e7e1
     NODE_ENV = production
     ```

5. **选择计划**
   - **Free Plan**: 免费，但服务会在15分钟无活动后休眠
   - **Starter Plan**: $7/月，服务始终运行

6. **部署**
   - 点击 "Create Web Service"
   - Render 会自动开始构建和部署
   - 等待部署完成（通常需要 3-5 分钟）

7. **获取服务地址**
   - 部署完成后，您会获得一个URL，如：`https://rv-agent.onrender.com`
   - 访问该URL即可使用您的应用

### 方法 2：使用 render.yaml（自动化部署）

如果您的项目已包含 `render.yaml` 文件：

1. **推送代码到 GitHub**（确保包含 `render.yaml`）

2. **在 Render Dashboard**
   - 点击 "New +" → "Blueprint"
   - 连接 GitHub 仓库
   - Render 会自动读取 `render.yaml` 配置

3. **设置环境变量**
   - 在服务设置中添加 `DEEPSEEK_API_KEY`

4. **部署**
   - Render 会自动按照 `render.yaml` 配置部署

## ⚙️ 配置说明

### 环境变量

| 变量名 | 说明 | 必需 | 默认值 |
|--------|------|------|--------|
| `DEEPSEEK_API_KEY` | DeepSeek API密钥 | ✅ 是 | 无 |
| `NODE_ENV` | 运行环境 | ❌ 否 | `production` |
| `PORT` | 服务端口 | ❌ 否 | Render自动分配 |

### 构建配置

- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Node Version**: 自动检测（建议 >= 16.0.0）

## 🔍 验证部署

部署完成后，访问以下URL验证：

1. **主页**: `https://您的服务名.onrender.com/`
2. **健康检查**: `https://您的服务名.onrender.com/api/health`
3. **API测试**: 上传文档测试AI功能

## 🐛 常见问题

### Q: 部署失败怎么办？

**A**: 检查以下几点：
1. 确保 `package.json` 中的 `start` 脚本正确
2. 检查环境变量是否已设置
3. 查看 Render 的构建日志（Build Logs）
4. 确保 Node.js 版本兼容（>= 16.0.0）

### Q: 服务启动后无法访问？

**A**: 
1. 检查服务状态是否为 "Live"
2. 确认端口配置正确（Render会自动设置PORT）
3. 查看运行日志（Runtime Logs）查找错误

### Q: API调用失败？

**A**:
1. 确认 `DEEPSEEK_API_KEY` 环境变量已正确设置
2. 检查前端API配置是否指向正确的域名
3. 查看服务器日志确认API调用情况

### Q: 文件上传失败？

**A**:
1. Render的免费计划有文件系统限制
2. 上传的文件存储在临时目录，服务重启后会丢失
3. 建议使用云存储（如AWS S3、Cloudinary）存储文件

### Q: 服务休眠问题？

**A**:
- **Free Plan**: 15分钟无活动后自动休眠，首次访问需要等待30-60秒唤醒
- **解决方案**: 
  - 升级到 Starter Plan（$7/月）
  - 使用外部监控服务定期ping您的服务

## 📊 监控和维护

### 查看日志
- 在 Render Dashboard 中点击服务
- 查看 "Logs" 标签页
- 可以查看实时日志和历史日志

### 更新部署
- 推送新代码到 GitHub
- Render 会自动检测并重新部署
- 或在 Dashboard 中手动触发 "Manual Deploy"

### 回滚部署
- 在 "Events" 标签页找到之前的部署
- 点击 "Redeploy" 可以回滚到之前的版本

## 🔒 安全建议

1. **保护API密钥**
   - 不要将API密钥提交到GitHub
   - 使用环境变量存储敏感信息
   - 定期轮换API密钥

2. **HTTPS**
   - Render自动提供HTTPS证书
   - 确保所有API调用使用HTTPS

3. **CORS配置**
   - 当前配置允许所有来源（开发环境）
   - 生产环境建议限制允许的域名

## 💰 费用说明

- **Free Plan**: 
  - 免费
  - 服务会休眠
  - 适合开发和测试

- **Starter Plan**: 
  - $7/月
  - 服务始终运行
  - 适合生产环境

## 📞 获取帮助

- **Render文档**: https://render.com/docs
- **Render支持**: https://render.com/support
- **项目问题**: rjasmine756@163.com

---

**🎉 部署完成后，您的RV-Agent就可以通过互联网访问了！**

