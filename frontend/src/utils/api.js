import axios from 'axios';

// 生产环境使用环境变量配置的API地址，开发环境使用代理
const API_BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api';

/**
 * API客户端
 */

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
        const response = await axios.post(`${API_BASE}/review`, {
            fileId,
            contractText,
            templateId,
            modelKey
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
