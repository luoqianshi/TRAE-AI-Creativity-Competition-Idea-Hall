function initNav(currentPage) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        if (item.dataset.page === currentPage) {
            item.classList.add('active');
        }
    });
}

function showModal(title, content, buttons) {
    const modalOverlay = document.getElementById('modalOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalContent');
    const modalActions = document.getElementById('modalActions');
    
    modalTitle.textContent = title;
    modalContent.textContent = content;
    
    modalActions.innerHTML = buttons.map(btn => `
        <button class="modal-btn ${btn.class}" onclick="${btn.action ? `handleModalAction('${btn.action}')` : 'closeModal()'}">
            ${btn.text}
        </button>
    `).join('');
    
    modalOverlay.classList.add('active');
}

function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    modalOverlay.classList.remove('active');
}

function handleModalAction(action) {
    closeModal();
    switch(action) {
        case 'callMetro':
            showModal('呼叫成功', '正在接通地铁客服，请稍候...', [{ text: '好的', class: 'primary' }]);
            speak('正在接通地铁客服，请稍候');
            break;
        case 'call120':
            showModal('呼叫成功', '120急救中心已收到您的求助，请保持电话畅通...', [{ text: '好的', class: 'primary' }]);
            speak('120急救中心已收到您的求助，请保持电话畅通');
            break;
        case 'notifyContact':
            showModal('发送成功', `已向${mockData.user.emergency_contact.name}发送求助信息和位置`, [{ text: '好的', class: 'primary' }]);
            speak(`已向${mockData.user.emergency_contact.name}发送求助信息`);
            break;
        case 'broadcastHelp':
            showModal('广播成功', '地铁站广播系统已启动，请工作人员尽快前往您的位置', [{ text: '好的', class: 'primary' }]);
            speak('地铁站广播系统已启动，请工作人员尽快前往您的位置');
            break;
        case 'navigateToilets':
            window.location.href = 'toilets.html';
            speak('正在为您显示附近的厕所');
            break;
    }
}

function handleSosClick() {
    showModal('紧急求助', '您需要什么帮助？\n\n当前位置：人民广场站', [
        { text: '呼叫地铁客服', class: 'primary', action: 'callMetro' },
        { text: '呼叫120', class: 'secondary', action: 'call120' },
        { text: '取消', class: 'secondary' }
    ]);
}

function speak(text) {
    if (!mockData.user.preferences.voice_enabled) return;
    
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

function createToiletCard(toilet) {
    const statusText = toilet.status === 'maintenance' ? '维修中' : '正常使用';
    const statusColor = toilet.status === 'maintenance' ? '#F39C12' : '#2ECC71';
    
    return `
        <div class="card" onclick="window.location.href='toilet-detail.html?id=${toilet.id}'">
            <div class="card-header">
                <div>
                    <div class="card-title">${toilet.name}</div>
                    <div class="card-info">${toilet.station} · ${toilet.line} · ${toilet.location}</div>
                </div>
                <div class="card-distance">${toilet.distance}</div>
            </div>
            <div style="font-size: 14px; color: ${statusColor}; margin-bottom: 12px; font-weight: 500;">
                ${statusText}
            </div>
            <div class="facility-tags">
                ${Object.entries(toilet.accessibility).map(([key, value]) => {
                    const facility = facilityLabels[key];
                    return `
                        <span class="facility-tag ${value ? 'available' : 'unavailable'}">
                            ${facility.icon} ${facility.label}
                        </span>
                    `;
                }).join('')}
            </div>
        </div>
    `;
}

function createServiceCard(service) {
    return `
        <div class="card">
            <div class="card-header">
                <div>
                    <div class="card-title">${service.name}</div>
                    <div class="card-info">${service.station} · ${service.location}</div>
                </div>
                <div class="card-distance">${service.distance}</div>
            </div>
            ${service.hours ? `<div class="card-info"><i class="fas fa-clock"></i> ${service.hours}</div>` : ''}
            ${service.phone ? `<div class="card-info"><i class="fas fa-phone"></i> ${service.phone}</div>` : ''}
        </div>
    `;
}

document.addEventListener('click', (e) => {
    const modalOverlay = document.getElementById('modalOverlay');
    if (e.target === modalOverlay) {
        closeModal();
    }
});

function initVoiceBtn() {
    const voiceBtn = document.getElementById('voiceBtn');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', () => {
            if (voiceBtn.classList.contains('listening')) {
                voiceBtn.classList.remove('listening');
                showModal('语音识别', '您可以说：\n- 找厕所\n- 紧急求助\n- 附近医院', [{ text: '知道了', class: 'primary' }]);
                speak('请问您需要什么帮助？');
            } else {
                voiceBtn.classList.add('listening');
                setTimeout(() => {
                    voiceBtn.classList.remove('listening');
                    showModal('语音识别', '已识别：找附近的厕所', [
                        { text: '确认', class: 'primary', action: 'navigateToilets' },
                        { text: '取消', class: 'secondary' }
                    ]);
                }, 2000);
            }
        });
    }
}
