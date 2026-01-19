import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import ModelSelector from '../components/ModelSelector';
import CollapsiblePanel from '../components/CollapsiblePanel';

function UploadPage() {
    const navigate = useNavigate();

    const [models, setModels] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('private_equity');
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [modelsRes, templatesRes] = await Promise.all([
                api.getModels(),
                api.getTemplates()
            ]);
            setModels(modelsRes.models);
            setTemplates(templatesRes.templates);
        } catch (err) {
            setError('加载配置失败: ' + err.message);
        }
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

        if (!selectedModel) {
            setError('请选择AI模型');
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
                    templateId: selectedTemplate,
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

                {/* 模型选择 */}
                <ModelSelector
                    models={models}
                    selectedModel={selectedModel}
                    onModelChange={setSelectedModel}
                />

                {/* 审查模板选择 */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        审查模板
                    </label>
                    <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full"
                    >
                        {templates.map(template => (
                            <option key={template.id} value={template.id}>
                                {template.name}
                            </option>
                        ))}
                    </select>
                    {selectedTemplate && templates.find(t => t.id === selectedTemplate) && (
                        <p className="text-sm text-gray-500 mt-2">
                            {templates.find(t => t.id === selectedTemplate).description}
                        </p>
                    )}
                </div>

                {/* API配置面板 */}
                <CollapsiblePanel title="API配置 (可选)" defaultOpen={false}>
                    <div className="text-sm text-gray-600 space-y-2">
                        <p>• 如需配置API密钥，请在后端 .env 文件中设置</p>
                        <p>• <strong>闭源模型</strong>: Gemini、Claude 需各自的API密钥</p>
                        <p>• <strong>智源模型</strong>: ZhiPu GLM-4 需单独配置 (格式: id.secret)</p>
                        <p>• <strong>开源模型</strong>: 支持 Together AI、Anyscale 等平台</p>
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
                    disabled={loading || !file || !selectedModel}
                    className={`w-full btn-primary ${(loading || !file || !selectedModel) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {loading ? '处理中...' : '开始审查'}
                </button>
            </div>
        </div>
    );
}

export default UploadPage;
