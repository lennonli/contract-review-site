import axios from 'axios';

// 生产环境使用环境变量配置的API地址，开发环境使用代理
const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

/**
 * API客户端
 */

/**
 * 从localStorage获取API密钥
 */
const getApiKeys = () => {
    return {
        gemini: localStorage.getItem('api_key_gemini') || '',
        claude: localStorage.getItem('api_key_claude') || '',
        openai: localStorage.getItem('api_key_openai') || '',
        zhipu: localStorage.getItem('api_key_zhipu') || ''
    };
};

/**
 * 根据模型准备API请求头
 * @param {string} modelKey - 模型标识符
 * @returns {object} - 请求头对象
 */
const getApiHeaders = (modelKey) => {
    const apiKeys = getApiKeys();
    const headers = {};

    // 根据模型类型添加相应的API密钥
    if (modelKey && apiKeys) {
        if (modelKey.includes('gemini')) {
            headers['X-Gemini-API-Key'] = apiKeys.gemini;
        } else if (modelKey.includes('claude')) {
            headers['X-Claude-API-Key'] = apiKeys.claude;
        } else if (modelKey.includes('gpt') || modelKey.includes('openai')) {
            headers['X-OpenAI-API-Key'] = apiKeys.openai;
        } else if (modelKey.includes('glm') || modelKey.includes('zhipu')) {
            headers['X-ZhiPu-API-Key'] = apiKeys.zhipu;
        }
    }

    return headers;
};

export const api = {
    /**
     * 获取所有可用模型
     */
    getModels: async () => {
        const response = await axios.get(`${API_BASE}/models`);
        return response.data;
    },

    /**
     * 获取所有审查模板
     */
    getTemplates: async () => {
        const response = await axios.get(`${API_BASE}/templates`);
        return response.data;
    },

    /**
     * 上传合同文件
     */
    uploadContract: async (file) => {
        const formData = new FormData();
        formData.append('contract', file);

        const response = await axios.post(`${API_BASE}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    },

    /**
     * 执行合同审查
     */
    reviewContract: async (fileId, contractText, templateId, modelKey) => {
        const headers = getApiHeaders(modelKey);

        const response = await axios.post(`${API_BASE}/review`, {
            fileId,
            contractText,
            templateId,
            modelKey
        }, {
            headers
        });

        return response.data;
    },

    /**
     * 获取下载URL
     */
    getDownloadUrl: (filename) => {
        const baseUrl = import.meta.env.VITE_API_URL || '';
        return `${baseUrl}/api/download/${encodeURIComponent(filename)}`;
    }
};
