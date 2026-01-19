import axios from 'axios';

/**
 * Google Gemini API 适配器
 * Gemini API Adapter
 */

export class GeminiAdapter {
    constructor(apiKey, model = 'gemini-1.5-pro') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    }

    /**
     * 调用Gemini API
     * @param {string} prompt - 提示词
     * @param {object} options - 可选配置
     * @returns {Promise<string>}
     */
    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('Gemini API密钥未配置');
        }

        try {
            const response = await axios.post(
                `${this.baseURL}/models/${this.model}:generateContent`,
                {
                    contents: [{
                        parts: [{ text: prompt }]
                    }],
                    generationConfig: {
                        temperature: options.temperature || 0.7,
                        topK: options.topK || 40,
                        topP: options.topP || 0.95,
                        maxOutputTokens: options.maxTokens || 8192,
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    params: {
                        key: this.apiKey
                    }
                }
            );

            if (response.data.candidates && response.data.candidates.length > 0) {
                return response.data.candidates[0].content.parts[0].text;
            } else {
                throw new Error('Gemini API返回空响应');
            }
        } catch (error) {
            if (error.response) {
                throw new Error(`Gemini API错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw new Error(`Gemini API调用失败: ${error.message}`);
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
