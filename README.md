# 合同审查系统 | Contract Review System

一个基于AI的智能合同审查平台，支持多种大语言模型（闭源、开源、智源），实现合同自动审查、风险识别和修订建议生成。

## ✨ 核心特性

- **📤 文件上传**: 支持 PDF、Word (.docx/.doc) 格式合同文件上传，最大 10MB
- **🤖 多模型支持**: 统一API适配13+个主流LLM模型
  - 闭源模型：Google Gemini 1.5 Pro/Flash、Anthropic Claude 3.5 Sonnet/Opus
  - 智源模型：ZhiPu GLM-4/GLM-4V (专属适配，使用JWT认证)
  - 开源模型：Llama 3 (70B/8B)、Qwen2 (72B/14B)、Mistral Large、DeepSeek-R1、InternLM2
- **📋 预设模板**: 3种专业合同审查模板（私募股权、融资协议、尽调协议）
- **📊 智能审查**: 风险识别、合规检查、条款修订建议
- **📥 文档导出**: 生成修订版合同和审查意见书（DOCX/PDF格式）
- **🎨 极简UI**: React + Vite + Tailwind CSS，无冗余设计，专注核心功能
- **🔒 数据安全**: 本地处理，自动清理临时文件，不存储用户合同

## 🏗️ 技术栈

### 后端 (Backend)
- **框架**: Node.js + Express
- **文件解析**: pdf-parse, mammoth
- **文档生成**: docx, html-pdf-node
- **LLM集成**: axios (统一API调用层)

### 前端 (Frontend)
- **框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **路由**: React Router DOM

## 🚀 快速开始

### 前置要求

- Node.js >= 18.0
- npm >= 9.0

### 安装步骤

#### 1. 克隆项目
```bash
cd /Users/licheng/.gemini/antigravity/playground/infinite-photosphere
```

#### 2. 安装后端依赖
```bash
cd backend
npm install
```

#### 3. 配置环境变量
```bash
cp .env.example .env
```

编辑 `.env` 文件，配置至少一个模型的API密钥：

```bash
# 示例：配置 Gemini
GEMINI_API_KEY=your_gemini_api_key_here

# 或配置智源 GLM-4
ZHIPU_API_KEY=your_id.your_secret
```

> 📖 详细的API密钥获取和配置指南请查看 [docs/API_SETUP.md](docs/API_SETUP.md)

#### 4. 安装前端依赖
```bash
cd ../frontend
npm install
```

#### 5. 启动开发服务器

**终端1 - 启动后端**:
```bash
cd backend
npm run dev
```
后端运行在: http://localhost:3001

**终端2 - 启动前端**:
```bash
cd frontend
npm run dev
```
前端运行在: http://localhost:3000

#### 6. 访问应用

打开浏览器访问: http://localhost:3000

## 📖 使用说明

### 基本工作流程

1. **上传合同**: 拖拽或点击上传 PDF/Word 格式的合同文件
2. **选择模型**: 从下拉框中选择要使用的AI模型
3. **选择模板**: 选择合适的审查模板（私募股权/融资协议/尽调协议）
4. **开始审查**: 点击"开始审查"按钮
5. **查看结果**: 在结果页面预览修订版合同和审查意见书
6. **下载文档**: 下载 DOCX 或 PDF 格式的审查报告

### 审查模板说明

#### 私募股权合同 (Private Equity Agreement)
- 投资条款审查（金额、估值、股权比例、对赌条款）
- 权利义务审查（股东权利、管理层义务、董事会席位）
- 退出机制审查（IPO、回购、优先清算权）
- 风险控制审查（陈述与保证、违约责任、争议解决）

#### 融资协议 (Financing Agreement)
- 融资条款审查（金额、用途、利率、还款方式）
- 担保条款审查（担保方式、担保范围、登记手续）
- 财务约束审查（财务指标、报告义务、资金使用限制）
- 违约救济审查（违约事件、交叉违约、加速到期）

#### 尽调协议 (Due Diligence Agreement)
- 调查范围审查（调查事项清单、时间地点方式）
- 保密义务审查（保密范围、期限、例外情形）
- 信息真实性审查（陈述与保证、信息更新义务）
- 费用终止审查（费用承担、终止条件、资料返还）

