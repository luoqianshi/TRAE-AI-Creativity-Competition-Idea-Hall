let currentStep = 0;
const totalSteps = 8;

const diagnosisDB = {
    '开机黑屏，风扇转但没画面': {
        title: '🔍 开机黑屏排查',
        steps: [
            '检查显示器是否通电，信号线是否插紧',
            '确认显示器信号源选择正确（HDMI/DP）',
            '确认显示器线插在<strong>独立显卡</strong>上，不是主板上！',
            '重新插拔内存条，确保卡扣到位',
            '清除 CMOS：拔掉主板电池等 30 秒再装回',
            '如果以上都不行，可能是 CPU 或主板问题，尝试最小化启动（只留 CPU + 1 根内存）'
        ],
        tip: '💡 最常见的原因是显示器线插在了主板输出口上，而不是独立显卡上。'
    },
    '蓝屏代码0x0000007E': {
        title: '🔍 蓝屏 0x0000007E 排查',
        steps: [
            '这个错误通常是<strong>系统线程异常</strong>，常见于驱动问题',
            '进入安全模式（开机时连按 F8 或强制重启 3 次触发修复模式）',
            '在安全模式中卸载最近安装的驱动或软件',
            '运行命令提示符：<code>sfc /scannow</code> 修复系统文件',
            '更新所有驱动程序，特别是显卡和芯片组驱动',
            '如果频繁出现，检查内存是否有问题（运行 Windows 内存诊断工具）'
        ],
        tip: '💡 新装机出现蓝屏，大概率是驱动不兼容或内存没插好。'
    },
    '装完机没有网络驱动': {
        title: '🔍 没有网络驱动解决方案',
        steps: [
            '用另一台电脑或手机，去主板官网下载对应型号的网卡/无线网卡驱动',
            '用 U 盘拷贝到装好的电脑上安装',
            '如果是 WiFi 没有驱动：确认主板自带 WiFi 天线已拧上',
            'Windows 11 安装时可能自带部分驱动，尝试运行 Windows Update',
            '也可以用手机 USB 共享网络临时上网，然后下载驱动'
        ],
        tip: '💡 建议提前把网卡驱动下载到 U 盘里，装机后第一时间安装。手机 USB 共享网络是救急神器！'
    },
    '内存频率达不到标称频率': {
        title: '🔍 内存频率问题排查',
        steps: [
            '内存默认以 JEDEC 基础频率运行（DDR5 通常 4800MHz，DDR4 通常 2133/2400MHz）',
            '进入 BIOS，找到 <strong>XMP</strong>（Intel）或 <strong>EXPO/DOCP</strong>（AMD）选项',
            '将 XMP/EXPO 开启为 Profile 1',
            '保存退出，重新进入系统后用 CPU-Z 或 HWiNFO 确认频率',
            '如果开启后不稳定，可以尝试手动降低一档频率',
            '确认内存插在正确的插槽上（通常第 2、4 槽优先）'
        ],
        tip: '💡 标称频率需要开启 XMP/EXPO 才能达到！不开就是"降速"运行。'
    },
    '电脑频繁死机重启': {
        title: '🔍 频繁死机重启排查',
        steps: [
            '首先检查<strong>CPU 温度</strong>：进 BIOS 或用软件查看，待机应在 30-50°C',
            '如果温度过高（>90°C）：检查散热器是否装好、硅脂是否涂好、风扇是否转动',
            '检查电源功率是否够用：高端配置建议 850W 以上',
            '运行内存检测工具：Windows 内存诊断 或 MemTest86',
            '检查硬盘健康状态：用 CrystalDiskInfo 查看',
            '如果以上都正常，尝试更新 BIOS 到最新版本'
        ],
        tip: '💡 新装机频繁重启，最常见原因是散热没装好导致 CPU 过热保护。'
    },
    '显卡驱动安装失败': {
        title: '🔍 显卡驱动安装失败排查',
        steps: [
            '先去 NVIDIA/AMD 官网下载最新驱动',
            '使用 <strong>DDU（Display Driver Uninstaller）</strong> 在安全模式中彻底卸载旧驱动',
            '重启后安装新下载的驱动',
            '安装时选择"清洁安装"选项',
            '如果还是失败，检查 Windows Update 是否自动装了不兼容的驱动（先暂停更新）',
            '确认系统版本与驱动兼容（如 Win10/Win11 版本）'
        ],
        tip: '💡 DDU 是解决显卡驱动问题的终极武器，几乎能解决 99% 的驱动安装失败问题。'
    }
};

