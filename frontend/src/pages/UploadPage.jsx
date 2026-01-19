import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import CollapsiblePanel from '../components/CollapsiblePanel';

function UploadPage() {
    const navigate = useNavigate();

    const [selectedModel, setSelectedModel] = useState('gemini'); // Default model
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // API Keys state
    const [apiKeys, setApiKeys] = useState({
        gemini: '',
        claude: '',
        openai: '',
        zhipu: ''
    });

    useEffect(() => {
        loadApiKeys();
    }, []);



    const loadApiKeys = () => {
        const storedKeys = {
            gemini: localStorage.getItem('api_key_gemini') || '',
            claude: localStorage.getItem('api_key_claude') || '',
            openai: localStorage.getItem('api_key_openai') || '',
            zhipu: localStorage.getItem('api_key_zhipu') || ''
        };
        setApiKeys(storedKeys);
    };

    const handleApiKeyChange = (provider, value) => {
        const newKeys = { ...apiKeys, [provider]: value };
        setApiKeys(newKeys);
        localStorage.setItem(`api_key_${provider}`, value);
    };

    const handleClearAllKeys = () => {
        localStorage.removeItem('api_key_gemini');
        localStorage.removeItem('api_key_claude');
        localStorage.removeItem('api_key_openai');
        localStorage.removeItem('api_key_zhipu');
        setApiKeys({
            gemini: '',
            claude: '',
            openai: '',
            zhipu: ''
        });
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            handleFileSelect(droppedFile);
        }
    };

    const handleFileSelect = (selectedFile) => {
        const allowedTypes = [
            'application/pdf',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword'
        ];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('仅支持 PDF 和 Word 文档格式');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('文件大小不能超过 10MB');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const handleStartReview = async () => {
        if (!file) {
            setError('请先上传合同文件');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // 上传文件
            const uploadResult = await api.uploadContract(file);

            // 导航到处理页面并传递数据
            navigate('/processing', {
                state: {
                    fileId: uploadResult.fileId,
                    fileName: uploadResult.fileName,
                    contractText: uploadResult.text,
                    modelKey: selectedModel
                }
            });
        } catch (err) {
            setError('上传失败: ' + err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-2xl">
                {/* 标题 */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-btn mb-2">
                        合同审查系统
                    </h1>
                    <p className="text-gray-600">AI驱动的智能合同审查平台</p>
                </div>

                {/* 文件上传区域 */}
                <div
                    className={`upload-area mb-6 ${isDragging ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-input').click()}
                >
                    <input
                        id="file-input"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files[0] && handleFileSelect(e.target.files[0])}
                        className="hidden"
                    />

                    <div className="text-6xl mb-4">📄</div>

                    {file ? (
                        <div>
                            <p className="text-lg font-medium text-primary-btn">
                                已选择: {file.name}
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                大小: {(file.size / 1024).toFixed(2)} KB
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                点击或拖拽文件以更换
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-lg font-medium mb-2">
                                拖拽文件到此处或点击上传
                            </p>
                            <p className="text-sm text-gray-500">
                                支持 PDF、Word 格式，文件大小不超过 10MB
                            </p>
                        </div>
                    )}
                </div>



                {/* API配置面板 */}
                <CollapsiblePanel title="API配置 (可选)" defaultOpen={false}>
                    <div className="space-y-4">
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
                            ⚠️ <strong>安全提示</strong>: API密钥将保存在浏览器本地存储中。请勿在公共设备上使用。
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Gemini API Key
                            </label>
                            <input
                                type="password"
                                value={apiKeys.gemini}
                                onChange={(e) => handleApiKeyChange('gemini', e.target.value)}
                                placeholder="输入 Gemini API 密钥"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-btn focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                Claude API Key
                            </label>
                            <input
                                type="password"
                                value={apiKeys.claude}
                                onChange={(e) => handleApiKeyChange('claude', e.target.value)}
                                placeholder="输入 Claude API 密钥"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-btn focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                OpenAI API Key
                            </label>
                            <input
                                type="password"
                                value={apiKeys.openai}
                                onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                                placeholder="输入 OpenAI API 密钥"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-btn focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-700">
                                ZhiPu GLM API Key
                            </label>
                            <input
                                type="password"
                                value={apiKeys.zhipu}
                                onChange={(e) => handleApiKeyChange('zhipu', e.target.value)}
                                placeholder="输入智谱 API 密钥 (格式: id.secret)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-btn focus:border-transparent"
                            />
                        </div>

                        <button
                            onClick={handleClearAllKeys}
                            className="text-sm text-red-600 hover:text-red-800 hover:underline"
                        >
                            🗑️ 清除所有API密钥
                        </button>
                    </div>
                </CollapsiblePanel>

                {/* 审查规则面板 */}
                <CollapsiblePanel title="审查规则说明" defaultOpen={false}>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p><strong>私募股权合同</strong>: 关注投资条款、权利义务、退出机制、风险控制</p>
                        <p><strong>融资协议</strong>: 关注融资条款、担保条款、财务约束、违约救济</p>
                        <p><strong>尽调协议</strong>: 关注调查范围、保密义务、信息真实性、费用终止</p>
                    </div>
                </CollapsiblePanel>

                {/* 错误提示 */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* 开始审查按钮 */}
                <button
                    onClick={handleStartReview}
                    disabled={loading || !file}
                    className={`w-full btn-primary ${(loading || !file) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? '处理中...' : '开始审查'}
                </button>
            </div>
        </div>
    );
}

export default UploadPage;