## 🔧 配置指南

### 环境变量配置

#### 闭源模型配置

**Google Gemini**:
```bash
GEMINI_API_KEY=your_api_key
GEMINI_MODEL=gemini-1.5-pro
```

**Anthropic Claude**:
```bash
CLAUDE_API_KEY=your_api_key
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

#### 智源模型配置 (重点)

**ZhiPu GLM-4** (智谱AI):
```bash
ZHIPU_API_KEY=your_id.your_secret
ZHIPU_API_BASE=https://open.bigmodel.cn/api/paas/v4/
ZHIPU_MODEL=glm-4
```

> ⚠️ **注意**: 智源API密钥格式为 `id.secret`，与其他模型不同

#### 开源模型配置

**Llama 3** (via Together AI):
```bash
LLAMA_API_KEY=your_together_api_key
LLAMA_API_BASE=https://api.together.xyz/v1
LLAMA_MODEL=meta-llama/Llama-3-70b-chat-hf
```

**Qwen2** (via Together AI):
```bash
QWEN_API_KEY=your_api_key
QWEN_API_BASE=https://api.together.xyz/v1
QWEN_MODEL=Qwen/Qwen2-72B-Instruct
```

**DeepSeek-R1**:
```bash
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

## 📁 项目结构

```
infinite-photosphere/
├── backend/                    # 后端服务
│   ├── server.js              # Express服务器入口
│   ├── parsers/               # 文件解析器
│   │   └── fileParser.js      # PDF/Word解析
│   ├── llm/                   # LLM适配器
│   │   ├── adapter.js         # 统一适配器（工厂模式）
│   │   └── models/            # 各模型实现
│   │       ├── gemini.js      # Google Gemini
│   │       ├── claude.js      # Anthropic Claude
│   │       ├── zhipu.js       # ZhiPu GLM-4 (专属)
│   │       └── openai-compatible.js  # 开源模型统一接口
│   ├── review/                # 审查逻辑
│   │   ├── templates.js       # 审查模板
│   │   └── processor.js       # 审查处理器
│   ├── generators/            # 文档生成器
│   │   └── documentGenerator.js  # DOCX/PDF生成
│   ├── package.json
│   └── .env.example
├── frontend/                  # 前端应用
│   ├── src/
│   │   ├── pages/            # 页面组件
│   │   │   ├── UploadPage.jsx      # 上传页
│   │   │   ├── ProcessingPage.jsx  # 处理页
│   │   │   └── ResultsPage.jsx     # 结果页
│   │   ├── components/       # 通用组件
│   │   │   ├── ModelSelector.jsx   # 模型选择器
│   │   │   └── CollapsiblePanel.jsx # 折叠面板
│   │   ├── utils/
│   │   │   └── api.js        # API客户端
│   │   ├── App.jsx           # 路由配置
│   │   ├── main.jsx
│   │   └── index.css         # 全局样式
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docs/                     # 文档
│   ├── API_SETUP.md         # API配置指南
│   └── DEPLOYMENT.md        # 部署指南
└── README.md                # 本文件
```

## 📚 更多文档

- [API配置详细指南](docs/API_SETUP.md) - 各模型API密钥获取和配置步骤
- [部署指南](docs/DEPLOYMENT.md) - Vercel、Netlify、Docker部署说明

## 🐛 故障排除

### 后端启动失败

**问题**: `npm start` 报错
**解决**:
1. 确认 Node.js 版本 >= 18
2. 删除 `node_modules` 和 `package-lock.json`，重新 `npm install`
3. 检查 `.env` 文件是否正确配置

### API调用失败

**问题**: 审查失败，提示 "API密钥未配置"
**解决**:
1. 检查 `.env` 文件中对应模型的API密钥是否配置
2. 智源模型确认密钥格式为 `id.secret`
3. 重启后端服务

### 文件上传失败

**问题**: "不支持的文件格式"
**解决**:
- 确保文件为 `.pdf`、`.docx` 或 `.doc` 格式
- 检查文件大小是否超过 10MB

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 📧 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

**开发状态**: ✅ 生产就绪 | **版本**: 1.0.0 | **最后更新**: 2026-01-19
