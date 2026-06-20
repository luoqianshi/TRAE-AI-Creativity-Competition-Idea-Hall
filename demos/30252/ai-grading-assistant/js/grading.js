// 批改模块 - AI自动批改逻辑
const Grading = {
    // 从OCR识别结果中提取答案
    extractAnswers(ocrText, questions) {
        const results = [];
        const text = ocrText.toLowerCase();
        
        questions.forEach((question, index) => {
            const result = {
                questionId: question.id,
                type: question.type,
                content: question.content,
                options: question.options,
                correctAnswer: question.answer,
                maxScore: question.score,
                detectedAnswer: '',
                score: 0,
                status: 'pending' // pending, correct, wrong, partial, manual
            };
            
            if (question.type === 'choice') {
                // 提取选择题答案
                result.detectedAnswer = this.extractChoiceAnswer(text, index);
                result.score = this.checkChoiceAnswer(result.detectedAnswer, question.answer, question.score);
                result.status = result.score === question.score ? 'correct' : 'wrong';
            } else if (question.type === 'blank') {
                // 提取填空题答案
                result.detectedAnswer = this.extractBlankAnswer(text, index);
                result.score = this.checkBlankAnswer(result.detectedAnswer, question.answer, question.score);
                result.status = result.score === question.score ? 'correct' : (result.score > 0 ? 'partial' : 'wrong');
            } else {
                // 主观题需要手动批改
                result.detectedAnswer = this.extractSubjectiveAnswer(text, index);
                result.status = 'manual';
                result.score = 0; // 待手动评分
            }
            
            results.push(result);
        });
        
        return results;
    },
    
    // 提取选择题答案
    extractChoiceAnswer(text, questionIndex) {
        // 尝试多种匹配模式
        const patterns = [
            // 第X题答案
            new RegExp(`第[\\s\\t]*(${questionIndex + 1}|[一二三四五六七八九十]+)[\\s\\t]*[题：:][\\s\\t]*([a-dA-D])`),
            // 答案：X 或 答案: X
            new RegExp(`答案[\\s：:][\\s\\t]*([a-dA-D])`),
            // (X) 或 [X] 模式
            new RegExp(`[\\( \\[]([a-dA-D])[\\) \\]]`),
            // 单独的大写字母（作为答案）
            new RegExp(`^\\s*([A-D])\\s*$`, 'm'),
            // 题目后的字母
            new RegExp(`${questionIndex + 1}[\\.、]\\s*([a-dA-D])`),
            new RegExp(`^${questionIndex + 1}[\\.、]\\s*([A-D])`, 'm')
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].toUpperCase();
            }
        }
        
        return '';
    },
    
    // 提取填空题答案
    extractBlankAnswer(text, questionIndex) {
        // 尝试多种匹配模式
        const patterns = [
            // 第X题答案
            new RegExp(`第[\\s\\t]*(${questionIndex + 1}|[一二三四五六七八九十]+)[\\s\\t]*[题：:][\\s\\t]*(.{0,30})`),
            // 答案：XXX
            new RegExp(`答案[\\s：:][\\s\\t]*(.{0,30})(?=[\\n\\r]|$)`),
            // 填空：XXX
            new RegExp(`填空[\\s：:][\\s\\t]*(.{0,30})(?=[\\n\\r]|$)`),
            // 横线后的内容
            new RegExp(`[\_\_\-\—]{3,}[\\s]*(.{0,30})`)
        ];
        
        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match && match[1]) {
                return match[1].trim();
            }
        }
        
        return '';
    },
    
    // 提取主观题内容
    extractSubjectiveAnswer(text, questionIndex) {
        // 返回识别到的文本片段
        const lines = text.split(/[\n\r]+/);
        if (lines.length > questionIndex) {
            return lines[questionIndex].trim();
        }
        return '';
    },
    
    // 检查选择题答案
    checkChoiceAnswer(detected, correct, maxScore) {
        if (!detected || !correct) return 0;
        return detected.toUpperCase() === correct.toUpperCase() ? maxScore : 0;
    },
    
    // 检查填空题答案
    checkBlankAnswer(detected, correct, maxScore) {
        if (!detected || !correct) return 0;
        
        // 精确匹配
        if (detected.trim() === correct.trim()) {
            return maxScore;
        }
        
        // 关键词匹配（多个关键词用逗号分隔）
        const keywords = correct.split(/[,，;；]/).map(k => k.trim()).filter(k => k);
        if (keywords.length === 0) return 0;
        
        let matchCount = 0;
        keywords.forEach(keyword => {
            if (detected.includes(keyword)) {
                matchCount++;
            }
        });
        
        // 计算部分得分
        const partialScore = Math.round((matchCount / keywords.length) * maxScore);
        return partialScore;
    },
    
    // 计算总分
    calculateTotalScore(results) {
        return results.reduce((sum, r) => sum + r.score, 0);
    },
    
    // 生成批改报告
    generateReport(gradingResults) {
        const totalScore = this.calculateTotalScore(gradingResults);
        const correctCount = gradingResults.filter(r => r.status === 'correct').length;
        const wrongCount = gradingResults.filter(r => r.status === 'wrong').length;
        const partialCount = gradingResults.filter(r => r.status === 'partial').length;
        const manualCount = gradingResults.filter(r => r.status === 'manual').length;
        
        return {
            totalScore,
            correctCount,
            wrongCount,
            partialCount,
            manualCount,
            totalQuestions: gradingResults.length
        };
    },
    
    // 导出成绩为CSV格式
    exportToCSV(assignment, grades, students) {
        const headers = ['姓名', ...assignment.questions.map((q, i) => `题目${i + 1}`), '总分'];
        const rows = grades.map(grade => {
            const student = students.find(s => s.id === grade.studentId);
            const scores = assignment.questions.map(q => {
                const qScore = grade.scores[q.id];
                return qScore ? qScore.finalScore ?? qScore.autoScore ?? 0 : '-';
            });
            return [student?.name || '未知', ...scores, grade.totalScore];
        });
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.join(',') + '\n';
        });
        
        return csv;
    },
    
    // 计算分数分布
    calculateScoreDistribution(grades, totalScore) {
        const ranges = [
            { label: '0-59', min: 0, max: 59, count: 0 },
            { label: '60-69', min: 60, max: 69, count: 0 },
            { label: '70-79', min: 70, max: 79, count: 0 },
            { label: '80-89', min: 80, max: 89, count: 0 },
            { label: '90-100', min: 90, max: 100, count: 0 }
        ];
        
        grades.forEach(g => {
            const score = g.totalScore;
            const range = ranges.find(r => score >= r.min && score <= r.max);
            if (range) range.count++;
        });
        
        return ranges;
    },
    
    // 统计错题
    calculateErrorStats(assignment, grades) {
        const errorStats = [];
        
        assignment.questions.forEach((q, index) => {
            let errorCount = 0;
            grades.forEach(grade => {
                const qScore = grade.scores[q.id];
                const score = qScore?.finalScore ?? qScore?.autoScore ?? q.score;
                if (score < q.score) {
                    errorCount++;
                }
            });
            
            if (errorCount > 0) {
                errorStats.push({
                    questionNumber: index + 1,
                    content: q.content.substring(0, 30) + (q.content.length > 30 ? '...' : ''),
                    type: q.type,
                    errorCount,
                    errorRate: grades.length > 0 ? Math.round((errorCount / grades.length) * 100) : 0
                });
            }
        });
        
        // 按错误率排序
        return errorStats.sort((a, b) => b.errorCount - a.errorCount);
    }
};

// 导出模块
window.Grading = Grading;