function switchPage(pageName) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));

    document.getElementById(pageName).classList.add('active');
    document.querySelector(`[data-page="${pageName}"]`).classList.add('active');
}

function checkCompatibility() {
    const cpu = document.getElementById('cpu-select').value;
    const mb = document.getElementById('mb-select').value;
    const ram = document.getElementById('ram-select').value;
    const gpu = document.getElementById('gpu-select').value;
    const psu = document.getElementById('psu-select').value;

    if (!cpu || !mb || !ram || !gpu || !psu) {
        alert('请选择所有硬件配置！');
        return;
    }

    const results = [];
    const cpuSocket = {
        'i9-14900K': 'LGA1700', 'i7-14700K': 'LGA1700', 'i5-14600K': 'LGA1700',
        'R9-7950X': 'AM5', 'R7-7800X3D': 'AM5', 'R5-7600': 'AM5'
    };

    const mbSocket = {
        'Z790': 'LGA1700', 'B760': 'LGA1700',
        'X670E': 'AM5', 'B650': 'AM5'
    };

    const mbDDR = {
        'Z790': 'DDR5', 'B760': 'DDR5',
        'X670E': 'DDR5', 'B650': 'DDR5'
    };

    const ramType = {
        'ddr5-6000': 'DDR5', 'ddr5-5600': 'DDR5',
        'ddr4-3600': 'DDR4', 'ddr4-3200': 'DDR4'
    };

    const psuWatt = {
        '1000W': 1000, '850W': 850, '750W': 750, '650W': 650
    };

    const gpuPower = {
        'RTX4090': 450, 'RTX4080S': 320, 'RTX4070TiS': 285,
        'RX7900XTX': 355, 'RX7800XT': 263
    };

    if (cpuSocket[cpu] === mbSocket[mb]) {
        results.push({ icon: '✅', title: 'CPU 与主板兼容', desc: `接口匹配：${cpuSocket[cpu]}`, type: 'success' });
    } else {
        results.push({ icon: '❌', title: 'CPU 与主板不兼容！', desc: `CPU 接口 ${cpuSocket[cpu]} ≠ 主板接口 ${mbSocket[mb]}`, type: 'error' });
    }

    if (ramType[ram] === mbDDR[mb]) {
        results.push({ icon: '✅', title: '内存与主板兼容', desc: `内存类型匹配：${mbDDR[mb]}`, type: 'success' });
    } else {
        results.push({ icon: '❌', title: '内存与主板不兼容！', desc: `主板支持 ${mbDDR[mb]}，你选择了 ${ramType[ram]}`, type: 'error' });
    }

    const totalPower = gpuPower[gpu] + 150;
    if (psuWatt[psu] >= totalPower) {
        results.push({ icon: '✅', title: '电源功率充足', desc: `预估功耗 ~${totalPower}W，电源 ${psuWatt[psu]}W 够用`, type: 'success' });
    } else {
        results.push({ icon: '⚠️', title: '电源功率可能不足', desc: `预估功耗 ~${totalPower}W，建议升级到 ${totalPower + 100}W 以上电源`, type: 'warning' });
    }

    if (gpu === 'RTX4090' && psuWatt[psu] < 850) {
        results.push({ icon: '⚠️', title: '建议：RTX 4090 至少 850W 电源', desc: '高端显卡需要稳定供电，电源不足可能导致黑屏或重启', type: 'warning' });
    }

    results.push({ icon: '✅', title: '显卡与主板兼容', desc: '所有主板 PCIe x16 插槽均兼容当前显卡', type: 'success' });

    const hasError = results.some(r => r.type === 'error');
    let html = `<h3 style="margin-bottom:20px">${hasError ? '⚠️ 兼容性检查发现不兼容项' : '✅ 配置兼容性检查通过'}</h3>`;

    results.forEach(r => {
        html += `
            <div class="result-item">
                <span class="result-icon">${r.icon}</span>
                <div class="result-text">
                    <strong>${r.title}</strong>
                    <span>${r.desc}</span>
                </div>
            </div>
        `;
    });

    if (!hasError) {
        html += `<div style="margin-top:20px;padding:16px;background:rgba(34,197,94,0.1);border-radius:8px;border:1px solid rgba(34,197,94,0.3)">
            <strong>🎉 恭喜！你的配置兼容性良好，可以放心购买装机！</strong>
        </div>`;
    }

    const panel = document.getElementById('compatibility-result');
    panel.innerHTML = html;
    panel.style.display = 'block';
}

function sendMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    askQuestion(text);
}

function askQuestion(question) {
    const messagesDiv = document.getElementById('chat-messages');

    messagesDiv.innerHTML += `
        <div class="message user-message">
            <div class="message-avatar">👤</div>
            <div class="message-content">
                <p>${question}</p>
            </div>
        </div>
    `;

    setTimeout(() => {
        let response = findDiagnosis(question);
        messagesDiv.innerHTML += `
            <div class="message ai-message">
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    ${response}
                </div>
            </div>
        `;
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 600);

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function findDiagnosis(question) {
    for (const [key, data] of Object.entries(diagnosisDB)) {
        if (question.includes(key.substring(0, 4)) || key.includes(question.substring(0, 4))) {
            let html = `<p><strong>${data.title}</strong></p><p>按以下步骤排查：</p><ol>`;
            data.steps.forEach(s => html += `<li>${s}</li>`);
            html += `</ol><div style="margin-top:12px;padding:10px;background:rgba(99,102,241,0.1);border-radius:8px;font-size:13px">${data.tip}</div>`;
            return html;
        }
    }

    return `<p>我理解你的问题：<strong>"${question}"</strong></p>
        <p>作为 Demo 版本，我的知识库有限。以下是通用排查建议：</p>
        <ol>
            <li>检查所有硬件连接是否牢固</li>
            <li>查看 BIOS 中硬件是否被正确识别</li>
            <li>检查设备管理器中是否有黄色感叹号</li>
            <li>尝试更新相关驱动程序</li>
            <li>搜索具体问题关键词获取更详细方案</li>
        </ol>
        <p style="color:var(--text-secondary);font-size:13px;margin-top:8px">💡 完整版将接入 AI 大模型，支持任意问题智能诊断。</p>`;
}

function nextStep() {
    if (currentStep < totalSteps - 1) {
        document.querySelectorAll('.guide-step').forEach(s => s.classList.remove('active'));
        currentStep++;
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        updateProgress();
    }
}

function prevStep() {
    if (currentStep > 0) {
        document.querySelectorAll('.guide-step').forEach(s => s.classList.remove('active'));
        currentStep--;
        document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    const prevBtn = document.getElementById('btn-prev');
    const nextBtn = document.getElementById('btn-next');

    const percent = (currentStep / (totalSteps - 1)) * 100;
    fill.style.width = percent + '%';
    text.textContent = `步骤 ${currentStep}/${totalSteps - 1}`;

    prevBtn.disabled = currentStep === 0;
    nextBtn.disabled = currentStep === totalSteps - 1;

    if (currentStep === totalSteps - 1) {
        nextBtn.textContent = '✅ 完成';
        nextBtn.disabled = true;
    } else {
        nextBtn.textContent = '下一步 ➡';
    }
}

function installDriver(btn, name) {
    const item = btn.closest('.driver-item');
    const status = item.querySelector('.driver-status');

    btn.textContent = '安装中...';
    btn.disabled = true;

    setTimeout(() => {
        status.textContent = '✅ 已安装';
        status.classList.add('done');
        btn.textContent = '已完成';
        btn.style.background = 'var(--success)';
    }, 1500);
}

function showSWDetail(type) {
    alert('详细教程将在完整版中提供，包含图文步骤和视频指引。');
}

document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function (e) {
        e.preventDefault();
        switchPage(this.dataset.page);
    });
});

updateProgress();
