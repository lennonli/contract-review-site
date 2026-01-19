import { GeminiAdapter } from './models/gemini.js';
import { ClaudeAdapter } from './models/claude.js';
import { ZhiPuAdapter } from './models/zhipu.js';
import { OpenAICompatibleAdapter } from './models/openai-compatible.js';

/**
 * 统一LLM适配器 - 工厂模式
 * Unified LLM Adapter - Factory Pattern
 */

/**
 * 支持的模型列表
 */
export const SUPPORTED_MODELS = {
    // 闭源模型 / Proprietary Models
    'gemini-1.5-pro': { type: 'gemini', name: 'Gemini 1.5 Pro' },
    'gemini-1.5-flash': { type: 'gemini', name: 'Gemini 1.5 Flash' },
    'claude-3-5-sonnet-20241022': { type: 'claude', name: 'Claude 3.5 Sonnet' },
    'claude-3-opus-20240229': { type: 'claude', name: 'Claude 3 Opus' },

    // 智源模型 / ZhiPu Models
    'glm-4': { type: 'zhipu', name: 'ZhiPu GLM-4' },
    'glm-4v': { type: 'zhipu', name: 'ZhiPu GLM-4V' },

    // 开源模型 / Open-Source Models
    'llama-3-70b': { type: 'openai', name: 'Llama 3 70B', modelId: 'meta-llama/Llama-3-70b-chat-hf' },
    'llama-3-8b': { type: 'openai', name: 'Llama 3 8B', modelId: 'meta-llama/Llama-3-8b-chat-hf' },
    'qwen2-72b': { type: 'openai', name: 'Qwen2 72B', modelId: 'Qwen/Qwen2-72B-Instruct' },
    'qwen2-14b': { type: 'openai', name: 'Qwen2 14B', modelId: 'Qwen/Qwen2-14B-Instruct' },
    'mistral-large': { type: 'openai', name: 'Mistral Large', modelId: 'mistral-large-latest' },
    'deepseek-r1': { type: 'openai', name: 'DeepSeek-R1', modelId: 'deepseek-chat' },
    'internlm2': { type: 'openai', name: 'InternLM2', modelId: 'internlm2-chat-20b' }
};

/**
 * 创建LLM适配器实例
 * @param {string} modelKey - 模型标识
 * @param {object} config - 环境配置
 * @returns {object} LLM适配器实例
 */
export function createAdapter(modelKey, config) {
    const modelInfo = SUPPORTED_MODELS[modelKey];

    if (!modelInfo) {
        throw new Error(`不支持的模型: ${modelKey}`);
    }

    switch (modelInfo.type) {
        case 'gemini':
            return new GeminiAdapter(
                config.GEMINI_API_KEY,
                config.GEMINI_MODEL || modelKey
            );

        case 'claude':
            return new ClaudeAdapter(
                config.CLAUDE_API_KEY,
                config.CLAUDE_MODEL || modelKey
            );

        case 'zhipu':
            return new ZhiPuAdapter(
                config.ZHIPU_API_KEY,
                config.ZHIPU_MODEL || modelKey,
                config.ZHIPU_API_BASE
            );

        case 'openai':
            // 根据模型选择对应的配置
            const modelConfig = getOpenAIConfig(modelKey, modelInfo, config);
            return new OpenAICompatibleAdapter(
                modelConfig.apiKey,
                modelConfig.apiBase,
                modelConfig.model
            );

        default:
            throw new Error(`未知的模型类型: ${modelInfo.type}`);
    }
}

/**
 * 获取OpenAI兼容模型的配置
 * @param {string} modelKey - 模型标识
 * @param {object} modelInfo - 模型信息
 * @param {object} config - 环境配置
 * @returns {object}
 */
