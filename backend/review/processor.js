import { getTemplate } from './templates.js';
import { generateContent } from '../llm/adapter.js';

/**
 * 合同审查处理器
 * Contract Review Processor
 */

/**
 * 构建审查提示词
 * @param {string} contractText - 合同文本
 * @param {object} template - 审查模板
 * @returns {string}
 */
function buildReviewPrompt(contractText, template) {
    const reviewPointsText = template.reviewPoints
        .map(category => {
            const items = category.items.map(item => `  - ${item}`).join('\n');
            return `### ${category.category}\n${items}`;
        })
        .join('\n\n');

    const riskKeywordsText = template.riskKeywords.join('、');
    const complianceText = template.complianceChecks.map(check => `- ${check}`).join('\n');

    return `# 合同审查任务

## 待审查合同
${contractText}

## 审查模板
**模板名称**: ${template.name}
**适用场景**: ${template.description}

## 审查要点
${reviewPointsText}

## 风险关键词
请特别关注以下关键词及相关条款：${riskKeywordsText}

## 合规性检查
${complianceText}

---

## 输出要求

请按以下格式输出审查结果（严格遵循格式，使用中文）：

### 一、修订版合同

在原合同基础上进行修订，使用以下标记：
- 新增或修改的内容用【新增：XXX】标记
- 建议删除的内容用【删除：XXX】标记
- 保留原有编号和层级结构

### 二、审查意见书

#### 1. 风险点清单
列出发现的所有风险点，按条款序号排列，每项包括：
- 条款序号
- 风险描述
- 风险等级（高/中/低）

#### 2. 修订建议
针对每个风险点，提供具体的修订建议，包括：
- 建议修订的条款
- 修订理由
- 修订后的参考文本

#### 3. 合规结论
总体合规性评估，包括：
- 主要合规问题汇总
- 合规建议
- 整体风险评级

注意：
1. 所有输出使用中文
2. 保持专业的法律语言风格
3. 修订建议要具体、可操作
4. 标注要清晰，便于区分原文和修改内容`;
}

/**
 * 解析LLM输出
 * @param {string} output - LLM原始输出
 * @returns {object}
 */
function parseReviewOutput(output) {
    const sections = {
        revisedContract: '',
        riskList: [],
        recommendations: [],
        complianceConclusion: ''
    };

    try {
        // 提取修订版合同
        const contractMatch = output.match(/###?\s*一[、．.]?\s*修订版合同([\s\S]*?)###?\s*二[、．.]?\s*审查意见书/i);
        if (contractMatch) {
            sections.revisedContract = contractMatch[1].trim();
        }

        // 提取风险点清单
        const riskMatch = output.match(/####?\s*1[、．.]?\s*风险点清单([\s\S]*?)####?\s*2[、．.]?\s*修订建议/i);
        if (riskMatch) {
            const riskText = riskMatch[1].trim();
            // 简单解析：每个段落为一个风险点
            const riskParagraphs = riskText.split('\n\n').filter(p => p.trim());
            sections.riskList = riskParagraphs.map(p => p.trim());
        }

        // 提取修订建议
        const recommendMatch = output.match(/####?\s*2[、．.]?\s*修订建议([\s\S]*?)####?\s*3[、．.]?\s*合规结论/i);
        if (recommendMatch) {
            const recommendText = recommendMatch[1].trim();
            const recommendParagraphs = recommendText.split('\n\n').filter(p => p.trim());
            sections.recommendations = recommendParagraphs.map(p => p.trim());
        }

        // 提取合规结论
        const complianceMatch = output.match(/####?\s*3[、．.]?\s*合规结论([\s\S]*?)$/i);
        if (complianceMatch) {
            sections.complianceConclusion = complianceMatch[1].trim();
        }

        return sections;
    } catch (error) {
        console.error('解析审查输出失败:', error);
        // 返回原始输出
        return {
            revisedContract: output,
            riskList: [],
            recommendations: [],
            complianceConclusion: '解析失败，请查看原始输出'
        };
    }
}

/**
 * 执行合同审查
 * @param {string} contractText - 合同文本
 * @param {string} templateId - 模板ID
 * @param {string} modelKey - 模型标识
 * @param {object} config - 环境配置
 * @returns {Promise<object>}
 */
export async function reviewContract(contractText, templateId, modelKey, config) {
    try {
        // 获取审查模板
        const template = getTemplate(templateId);
        if (!template) {
            throw new Error(`未找到审查模板: ${templateId}`);
        }

        // 构建提示词
        const prompt = buildReviewPrompt(contractText, template);

        // 调用LLM
        console.log(`使用模型 ${modelKey} 进行审查...`);
        const output = await generateContent(modelKey, prompt, config, {
            temperature: 0.5, // 降低温度以提高一致性
            maxTokens: 8192
        });

        // 解析输出
        const parsed = parseReviewOutput(output);

        return {
            success: true,
            template: template.name,
            model: modelKey,
            originalContract: contractText,
            ...parsed,
            rawOutput: output
        };
    } catch (error) {
        console.error('合同审查失败:', error);
        throw error;
    }
}

/**
 * 批量审查（用于长合同分块处理）
 * @param {Array<string>} chunks - 合同文本块
 * @param {string} templateId - 模板ID
 * @param {string} modelKey - 模型标识
 * @param {object} config - 环境配置
 * @returns {Promise<object>}
 */
export async function reviewContractInChunks(chunks, templateId, modelKey, config) {
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
        console.log(`审查第 ${i + 1}/${chunks.length} 部分...`);
        const result = await reviewContract(chunks[i], templateId, modelKey, config);
        results.push(result);
    }

    // 合并结果
    return {
        success: true,
        template: results[0].template,
        model: modelKey,
        originalContract: chunks.join('\n\n'),
        revisedContract: results.map(r => r.revisedContract).join('\n\n'),
        riskList: results.flatMap(r => r.riskList),
        recommendations: results.flatMap(r => r.recommendations),
        complianceConclusion: results.map(r => r.complianceConclusion).join('\n\n'),
        rawOutput: results.map(r => r.rawOutput).join('\n\n---\n\n')
    };
}
