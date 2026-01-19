#!/bin/bash

# GitHub 自动部署脚本 | GitHub Auto Deployment Script
# 使用方法: ./deploy-to-github.sh YOUR_GITHUB_USERNAME

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查参数
if [ -z "$1" ]; then
    echo -e "${RED}错误：请提供GitHub用户名${NC}"
    echo "用法: ./deploy-to-github.sh YOUR_GITHUB_USERNAME"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME="contract-review-site"

echo -e "${YELLOW}=== 合同审查系统 GitHub 部署脚本 ===${NC}\n"

# 步骤1: 检查Git配置
echo -e "${GREEN}[1/6] 检查Git配置...${NC}"
if ! git config user.name > /dev/null; then
    echo -e "${YELLOW}请设置Git用户名:${NC}"
    read -p "Your Name: " git_name
    git config --global user.name "$git_name"
fi

if ! git config user.email > /dev/null; then
    echo -e "${YELLOW}请设置Git邮箱:${NC}"
    read -p "Your Email: " git_email
    git config --global user.email "$git_email"
fi

echo -e "Git配置完成: $(git config user.name) <$(git config user.email)>\n"

# 步骤2: 检查是否已有远程仓库
echo -e "${GREEN}[2/6] 配置远程仓库...${NC}"
if git remote | grep -q origin; then
    echo "移除旧的远程仓库..."
    git remote remove origin
fi

echo "添加新的远程仓库: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
echo ""

# 步骤3: 确保在main分支
echo -e "${GREEN}[3/6] 切换到main分支...${NC}"
git branch -M main
echo ""

# 步骤4: 提示创建GitHub仓库
echo -e "${GREEN}[4/6] 创建GitHub仓库${NC}"
echo -e "${YELLOW}请按照以下步骤在GitHub上创建仓库：${NC}"
echo "1. 访问: https://github.com/new"
echo "2. Repository name: ${REPO_NAME}"
echo "3. Description: AI-powered contract review application"
echo "4. Visibility: Public"
echo "5. 不要勾选 'Initialize this repository with a README'"
echo "6. 点击 'Create repository'"
echo ""
read -p "仓库创建完成后，按Enter继续..." dummy

# 步骤5: 推送代码
echo -e "${GREEN}[5/6] 推送代码到GitHub...${NC}"
echo "正在推送到 ${GITHUB_USERNAME}/${REPO_NAME}..."

if git push -u origin main; then
    echo -e "${GREEN}✓ 代码推送成功！${NC}\n"
else
    echo -e "${RED}✗ 推送失败${NC}"
    echo -e "${YELLOW}如果需要身份验证：${NC}"
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 生成新的Personal Access Token（勾选repo权限）"
    echo "3. 使用token作为密码重新推送"
    exit 1
fi

# 步骤6: 配置GitHub Pages
echo -e "${GREEN}[6/6] 配置GitHub Pages${NC}"
echo -e "${YELLOW}请按照以下步骤配置GitHub Pages：${NC}"
echo "1. 访问: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages"
echo "2. Source: 选择 'GitHub Actions'"
echo "3. 保存设置"
echo "4. 访问 Actions 标签查看部署进度"
echo ""
echo -e "${GREEN}前端部署地址: https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/${NC}"
echo ""

# 后端部署提示
echo -e "${YELLOW}=== 后端部署 ===${NC}"
echo "GitHub Pages只能托管前端，后端需要单独部署："
echo ""
echo "推荐方案1: Vercel"
echo "  1. 访问 https://vercel.com/"
echo "  2. 导入GitHub仓库"
echo "  3. Root Directory: backend"
echo "  4. 添加环境变量（API密钥）"
echo "  5. 部署后在GitHub Secrets中添加 VITE_API_URL"
echo ""
echo "推荐方案2: Railway"
echo "  1. 访问 https://railway.app/"
echo "  2. Deploy from GitHub repo"
echo "  3. 选择仓库，配置backend目录"
echo "  4. 添加环境变量"
echo ""
echo -e "${GREEN}部署完成！${NC}"
echo -e "查看部署指南: docs/GITHUB_DEPLOYMENT.md"
