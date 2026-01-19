import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { parseFile } from './parsers/fileParser.js';
import { reviewContract } from './review/processor.js';
import { getAvailableModels } from './llm/adapter.js';
import { getAllTemplates } from './review/templates.js';
import {
    generateRevisedContractDocx,
    generateReviewReportDocx,
    generateReviewReportPdf,
    generateReviewReportHtml
} from './generators/documentGenerator.js';

// 加载环境变量
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'https://lennonli.github.io',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Gemini-API-Key', 'X-Claude-API-Key', 'X-OpenAI-API-Key', 'X-ZhiPu-API-Key']
};
app.use(cors(corsOptions));
app.use(express.json());

// 文件上传配置
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // 10MB
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.docx', '.doc'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件格式，仅支持PDF和Word文档'));
        }
    }
});

// 确保必要的目录存在
async function ensureDirectories() {
    const dirs = ['uploads', 'outputs'];
    for (const dir of dirs) {
        try {
            await fs.access(dir);
        } catch {
            await fs.mkdir(dir, { recursive: true });
        }
    }
}

// 清理临时文件
async function cleanupFiles(...filePaths) {
    for (const filePath of filePaths) {
        try {
            await fs.unlink(filePath);
            console.log(`已删除临时文件: ${filePath}`);
        } catch (error) {
            console.error(`删除文件失败 ${filePath}:`, error.message);
        }
    }
}

// ========================================
// API Routes
// ========================================

/**
 * GET /api/models
 * 获取所有可用模型列表
 */
app.get('/api/models', (req, res) => {
    try {
        const models = getAvailableModels();
        res.json({ success: true, models });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/templates
 * 获取所有审查模板
 */
app.get('/api/templates', (req, res) => {
    try {
        const templates = getAllTemplates();
        res.json({ success: true, templates });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/upload
 * 上传并解析合同文件
 */
app.post('/api/upload', upload.single('contract'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: '未上传文件' });
        }

        const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
        const parsed = await parseFile(req.file.path, fileType);

        res.json({
            success: true,
            fileId: req.file.filename,
            fileName: req.file.originalname,
            text: parsed.text,
            clauses: parsed.clauses,
            metadata: parsed.metadata
        });
    } catch (error) {
        // 清理上传的文件
        if (req.file) {
            await cleanupFiles(req.file.path);
        }
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/review
 * 执行合同审查
 */
app.post('/api/review', async (req, res) => {
    try {
        const { fileId, contractText, templateId, modelKey } = req.body;

        if (!contractText || !templateId || !modelKey) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数: contractText, templateId, modelKey'
            });
        }

        // 执行审查
        const reviewResult = await reviewContract(
            contractText,
            templateId,
            modelKey,
            process.env
        );

        // 生成输出文件
        const timestamp = Date.now();
        const revisedContractPath = path.join('outputs', `revised_contract_${timestamp}.docx`);
        const reviewReportDocxPath = path.join('outputs', `review_report_${timestamp}.docx`);
        const reviewReportPdfPath = path.join('outputs', `review_report_${timestamp}.pdf`);

        await Promise.all([
            generateRevisedContractDocx(reviewResult.revisedContract, reviewResult.originalContract, revisedContractPath),
            generateReviewReportDocx(reviewResult, reviewReportDocxPath),
            generateReviewReportPdf(reviewResult, reviewReportPdfPath)
        ]);

        // 生成HTML用于前端预览
        const previewHtml = generateReviewReportHtml(reviewResult);

        // 清理上传的原始文件
        if (fileId) {
            const uploadedFilePath = path.join('uploads', fileId);
            await cleanupFiles(uploadedFilePath);
        }

        res.json({
            success: true,
            result: {
                ...reviewResult,
                files: {
                    revisedContract: revisedContractPath,
                    reviewReportDocx: reviewReportDocxPath,
                    reviewReportPdf: reviewReportPdfPath
                },
                previewHtml
            }
        });
    } catch (error) {
        console.error('审查失败:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/download/:filename
 * 下载生成的文件
 */
app.get('/api/download/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join('outputs', filename);

        // 检查文件是否存在
        await fs.access(filePath);

        res.download(filePath, filename, async (err) => {
            if (err) {
                console.error('下载失败:', err);
                res.status(500).json({ success: false, error: '文件下载失败' });
            }

            // 下载后延迟清理文件（30秒后）
            setTimeout(async () => {
                await cleanupFiles(filePath);
            }, 30000);
        });
    } catch (error) {
        res.status(404).json({ success: false, error: '文件不存在' });
    }
});

/**
 * GET /health
 * 健康检查
 */
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ========================================
// 启动服务器
// ========================================

async function startServer() {
    try {
        await ensureDirectories();

        app.listen(PORT, () => {
            console.log(`\n✅ 合同审查服务已启动`);
            console.log(`📡 服务地址: http://localhost:${PORT}`);
            console.log(`🏥 健康检查: http://localhost:${PORT}/health\n`);
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

startServer();
