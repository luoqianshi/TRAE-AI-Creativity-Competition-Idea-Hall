// ========== Quick Tools ==========
let calcExpression = '';
function openCalculator() {
    calcExpression = '';
    document.getElementById('calcDisplay').textContent = '0';
    openModal('calculatorModal');
}

function calcInput(val) {
    const display = document.getElementById('calcDisplay');
    if (val === 'C') {
        calcExpression = '';
        display.textContent = '0';
    } else if (val === 'DEL') {
        calcExpression = calcExpression.slice(0, -1);
        display.textContent = calcExpression || '0';
    } else if (val === '√') {
        try {
            let expr = calcExpression || display.textContent;
            if (expr === '0' || expr === '错误') return;
            let num = Function('"use strict"; return (' + expr + ')')();
            if (num < 0) {
                display.textContent = '错误';
                calcExpression = '';
            } else {
                let result = Math.sqrt(num);
                calcExpression = String(parseFloat(result.toFixed(10)));
                display.textContent = calcExpression;
            }
        } catch(e) {
            display.textContent = '错误';
            calcExpression = '';
        }
    } else if (val === 'x²') {
        try {
            let expr = calcExpression || display.textContent;
            if (expr === '0' || expr === '错误') return;
            let num = Function('"use strict"; return (' + expr + ')')();
            let result = num * num;
            calcExpression = String(parseFloat(result.toFixed(10)));
            display.textContent = calcExpression;
        } catch(e) {
            display.textContent = '错误';
            calcExpression = '';
        }
    } else if (val === '=') {
        try {
            let result = Function('"use strict"; return (' + calcExpression + ')')();
            if (!isFinite(result)) {
                display.textContent = '错误';
                calcExpression = '';
            } else {
                display.textContent = parseFloat(result.toFixed(10));
                calcExpression = String(parseFloat(result.toFixed(10)));
            }
        } catch(e) {
            display.textContent = '错误';
            calcExpression = '';
        }
    } else {
        if (calcExpression === '0' && val !== '.') calcExpression = '';
        calcExpression += val;
        display.textContent = calcExpression;
    }
}

// Drawing Board
let drawTool = 'pen';
let isDrawing = false;
let drawCtx = null;

function openDrawingBoard() {
    openModal('drawingModal');
    setTimeout(initCanvas, 100);
}

function initCanvas() {
    const canvas = document.getElementById('drawCanvas');
    drawCtx = canvas.getContext('2d');
    drawCtx.fillStyle = '#FFFFFF';
    drawCtx.fillRect(0, 0, canvas.width, canvas.height);
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';

    canvas.onmousedown = function(e) {
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        drawCtx.beginPath();
        drawCtx.moveTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
    };

    canvas.onmousemove = function(e) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        drawCtx.lineWidth = document.getElementById('drawSize').value;
        if (drawTool === 'eraser') {
            drawCtx.strokeStyle = '#FFFFFF';
            drawCtx.lineWidth = parseInt(document.getElementById('drawSize').value) * 3;
        } else {
            drawCtx.strokeStyle = document.getElementById('drawColor').value;
        }
        drawCtx.lineTo((e.clientX - rect.left) * scaleX, (e.clientY - rect.top) * scaleY);
        drawCtx.stroke();
    };

    canvas.onmouseup = function() { isDrawing = false; };
    canvas.onmouseleave = function() { isDrawing = false; };

    // Touch support
    canvas.ontouchstart = function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        isDrawing = true;
        drawCtx.beginPath();
        drawCtx.moveTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
    };

    canvas.ontouchmove = function(e) {
        e.preventDefault();
        if (!isDrawing) return;
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        drawCtx.lineWidth = document.getElementById('drawSize').value;
        if (drawTool === 'eraser') {
            drawCtx.strokeStyle = '#FFFFFF';
            drawCtx.lineWidth = parseInt(document.getElementById('drawSize').value) * 3;
        } else {
            drawCtx.strokeStyle = document.getElementById('drawColor').value;
        }
        drawCtx.lineTo((touch.clientX - rect.left) * scaleX, (touch.clientY - rect.top) * scaleY);
        drawCtx.stroke();
    };

    canvas.ontouchend = function() { isDrawing = false; };
}

