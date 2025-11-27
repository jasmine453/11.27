/**
 * RV-Agent Backend API Server
 * 集成DeepSeek API用于文档处理
 */

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// DeepSeek API 集成
const { OpenAI } = require('openai');

// 文档解析库
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

const app = express();
const PORT = process.env.PORT || 3000;

// 配置CORS和中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// 配置DeepSeek客户端
const deepseekClient = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY || 'sk-11a15d0858604a3ba89f77dcbf83e7e1',
    baseURL: 'https://api.deepseek.com'
});

// 配置文件上传
const upload = multer({
    dest: 'uploads/',
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB限制
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (allowedTypes.includes(file.mimetype) || 
            file.originalname.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件格式'), false);
        }
    }
});

// 创建uploads目录
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// 存储已上传的文件信息（用于下载）
const fileStorage = new Map();

/**
 * 使用DeepSeek分析文档内容
 */
async function analyzeDocumentWithDeepSeek(documentText, analysisType) {
    try {
        let systemPrompt = '';
        let userPrompt = '';

        switch (analysisType) {
            case 'enterprise-value':
                systemPrompt = '你是一位专业的企业价值分析师，擅长从财务文档中提取关键信息并进行企业估值分析。';
                userPrompt = `请分析以下文档内容，提供详细的企业价值分析报告，包括：
1. 企业估值评估
2. 资产状况分析
3. 负债情况分析
4. 盈利能力评估
5. 风险因素识别

文档内容：
${documentText}`;
                break;

            case 'risk-indicators':
                systemPrompt = '你是一位专业的风险分析师，擅长识别企业经营中的各种风险指标。';
                userPrompt = `请分析以下文档内容，识别并评估各项风险指标：
1. 流动性风险
2. 偿债能力风险
3. 经营风险
4. 市场风险
5. 财务风险

请为每项风险提供评级（低/中/高）和具体分析。

文档内容：
${documentText}`;
                break;

            case 'restructure-feasibility':
                systemPrompt = '你是一位专业的企业重组顾问，具有丰富的破产重整和债务重组经验。';
                userPrompt = `请分析以下文档内容，评估企业重组的可行性：
1. 重组可行性评分（0-100分）
2. 成功概率评估
3. 关键风险点识别
4. 具体建议措施
5. 实施时间规划

文档内容：
${documentText}`;
                break;

            case 'outside-agreement':
                systemPrompt = '你是一位专业的法律顾问，擅长起草庭外重组协议。';
                userPrompt = `基于以下文档内容，生成庭外重组协议草案：
1. 协议主体信息
2. 债务重组方案
3. 还款计划安排
4. 各方权利义务
5. 违约责任条款

文档内容：
${documentText}`;
                break;

            case 'pre-restructure-plan':
                systemPrompt = '你是一位专业的重组顾问，擅长制定预重整方案。';
                userPrompt = `基于以下文档内容，制定详细的预重整方案：
1. 重整目标设定
2. 实施步骤规划
3. 时间安排表
4. 资源需求分析
5. 风险控制措施

文档内容：
${documentText}`;
                break;

            default:
                systemPrompt = '你是一位专业的企业分析师，擅长文档分析和信息提取。';
                userPrompt = `请分析以下文档内容，提供专业的分析报告：

文档内容：
${documentText}`;
        }

        const response = await deepseekClient.chat.completions.create({
            model: "deepseek-chat",
            messages: [
                { "role": "system", "content": systemPrompt },
                { "role": "user", "content": userPrompt }
            ],
            stream: false,
            max_tokens: 4000,
            temperature: 0.1
        });

        return {
            success: true,
            analysis: response.choices[0].message.content,
            usage: response.usage
        };

    } catch (error) {
        console.error('DeepSeek API调用失败:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * 真实文档文本提取功能
 */
async function extractTextFromFile(filepath, mimetype, originalname) {
    try {
        console.log(`开始解析文件: ${originalname} (${mimetype})`);
        
        const buffer = fs.readFileSync(filepath);
        let extractedText = '';

        if (mimetype.includes('pdf') || originalname.toLowerCase().endsWith('.pdf')) {
            // 解析PDF文件
            const data = await pdf(buffer);
            extractedText = data.text;
            
        } else if (mimetype.includes('word') || originalname.match(/\.(doc|docx)$/i)) {
            // 解析Word文件
            const result = await mammoth.extractRawText({buffer: buffer});
            extractedText = result.value;
            
        } else if (mimetype.includes('sheet') || mimetype.includes('excel') || originalname.match(/\.(xls|xlsx)$/i)) {
            // 解析Excel文件
            const workbook = XLSX.read(buffer, {type: 'buffer'});
            const sheetNames = workbook.SheetNames;
            let allSheetsText = '';
            
            sheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {header: 1});
                
                allSheetsText += `\n工作表: ${sheetName}\n`;
                jsonData.forEach(row => {
                    if (row.length > 0) {
                        allSheetsText += row.join('\t') + '\n';
                    }
                });
            });
            
            extractedText = allSheetsText;
        } else {
            // 尝试作为文本文件读取
            extractedText = buffer.toString('utf8');
        }

        // 清理和格式化文本
        extractedText = extractedText.replace(/\s+/g, ' ').trim();
        
        console.log(`文档解析成功，提取文本长度: ${extractedText.length} 字符`);
        return extractedText;
        
    } catch (error) {
        console.error('文档解析失败:', error);
        
        // 返回备用文本，说明解析失败
        return `文档解析失败: ${error.message}\n\n文件名: ${originalname}\n文件类型: ${mimetype}\n请确保文件格式正确且未损坏。`;
    }
}

