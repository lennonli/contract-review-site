# 部署指南 | Deployment Guide

本文档说明如何将合同审查系统部署到生产环境。

## 目录
- [本地部署](#本地部署)
- [Vercel部署](#vercel部署-推荐)
- [Netlify部署](#netlify部署)
- [Docker部署](#docker部署)
- [环境变量配置](#环境变量配置)

---

## 本地部署

适合内网环境或小规模团队使用。

### 准备工作

1. **系统要求**
   - Node.js >= 18.0
   - npm >= 9.0
   - 至少 2GB 可用内存

2. **安装依赖**
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

### 生产环境启动

#### 方式1: 使用PM2 (推荐)

```bash
# 安装PM2
npm install -g pm2

# 启动后端
cd backend
pm2 start server.js --name contract-review-backend

# 构建并启动前端
cd ../frontend
npm run build
pm2 serve dist 3000 --name contract-review-frontend --spa

# 查看状态
pm2 status

# 设置开机自启
pm2 startup
pm2 save
```

#### 方式2: 使用systemd (Linux)

创建服务文件 `/etc/systemd/system/contract-review-backend.service`:

```ini
[Unit]
Description=Contract Review Backend
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/infinite-photosphere/backend
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment="NODE_ENV=production"

[Install]
WantedBy=multi-user.target
```

启动服务:
```bash
sudo systemctl enable contract-review-backend
sudo systemctl start contract-review-backend
```

---

## Vercel部署 (推荐)

Vercel 适合快速部署，支持 Serverless Functions。

### 后端部署为 Serverless Functions

1. **项目结构调整**

创建 `backend/api/` 目录，将路由改为Serverless Functions:

```bash
backend/
├── api/
│   ├── models.js      # GET /api/models
│   ├── templates.js   # GET /api/templates
│   ├── upload.js      # POST /api/upload
│   ├── review.js      # POST /api/review
│   └── download.js    # GET /api/download/[filename]
```

2. **创建 `vercel.json`**

在项目根目录创建:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/api/**/*.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **部署到Vercel**

```bash
# 安装Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel
```

4. **配置环境变量**

在 Vercel Dashboard → Settings → Environment Variables 中添加:
- `GEMINI_API_KEY`
- `CLAUDE_API_KEY`
- `ZHIPU_API_KEY`
- 其他模型的API密钥

### 前端部署

如果只部署前端（后端单独部署）:

```bash
cd frontend
npm run build
vercel --prod
```

---

## Netlify部署

Netlify 适合静态前端 + Netlify Functions。

### 部署步骤

1. **连接Git仓库**
   - 在 Netlify Dashboard 点击 "New site from Git"
   - 选择你的 GitHub/GitLab 仓库

2. **配置构建设置**
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Publish directory**: `frontend/dist`

3. **配置Functions**

创建 `netlify/functions/` 目录，将后端API改为Netlify Functions格式。

示例 (`netlify/functions/review.js`):

```javascript
const { reviewContract } = require('../../backend/review/processor');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { contractText, templateId, modelKey } = JSON.parse(event.body);

  try {
    const result = await reviewContract(contractText, templateId, modelKey, process.env);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, result })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
```

4. **配置环境变量**

在 Netlify Dashboard → Site settings → Environment variables 中添加API密钥。

---

## Docker部署

适合容器化部署和微服务架构。

### Dockerfile (后端)

创建 `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

CMD ["node", "server.js"]
```

### Dockerfile (前端)

创建 `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### docker-compose.yml

在项目根目录创建:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - CLAUDE_API_KEY=${CLAUDE_API_KEY}
      - ZHIPU_API_KEY=${ZHIPU_API_KEY}
    restart: unless-stopped
    volumes:
      - ./backend/uploads:/app/uploads
      - ./backend/outputs:/app/outputs

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

### 部署命令

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 环境变量配置

### 生产环境必需变量

```bash
# 服务端口
PORT=3001

# 至少配置一个模型
GEMINI_API_KEY=your_key
# 或
CLAUDE_API_KEY=your_key
# 或
ZHIPU_API_KEY=your_key

# 文件大小限制（字节）
MAX_FILE_SIZE=10485760

# 默认审查模板
DEFAULT_TEMPLATE=private_equity
```

### 安全建议

1. **不要在代码中硬编码密钥**
2. **使用环境变量管理敏感信息**
3. **生产环境启用HTTPS**
4. **定期轮换API密钥**
5. **设置合理的CORS策略**

---

## 性能优化

### 后端优化

1. **启用Gzip压缩**
```javascript
import compression from 'compression';
app.use(compression());
```

2. **设置缓存头**
```javascript
app.use(express.static('outputs', {
  maxAge: '1h'
}));
```

3. **限流**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 最多100个请求
});

app.use('/api/', limiter);
```

### 前端优化

1. **代码分割**（Vite自动处理）
2. **资源压缩**（生产构建自动启用）
3. **CDN加速**（部署到Vercel/Netlify自动启用）

---

## 监控与日志

### 使用PM2监控

```bash
pm2 monit
```

### 日志管理

```bash
# 查看PM2日志
pm2 logs contract-review-backend

# 清理日志
pm2 flush
```

### 错误追踪

推荐集成 Sentry:

```bash
npm install @sentry/node

# 在 server.js 中
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: 'your_sentry_dsn'
});
```

---

## 备份策略

### 数据备份

系统不持久化用户合同，但需备份配置：

1. **环境变量备份**
2. **审查模板备份**
3. **自定义配置备份**

### 定期备份脚本

```bash
#!/bin/bash
DATE=$(date +%Y%m%d)
tar -czf backup-$DATE.tar.gz backend/.env backend/review/templates.js
```

---

## 故障排除

### 常见问题

#### 1. 端口被占用

```bash
# 查找占用端口的进程
lsof -i :3001

# 杀死进程
kill -9 PID
```

#### 2. 内存不足

增加Node.js内存限制:
```bash
NODE_OPTIONS="--max-old-space-size=4096" node server.js
```

#### 3. 文件权限错误

```bash
chmod -R 755 uploads outputs
chown -R $USER:$USER uploads outputs
```

---

## 生产环境检查清单

- [ ] 环境变量已配置
- [ ] API密钥已测试
- [ ] HTTPS已启用
- [ ] 日志系统已配置
- [ ] 监控已设置
- [ ] 备份策略已实施
- [ ] 性能优化已应用
- [ ] 安全审计已完成

---

**更新时间**: 2026-01-19
