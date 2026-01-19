# GitHub 部署指南 | GitHub Deployment Guide

本文档提供完整的GitHub部署步骤。

## 📋 前置要求

- GitHub账号
- Git已安装并配置
- 代码已提交到本地Git仓库

## 🚀 部署步骤

### 第一步：创建GitHub仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `contract-review-site`
   - **Description**: AI-powered contract review application with multi-model LLM support
   - **Visibility**: ✅ Public
   - **不要**勾选 "Initialize this repository with a README"
3. 点击 "Create repository"

### 第二步：推送代码到GitHub

在项目目录执行以下命令（将 `YOUR_USERNAME` 替换为你的GitHub用户名）：

```bash
cd /Users/licheng/.gemini/antigravity/playground/infinite-photosphere

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/contract-review-site.git

# 推送代码
git branch -M main
git push -u origin main
```

如果需要身份验证，使用GitHub Personal Access Token：
1. 访问 https://github.com/settings/tokens
2. 生成新token（勾选repo权限）
3. 使用token作为密码

### 第三步：配置GitHub Pages

1. 进入仓库页面：`https://github.com/YOUR_USERNAME/contract-review-site`
2. 点击 **Settings** 标签
3. 左侧菜单选择 **Pages**
4. 在 "Build and deployment" 部分：
   - **Source**: 选择 `GitHub Actions`
5. 保存设置

### 第四步：触发部署

代码推送后，GitHub Actions 会自动运行：
1. 进入仓库的 **Actions** 标签
2. 查看 "Deploy to GitHub Pages" 工作流
3. 等待构建完成（约1-2分钟）

### 第五步：访问网站

部署成功后，访问地址为：
```
https://YOUR_USERNAME.github.io/contract-review-site/
```

## 🔧 配置后端API

由于GitHub Pages只能托管静态文件，后端需要单独部署。

### 方案1: 部署后端到Vercel (推荐)

1. 访问 https://vercel.com/ 并登录
2. 点击 "New Project"
3. 导入你的GitHub仓库 `contract-review-site`
4. 配置项目：
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Output Directory**: 留空
   - **Install Command**: `npm install`
5. 添加环境变量（Settings → Environment Variables）：
   ```
   GEMINI_API_KEY=your_key
   CLAUDE_API_KEY=your_key
   ZHIPU_API_KEY=your_key
   # 等其他API密钥
   ```
6. 点击 "Deploy"
7. 部署完成后，复制你的后端URL（例如：`https://your-backend.vercel.app`）

### 方案2: 部署后端到Railway

1. 访问 https://railway.app/ 并登录
2. 点击 "New Project" → "Deploy from GitHub repo"
3. 选择 `contract-review-site` 仓库
4. 配置：
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. 添加环境变量
6. 部署完成后复制URL

### 连接前后端

1. 获取后端URL后，在GitHub仓库中配置：
   - 进入 **Settings** → **Secrets and variables** → **Actions**
   - 点击 "New repository secret"
   - Name: `VITE_API_URL`
   - Value: 你的后端URL（例如：`https://your-backend.vercel.app`）
   - 点击 "Add secret"

2. 重新触发GitHub Actions部署：
   - 进入 **Actions** 标签
   - 选择最新的workflow
   - 点击 "Re-run all jobs"

## ✅ 验证部署

### 验证前端

访问 `https://YOUR_USERNAME.github.io/contract-review-site/`，应该能看到：
- ✅ 上传页面正常显示
- ✅ 模型选择器正常工作
- ✅ UI样式正确

### 验证后端连接

1. 上传一个测试合同文件
2. 选择一个已配置API密钥的模型
3. 点击"开始审查"
4. 如果正常处理并显示结果，说明前后端连接成功

## 📊 部署状态查看

### GitHub Actions日志

1. 进入仓库的 **Actions** 标签
2. 查看最新的workflow运行
3. 点击查看详细日志

### 常见问题

#### 1. 部署失败：Build error

**可能原因**：npm依赖安装失败

**解决方案**：
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
git add package-lock.json
git commit -m "Update dependencies"
git push
```

#### 2. 404 Page Not Found

**可能原因**：GitHub Pages未正确配置或base路径错误

**解决方案**：
- 确认Settings → Pages中Source设置为GitHub Actions
- 检查 `vite.config.js` 中的 `base` 路径是否为 `/contract-review-site/`

#### 3. API调用失败

**可能原因**：后端未部署或URL配置错误

**解决方案**：
- 确认后端已成功部署
- 检查GitHub Secrets中的`VITE_API_URL`是否正确
- 查看浏览器Console的错误信息

#### 4. CORS错误

**可能原因**：后端未配置CORS

**解决方案**：在backend/server.js中确认已启用CORS：
```javascript
app.use(cors({
  origin: ['https://YOUR_USERNAME.github.io'],
  credentials: true
}));
```

## 🔄 后续更新

每次代码更新后：
```bash
git add .
git commit -m "Update: description of changes"
git push
```

GitHub Actions会自动重新部署前端。

## 📝 快速命令参考

```bash
# 配置Git用户（首次）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# 推送到GitHub
git add .
git commit -m "Your commit message"
git push

# 查看远程仓库
git remote -v

# 查看提交历史
git log --oneline

# 强制推送（慎用）
git push -f origin main
```

---

**部署完成后的访问地址**:
- 前端: `https://YOUR_USERNAME.github.io/contract-review-site/`
- 后端: 根据你选择的部署平台而定

**需要帮助？** 查看 [GitHub Pages文档](https://docs.github.com/pages) 或 [GitHub Actions文档](https://docs.github.com/actions)