function getOpenAIConfig(modelKey, modelInfo, config) {
    const configs = {
        'llama-3-70b': {
            apiKey: config.LLAMA_API_KEY,
            apiBase: config.LLAMA_API_BASE || 'https://api.together.xyz/v1',
            model: config.LLAMA_MODEL || modelInfo.modelId
        },
        'llama-3-8b': {
            apiKey: config.LLAMA_API_KEY,
            apiBase: config.LLAMA_API_BASE || 'https://api.together.xyz/v1',
            model: modelInfo.modelId
        },
        'qwen2-72b': {
            apiKey: config.QWEN_API_KEY,
            apiBase: config.QWEN_API_BASE || 'https://api.together.xyz/v1',
            model: config.QWEN_MODEL || modelInfo.modelId
        },
        'qwen2-14b': {
            apiKey: config.QWEN_API_KEY,
            apiBase: config.QWEN_API_BASE || 'https://api.together.xyz/v1',
            model: modelInfo.modelId
        },
        'mistral-large': {
            apiKey: config.MISTRAL_API_KEY,
            apiBase: config.MISTRAL_API_BASE || 'https://api.mistral.ai/v1',
            model: config.MISTRAL_MODEL || modelInfo.modelId
        },
        'deepseek-r1': {
            apiKey: config.DEEPSEEK_API_KEY,
            apiBase: config.DEEPSEEK_API_BASE || 'https://api.deepseek.com/v1',
            model: config.DEEPSEEK_MODEL || modelInfo.modelId
        },
        'internlm2': {
            apiKey: config.INTERNLM_API_KEY,
            apiBase: config.INTERNLM_API_BASE || 'http://localhost:8000/v1',
            model: config.INTERNLM_MODEL || modelInfo.modelId
        }
    };

    return configs[modelKey] || {
        apiKey: null,
        apiBase: null,
        model: modelInfo.modelId
    };
}

/**
 * 统一的内容生成接口
 * @param {string} modelKey - 模型标识
 * @param {string} prompt - 提示词
 * @param {object} config - 环境配置
 * @param {object} options - 生成选项
 * @returns {Promise<string>}
 */
export async function generateContent(modelKey, prompt, config, options = {}) {
    try {
        const adapter = createAdapter(modelKey, config);

        if (!adapter.isConfigured()) {
            throw new Error(`模型 ${modelKey} 的API配置不完整，请检查环境变量`);
        }

        const result = await adapter.generateContent(prompt, options);
        return result;
    } catch (error) {
        console.error(`LLM调用失败 [${modelKey}]:`, error.message);
        throw error;
    }
}

/**
 * 获取所有可用模型列表（按类别分组）
 * @returns {object}
 */
export function getAvailableModels() {
    return {
        proprietary: [
            { key: 'gemini-1.5-pro', ...SUPPORTED_MODELS['gemini-1.5-pro'] },
            { key: 'gemini-1.5-flash', ...SUPPORTED_MODELS['gemini-1.5-flash'] },
            { key: 'claude-3-5-sonnet-20241022', ...SUPPORTED_MODELS['claude-3-5-sonnet-20241022'] },
            { key: 'claude-3-opus-20240229', ...SUPPORTED_MODELS['claude-3-opus-20240229'] }
        ],
        zhipu: [
            { key: 'glm-4', ...SUPPORTED_MODELS['glm-4'] },
            { key: 'glm-4v', ...SUPPORTED_MODELS['glm-4v'] }
        ],
        opensource: [
            { key: 'llama-3-70b', ...SUPPORTED_MODELS['llama-3-70b'] },
            { key: 'llama-3-8b', ...SUPPORTED_MODELS['llama-3-8b'] },
            { key: 'qwen2-72b', ...SUPPORTED_MODELS['qwen2-72b'] },
            { key: 'qwen2-14b', ...SUPPORTED_MODELS['qwen2-14b'] },
            { key: 'mistral-large', ...SUPPORTED_MODELS['mistral-large'] },
            { key: 'deepseek-r1', ...SUPPORTED_MODELS['deepseek-r1'] },
            { key: 'internlm2', ...SUPPORTED_MODELS['internlm2'] }
        ]
    };
}
