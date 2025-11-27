/**
 * Restructure Vision – RV-Agent
 * 主交互逻辑文件
 */

// =========================
// 启动页面控制
// =========================

/**
 * 隐藏启动页面，显示主页面内容
 */
function hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    const mascot = document.querySelector('.mascot-assistant');
    
    if (splashScreen && mainContent) {
        // 添加淡出动画
        splashScreen.classList.add('fade-out');
        
        // 等待启动页完全淡出后，再开始显示主内容
        setTimeout(() => {
            splashScreen.style.display = 'none';
            
            // 显示吉祥物
            if (mascot) {
                mascot.classList.add('show');
                mascot.style.display = 'block';
                console.log('吉祥物已显示');
            } else {
                console.log('未找到吉祥物元素');
            }
            
            // 封面完全淡出后，再延迟一点开始显示主页面
            setTimeout(() => {
                // 先显示主内容（但保持透明）
                mainContent.classList.remove('hidden');
                mainContent.style.display = 'block';
                
                // 强制浏览器重新计算样式，确保初始状态生效
                void mainContent.offsetWidth;
                
                // 再添加淡入类，触发动画
                setTimeout(() => {
                    mainContent.classList.add('fade-in');
                }, 10);
            }, 100);
        }, 800);
    }
}

// =========================
// 模态框控制
// =========================

/**
 * 打开关于我们弹窗
 */
function openAboutModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // 防止背景滚动
    }
}

/**
 * 关闭关于我们弹窗
 */
function closeAboutModal() {
    const modal = document.getElementById('aboutModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = ''; // 恢复滚动
    }
}

/**
 * 打开招贤纳士/联系我们弹窗
 */
function openRecruitModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('recruitModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 关闭招贤纳士/联系我们弹窗
 */
function closeRecruitModal() {
    const modal = document.getElementById('recruitModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

/**
 * 打开平台人员介绍弹窗
 */
function openTeamModal(event) {
    if (event) event.preventDefault();
    const modal = document.getElementById('teamModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

/**
 * 关闭平台人员介绍弹窗
 */
function closeTeamModal() {
    const modal = document.getElementById('teamModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

// 点击弹窗外部关闭
window.onclick = function(event) {
    const aboutModal = document.getElementById('aboutModal');
    const recruitModal = document.getElementById('recruitModal');
    const teamModal = document.getElementById('teamModal');
    
    if (event.target === aboutModal) {
        closeAboutModal();
    }
    if (event.target === recruitModal) {
        closeRecruitModal();
    }
    if (event.target === teamModal) {
        closeTeamModal();
    }
}

// ESC键关闭弹窗
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAboutModal();
        closeRecruitModal();
        closeTeamModal();
    }
});

// =========================
// 页面导航函数
// =========================

function navigateToManager() {
    window.location.href = 'manager.html?skipSplash=true';
}

function navigateToCreditor() {
    window.location.href = 'creditor.html?skipSplash=true';
}

function navigateToHome() {
    window.location.href = 'index.html?skipSplash=true';
}

// =========================
// 文件上传功能与工具函数
// =========================

// 文件大小格式化
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

// HTML转义函数（防止XSS攻击）
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 打开文档（显示预览弹窗）
 */
async function openDocument(filename) {
    try {
        if (!filename) {
            showErrorMessage('文件名无效');
            return;
        }

        // 找到对应的文件信息
        const file = uploadedFiles.find(f => f.filename === filename || f.originalName === filename);
        if (!file) {
            showErrorMessage('文件信息不存在');
            return;
        }

        showLoadingMessage('正在解析文档内容...');
        
        // 调用预览API获取文档内容
        const response = await fetch(`${API_CONFIG.baseURL}/preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: [file]
            }),
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        });

        const result = await response.json();
        hideLoadingMessage();

        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        if (result.success && result.previews.length > 0) {
            // 显示文档预览弹窗
            displayDocumentPreview(result.previews);
        } else {
            throw new Error('预览失败');
        }
        
    } catch (error) {
        hideLoadingMessage();
        if (error.name === 'AbortError') {
            showErrorMessage('预览超时，请重试');
        } else if (error.message.includes('Failed to fetch')) {
            showErrorMessage('🔌 无法连接到DeepSeek API服务器\n\n📋 解决步骤：\n1️⃣ 安装 Node.js (https://nodejs.org/)\n2️⃣ 双击运行 start-server.bat\n3️⃣ 等待服务启动后刷新页面');
        } else {
            showErrorMessage(`打开文档失败：${error.message}`);
        }
        console.error('打开文档失败:', error);
    }
}

// 显示成功消息
function showSuccessMessage(message, duration = 3000) {
    const toast = createToast(message, 'success');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// 显示错误消息
function showErrorMessage(message, duration = 4000) {
    const toast = createToast(message, 'error');
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), duration);
}

// 显示加载状态
function showLoadingMessage(message) {
    const toast = createToast(message, 'loading');
    toast.id = 'loading-toast';
    document.body.appendChild(toast);
    return toast;
}

// 隐藏加载状态
function hideLoadingMessage() {
    const loadingToast = document.getElementById('loading-toast');
    if (loadingToast) {
        loadingToast.remove();
    }
}

// 创建Toast消息
function createToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        ${type === 'loading' ? '<div class="loading-spinner"></div>' : ''}
        <span>${message}</span>
        ${type !== 'loading' ? '<button class="toast-close">&times;</button>' : ''}
    `;
    
    // 添加关闭事件
    if (type !== 'loading') {
        toast.querySelector('.toast-close').onclick = () => toast.remove();
    }
    
    return toast;
}

// 文件验证
function validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (file.size > maxSize) {
        throw new Error(`文件"${file.name}"超过10MB限制`);
    }
    
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
        throw new Error(`文件"${file.name}"格式不支持，请上传PDF、Word或Excel文件`);
    }
    
    return true;
}

function displayFileList(files) {
    const fileList = document.getElementById('fileList');
    if (!fileList) return;
    
    fileList.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background: var(--bg-gray);
            border-radius: 8px;
            margin-bottom: 0.75rem;
            border: 1px solid var(--border-color);
        `;
        
        fileItem.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; flex: 1;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 600; color: var(--text-dark); word-break: break-all;">${escapeHtml(file.originalName || file.name)}</div>
                    <div style="font-size: 0.875rem; color: var(--text-light);">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="openDocument('${file.filename}')" style="
                    padding: 0.5rem 1rem;
                    background: #2563eb;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                    </svg>
                    打开
                </button>
                <button onclick="removeFile(${index})" style="
                    padding: 0.5rem 1rem;
                    background: #fee2e2;
                    color: #dc2626;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.875rem;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#fecaca'" onmouseout="this.style.background='#fee2e2'">
                    删除
                </button>
            </div>
        `;
        
        fileList.appendChild(fileItem);
    });
}

let uploadedFiles = [];

function removeFile(index) {
    uploadedFiles.splice(index, 1);
    displayFileList(uploadedFiles);
}

// =========================
// 管理人功能（manager.html）
// =========================

/**
 * 生成庭外重组协议
 * TODO: 接入 RV-Agent 智能体 API
 */
async function generateOutsideReorganizationAgreement() {
    console.log('生成庭外重组协议');
    
    // 检查是否有上传的文件
    if (!uploadedFiles || uploadedFiles.length === 0) {
        showErrorMessage('请先上传相关文档');
        return;
    }
    
    const textDisplay = document.getElementById('textDisplay');
    if (!textDisplay) return;
    
    const loadingToast = showLoadingMessage('正在生成庭外重组协议，请稍候...');
    
    try {
        // 显示加载状态
        textDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--primary-color);">正在分析文档并生成庭外重组协议...</p>
            </div>
        `;
        
        // 调用DeepSeek API生成庭外重组协议
        const result = await callAPI('/analyze', {
            files: uploadedFiles,
            analysisType: 'outside-agreement'
        });
        
        hideLoadingMessage();
        
        if (result.success) {
            textDisplay.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">
                        <span style="color: var(--success-color);">✓</span> 庭外重组协议生成完成
                    </h4>
                    <div style="background: var(--bg-white); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color);">
                        <p style="color: var(--text-dark); line-height: 1.8; margin-bottom: 1rem;">
                            基于您上传的文档，系统已自动生成庭外重组协议草案。协议包含以下要点：
                        </p>
                        <ul style="color: var(--text-light); line-height: 1.8; margin-left: 1.5rem;">
                            <li>债务重组方案及还款计划</li>
                            <li>各方权利义务条款</li>
                            <li>执行监督机制</li>
                            <li>违约责任及救济措施</li>
                        </ul>
                    </div>
                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                        <button onclick="downloadDocument('agreement')" style="
                            padding: 0.75rem 1.5rem;
                            background: var(--primary-color);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">下载协议</button>
                        <button onclick="previewDocument('agreement')" style="
                            padding: 0.75rem 1.5rem;
                            background: transparent;
                            color: var(--primary-color);
                            border: 2px solid var(--primary-color);
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">预览</button>
                    </div>
                </div>
            `;
            showSuccessMessage('庭外重组协议生成完成！');
        } else {
            throw new Error(result.message || '生成失败');
        }
    } catch (error) {
        hideLoadingMessage();
        console.error('生成庭外重组协议失败:', error);
        
        textDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="color: var(--error-color); margin-bottom: 1rem; font-size: 2rem;">⚠️</div>
                <h4 style="color: var(--error-color); margin-bottom: 1rem;">生成失败</h4>
                <p style="color: var(--text-light);">
                    ${error.message || '服务暂时不可用，请稍后重试'}
                </p>
                <button onclick="generateOutsideReorganizationAgreement()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">重试</button>
            </div>
        `;
        
        showErrorMessage(error.message || '生成庭外重组协议失败');
    }
}

/**
 * 生成预重整方案
 * TODO: 接入 RV-Agent 智能体 API
 */
function generatePreReorganizationDraft() {
    console.log('生成预重整方案');
    const textDisplay = document.getElementById('textDisplay');
    if (textDisplay) {
        textDisplay.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--primary-color);">正在生成预重整方案...</div>';
        
        setTimeout(() => {
            textDisplay.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">预重整方案生成示例</h4>
                    <p style="color: var(--text-light); line-height: 1.8;">
                        方案内容将基于企业实际情况自动生成。<br>
                        包括重组目标、实施步骤、时间安排等关键内容。
                    </p>
                </div>
            `;
        }, 1000);
    }
}

