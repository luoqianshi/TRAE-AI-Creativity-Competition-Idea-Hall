/**
 * 编译器API模块
 * 通过Wandbox API执行C++代码
 */
const CompilerAPI = (function() {
    'use strict';

    // Wandbox API配置
    const WANDBOX_API = 'https://wandbox.org/api/compile.json';
    const COMPILER = 'gcc-head';

    // 状态管理
    let isCompiling = false;
    let compilationListeners = [];

    /**
     * 编译并运行代码
     * @param {string} code - C++源代码
     * @returns {Promise<{success: boolean, output: string, error: string, compileOutput: string}>}
     */
    async function compileAndRun(code) {
        if (isCompiling) {
            return {
                success: false,
                output: '',
                error: '已经在编译中，请稍候...',
                compileOutput: ''
            };
        }

        isCompiling = true;
        notifyListeners({ type: 'start' });

        try {
            const response = await fetch(WANDBOX_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code: code,
                    compiler: COMPILER,
                    options: 'warning,optimization,workspace',
                    'runtime-options': 'runtime_speed',
                    'compiler-option-raw': '-std=c++17 -O2',
                    'execution-policy': 'safememory'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const result = await response.json();
            
            // 记录实验日志
            await logExperiment(code, result);

            const success = !result.status || result.status === 0;
            
            notifyListeners({
                type: 'complete',
                success,
                output: result.program_output || '',
                error: result.program_error || '',
                compileOutput: result.compiler_output || '',
                signal: result.signal
            });

            return {
                success,
                output: result.program_output || '',
                error: result.program_error || '',
                compileOutput: result.compiler_output || '',
                signal: result.signal,
                status: result.status
            };

        } catch (error) {
            const errorMessage = `编译失败: ${error.message}`;
            
            notifyListeners({
                type: 'error',
                error: errorMessage
            });

            return {
                success: false,
                output: '',
                error: errorMessage,
                compileOutput: ''
            };
        } finally {
            isCompiling = false;
        }
    }

    /**
     * 验证代码输出
     * @param {string} actualOutput - 实际输出
     * @param {string} expectedOutput - 期望输出
     * @param {string} solutionRegex - 可选的正则表达式验证
     * @returns {{success: boolean, diff: {expected: string, actual: string}, message: string}}
     */
    function verifyOutput(actualOutput, expectedOutput, solutionRegex = null) {
        // 标准化输出用于比较
        const normalizedActual = normalizeOutput(actualOutput);
        const normalizedExpected = normalizeOutput(expectedOutput);

        // 检查输出是否匹配
        let outputMatch = normalizedActual === normalizedExpected;

        // 如果提供了正则表达式，也检查正则
        let regexMatch = true;
        if (solutionRegex && !outputMatch) {
            try {
                const regex = new RegExp(solutionRegex, 'i');
                regexMatch = regex.test(actualOutput);
            } catch (e) {
                console.warn('无效的正则表达式:', solutionRegex);
            }
        }

        const success = outputMatch || regexMatch;

        return {
            success,
            diff: {
                expected: expectedOutput,
                actual: actualOutput
            },
            message: success ? '答案正确！' : '输出不匹配，请检查你的代码。'
        };
    }

    /**
     * 标准化输出用于比较
     */
    function normalizeOutput(output) {
        if (!output) return '';
        
        return output
            // 移除末尾空白
            .trim()
            // 将所有空白字符（空格、换行、制表符）替换为单个空格
            .replace(/\s+/g, ' ')
            // 移除行首行尾空格
            .replace(/^\s+|\s+$/g, '')
            // 移除多个连续空格
            .replace(/\s{2,}/g, ' ')
            // 转为小写（可选，取消注释以实现不区分大小写）
            // .toLowerCase()
            ;
    }

    /**
     * 记录实验日志到IndexedDB
     */
    async function logExperiment(code, result) {
        try {
            const lessonId = App?.getCurrentLessonId?.() || 'sandbox';
            
            await DataStore.addExperimentLog(
                lessonId,
                code,
                result.program_output || '',
                result.status === 0 ? 'success' : 'error'
            );
        } catch (e) {
            console.warn('记录实验日志失败:', e);
        }
    }

    /**
     * 编译一个代码片段（不验证结果）
     */
    async function runCode(code, outputElement) {
        const result = await compileAndRun(code);
        
        if (outputElement) {
            if (result.success) {
                outputElement.textContent = result.output || '(无输出)';
                outputElement.classList.remove('error');
            } else {
                outputElement.textContent = result.error || result.compileOutput || '编译失败';
                outputElement.classList.add('error');
            }
        }
        
        return result;
    }

    /**
     * 验证并运行代码
     */
    async function verifyAndRun(code, expectedOutput, solutionRegex = null, outputElement = null) {
        const result = await compileAndRun(code);
        
        if (!result.success) {
            return {
                success: false,
                message: '代码编译失败',
                error: result.error || result.compileOutput,
                output: ''
            };
        }

        const verification = verifyOutput(result.output, expectedOutput, solutionRegex);

        if (outputElement) {
            if (verification.success) {
                outputElement.innerHTML = `
                    <div class="verification-result success show">
                        <div class="result-header">
                            <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" stroke-width="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                            <span class="result-title">答案正确！</span>
                        </div>
                        <div class="result-message">${verification.message}</div>
                    </div>
                `;
            } else {
                outputElement.innerHTML = `
                    <div class="verification-result error show">
                        <div class="result-header">
                            <svg class="result-icon" viewBox="0 0 24 24" fill="none" stroke="var(--accent-error)" stroke-width="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="15" y1="9" x2="9" y2="15"/>
                                <line x1="9" y1="9" x2="15" y2="15"/>
                            </svg>
                            <span class="result-title">输出不匹配</span>
                        </div>
                        <div class="result-message">${verification.message}</div>
                        <div class="result-diff">
                            <div class="diff-row">
                                <span class="diff-label">期望:</span>
                                <span class="diff-expected">${escapeHtml(verification.diff.expected)}</span>
                            </div>
                            <div class="diff-row">
                                <span class="diff-label">实际:</span>
                                <span class="diff-actual">${escapeHtml(verification.diff.actual) || '(无输出)'}</span>
                            </div>
                        </div>
                    </div>
                `;
            }
        }

        return {
            success: verification.success,
            message: verification.message,
            output: result.output,
            diff: verification.diff
        };
    }

    /**
     * HTML转义
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * 添加编译状态监听器
     */
    function addCompilationListener(listener) {
        compilationListeners.push(listener);
    }

    /**
     * 移除编译状态监听器
     */
    function removeCompilationListener(listener) {
        compilationListeners = compilationListeners.filter(l => l !== listener);
    }

    /**
     * 通知所有监听器
     */
    function notifyListeners(event) {
        compilationListeners.forEach(listener => listener(event));
    }

    /**
     * 获取编译状态
     */
    function getStatus() {
        return {
            isCompiling,
            compiler: COMPILER
        };
    }

    // ==================== 导出 ====================
    return {
        compileAndRun,
        verifyOutput,
        runCode,
        verifyAndRun,
        addCompilationListener,
        removeCompilationListener,
        getStatus,
        normalizeOutput
    };
})();

// 导出到全局
window.CompilerAPI = CompilerAPI;
