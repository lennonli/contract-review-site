#!/bin/bash

# 一键部署脚本 - 简化版
# Quick Deploy Script - Simplified Version

set -e

GITHUB_USERNAME="lennonli"
REPO_NAME="contract-review-site"

echo "🚀 开始部署到 GitHub..."
echo ""

# 配置Git用户（如果未配置）
if ! git config user.name > /dev/null 2>&1; then
    git config --global user.name "lennonli"
fi

if ! git config user.email > /dev/null 2>&1; then
    git config --global user.email "lennonli@users.noreply.github.com"
fi

# 检查是否已有远程仓库
if git remote | grep -q origin; then
    echo "✓ 检测到已有远程仓库，移除后重新添加..."
    git remote remove origin
fi

# 添加远程仓库
echo "✓ 添加远程仓库: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"
git remote add origin "https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

# 确保在main分支
git branch -M main

echo ""
echo "================================================"
echo "⚠️  需要手动操作："
echo "================================================"
echo "请在浏览器中完成以下步骤："
echo ""
echo "1. 访问: https://github.com/new"
echo "2. Repository name: contract-review-site"
echo "3. Visibility: Public"
echo "4. 不要勾选 'Initialize this repository with a README'"
echo "5. 点击 'Create repository'"
echo ""
echo "创建完成后，按 Enter 继续推送代码..."
read -p ""

echo ""
echo "📤 推送代码到 GitHub..."
if git push -u origin main 2>&1; then
    echo ""
    echo "================================================"
    echo "✅ 代码推送成功！"
    echo "================================================"
    echo ""
    echo "🌐 前端访问地址："
    echo "   https://${GITHUB_USERNAME}.github.io/${REPO_NAME}/"
    echo ""
    echo "📋 下一步操作："
    echo "1. 访问: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}/settings/pages"
    echo "2. Source 选择: GitHub Actions"
    echo "3. 保存后等待自动部署（1-2分钟）"
    echo ""
    echo "⚙️  后端部署："
    echo "   后端需单独部署到 Vercel/Railway"
    echo "   详见: docs/GITHUB_DEPLOYMENT.md"
    echo ""
else
    echo ""
    echo "================================================"
    echo "❌ 推送失败"
    echo "================================================"
    echo ""
    echo "可能的原因："
    echo "1. 仓库未创建或仓库名错误"
    echo "2. 需要 GitHub 身份验证"
    echo ""
    echo "解决方案："
    echo "1. 确认仓库已创建: https://github.com/${GITHUB_USERNAME}/${REPO_NAME}"
    echo "2. 使用 Personal Access Token 认证"
    echo "   访问: https://github.com/settings/tokens"
    echo ""
    exit 1
fi