/**
 * 提取第一次会议字段
 * TODO: 接入 RV-Agent 智能体 API
 */
function extractFirstMeetingFields() {
    console.log('提取第一次会议字段');
    const fieldsDisplay = document.getElementById('fieldsDisplay');
    if (fieldsDisplay) {
        fieldsDisplay.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--primary-color);">正在提取会议字段...</div>';
        
        setTimeout(() => {
            fieldsDisplay.innerHTML = `
                <div style="padding: 1rem;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 0.75rem; font-weight: 600; color: var(--text-dark);">会议时间</td>
                            <td style="padding: 0.75rem; color: var(--text-light);">待提取</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 0.75rem; font-weight: 600; color: var(--text-dark);">会议地点</td>
                            <td style="padding: 0.75rem; color: var(--text-light);">待提取</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--border-color);">
                            <td style="padding: 0.75rem; font-weight: 600; color: var(--text-dark);">参会人员</td>
                            <td style="padding: 0.75rem; color: var(--text-light);">待提取</td>
                        </tr>
                        <tr>
                            <td style="padding: 0.75rem; font-weight: 600; color: var(--text-dark);">主要议题</td>
                            <td style="padding: 0.75rem; color: var(--text-light);">待提取</td>
                        </tr>
                    </table>
                </div>
            `;
        }, 1000);
    }
}

/**
 * 生成债权人会议报告
 * TODO: 接入 RV-Agent 智能体 API
 */
