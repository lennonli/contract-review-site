import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import fs from 'fs/promises';
import htmlPdf from 'html-pdf-node';

/**
 * 文档生成器 - 生成DOCX和PDF格式的审查报告
 * Document Generator - Generate DOCX and PDF review reports
 */

/**
 * 生成修订版合同DOCX
 * @param {string} revisedContract - 修订版合同文本
 * @param {string} originalContract - 原合同文本
 * @param {string} outputPath - 输出文件路径
 * @returns {Promise<string>}
 */
export async function generateRevisedContractDocx(revisedContract, originalContract, outputPath) {
    try {
        const paragraphs = [];

        // 添加标题
        paragraphs.push(
            new Paragraph({
                text: '修订版合同 (Revised Contract)',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // 处理修订内容
        const lines = revisedContract.split('\n');

        for (const line of lines) {
            if (!line.trim()) {
                paragraphs.push(new Paragraph({ text: '' }));
                continue;
            }

            // 检测【新增：】标记
            const additionMatch = line.match(/【新增[：:](.+?)】/g);
            // 检测【删除：】标记
            const deletionMatch = line.match(/【删除[：:](.+?)】/g);

            if (additionMatch || deletionMatch) {
                const runs = [];
                let remainingText = line;

                // 处理新增内容（红色）
                if (additionMatch) {
                    additionMatch.forEach(match => {
                        const parts = remainingText.split(match);
                        if (parts[0]) {
                            runs.push(new TextRun({ text: parts[0] }));
                        }
                        const addedText = match.match(/【新增[：:](.+?)】/)[1];
                        runs.push(new TextRun({
                            text: addedText,
                            color: 'FF0000', // 红色
                            bold: true
                        }));
                        remainingText = parts.slice(1).join(match);
                    });
                }

                // 处理删除内容（删除线）
                if (deletionMatch) {
                    deletionMatch.forEach(match => {
                        const parts = remainingText.split(match);
                        if (parts[0]) {
                            runs.push(new TextRun({ text: parts[0] }));
                        }
                        const deletedText = match.match(/【删除[：:](.+?)】/)[1];
                        runs.push(new TextRun({
                            text: deletedText,
                            strike: true,
                            color: '999999' // 灰色
                        }));
                        remainingText = parts.slice(1).join(match);
                    });
                }

                if (remainingText) {
                    runs.push(new TextRun({ text: remainingText }));
                }

                paragraphs.push(new Paragraph({ children: runs }));
            } else {
                paragraphs.push(new Paragraph({ text: line }));
            }
        }

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        await fs.writeFile(outputPath, buffer);

        return outputPath;
    } catch (error) {
        throw new Error(`生成修订版合同DOCX失败: ${error.message}`);
    }
}

/**
 * 生成审查意见书DOCX
 * @param {object} reviewResult - 审查结果
 * @param {string} outputPath - 输出文件路径
 * @returns {Promise<string>}
 */
export async function generateReviewReportDocx(reviewResult, outputPath) {
    try {
        const paragraphs = [];

        // 标题
        paragraphs.push(
            new Paragraph({
                text: '合同审查意见书',
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 }
            })
        );

        // 基本信息
        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '审查模板：', bold: true }),
                    new TextRun({ text: reviewResult.template || '未指定' })
                ],
                spacing: { after: 200 }
            })
        );

        paragraphs.push(
            new Paragraph({
                children: [
                    new TextRun({ text: '使用模型：', bold: true }),
                    new TextRun({ text: reviewResult.model || '未指定' })
                ],
                spacing: { after: 400 }
            })
        );

        // 一、风险点清单
        paragraphs.push(
            new Paragraph({
                text: '一、风险点清单',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            })
        );

        if (reviewResult.riskList && reviewResult.riskList.length > 0) {
            reviewResult.riskList.forEach((risk, index) => {
                paragraphs.push(
                    new Paragraph({
                        text: `${index + 1}. ${risk}`,
                        spacing: { after: 150 }
                    })
                );
            });
        } else {
            paragraphs.push(new Paragraph({ text: '未发现明显风险点' }));
        }

        // 二、修订建议
        paragraphs.push(
            new Paragraph({
                text: '二、修订建议',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            })
        );

        if (reviewResult.recommendations && reviewResult.recommendations.length > 0) {
            reviewResult.recommendations.forEach((recommendation, index) => {
                paragraphs.push(
                    new Paragraph({
                        text: `${index + 1}. ${recommendation}`,
                        spacing: { after: 150 }
                    })
                );
            });
        } else {
            paragraphs.push(new Paragraph({ text: '无需修订' }));
        }

        // 三、合规结论
        paragraphs.push(
            new Paragraph({
                text: '三、合规结论',
                heading: HeadingLevel.HEADING_2,
                spacing: { before: 400, after: 200 }
            })
        );

        const conclusionLines = (reviewResult.complianceConclusion || '待评估').split('\n');
        conclusionLines.forEach(line => {
            paragraphs.push(new Paragraph({ text: line, spacing: { after: 100 } }));
        });

        const doc = new Document({
            sections: [{
                properties: {},
                children: paragraphs
            }]
        });

        const buffer = await Packer.toBuffer(doc);
        await fs.writeFile(outputPath, buffer);

        return outputPath;
    } catch (error) {
        throw new Error(`生成审查意见书DOCX失败: ${error.message}`);
    }
}

