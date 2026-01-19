import axios from 'axios';

/**
 * OpenAI兼容API适配器
 * OpenAI-Compatible API Adapter
 * 
 * 支持以下开源模型 / Supports open-source models:
 * - Llama 3 (70B/8B)
 * - Qwen2 (72B/14B)
 * - Mistral Large
 * - DeepSeek-R1
 * - InternLM2
 */

export class OpenAICompatibleAdapter {
    constructor(apiKey, apiBase, model) {
        this.apiKey = apiKey;
        this.baseURL = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
        this.model = model;
    }

    /**
     * 调用OpenAI兼容API
     * @param {string} prompt - 提示词
     * @param {object} options - 可选配置
     * @returns {Promise<string>}
     */
    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error(`${this.model} API密钥未配置`);
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/chat/completions`,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: options.temperature || 0.7,
                    top_p: options.topP || 0.95,
                    max_tokens: options.maxTokens || 4096,
                    stream: false
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`
                    },
                    timeout: options.timeout || 60000
                }
            );

            if (response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            } else {
                throw new Error(`${this.model} API返回空响应`);
            }
        } catch (error) {
            if (error.response) {
                const errorData = error.response.data;
                throw new Error(`${this.model} API错误: ${error.response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
            }
            throw new Error(`${this.model} API调用失败: ${error.message}`);
        }
    }

    /**
     * 检查API配置是否有效
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey && !!this.baseURL && !!this.model;
    }

    /**
     * 分块处理长文本（用于上下文窗口限制）
     * Chunk long text for context window limitations
     * @param {string} text - 长文本
     * @param {number} chunkSize - 每块字符数
     * @returns {Array<string>}
     */
    static chunkText(text, chunkSize = 8000) {
        const chunks = [];
        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.slice(i, i + chunkSize));
        }
        return chunks;
    }
}
