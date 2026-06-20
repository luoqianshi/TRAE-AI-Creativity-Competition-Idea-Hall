let checkIns = [];
let targetTime = '23:00';
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

function init() {
    loadCheckIns();
    loadTargetTime();
    updateTodayInfo();
    updateStats();
    renderCalendar();
}

function loadCheckIns() {
    const saved = localStorage.getItem('sleepCheckIns');
    if (saved) {
        checkIns = JSON.parse(saved);
    }
}

function saveCheckIns() {
    localStorage.setItem('sleepCheckIns', JSON.stringify(checkIns));
}

function loadTargetTime() {
    const saved = localStorage.getItem('sleepTargetTime');
    if (saved) {
        targetTime = saved;
        document.getElementById('target-time').textContent = targetTime;
        document.getElementById('target-time-input').value = targetTime;
    }
}

function saveTargetTime() {
    const input = document.getElementById('target-time-input');
    targetTime = input.value;
    localStorage.setItem('sleepTargetTime', targetTime);
    document.getElementById('target-time').textContent = targetTime;
    showMessage('目标时间已更新！', 'info');
}

function updateTodayInfo() {
    const now = new Date();
    const weekday = WEEKDAYS[now.getDay()];
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    
    document.getElementById('weekday').textContent = weekday;
    document.getElementById('date').textContent = dateStr;
    
    updateCheckButton();
}

function updateCheckButton() {
    const btn = document.getElementById('check-btn');
    const statusMsg = document.getElementById('status-message');
    
    if (hasCheckedToday()) {
        btn.disabled = true;
        btn.textContent = '✓ 已打卡';
        statusMsg.textContent = '今日已打卡！继续保持！';
        statusMsg.className = 'status-message success';
    } else {
        btn.disabled = false;
        btn.textContent = '✅ 打卡';
        statusMsg.textContent = '';
        statusMsg.className = 'status-message';
    }
}

function hasCheckedToday() {
    const today = formatDate(new Date());
    return checkIns.some(checkIn => checkIn.date === today);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function checkIn() {
    if (hasCheckedToday()) {
        showMessage('今日已打卡！', 'info');
        return;
    }
    
    const now = new Date();
    const checkInTime = formatTime(now);
    const isEarly = isBeforeTargetTime(now);
    
    const checkInData = {
        date: formatDate(now),
        time: checkInTime,
        isEarly: isEarly
    };
    
    checkIns.push(checkInData);
    saveCheckIns();
    
    updateStats();
    updateCheckButton();
    renderCalendar();
    
    if (isEarly) {
        showMessage(`🎉 打卡成功！你在 ${checkInTime} 打卡，早睡成功！`, 'success');
    } else {
        showMessage(`⏰ 打卡成功！你在 ${checkInTime} 打卡，记得明天早点休息哦~`, 'info');
    }
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function isBeforeTargetTime(date) {
    const [targetHour, targetMinute] = targetTime.split(':').map(Number);
    const targetTotalMinutes = targetHour * 60 + targetMinute;
    const currentTotalMinutes = date.getHours() * 60 + date.getMinutes();
    return currentTotalMinutes <= targetTotalMinutes;
}

function showMessage(msg, type) {
    const statusMsg = document.getElementById('status-message');
    statusMsg.textContent = msg;
    statusMsg.className = `status-message ${type}`;
}

function updateStats() {
    const totalDays = checkIns.length;
    const currentStreak = calculateCurrentStreak();
    const maxStreak = calculateMaxStreak();
    const completionRate = calculateCompletionRate();
    
    document.getElementById('total-days').textContent = totalDays;
    document.getElementById('current-streak').textContent = `${currentStreak}天`;
    document.getElementById('max-streak').textContent = `${maxStreak}天`;
    document.getElementById('completion-rate').textContent = completionRate;
}

function calculateCurrentStreak() {
    if (checkIns.length === 0) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = formatDate(checkDate);
        
        if (checkIns.some(checkIn => checkIn.date === dateStr)) {
            streak++;
        } else if (i > 0) {
            break;
        }
    }
    
    return streak;
}

function calculateMaxStreak() {
    if (checkIns.length === 0) return 0;
    
    const sortedDates = [...checkIns]
        .map(checkIn => checkIn.date)
        .sort();
    
    let maxStreak = 1;
    let currentStreak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            currentStreak++;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
    }
    
    return maxStreak;
}

function calculateCompletionRate() {
    if (checkIns.length === 0) return '0%';
    
    const firstDate = new Date(Math.min(...checkIns.map(c => new Date(c.date))));
    const lastDate = new Date();
    const totalDays = Math.floor((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1;
    const rate = Math.round((checkIns.length / totalDays) * 100);
    
    return `${rate}%`;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const today = new Date();
    const todayStr = formatDate(today);
    
    document.getElementById('month-year').textContent = `${currentYear}年${currentMonth + 1}月`;
    
    const startDay = firstDay.getDay();
    
    for (let i = 0; i < startDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day other-month';
        grid.appendChild(emptyDay);
    }
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = formatDate(date);
        const isChecked = checkIns.some(checkIn => checkIn.date === dateStr);
        const isToday = dateStr === todayStr;
        const isFuture = date > today;
        
        const dayEl = document.createElement('div');
        dayEl.className = 'calendar-day current-month';
        
        if (isToday) dayEl.classList.add('today');
        if (isChecked) dayEl.classList.add('checked');
        if (isFuture) dayEl.classList.add('disabled');
        
        dayEl.textContent = day;
        dayEl.title = isChecked ? `已打卡 ${checkIns.find(c => c.date === dateStr)?.time}` : '';
        
        grid.appendChild(dayEl);
    }
}

function prevMonth() {
    if (currentMonth === 0) {
        currentMonth = 11;
        currentYear--;
    } else {
        currentMonth--;
    }
    renderCalendar();
}

function nextMonth() {
    const today = new Date();
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth()) {
        return;
    }
    
    if (currentMonth === 11) {
        currentMonth = 0;
        currentYear++;
    } else {
        currentMonth++;
    }
    renderCalendar();
}

document.addEventListener('DOMContentLoaded', init);