// API路由

/**
 * 文档上传接口
 */
app.post('/api/upload', upload.array('files', 10), (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const uploadedFiles = req.files.map(file => {
            const fileInfo = {
                originalName: Buffer.from(file.originalname, 'latin1').toString('utf8'),
                filename: file.filename,
                size: file.size,
                mimetype: file.mimetype,
                path: file.path
            };
            // 存储文件信息，使用filename作为key
            fileStorage.set(file.filename, fileInfo);
            return fileInfo;
        });

        res.json({
            success: true,
            message: `成功上传 ${uploadedFiles.length} 个文件`,
            files: uploadedFiles
        });

    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败',
            error: error.message
        });
    }
});

/**
 * 文档分析接口
 */
app.post('/api/analyze', async (req, res) => {
    try {
        const { files, analysisType } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请先上传文件'
            });
        }

        // 从文件中提取真实文本
        let combinedText = '';
        for (const file of files) {
            const extractedText = await extractTextFromFile(file.path, file.mimetype, file.originalName);
            combinedText += `\n文件：${file.originalName}\n${extractedText}\n`;
        }

        // 使用DeepSeek分析
        console.log(`开始使用DeepSeek分析文档，分析类型：${analysisType}`);
        const analysisResult = await analyzeDocumentWithDeepSeek(combinedText, analysisType);

        if (analysisResult.success) {
            res.json({
                success: true,
                message: '分析完成',
                result: analysisResult.analysis,
                usage: analysisResult.usage
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'AI分析失败',
                error: analysisResult.error
            });
        }

    } catch (error) {
        console.error('文档分析失败:', error);
        res.status(500).json({
            success: false,
            message: '文档分析失败',
            error: error.message
        });
    }
});

/**
 * 文档预览接口
 */
app.post('/api/preview', async (req, res) => {
    try {
        const { files } = req.body;

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                message: '请先上传文件'
            });
        }

        console.log(`开始预览文档，文件数量：${files.length}`);
        
        // 提取所有文件的内容
        const previews = [];
        for (const file of files) {
            try {
                const extractedText = await extractTextFromFile(file.path, file.mimetype, file.originalName);
                
                // 返回完整内容，不截取
                previews.push({
                    filename: file.originalName,
                    size: file.size,
                    mimetype: file.mimetype,
                    content: extractedText,
                    fullLength: extractedText.length
                });
                
            } catch (error) {
                console.error(`文件 ${file.originalName} 预览失败:`, error);
                previews.push({
                    filename: file.originalName,
                    size: file.size,
                    mimetype: file.mimetype,
                    content: `文档预览失败: ${error.message}`,
                    error: true
                });
            }
        }

        res.json({
            success: true,
            message: `成功预览 ${previews.length} 个文档`,
            previews: previews
        });

    } catch (error) {
        console.error('文档预览失败:', error);
        res.status(500).json({
            success: false,
            message: '文档预览失败',
            error: error.message
        });
    }
});

/**
 * 下载/查看文档接口
 */
app.get('/api/download/:filename', (req, res) => {
    try {
        const { filename } = req.params;
        const file = fileStorage.get(filename);
        
        if (!file) {
            return res.status(404).json({
                success: false,
                message: '文件不存在或已过期'
            });
        }

        const filePath = path.join(__dirname, file.path);
        
        if (!fs.existsSync(filePath)) {
            fileStorage.delete(filename);
            return res.status(404).json({
                success: false,
                message: '文件已删除或不存在'
            });
        }

        // 设置响应头，支持中文文件名
        const encodedFilename = encodeURIComponent(file.originalName);
        res.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodedFilename}`);
        res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
        
        // 发送文件
        res.sendFile(path.resolve(filePath));
        
    } catch (error) {
        console.error('文件下载失败:', error);
        res.status(500).json({
            success: false,
            message: '文件下载失败',
            error: error.message
        });
    }
});

/**
 * 健康检查接口
 */
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'RV-Agent API服务运行正常',
        timestamp: new Date().toISOString()
    });
});

/**
 * 静态文件服务
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 RV-Agent API服务已启动`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`🔗 API地址: http://localhost:${PORT}/api`);
    console.log(`🤖 DeepSeek API已集成`);
});

// 错误处理
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: error.message
    });
});

module.exports = app;
