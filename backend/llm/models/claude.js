import axios from 'axios';

/**
 * Anthropic Claude API 适配器
 * Claude API Adapter
 */

export class ClaudeAdapter {
    constructor(apiKey, model = 'claude-3-5-sonnet-20241022') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseURL = 'https://api.anthropic.com/v1';
        this.apiVersion = '2023-06-01';
    }

    /**
     * 调用Claude API (Messages API)
     * @param {string} prompt - 提示词
     * @param {object} options - 可选配置
     * @returns {Promise<string>}
     */
    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('Claude API密钥未配置');
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/messages`,
                {
                    model: this.model,
                    max_tokens: options.maxTokens || 8192,
                    temperature: options.temperature || 0.7,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': this.apiKey,
                        'anthropic-version': this.apiVersion
                    }
                }
            );

            if (response.data.content && response.data.content.length > 0) {
                return response.data.content[0].text;
            } else {
                throw new Error('Claude API返回空响应');
            }
        } catch (error) {
            if (error.response) {
                throw new Error(`Claude API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Claude API调用失败: ${error.message}`);
        }
    }

    /**
     * 检查API配置是否有效
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey;
    }
}
