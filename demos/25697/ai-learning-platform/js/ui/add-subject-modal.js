        // ========== Add Subject Modal ==========
        function openAddSubjectModal() {
            openModal('addSubjectModal');
            document.getElementById('subjectCreateStep1').style.display = 'block';
            document.getElementById('subjectCreateStep2').style.display = 'none';
            document.getElementById('newSubjectName').value = '';
            document.getElementById('newSubjectDesc').value = '';
            document.getElementById('confirmCreateSubject').style.display = 'none';
            document.getElementById('startCreateSubject').style.display = 'flex';
            document.getElementById('addSubjectModalTitle').textContent = `添加新${state.role === 'student' ? '科目' : '项目'}`;
            state.selectedSubjectIcon = '📚';
        }

        function startCreateSubject() {
            const name = document.getElementById('newSubjectName').value.trim();
            const desc = document.getElementById('newSubjectDesc').value.trim();
            if (!name) {
                showToast('warning', `请输入${state.role === 'student' ? '科目' : '项目'}名称`);
                return;
            }

            // Switch to step 2
            document.getElementById('subjectCreateStep1').style.display = 'none';
            document.getElementById('subjectCreateStep2').style.display = 'block';
            document.getElementById('startCreateSubject').style.display = 'none';

            // Simulate AI search
            setTimeout(() => {
                document.getElementById('aiSearchStatus').style.display = 'none';
                const summary = document.getElementById('aiSummary');
                summary.style.display = 'block';
                summary.textContent = generateSubjectSummary(name, desc);
                document.getElementById('subjectConfirmArea').style.display = 'block';
                document.getElementById('confirmCreateSubject').style.display = 'flex';
            }, 2000);
        }

        function generateSubjectSummary(name, desc) {
            const isStudent = state.role === 'student';
            let customSection = '';

            if (desc) {
                if (isStudent) {
                    customSection = `

📝 你的学习需求：
${desc}

AI已根据你的描述，为你定制了以下内容：`;
                } else {
                    customSection = `

📝 你的项目描述：
${desc}

AI已根据你的描述，为你定制了以下内容：`;
                }
            }

            if (isStudent) {
                return `🔍 AI对「${name}」的了解：${customSection}

📚 学科概述：
${name}是一门重要的学科，涵盖基础概念、核心理论和实践应用等多个方面。学习${name}需要建立系统的知识框架，注重理论与实践相结合。

📌 核心内容：
• 基础概念与定义
• 核心原理与定律
• 典型题型与方法
• 实际应用场景

💡 学习建议：
• 从基础概念入手，逐步深入
• 多做练习，巩固知识点
• 注重总结归纳，建立知识体系
• 结合实际案例加深理解

🎯 常见考点：
• 基础知识理解与辨析
• 综合应用与问题解决
• 创新思维与拓展延伸`;
            } else {
                return `🔍 AI对「${name}」的了解：${customSection}

📁 项目概述：
${name}是一个工作项目，涉及多阶段任务推进和成果交付。管理${name}需要明确目标、合理分配资源、跟踪进度并及时调整。

📌 核心任务：
• 需求分析与目标定义
• 方案设计与资源规划
• 执行推进与进度跟踪
• 成果验收与复盘优化

💡 工作建议：
• 明确项目范围和交付标准
• 制定详细的时间节点和里程碑
• 建立有效的沟通协作机制
• 做好文档记录和知识沉淀

🎯 关键产出：
• 项目计划书/方案文档
• 阶段性成果和交付物
• 进度报告和风险评估
• 项目总结和经验沉淀`;
            }
        }

        function selectSubjectIcon(btn, icon) {
            document.querySelectorAll('#subjectCreateStep2 .reminder-type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.selectedSubjectIcon = icon;
        }

        function confirmCreateSubject() {
            const name = document.getElementById('newSubjectName').value.trim();
            if (!name) return;

            const id = 'custom_' + Date.now();
            const newItem = {
                id,
                name,
                icon: state.selectedSubjectIcon,
                errors: [],
                chats: {}
            };

            if (state.role === 'student') {
                state.subjects.push(newItem);
                StorageManager.saveErrors(id, []);
                // Save custom subjects list
                const customs = state.subjects.filter(s => s.id.startsWith('custom_'));
                localStorage.setItem(`user_${StorageManager.getCurrentUserId()}_custom_subjects`, JSON.stringify(customs));
            } else {
                newItem.type = 'custom';
                newItem.files = [];
                state.projects.push(newItem);
            }

            closeModal('addSubjectModal');
            renderSubjects();
            selectSubject(id);
            showToast('success', `「${name}」创建成功`);
        }

        function closeModal(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
            // Also check for any active overlay
            const overlay = document.querySelector('.modal-overlay.active');
            if (overlay) {
                overlay.style.display = 'none';
                overlay.classList.remove('active');
            }
        }

        function openModal(id) {
            const modal = document.getElementById(id);
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
            }
        }

        // Click-outside-to-close for all modals
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                e.target.style.display = 'none';
                e.target.classList.remove('active');
            }
        });