function setDrawTool(tool) {
    drawTool = tool;
    document.getElementById('drawPenBtn').classList.toggle('active', tool === 'pen');
    document.getElementById('drawEraserBtn').classList.toggle('active', tool === 'eraser');
    document.getElementById('drawTextBtn').classList.toggle('active', tool === 'text');
    const canvas = document.getElementById('drawCanvas');
    if (tool === 'text') {
        canvas.style.cursor = 'text';
        canvas.onclick = function(e) {
            const text = prompt('输入文本:');
            if (text) {
                const ctx = canvas.getContext('2d');
                ctx.font = document.getElementById('drawSize').value * 4 + 'px sans-serif';
                ctx.fillStyle = document.getElementById('drawColor').value;
                ctx.fillText(text, e.offsetX, e.offsetY);
            }
        };
    } else {
        canvas.onclick = null;
        canvas.style.cursor = 'crosshair';
    }
}

function clearCanvas() {
    const canvas = document.getElementById('drawCanvas');
    if (drawCtx) {
        drawCtx.fillStyle = '#FFFFFF';
        drawCtx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function saveDrawing() {
    const canvas = document.getElementById('drawCanvas');
    const link = document.createElement('a');
    link.download = '绘图_' + new Date().toISOString().slice(0,10) + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('success', '绘图已保存为PNG文件');
}

function copyDrawing() {
    const canvas = document.getElementById('drawCanvas');
    canvas.toBlob(function(blob) {
        if (navigator.clipboard && navigator.clipboard.write) {
            const item = new ClipboardItem({ 'image/png': blob });
            navigator.clipboard.write([item]).then(function() {
                showToast('success', '绘图已复制到剪贴板');
            }).catch(function() {
                showToast('warning', '复制失败，请使用保存功能');
            });
        } else {
            showToast('warning', '当前浏览器不支持复制图片');
        }
    }, 'image/png');
}

function openGuideModal() {
    openModal('guideModal');
}

// Quick Notes Widget
function toggleQuickNote() {
    let note = document.getElementById('quickNoteFloat');
    if (note) {
        note.style.display = note.style.display === 'none' ? 'flex' : 'none';
        return;
    }
    note = document.createElement('div');
    note.id = 'quickNoteFloat';
    note.style.cssText = 'position:fixed;bottom:80px;right:20px;width:280px;max-height:350px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;z-index:1000;display:flex;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,0.3);';
    note.innerHTML = `
        <div style="padding:8px 12px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;cursor:move;" id="quickNoteHeader">
            <span style="font-size:13px;font-weight:600;">📝 快速笔记</span>
            <button onclick="this.closest('#quickNoteFloat').style.display='none'" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;line-height:1;">×</button>
        </div>
        <textarea id="quickNoteContent" style="flex:1;min-height:200px;padding:12px;border:none;background:transparent;color:var(--text-primary);resize:none;font-size:13px;font-family:inherit;outline:none;" placeholder="在这里快速记录..."></textarea>
        <div style="padding:8px 12px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;">
            <button onclick="clearQuickNote()" style="padding:4px 12px;border:1px solid var(--border);background:none;color:var(--text-secondary);border-radius:6px;cursor:pointer;font-size:12px;">清除</button>
            <button onclick="saveQuickNote()" style="padding:4px 12px;border:none;background:var(--primary);color:#fff;border-radius:6px;cursor:pointer;font-size:12px;">保存</button>
        </div>
    `;
    document.body.appendChild(note);
    // Load saved note
    const saved = localStorage.getItem('quickNote');
    if (saved) document.getElementById('quickNoteContent').value = saved;

    // Make draggable
    makeDraggable(note, document.getElementById('quickNoteHeader'));
}

function makeDraggable(el, handle) {
    let offsetX = 0, offsetY = 0, isDragging = false;
    handle.addEventListener('mousedown', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const rect = el.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        el.style.transition = 'none';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        el.style.left = (e.clientX - offsetX) + 'px';
        el.style.top = (e.clientY - offsetY) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    });
    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            el.style.transition = '';
        }
    });
    // Touch support
    handle.addEventListener('touchstart', function(e) {
        if (e.target.tagName === 'BUTTON') return;
        isDragging = true;
        const touch = e.touches[0];
        const rect = el.getBoundingClientRect();
        offsetX = touch.clientX - rect.left;
        offsetY = touch.clientY - rect.top;
        el.style.transition = 'none';
    }, { passive: true });
    document.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        const touch = e.touches[0];
        el.style.left = (touch.clientX - offsetX) + 'px';
        el.style.top = (touch.clientY - offsetY) + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
    }, { passive: true });
    document.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            el.style.transition = '';
        }
    });
}

function saveQuickNote() {
    localStorage.setItem('quickNote', document.getElementById('quickNoteContent').value);
    showToast('success', '笔记已保存');
}

function clearQuickNote() {
    document.getElementById('quickNoteContent').value = '';
    localStorage.removeItem('quickNote');
}
