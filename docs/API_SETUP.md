# API配置指南 | API Setup Guide

本文档详细说明如何获取和配置各个LLM模型的API密钥。

## 目录
- [闭源模型](#闭源模型)
  - [Google Gemini](#google-gemini)
  - [Anthropic Claude](#anthropic-claude)
- [智源模型](#智源模型-重点)
  - [ZhiPu GLM-4](#zhipu-glm-4)
- [开源模型](#开源模型)
  - [Together AI (Llama 3, Qwen2)](#together-ai)
  - [Mistral AI](#mistral-ai)
  - [DeepSeek](#deepseek)
  - [InternLM2 本地部署](#internlm2-本地部署)

---

## 闭源模型

### Google Gemini

#### 获取API密钥

1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 使用Google账号登录
3. 点击 "Get API Key" 或 "Create API Key"
4. 选择项目或创建新项目
5. 复制生成的API密钥

#### 配置环境变量

在 `backend/.env` 文件中添加：

```bash
GEMINI_API_KEY=AIzaSy...your_api_key_here
GEMINI_MODEL=gemini-1.5-pro
```

**可用模型**:
- `gemini-1.5-pro` (推荐，上下文窗口大)
- `gemini-1.5-flash` (速度快，成本低)

#### 注意事项
- ⚠️ Gemini API可能在某些地区受限，需使用代理
- 💰 免费额度: 每分钟60次请求
- 📖 [官方文档](https://ai.google.dev/docs)

---

### Anthropic Claude

#### 获取API密钥

1. 访问 [Anthropic Console](https://console.anthropic.com/)
2. 注册账号并登录
3. 进入 "API Keys" 页面
4. 点击 "Create Key"
5. 复制生成的API密钥

#### 配置环境变量

```bash
CLAUDE_API_KEY=sk-ant-api03-...your_api_key_here
CLAUDE_MODEL=claude-3-5-sonnet-20241022
```

**可用模型**:
- `claude-3-5-sonnet-20241022` (推荐，性价比高)
- `claude-3-opus-20240229` (最强性能)

#### 注意事项
- 💰 需要充值才能使用
- 📊 计费方式: 按token计费
- 📖 [官方文档](https://docs.anthropic.com/)

---

## 智源模型 (重点)

### ZhiPu GLM-4

> ⚠️ **重要**: 智源模型使用独立API格式，与OpenAI不兼容，本项目已实现专属适配器

#### 获取API密钥

1. 访问 [智谱AI开放平台](https://open.bigmodel.cn/)
2. 注册并登录账号（支持手机号/企业认证）
3. 进入 "控制台" → "API管理"
4. 点击 "创建API Key"
5. 复制生成的API密钥（格式: `id.secret`）

#### 配置环境变量

```bash
# 智源GLM-4配置
ZHIPU_API_KEY=your_id.your_secret
ZHIPU_API_BASE=https://open.bigmodel.cn/api/paas/v4/
ZHIPU_MODEL=glm-4
```

**可用模型**:
- `glm-4` (推荐，128K上下文)
- `glm-4v` (视觉模型，支持图片)

#### 密钥格式说明

智源API密钥格式为 `id.secret`，例如:
```
abc123def456.1234567890abcdefghijklmnopqrstuvwxyz
```

系统会自动处理JWT签名认证。

#### 注意事项
- ✅ 本项目已实现智源专属适配器，无需手动处理认证
- 💰 新用户有免费额度（约500万tokens）
- 🇨🇳 国内访问速度快，无需代理
- 📖 [官方文档](https://open.bigmodel.cn/dev/api)

#### 常见问题

**Q: API密钥格式错误**  
A: 确保密钥包含一个英文句点 `.`，分隔id和secret

**Q: 401 Unauthorized**  
A: 检查密钥是否正确，或密钥是否已过期

**Q: 接口调用超时**  
A: 检查网络连接，或尝试更换API Base URL

---

## 开源模型

### Together AI

Together AI 提供托管的开源模型API，支持 Llama 3、Qwen2、Mistral 等。

#### 获取API密钥

1. 访问 [Together AI](https://api.together.xyz/)
2. 注册账号并登录
3. 进入 "Settings" → "API Keys"
4. 点击 "Create new API key"
5. 复制生成的API密钥

#### 配置环境变量

**Llama 3**:
```bash
LLAMA_API_KEY=your_together_api_key
LLAMA_API_BASE=https://api.together.xyz/v1
LLAMA_MODEL=meta-llama/Llama-3-70b-chat-hf
```

**Qwen2**:
```bash
QWEN_API_KEY=your_together_api_key
QWEN_API_BASE=https://api.together.xyz/v1
QWEN_MODEL=Qwen/Qwen2-72B-Instruct
```

#### 可用模型
- Llama 3: `meta-llama/Llama-3-70b-chat-hf`, `meta-llama/Llama-3-8b-chat-hf`
- Qwen2: `Qwen/Qwen2-72B-Instruct`, `Qwen/Qwen2-14B-Instruct`
- Mistral: `mistralai/Mistral-7B-Instruct-v0.2`

#### 注意事项
- 💰 按使用量计费，首次注册有免费额度
- 📖 [官方文档](https://docs.together.ai/)

---

### Mistral AI

#### 获取API密钥

1. 访问 [Mistral AI Console](https://console.mistral.ai/)
2. 注册并登录
3. 创建API密钥
4. 复制密钥

#### 配置环境变量

```bash
MISTRAL_API_KEY=your_mistral_api_key
MISTRAL_API_BASE=https://api.mistral.ai/v1
MISTRAL_MODEL=mistral-large-latest
```

---

### DeepSeek

#### 获取API密钥

1. 访问 [DeepSeek Platform](https://platform.deepseek.com/)
2. 注册并登录（支持中国手机号）
3. 进入 "API Keys" 页面
4. 创建新的API密钥

#### 配置环境变量

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_API_BASE=https://api.deepseek.com/v1
DEEPSEEK_MODEL=deepseek-chat
```

#### 注意事项
- 💰 价格极低，中文能力强
- 🚀 DeepSeek-R1 支持推理增强
- 📖 [官方文档](https://platform.deepseek.com/api-docs/)

---

### InternLM2 本地部署

InternLM2 需要本地部署或使用云平台。

#### 部署选项

**1. 本地部署 (使用vLLM)**

```bash
# 安装vLLM
pip install vllm

# 启动OpenAI兼容服务器
python -m vllm.entrypoints.openai.api_server \
  --model internlm/internlm2-chat-20b \
  --served-model-name internlm2-chat-20b \
  --host 0.0.0.0 \
  --port 8000
```

**2. 使用Hugging Face Inference API**

免费额度有限，适合测试。

#### 配置环境变量

```bash
INTERNLM_API_KEY=your_api_key_or_dummy
INTERNLM_API_BASE=http://localhost:8000/v1
INTERNLM_MODEL=internlm2-chat-20b
```

---

## 测试API配置

启动后端后，可通过以下方式测试API配置:

```bash
curl http://localhost:3001/api/models
```

应返回所有支持的模型列表。

---

## 推荐配置方案

### 方案1: 快速体验
- **Gemini 1.5 Flash** (免费额度)
- 速度快，适合测试

### 方案2: 高质量审查
- **Claude 3.5 Sonnet** 或 **Gemini 1.5 Pro**
- 审查质量最高

### 方案3: 国内优选
- **智源 GLM-4**
- 国内访问快，免费额度充足，中文能力强

### 方案4: 成本优化
- **DeepSeek-R1**
- 价格极低，性能优秀

---

## 常见问题

### Q: 可以同时配置多个模型吗？
A: 可以！在 `.env` 中配置多个模型的密钥，前端可随时切换。

### Q: 哪个模型最适合合同审查？
A: 推荐 **Claude 3.5 Sonnet** (综合能力强) 或 **智源 GLM-4** (中文合同专业)。

### Q: 免费模型有哪些？
A: Gemini 有免费额度，智源 GLM-4 新用户有500万tokens免费。

### Q: API调用失败怎么办？
A: 检查：
1. 密钥是否正确配置
2. 网络是否可访问API地址
3. 账户是否有余额（付费模型）
4. 后端日志中的具体错误信息

---

**更新时间**: 2026-01-19
