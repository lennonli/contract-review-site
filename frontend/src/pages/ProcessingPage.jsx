import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function ProcessingPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('正在处理合同...');
    const [error, setError] = useState('');

    useEffect(() => {
        // 如果没有传递状态，返回首页
        if (!location.state) {
            navigate('/');
            return;
        }

        startReview();
    }, []);

    const startReview = async () => {
        const { fileId, contractText, templateId, modelKey, fileName } = location.state;

        try {
            // 模拟进度更新
            setProgress(10);
            setStatus('文件已上传...');

            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(30);
            setStatus('正在调用AI模型...');

            // 执行审查
            const result = await api.reviewContract(fileId, contractText, templateId, modelKey);

            setProgress(80);
            setStatus('正在生成报告...');

            await new Promise(resolve => setTimeout(resolve, 500));
            setProgress(100);
            setStatus('完成！');

            // 等待一下再跳转
            await new Promise(resolve => setTimeout(resolve, 500));

            // 导航到结果页面
            navigate('/results', {
                state: {
                    result: result.result,
                    fileName
                }
            });
        } catch (err) {
            console.error('Review error:', err);
            setError('审查失败: ' + (err.response?.data?.error || err.message));
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-primary-bg">
            <div className="w-full max-w-md">
                <div className="panel text-center">
                    {/* 标题 */}
                    <h2 className="text-2xl font-bold text-primary-btn mb-6">
                        {error ? '处理失败' : '审查进行中'}
                    </h2>

                    {/* 进度条 */}
                    {!error && (
                        <div className="mb-6">
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                <div
                                    className="bg-primary-btn h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600">{progress}%</p>
                        </div>
                    )}

                    {/* 状态文字 */}
                    {error ? (
                        <div>
                            <div className="text-6xl mb-4">❌</div>
                            <p className="text-red-600 mb-6">{error}</p>
                            <button
                                onClick={() => navigate('/')}
                                className="btn-primary"
                            >
                                返回首页
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="text-6xl mb-4 animate-pulse">⚙️</div>
                            <p className="text-gray-600 text-lg">{status}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProcessingPage;
