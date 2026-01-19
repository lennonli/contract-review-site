import pdf from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * 文件解析器 - 提取Word/PDF文本并保留格式
 * File Parser - Extract text from Word/PDF while preserving formatting
 */

/**
 * 解析PDF文件
 * @param {string} filePath - PDF文件路径
 * @returns {Promise<{text: string, metadata: object}>}
 */
export async function parsePDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    
    return {
      text: data.text,
      metadata: {
        pages: data.numpages,
        info: data.info
      }
    };
  } catch (error) {
    throw new Error(`PDF解析失败: ${error.message}`);
  }
}

/**
 * 解析Word文档 (.docx)
 * @param {string} filePath - Word文件路径
 * @returns {Promise<{text: string, html: string, metadata: object}>}
 */
export async function parseWord(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    
    // 提取纯文本
    const textResult = await mammoth.extractRawText({ buffer: dataBuffer });
    
    // 提取HTML（保留格式）
    const htmlResult = await mammoth.convertToHtml({ buffer: dataBuffer });
    
    return {
      text: textResult.value,
      html: htmlResult.value,
      metadata: {
        messages: textResult.messages,
        warnings: htmlResult.messages
      }
    };
  } catch (error) {
    throw new Error(`Word文档解析失败: ${error.message}`);
  }
}

/**
 * 检测条款层级结构
 * Detect clause hierarchy (e.g., 1., 1.1, 1.1.1, etc.)
 * @param {string} text - 合同文本
 * @returns {Array<{level: number, number: string, content: string}>}
 */
export function detectClauseHierarchy(text) {
  const lines = text.split('\n');
  const clauses = [];
  
  // 匹配编号格式：1. 或 1.1 或 1.1.1 或 第一条 等
  const numberPatterns = [
    /^(\d+(?:\.\d+)*)\s*[、.．]\s*(.+)$/,  // 1. 或 1.1. 格式
    /^第([一二三四五六七八九十百]+)条\s*(.+)$/,  // 第一条 格式
    /^\(([一二三四五六七八九十]+)\)\s*(.+)$/,  // (一) 格式
    /^[（(](\d+)[）)]\s*(.+)$/  // (1) 格式
  ];
  
  lines.forEach((line, index) => {
    line = line.trim();
    if (!line) return;
    
    for (const pattern of numberPatterns) {
      const match = line.match(pattern);
      if (match) {
        const number = match[1];
        const content = match[2];
        const level = number.includes('.') ? number.split('.').length : 1;
        
        clauses.push({
          level,
          number,
          content,
          lineNumber: index + 1
        });
        break;
      }
    }
  });
  
  return clauses;
}

/**
 * 统一文件解析接口
 * @param {string} filePath - 文件路径
 * @param {string} fileType - 文件类型 (pdf/docx)
 * @returns {Promise<{text: string, html: string|null, clauses: Array, metadata: object}>}
 */
export async function parseFile(filePath, fileType) {
  let result;
  
  if (fileType === 'pdf') {
    result = await parsePDF(filePath);
    result.html = null;
  } else if (fileType === 'docx' || fileType === 'doc') {
    result = await parseWord(filePath);
  } else {
    throw new Error(`不支持的文件类型: ${fileType}`);
  }
  
  // 检测条款层级
  result.clauses = detectClauseHierarchy(result.text);
  
  return result;
}