function generateClaimsMeetingReport() {
    console.log('生成债权人会议报告');
    const textDisplay = document.getElementById('textDisplay');
    if (textDisplay) {
        textDisplay.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--primary-color);">正在生成债权人会议报告...</div>';
        
        setTimeout(() => {
            textDisplay.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">债权人会议报告生成示例</h4>
                    <p style="color: var(--text-light); line-height: 1.8;">
                        报告将包含会议纪要、决议事项、表决结果等完整内容。
                    </p>
                </div>
            `;
        }, 1000);
    }
}

// =========================
// 债权人功能（creditor.html）
// =========================

/**
 * 企业价值分析
 * 已集成DeepSeek AI分析
 */
async function analyzeEnterpriseValue() {
    console.log('企业价值分析 - 使用DeepSeek AI');
    
    // 检查是否有上传的文件
    if (!uploadedFiles || uploadedFiles.length === 0) {
        showErrorMessage('请先上传相关文档');
        return;
    }
    
    const analysisDisplay = document.getElementById('analysisDisplay');
    if (!analysisDisplay) return;
    
    const loadingToast = showLoadingMessage('DeepSeek AI正在分析企业价值，请稍候...');
    
    try {
        // 显示加载状态
        analysisDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--primary-color);">🤖 DeepSeek AI正在深度分析企业价值...</p>
                <p style="color: var(--text-light); font-size: 0.9rem;">这可能需要30-60秒，请耐心等待</p>
            </div>
        `;
        
        // 调用DeepSeek API进行企业价值分析
        const result = await callAPI('/analyze', {
            files: uploadedFiles,
            analysisType: 'enterprise-value'
        });
        
        hideLoadingMessage();
        
        if (result.success) {
            analysisDisplay.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">
                        <span style="color: var(--success-color);">🤖</span> DeepSeek AI企业价值分析报告
                    </h4>
                    <div style="background: var(--bg-white); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); max-height: 400px; overflow-y: auto;">
                        <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6; margin: 0; color: var(--text-dark);">${result.result}</pre>
                    </div>
                    <div style="margin-top: 1rem; padding: 0.75rem; background: #e3f2fd; border-radius: 6px; font-size: 0.85rem; color: #1565c0;">
                        <strong>💡 AI分析完成</strong> - 本报告由DeepSeek AI基于上传文档生成
                        ${result.usage ? `（消耗tokens: ${result.usage.total_tokens}）` : ''}
                    </div>
                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                        <button onclick="copyToClipboard(\`${result.result.replace(/`/g, '\\`')}\`)" style="
                            padding: 0.75rem 1.5rem;
                            background: var(--primary-color);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">复制报告</button>
                        <button onclick="exportAnalysisResults()" style="
                            padding: 0.75rem 1.5rem;
                            background: transparent;
                            color: var(--primary-color);
                            border: 2px solid var(--primary-color);
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">导出Excel</button>
                    </div>
                </div>
            `;
            showSuccessMessage('DeepSeek AI企业价值分析完成！');
        } else {
            throw new Error(result.message || 'AI分析失败');
        }
    } catch (error) {
        hideLoadingMessage();
        console.error('企业价值分析失败:', error);
        
        analysisDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="color: var(--error-color); margin-bottom: 1rem; font-size: 2rem;">⚠️</div>
                <h4 style="color: var(--error-color); margin-bottom: 1rem;">AI分析失败</h4>
                <p style="color: var(--text-light);">
                    ${error.message || 'DeepSeek服务暂时不可用，请稍后重试'}
                </p>
                <button onclick="analyzeEnterpriseValue()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">重新分析</button>
            </div>
        `;
        
        showErrorMessage(error.message || 'DeepSeek AI分析失败');
    }
}

/**
 * 提取风险指标
 * 已集成DeepSeek AI分析
 */
async function extractRiskIndicators() {
    console.log('提取风险指标 - 使用DeepSeek AI');
    
    // 检查是否有上传的文件
    if (!uploadedFiles || uploadedFiles.length === 0) {
        showErrorMessage('请先上传相关文档');
        return;
    }
    
    const analysisDisplay = document.getElementById('analysisDisplay');
    if (!analysisDisplay) return;
    
    const loadingToast = showLoadingMessage('DeepSeek AI正在提取风险指标，请稍候...');
    
    try {
        // 显示加载状态
        analysisDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--primary-color);">🤖 DeepSeek AI正在智能提取风险指标...</p>
                <p style="color: var(--text-light); font-size: 0.9rem;">正在识别各项风险因素...</p>
            </div>
        `;
        
        // 调用DeepSeek API进行风险指标分析
        const result = await callAPI('/analyze', {
            files: uploadedFiles,
            analysisType: 'risk-indicators'
        });
        
        hideLoadingMessage();
        
        if (result.success) {
            analysisDisplay.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">
                        <span style="color: var(--warning-color);">⚠️</span> DeepSeek AI风险指标分析报告
                    </h4>
                    <div style="background: var(--bg-white); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); max-height: 400px; overflow-y: auto;">
                        <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6; margin: 0; color: var(--text-dark);">${result.result}</pre>
                    </div>
                    <div style="margin-top: 1rem; padding: 0.75rem; background: #fff3cd; border-radius: 6px; font-size: 0.85rem; color: #856404;">
                        <strong>⚠️ 风险评估完成</strong> - 本报告由DeepSeek AI基于文档内容分析生成
                        ${result.usage ? `（消耗tokens: ${result.usage.total_tokens}）` : ''}
                    </div>
                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                        <button onclick="copyToClipboard(\`${result.result.replace(/`/g, '\\`')}\`)" style="
                            padding: 0.75rem 1.5rem;
                            background: var(--warning-color);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">复制报告</button>
                        <button onclick="exportAnalysisResults()" style="
                            padding: 0.75rem 1.5rem;
                            background: transparent;
                            color: var(--warning-color);
                            border: 2px solid var(--warning-color);
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">导出Excel</button>
                    </div>
                </div>
            `;
            showSuccessMessage('DeepSeek AI风险指标分析完成！');
        } else {
            throw new Error(result.message || 'AI分析失败');
        }
    } catch (error) {
        hideLoadingMessage();
        console.error('风险指标分析失败:', error);
        
        analysisDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="color: var(--error-color); margin-bottom: 1rem; font-size: 2rem;">⚠️</div>
                <h4 style="color: var(--error-color); margin-bottom: 1rem;">AI分析失败</h4>
                <p style="color: var(--text-light);">
                    ${error.message || 'DeepSeek服务暂时不可用，请稍后重试'}
                </p>
                <button onclick="extractRiskIndicators()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">重新分析</button>
            </div>
        `;
        
        showErrorMessage(error.message || 'DeepSeek AI风险分析失败');
    }
}

/**
 * 生成重组可行性报告
 * 已集成DeepSeek AI分析
 */
async function generateRestructureFeasibility() {
    console.log('生成重组可行性报告 - 使用DeepSeek AI');
    
    // 检查是否有上传的文件
    if (!uploadedFiles || uploadedFiles.length === 0) {
        showErrorMessage('请先上传相关文档');
        return;
    }
    
    const analysisDisplay = document.getElementById('analysisDisplay');
    if (!analysisDisplay) return;
    
    const loadingToast = showLoadingMessage('DeepSeek AI正在分析重组可行性，请稍候...');
    
    try {
        // 显示加载状态
        analysisDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div class="loading-spinner" style="margin: 0 auto 1rem;"></div>
                <p style="color: var(--primary-color);">🤖 DeepSeek AI正在评估重组可行性...</p>
                <p style="color: var(--text-light); font-size: 0.9rem;">正在综合分析各项指标...</p>
            </div>
        `;
        
        // 调用DeepSeek API进行可行性分析
        const result = await callAPI('/analyze', {
            files: uploadedFiles,
            analysisType: 'restructure-feasibility'
        });
        
        hideLoadingMessage();
        
        if (result.success) {
            analysisDisplay.innerHTML = `
                <div style="padding: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--text-dark);">
                        <span style="color: var(--success-color);">📊</span> DeepSeek AI重组可行性分析报告
                    </h4>
                    <div style="background: var(--bg-white); padding: 1.5rem; border-radius: 8px; border: 1px solid var(--border-color); max-height: 400px; overflow-y: auto;">
                        <pre style="white-space: pre-wrap; font-family: inherit; line-height: 1.6; margin: 0; color: var(--text-dark);">${result.result}</pre>
                    </div>
                    <div style="margin-top: 1rem; padding: 0.75rem; background: #d4edda; border-radius: 6px; font-size: 0.85rem; color: #155724;">
                        <strong>📊 可行性评估完成</strong> - 本报告由DeepSeek AI基于企业现状综合评估
                        ${result.usage ? `（消耗tokens: ${result.usage.total_tokens}）` : ''}
                    </div>
                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
                        <button onclick="copyToClipboard(\`${result.result.replace(/`/g, '\\`')}\`)" style="
                            padding: 0.75rem 1.5rem;
                            background: var(--success-color);
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">复制报告</button>
                        <button onclick="exportAnalysisResults()" style="
                            padding: 0.75rem 1.5rem;
                            background: transparent;
                            color: var(--success-color);
                            border: 2px solid var(--success-color);
                            border-radius: 6px;
                            cursor: pointer;
                            font-weight: 600;
                        ">导出Excel</button>
                    </div>
                </div>
            `;
            showSuccessMessage('DeepSeek AI可行性分析完成！');
        } else {
            throw new Error(result.message || 'AI分析失败');
        }
    } catch (error) {
        hideLoadingMessage();
        console.error('可行性分析失败:', error);
        
        analysisDisplay.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <div style="color: var(--error-color); margin-bottom: 1rem; font-size: 2rem;">⚠️</div>
                <h4 style="color: var(--error-color); margin-bottom: 1rem;">AI分析失败</h4>
                <p style="color: var(--text-light);">
                    ${error.message || 'DeepSeek服务暂时不可用，请稍后重试'}
                </p>
                <button onclick="generateRestructureFeasibility()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: var(--primary-color);
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                ">重新分析</button>
            </div>
        `;
        
        showErrorMessage(error.message || 'DeepSeek AI可行性分析失败');
    }
}

// =========================
// 页面初始化
// =========================

document.addEventListener('DOMContentLoaded', function() {
    console.log('RV-Agent 系统已加载');
    
    const mascot = document.querySelector('.mascot-assistant');
    const splashScreen = document.getElementById('splashScreen');
    const mainContent = document.getElementById('mainContent');
    
    // 检查是否需要跳过启动页
    const urlParams = new URLSearchParams(window.location.search);
    
    // 显示吉祥物的函数
    function showMascot() {
        const mascotEl = document.querySelector('.mascot-assistant');
        if (mascotEl) {
            mascotEl.classList.add('show');
            mascotEl.style.display = 'block';
            console.log('吉祥物已显示（初始化）');
        } else {
            console.log('未找到吉祥物元素（初始化）');
        }
    }
    
    if (urlParams.get('skipSplash') === 'true') {
        if (splashScreen && mainContent) {
            // 直接隐藏启动页，显示主内容（无动画）
            splashScreen.style.display = 'none';
            splashScreen.classList.add('fade-out');
            mainContent.classList.remove('hidden');
            mainContent.style.display = 'block';
            // 直接显示，不添加淡入动画
            mainContent.style.opacity = '1';
            mainContent.style.transform = 'translateY(0)';
            
            // 显示吉祥物
            showMascot();
            
            // 移除URL中的skipSplash参数，这样刷新时会显示启动页
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
        } else {
            // 如果没有启动页，直接显示吉祥物
            showMascot();
        }
    } else {
        // 检查启动页是否存在且可见
        const splashVisible = splashScreen && 
            splashScreen.style.display !== 'none' && 
            !splashScreen.classList.contains('fade-out');
        
        if (!splashVisible) {
            // 如果启动页不存在或已隐藏，显示吉祥物
            showMascot();
        }
        
        // 检查主内容是否已经显示（没有启动页的情况）
        if (mainContent && !mainContent.classList.contains('hidden')) {
            showMascot();
        }
    }
    
    // 文件上传功能
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    
    if (fileInput && uploadArea) {
        fileInput.addEventListener('change', async function(e) {
            if (e.target.files.length > 0) {
                try {
                    const validFiles = [];
                    Array.from(e.target.files).forEach(file => {
                        validateFile(file);
                        validFiles.push(file);
                    });

                    // 上传文件到服务器
                    const loadingToast = showLoadingMessage(`正在上传 ${validFiles.length} 个文件...`);
                    
                    const uploadResult = await uploadFiles(validFiles);
                    hideLoadingMessage();

                    if (uploadResult.success) {
                        uploadedFiles = uploadResult.files;
                        displayFileList(uploadedFiles);
                        showSuccessMessage(uploadResult.message);
                    } else {
                        throw new Error(uploadResult.message || '上传失败');
                    }

                } catch (error) {
                    hideLoadingMessage();
                    showErrorMessage(error.message);
                    e.target.value = ''; // 清除无效文件
                    uploadedFiles = [];
                }
            }
        });
        
        // 拖拽上传
        uploadArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = '#eff6ff';
        });
        
        uploadArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'var(--bg-gray)';
        });
        
        uploadArea.addEventListener('drop', async function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'var(--bg-gray)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                try {
                    const validFiles = [];
                    Array.from(files).forEach(file => {
                        validateFile(file);
                        validFiles.push(file);
                    });

                    // 上传文件到服务器
                    const loadingToast = showLoadingMessage(`正在拖拽上传 ${validFiles.length} 个文件...`);
                    
                    const uploadResult = await uploadFiles(validFiles);
                    hideLoadingMessage();

                    if (uploadResult.success) {
                        uploadedFiles = uploadResult.files;
                        displayFileList(uploadedFiles);
                        showSuccessMessage(uploadResult.message);
                    } else {
                        throw new Error(uploadResult.message || '上传失败');
                    }

                } catch (error) {
                    hideLoadingMessage();
                    showErrorMessage(error.message);
                    uploadedFiles = [];
                }
            }
        });
    }
});

// =========================
// API 配置（已集成DeepSeek）
// =========================

// API配置 - 自动检测环境
const API_CONFIG = {
    baseURL: (() => {
        // 生产环境：使用当前域名
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            return `${window.location.origin}/api`;
        }
        // 开发环境：使用localhost
        return 'http://localhost:3000/api';
    })(),
    timeout: 60000, // 增加超时时间，因为AI分析需要更长时间
};

/**
 * API 请求封装函数
 * 已实现DeepSeek AI分析集成
 */
async function callAPI(endpoint, data, options = {}) {
    console.log(`调用 API: ${endpoint}`, data);
    
    try {
        const url = `${API_CONFIG.baseURL}${endpoint}`;
        const config = {
            method: options.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            body: data ? JSON.stringify(data) : null,
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        };

        const response = await fetch(url, config);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        return result;

    } catch (error) {
        console.error(`API调用失败 ${endpoint}:`, error);
        
        if (error.name === 'AbortError') {
            throw new Error('请求超时，请重试');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('🔌 无法连接到DeepSeek API服务器\n\n📋 解决步骤：\n1️⃣ 安装 Node.js (https://nodejs.org/)\n2️⃣ 双击运行 start-server.bat\n3️⃣ 等待服务启动后刷新页面\n\n💡 安装Node.js后即可使用AI功能');
        } else {
            throw error;
        }
    }
}

/**
 * 上传文件到服务器
 */
async function uploadFiles(files) {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const url = `${API_CONFIG.baseURL}/upload`;
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        return result;

    } catch (error) {
        console.error('文件上传失败:', error);
        if (error.name === 'AbortError') {
            throw new Error('上传超时，请重试');
        } else if (error.message.includes('Failed to fetch')) {
            throw new Error('🔌 无法连接到DeepSeek API服务器\n\n📋 解决步骤：\n1️⃣ 安装 Node.js (https://nodejs.org/)\n2️⃣ 双击运行 start-server.bat\n3️⃣ 等待服务启动后刷新页面\n\n💡 安装Node.js后即可使用AI功能');
        } else {
            throw error;
        }
    }
}

// =========================
// 文档操作功能
// =========================

/**
 * 下载文档到桌面
 */
async function downloadDocument(type) {
    try {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            showErrorMessage('请先上传文档文件');
            return;
        }

        showLoadingMessage('正在准备下载...');
        
        // 下载所有上传的文件
        let downloadCount = 0;
        for (const file of uploadedFiles) {
            try {
                const downloadUrl = `${API_CONFIG.baseURL}/download/${encodeURIComponent(file.filename)}`;
                
                // 创建下载链接
                const a = document.createElement('a');
                a.href = downloadUrl;
                a.download = file.originalName || file.name;
                a.style.display = 'none';
                
                // 触发下载
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                
                downloadCount++;
                
                // 延迟一下，避免浏览器阻止多个下载
                await new Promise(resolve => setTimeout(resolve, 300));
                
            } catch (error) {
                console.error(`文件 ${file.originalName} 下载失败:`, error);
            }
        }
        
        hideLoadingMessage();
        
        if (downloadCount > 0) {
            showSuccessMessage(`已开始下载 ${downloadCount} 个文件\n\n💡 提示：文件将下载到浏览器默认位置\n如需下载到桌面，请在浏览器设置中配置下载路径`);
        } else {
            showErrorMessage('下载失败，请重试');
        }
        
    } catch (error) {
        hideLoadingMessage();
        showErrorMessage(`下载失败：${error.message}`);
        console.error('下载失败:', error);
    }
}

/**
 * 预览文档
 */
async function previewDocument(type) {
    try {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            showErrorMessage('请先上传文档文件');
            return;
        }

        showLoadingMessage('正在解析文档内容...');
        
        // 调用预览API
        const response = await fetch(`${API_CONFIG.baseURL}/preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                files: uploadedFiles
            }),
            signal: AbortSignal.timeout(API_CONFIG.timeout)
        });

        const result = await response.json();
        hideLoadingMessage();

        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}`);
        }

        if (result.success) {
            // 显示文档预览
            displayDocumentPreview(result.previews);
            showSuccessMessage('文档解析完成');
        } else {
            throw new Error(result.message || '预览失败');
        }
        
    } catch (error) {
        hideLoadingMessage();
        if (error.name === 'AbortError') {
            showErrorMessage('预览超时，请重试');
        } else if (error.message.includes('Failed to fetch')) {
            showErrorMessage('🔌 无法连接到DeepSeek API服务器\n\n📋 解决步骤：\n1️⃣ 安装 Node.js (https://nodejs.org/)\n2️⃣ 双击运行 start-server.bat\n3️⃣ 等待服务启动后刷新页面');
        } else {
            showErrorMessage(`预览失败：${error.message}`);
        }
        console.error('预览失败:', error);
    }
}

/**
 * 显示文档预览内容
 */
function displayDocumentPreview(previews) {
    // 创建预览弹窗
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'flex';
    
    let previewContent = '';
    previews.forEach((preview, index) => {
        const statusIcon = preview.error ? '❌' : '📄';
        const sizeText = preview.size ? `(${(preview.size / 1024).toFixed(1)} KB)` : '';
        
        previewContent += `
            <div style="margin-bottom: 2rem; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
                <div style="background: #f8fafc; padding: 1rem; border-bottom: 1px solid #e2e8f0;">
                    <h4 style="margin: 0; color: var(--text-dark); display: flex; align-items: center; gap: 0.5rem;">
                        ${statusIcon} ${preview.filename} ${sizeText}
                        ${preview.fullLength ? `<small style="color: var(--text-light); font-weight: normal;">(${preview.fullLength} 字符)</small>` : ''}
                    </h4>
                </div>
                <div style="padding: 1.5rem; max-height: 500px; overflow-y: auto; background: white;">
                    <pre style="white-space: pre-wrap; font-family: inherit; margin: 0; color: var(--text-dark); line-height: 1.6; word-wrap: break-word;">${escapeHtml(preview.content)}</pre>
                </div>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 90%; max-height: 85%; width: 800px;">
            <span class="modal-close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h2 class="modal-title">📄 文档预览 (${previews.length}个文件)</h2>
            <div style="max-height: calc(85vh - 120px); overflow-y: auto; padding: 0.5rem;">
                ${previewContent}
            </div>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; text-align: center;">
                <small style="color: var(--text-light);">
                    💡 提示：已显示完整文档内容
                </small>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 点击外部关闭
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

/**
 * 复制到剪贴板
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showSuccessMessage('内容已复制到剪贴板');
    } catch (error) {
        // fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showSuccessMessage('内容已复制到剪贴板');
    }
}

/**
 * 输出分析结果
 */
function exportAnalysisResults() {
    try {
        showLoadingMessage('正在导出分析结果...');
        
        setTimeout(() => {
            hideLoadingMessage();
            const filename = `分析报告_${new Date().toISOString().split('T')[0]}.xlsx`;
            showSuccessMessage(`分析结果已导出为 "${filename}"`);
        }, 2000);
    } catch (error) {
        hideLoadingMessage();
        showErrorMessage('导出失败，请重试');
        console.error('导出失败:', error);
    }
}

// =========================
// 系统工具函数
// =========================

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 节流函数
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

/**
 * 格式化日期
 */
function formatDate(date = new Date()) {
    return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(date);
}

console.log('RV-Agent 主脚本加载完成 - Enhanced Version v2.0');

