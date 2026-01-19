/**
 * 模型选择器组件
 * Model Selector Component
 */
function ModelSelector({ models, selectedModel, onModelChange }) {
    if (!models) {
        return <div>加载中...</div>;
    }

    return (
        <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700">
                选择AI模型
            </label>
            <select
                value={selectedModel}
                onChange={(e) => onModelChange(e.target.value)}
                className="w-full"
            >
                <option value="">请选择模型</option>

                <optgroup label="🔒 闭源模型 (Proprietary Models)">
                    {models.proprietary?.map(model => (
                        <option key={model.key} value={model.key}>
                            {model.name}
                        </option>
                    ))}
                </optgroup>

                <optgroup label="🧠 智源模型 (ZhiPu GLM)">
                    {models.zhipu?.map(model => (
                        <option key={model.key} value={model.key}>
                            {model.name}
                        </option>
                    ))}
                </optgroup>

                <optgroup label="🌐 开源模型 (Open-Source Models)">
                    {models.opensource?.map(model => (
                        <option key={model.key} value={model.key}>
                            {model.name}
                        </option>
                    ))}
                </optgroup>
            </select>
        </div>
    );
}

export default ModelSelector;