/**
 * 生成HTML格式的审查报告（用于PDF转换和前端预览）
 * @param {object} reviewResult - 审查结果
 * @returns {string}
 */
export function generateReviewReportHtml(reviewResult) {
    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>合同审查意见书</title>
  <style>
    body {
      font-family: "Microsoft YaHei", "SimSun", Arial, sans-serif;
      line-height: 1.8;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      color: #333;
    }
    h1 {
      text-align: center;
      font-size: 24px;
      margin-bottom: 30px;
      border-bottom: 2px solid #2D3748;
      padding-bottom: 10px;
    }
    h2 {
      font-size: 18px;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #2D3748;
    }
    .meta {
      margin-bottom: 20px;
      padding: 15px;
      background: #F5F5F5;
      border-radius: 5px;
    }
    .meta strong {
      display: inline-block;
      width: 100px;
    }
    .risk-item, .recommendation-item {
      margin-bottom: 15px;
      padding: 10px;
      background: #FAFAFA;
      border-left: 3px solid #2D3748;
    }
    .addition {
      color: #FF0000;
      font-weight: bold;
    }
    .deletion {
      text-decoration: line-through;
      color: #999;
    }
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      background: #F9F9F9;
      padding: 15px;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <h1>合同审查意见书</h1>
  
  <div class="meta">
    <p><strong>审查模板：</strong>${reviewResult.template || '未指定'}</p>
    <p><strong>使用模型：</strong>${reviewResult.model || '未指定'}</p>
  </div>

  <h2>一、风险点清单</h2>
  ${reviewResult.riskList && reviewResult.riskList.length > 0
            ? reviewResult.riskList.map((risk, i) => `<div class="risk-item">${i + 1}. ${risk}</div>`).join('')
            : '<p>未发现明显风险点</p>'}

  <h2>二、修订建议</h2>
  ${reviewResult.recommendations && reviewResult.recommendations.length > 0
            ? reviewResult.recommendations.map((rec, i) => `<div class="recommendation-item">${i + 1}. ${rec}</div>`).join('')
            : '<p>无需修订</p>'}

  <h2>三、合规结论</h2>
  <pre>${reviewResult.complianceConclusion || '待评估'}</pre>
</body>
</html>
  `;
}

/**
 * 生成PDF格式的审查报告
 * @param {object} reviewResult - 审查结果
 * @param {string} outputPath - 输出文件路径
 * @returns {Promise<string>}
 */
export async function generateReviewReportPdf(reviewResult, outputPath) {
    try {
        const html = generateReviewReportHtml(reviewResult);

        const options = {
            format: 'A4',
            margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' }
        };

        const file = { content: html };
        const pdfBuffer = await htmlPdf.generatePdf(file, options);

        await fs.writeFile(outputPath, pdfBuffer);
        return outputPath;
    } catch (error) {
        throw new Error(`生成审查报告PDF失败: ${error.message}`);
    }
}
