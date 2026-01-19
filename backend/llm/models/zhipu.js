import axios from 'axios';
import crypto from 'crypto';

/**
 * 智源 ZhiPu GLM API 适配器
 * ZhiPu GLM API Adapter (智谱AI开放平台)
 * 
 * ⚠️ 注意：智源模型使用独立API格式，非OpenAI兼容
 * ⚠️ Note: ZhiPu uses proprietary API format (NOT OpenAI-compatible)
 */

export class ZhiPuAdapter {
    constructor(apiKey, model = 'glm-4', apiBase = 'https://open.bigmodel.cn/api/paas/v4/') {
        this.apiKey = apiKey;
        this.model = model;
        this.baseURL = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
    }

    /**
     * 生成JWT Token用于智源API认证
     * Generate JWT token for ZhiPu API authentication
     * @returns {string}
     */
    generateToken() {
        if (!this.apiKey) {
            throw new Error('智源API密钥未配置');
        }

        try {
            // 智源API使用API Key格式: id.secret
            const [id, secret] = this.apiKey.split('.');
            if (!id || !secret) {
                throw new Error('智源API密钥格式错误，应为: id.secret');
            }

            const timestamp = Date.now();
            const exp = timestamp + 3600000; // 1小时过期

            // 构建JWT Header
            const header = {
                alg: 'HS256',
                sign_type: 'SIGN'
            };

            // 构建JWT Payload
            const payload = {
                api_key: id,
                exp: exp,
                timestamp: timestamp
            };

            // Base64 URL编码
            const base64UrlEncode = (obj) => {
                return Buffer.from(JSON.stringify(obj))
                    .toString('base64')
                    .replace(/\+/g, '-')
                    .replace(/\//g, '_')
                    .replace(/=/g, '');
            };

            const encodedHeader = base64UrlEncode(header);
            const encodedPayload = base64UrlEncode(payload);

            // 生成签名
            const signatureInput = `${encodedHeader}.${encodedPayload}`;
            const signature = crypto
                .createHmac('sha256', secret)
                .update(signatureInput)
                .digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            return `${encodedHeader}.${encodedPayload}.${signature}`;
        } catch (error) {
            throw new Error(`智源Token生成失败: ${error.message}`);
        }
    }

    /**
     * 调用智源 GLM API
     * @param {string} prompt - 提示词
     * @param {object} options - 可选配置
     * @returns {Promise<string>}
     */
    async generateContent(prompt, options = {}) {
        if (!this.apiKey) {
            throw new Error('智源API密钥未配置');
        }

        try {
            const token = this.generateToken();

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
                    max_tokens: options.maxTokens || 8192
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    timeout: options.timeout || 60000
                }
            );

            if (response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            } else {
                throw new Error('智源API返回空响应');
            }
        } catch (error) {
            if (error.response) {
                const errorData = error.response.data;
                throw new Error(`智源API错误: ${error.response.status} - ${errorData.error?.message || JSON.stringify(errorData)}`);
            }
            throw new Error(`智源API调用失败: ${error.message}`);
        }
    }

    /**
     * 检查API配置是否有效
     * @returns {boolean}
     */
    isConfigured() {
        return !!this.apiKey && this.apiKey.includes('.');
    }
}
