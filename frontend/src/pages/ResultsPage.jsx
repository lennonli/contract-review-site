import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

function ResultsPage() {
    const location = useLocation();
    const navigate = useNavigate();

    // 如果没有结果数据，返回首页
    if (!location.state?.result) {
        navigate('/');
        return null;
    }

    const { result, fileName } = location.state;

    const handleDownload = (filePath) => {
        const filename = filePath.split('/').pop();
        const downloadUrl = api.getDownloadUrl(filename);
        window.open(downloadUrl, '_blank');
    };

    // 格式化修订版合同（处理【新增】和【删除】标记）
    const formatRevisedContract = (text) => {
        if (!text) return '';

        return text.split('\n').map((line, index) => {
            // 处理【新增】标记
            let formattedLine = line.replace(
                /【新增[：:](.+?)】/g,
                '<span class="addition">$1</span>'
            );

            // 处理【删除】标记
            formattedLine = formattedLine.replace(
                /【删除[：:](.+?)】/g,
                '<span class="deletion">$1</span>'
            );

            return <div key={index} dangerouslySetInnerHTML={{ __html: formattedLine }} />;
        });
    };

    return (
        <div className="min-h-screen bg-primary-bg p-6">
            <div className="max-w-7xl mx-auto">
                {/* 头部 */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-primary-btn mb-2">
                        审查完成
                    </h1>
                    <p className="text-gray-600">
                        文件: {fileName} | 模型: {result.model} | 模板: {result.template}
                    </p>
                </div>

                {/* 下载按钮组 */}
                <div className="flex gap-4 mb-6 flex-wrap">
                    <button
                        onClick={() => handleDownload(result.files.revisedContract)}
                        className="btn-primary"
                    >
                        📥 下载修订版合同 (DOCX)
                    </button>
                    <button
                        onClick={() => handleDownload(result.files.reviewReportDocx)}
                        className="btn-primary"
                    >
                        📥 下载审查意见书 (DOCX)
                    </button>
                    <button
                        onClick={() => handleDownload(result.files.reviewReportPdf)}
                        className="btn-primary"
                    >
                        📥 下载审查意见书 (PDF)
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="btn-secondary"
                    >
                        ← 返回首页
                    </button>
                </div>

                {/* 左右分栏预览 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左侧：修订版合同 */}
                    <div className="panel h-[600px] flex flex-col">
                        <h2 className="text-xl font-bold mb-4 text-primary-btn">
                            修订版合同
                        </h2>
                        <div className="flex-1 overflow-y-auto text-sm whitespace-pre-wrap">
                            <style>
                                {`
                  .addition {
                    color: #FF0000;
                    font-weight: bold;
                  }
                  .deletion {
                    text-decoration: line-through;
                    color: #999999;
                  }
                `}
                            </style>
                            {formatRevisedContract(result.revisedContract)}
                        </div>
                    </div>

                    {/* 右侧：审查意见书 */}
                    <div className="panel h-[600px] flex flex-col">
                        <h2 className="text-xl font-bold mb-4 text-primary-btn">
                            审查意见书
                        </h2>
                        <div className="flex-1 overflow-y-auto text-sm">
                            {/* 风险点清单 */}
                            <div className="mb-6">
                                <h3 className="font-bold text-base mb-2">一、风险点清单</h3>
                                {result.riskList && result.riskList.length > 0 ? (
                                    <div className="space-y-2">
                                        {result.riskList.map((risk, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-red-500">
                                                {index + 1}. {risk}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">未发现明显风险点</p>
                                )}
                            </div>

                            {/* 修订建议 */}
                            <div className="mb-6">
                                <h3 className="font-bold text-base mb-2">二、修订建议</h3>
                                {result.recommendations && result.recommendations.length > 0 ? (
                                    <div className="space-y-2">
                                        {result.recommendations.map((rec, index) => (
                                            <div key={index} className="bg-gray-50 p-3 rounded border-l-4 border-blue-500">
                                                {index + 1}. {rec}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">无需修订</p>
                                )}
                            </div>

                            {/* 合规结论 */}
                            <div>
                                <h3 className="font-bold text-base mb-2">三、合规结论</h3>
                                <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap">
                                    {result.complianceConclusion || '待评估'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResultsPage;
