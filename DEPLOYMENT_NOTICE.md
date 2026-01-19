# ⚠️ 部署说明 | Deployment Notice

由于GitHub Pages只支持静态网站，本项目的部署分为两部分：

## 前端部署（Frontend - GitHub Pages）

前端已部署到GitHub Pages，访问地址：
- https://YOUR_USERNAME.github.io/contract-review-site/

## 后端部署（Backend - 需要单独部署）

后端需要部署到支持Node.js的平台，推荐以下选项：

### 选项1: Vercel (推荐)
```bash
cd backend
npm install -g vercel
vercel
```

### 选项2: Railway
1. 访问 https://railway.app/
2. 连接GitHub仓库
3. 选择backend目录
4. 配置环境变量

### 选项3: Render
1. 访问 https://render.com/
2. 创建Web Service
3. 连接GitHub仓库
4. 设置构建命令: `cd backend && npm install`
5. 设置启动命令: `cd backend && npm start`

## 配置前端连接后端

部署后端后，需要配置前端的API地址：

1. 在GitHub仓库Settings → Secrets and variables → Actions中添加：
   - `VITE_API_URL`: 你的后端URL（例如：https://your-backend.vercel.app）

2. 或者直接修改前端代码中的API_BASE

## 本地开发

```bash
# 后端
cd backend
npm install
npm run dev

# 前端（另一终端）
cd frontend
npm install
npm run dev
```

访问: http://localhost:3000
