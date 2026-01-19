# 快速部署到 GitHub | Quick Deploy to GitHub

## 🚀 一键部署脚本

我们提供了自动化部署脚本，简化GitHub部署流程。

### 使用方法

```bash
cd /Users/licheng/.gemini/antigravity/playground/infinite-photosphere
./deploy-to-github.sh YOUR_GITHUB_USERNAME
```

将 `YOUR_GITHUB_USERNAME` 替换为你的GitHub用户名。

### 脚本功能

✅ 自动配置Git用户信息  
✅ 自动添加GitHub远程仓库  
✅ 自动推送代码到main分支  
✅ 提供GitHub Pages配置指导  
✅ 提供后端部署方案建议

---

## 📋 手动部署步骤

如果不想使用脚本，请参考完整的部署指南：
- [完整GitHub部署指南](docs/GITHUB_DEPLOYMENT.md)

### 快速步骤概览

1. **创建GitHub仓库**
   - 访问 https://github.com/new
   - 仓库名: `contract-review-site`
   - 设为Public

2. **推送代码**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/contract-review-site.git
   git branch -M main
   git push -u origin main
   ```

3. **配置GitHub Pages**
   - Settings → Pages → Source: GitHub Actions

4. **部署后端**
   - 推荐使用Vercel或Railway
   - 详见 [部署指南](docs/GITHUB_DEPLOYMENT.md)

---

## ⚠️ 重要说明

### 前后端分离部署

本项目包含前端（React）和后端（Node.js），需要分别部署：

- **前端**: GitHub Pages（自动通过GitHub Actions部署）
- **后端**: Vercel / Railway / Render（需单独部署）

### 连接前后端

后端部署完成后：
1. 获取后端URL（例如：`https://your-backend.vercel.app`）
2. 在GitHub仓库设置中添加Secret：
   - Name: `VITE_API_URL`
   - Value: 后端URL
3. 重新触发GitHub Actions部署

---

## 📚 相关文档

- [完整GitHub部署指南](docs/GITHUB_DEPLOYMENT.md) - 详细的分步骤说明
- [项目README](README.md) - 项目概览和本地开发
- [API配置指南](docs/API_SETUP.md) - LLM模型API配置
- [通用部署指南](docs/DEPLOYMENT.md) - 其他部署平台

---

## 🆘 需要帮助？

遇到问题请查看：
1. [GitHub部署指南的故障排除部分](docs/GITHUB_DEPLOYMENT.md#常见问题)
2. GitHub Actions日志（Actions标签）
3. 浏览器Console错误信息

---

**部署后访问地址**: `https://YOUR_USERNAME.github.io/contract-review-site/`
