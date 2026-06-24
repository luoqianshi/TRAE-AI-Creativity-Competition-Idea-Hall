let pets = [
    {
        id: 1,
        name: '旺财',
        type: 'dog',
        breed: '金毛寻回犬',
        age: 24,
        gender: '公',
        weight: 28.5,
        behavior: '喜欢拆家，看到陌生人会狂吠'
    },
    {
        id: 2,
        name: '咪咪',
        type: 'cat',
        breed: '英国短毛猫',
        age: 18,
        gender: '母',
        weight: 4.2,
        behavior: '不爱洗澡，偶尔会抓沙发'
    },
    {
        id: 3,
        name: '球球',
        type: 'rabbit',
        breed: '垂耳兔',
        age: 12,
        gender: '公',
        weight: 2.1,
        behavior: '喜欢啃咬家具，比较胆小'
    }
];

const petEmojis = {
    dog: '🐕',
    cat: '🐱',
    bird: '🐦',
    rabbit: '🐰',
    other: '🐾'
};

const petTypeNames = {
    dog: '狗狗',
    cat: '猫咪',
    bird: '鸟类',
    rabbit: '兔子',
    other: '其他'
};

const trainingPlans = {
    dog: {
        basic: {
            title: '基础服从训练',
            duration: '2周',
            items: ['坐下训练', '趴下训练', '握手训练', '过来训练', '等待训练']
        },
        behavior: {
            title: '行为纠正',
            duration: '3周',
            items: ['制止乱吠', '定点排便', '防止拆家', '社交化训练', '牵引训练']
        },
        advanced: {
            title: '技能进阶',
            duration: '4周',
            items: ['捡球训练', '跳圈训练', '障碍跑', '装死表演', '随行训练']
        }
    },
    cat: {
        basic: {
            title: '基础适应训练',
            duration: '2周',
            items: ['使用猫砂盆', '接受梳毛', '剪指甲配合', '叫名字回应', '适应外出']
        },
        behavior: {
            title: '行为纠正',
            duration: '3周',
            items: ['制止抓沙发', '防止跳餐桌', '减少夜间活动', '不乱咬东西', '接受抱持']
        },
        advanced: {
            title: '技能进阶',
            duration: '4周',
            items: ['击掌训练', '跳高高训练', '找玩具', '简单指令', '走猫步']
        }
    },
    bird: {
        basic: {
            title: '基础适应训练',
            duration: '2周',
            items: ['适应新环境', '接受喂食', '熟悉主人声音', '站手指', '简单互动']
        },
        behavior: {
            title: '行为纠正',
            duration: '3周',
            items: ['减少尖叫', '不乱飞', '不咬人', '定点排便', '笼养适应']
        },
        advanced: {
            title: '技能进阶',
            duration: '4周',
            items: ['学说话', '唱歌训练', '做手势', '认颜色', '小道具表演']
        }
    },
    rabbit: {
        basic: {
            title: '基础适应训练',
            duration: '2周',
            items: ['适应笼子', '接受抚摸', '熟悉环境', '回应名字', '吃零食配合']
        },
        behavior: {
            title: '行为纠正',
            duration: '3周',
            items: ['制止啃咬', '定点排便', '不跳高处', '不挖洞', '减少胆小']
        },
        advanced: {
            title: '技能进阶',
            duration: '4周',
            items: ['跳障碍', '转圈', '听指令', '用小厕所', '简单互动游戏']
        }
    },
    other: {
        basic: {
            title: '基础适应训练',
            duration: '2周',
            items: ['适应新环境', '接受喂食', '熟悉主人', '建立信任', '基础互动']
        },
        behavior: {
            title: '行为纠正',
            duration: '3周',
            items: ['制止不良行为', '建立规律作息', '社交化', '减少焦虑', '适应触摸']
        },
        advanced: {
            title: '技能进阶',
            duration: '4周',
            items: ['学习简单指令', '互动游戏', '表演技能', '敏捷训练', '智力游戏']
        }
    }
};

function getPetEmoji(type) {
    return petEmojis[type] || petEmojis.other;
}

function getPetTypeName(type) {
    return petTypeNames[type] || '其他';
}

function renderPets() {
    const container = document.getElementById('petsContainer');
    
    if (pets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">🐾</div>
                <h3>还没有添加宠物</h3>
                <p>在上方表单中添加你的宠物吧！</p>
            </div>
        `;
        return;
    }

    container.innerHTML = pets.map(pet => `
        <div class="pet-card" onclick="showTrainingPlan(${pet.id})">
            <div class="pet-avatar-section">
                <div class="pet-avatar">${getPetEmoji(pet.type)}</div>
                <h3 class="pet-name">${pet.name}</h3>
            </div>
            <ul class="pet-info">
                <li><span>类型</span><span>${getPetTypeName(pet.type)}</span></li>
                <li><span>品种</span><span>${pet.breed || '未知'}</span></li>
                <li><span>年龄</span><span>${pet.age ? `${pet.age}个月` : '未知'}</span></li>
                <li><span>性别</span><span>${pet.gender}</span></li>
                <li><span>体重</span><span>${pet.weight ? `${pet.weight}kg` : '未知'}</span></li>
            </ul>
            ${pet.behavior ? `<div class="behavior-tag">${pet.behavior}</div>` : ''}
        </div>
    `).join('');
}

let currentPet = null;
let isTraining = false;
let trainingStartTime = null;
let timerInterval = null;
let currentCheckins = [];

let trainingHistory = [
    {
        id: 1,
        petId: 1,
        date: new Date(Date.now() - 86400000 * 2).toISOString(),
        duration: 1200,
        checkins: [
            { time: '10:05', content: '完成坐下训练 10 组' },
            { time: '10:12', content: '趴下训练效果不错' },
            { time: '10:20', content: '握手训练第一次尝试' }
        ]
    },
    {
        id: 2,
        petId: 1,
        date: new Date(Date.now() - 86400000).toISOString(),
        duration: 1800,
        checkins: [
            { time: '15:30', content: '基础服从训练复习' },
            { time: '15:45', content: '社交化训练 - 遇到陌生人' },
            { time: '16:00', content: '牵引训练 15 分钟' }
        ]
    },
    {
        id: 3,
        petId: 2,
        date: new Date(Date.now() - 86400000).toISOString(),
        duration: 900,
        checkins: [
            { time: '20:00', content: '使用猫砂盆巩固训练' },
            { time: '20:10', content: '接受梳毛 5 分钟' }
        ]
    }
];

function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0');
    const mins = date.getMinutes().toString().padStart(2, '0');
    return `${month}月${day}日 ${hours}:${mins}`;
}

function getCurrentTimeStr() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function renderCheckins() {
    const list = document.getElementById('checkinList');
    if (currentCheckins.length === 0) {
        list.innerHTML = '<div class="checkin-empty">还没有打卡记录，开始记录训练内容吧！</div>';
        return;
    }
    list.innerHTML = currentCheckins.map((c, i) => `
        <li>
            <span>${c.content}</span>
            <span class="checkin-time">${c.time}</span>
        </li>
    `).join('');
}

function startTraining() {
    isTraining = true;
    trainingStartTime = Date.now();
    currentCheckins = [];

    document.getElementById('activeTrainingSection').style.display = 'block';
    document.getElementById('startTrainingBtn').style.display = 'none';
    document.getElementById('viewHistoryBtn').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';

    renderCheckins();

    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - trainingStartTime) / 1000);
        document.getElementById('trainingTimer').textContent = formatDuration(elapsed);
    }, 1000);
}

function endTraining() {
    if (!isTraining) return;

    const elapsedSeconds = Math.floor((Date.now() - trainingStartTime) / 1000);

    if (currentCheckins.length > 0 || elapsedSeconds > 60) {
        const record = {
            id: Date.now(),
            petId: currentPet.id,
            date: new Date().toISOString(),
            duration: elapsedSeconds,
            checkins: [...currentCheckins]
        };
        trainingHistory.unshift(record);
    }

    clearInterval(timerInterval);
    isTraining = false;
    trainingStartTime = null;

    document.getElementById('activeTrainingSection').style.display = 'none';
    document.getElementById('startTrainingBtn').style.display = 'flex';
    document.getElementById('viewHistoryBtn').style.display = 'flex';

    document.getElementById('checkinInput').value = '';
}

function addCheckin() {
    const input = document.getElementById('checkinInput');
    const content = input.value.trim();
    if (!content) return;

    currentCheckins.push({
        time: getCurrentTimeStr(),
        content: content
    });

    input.value = '';
    renderCheckins();
}

function showHistory() {
    const petHistory = trainingHistory
        .filter(r => r.petId === currentPet.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

    const list = document.getElementById('historyList');

    if (petHistory.length === 0) {
        list.innerHTML = `
            <div class="history-empty">
                <div class="icon">📭</div>
                <h4>暂无训练记录</h4>
                <p>开始你的第一次训练吧！</p>
            </div>
        `;
    } else {
        list.innerHTML = petHistory.map(record => `
            <div class="history-card">
                <div class="history-card-header">
                    <span class="history-date">${formatDate(record.date)}</span>
                    <span class="history-duration">${formatDuration(record.duration)}</span>
                </div>
                ${record.checkins.length > 0 ? `
                    <ul class="history-checkins">
                        ${record.checkins.map(c => `<li>• ${c.content} <span style="color:#bbb">(${c.time})</span></li>`).join('')}
                    </ul>
                ` : ''}
            </div>
        `).join('');
    }

    document.getElementById('historySection').style.display = 'block';
    document.getElementById('trainingPlan').style.display = 'none';
    document.querySelector('.training-actions').style.display = 'none';
}

function closeHistory() {
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('trainingPlan').style.display = 'grid';
    document.querySelector('.training-actions').style.display = 'flex';
}

function showTrainingPlan(petId) {
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;

    currentPet = pet;
    isTraining = false;
    clearInterval(timerInterval);
    currentCheckins = [];

    const plan = trainingPlans[pet.type] || trainingPlans.other;

    document.getElementById('selectedPetInfo').innerHTML = `
        <div class="pet-avatar">${getPetEmoji(pet.type)}</div>
        <div>
            <h3>${pet.name} 的训练计划</h3>
            <p>${getPetTypeName(pet.type)} · ${pet.breed || '未知品种'} · ${pet.age ? `${pet.age}个月` : '年龄未知'}</p>
        </div>
    `;

    document.getElementById('trainingPlan').innerHTML = Object.keys(plan).map((key, index) => {
        const colors = ['#667eea', '#28a745', '#ffc107'];
        return `
            <div class="training-card" style="border-left-color: ${colors[index]}">
                <h4>${plan[key].title}<span class="badge" style="background: ${colors[index]}">${plan[key].duration}</span></h4>
                <ul>
                    ${plan[key].items.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <div class="duration">建议每天训练 15-20 分钟</div>
            </div>
        `;
    }).join('');

    document.getElementById('activeTrainingSection').style.display = 'none';
    document.getElementById('historySection').style.display = 'none';
    document.getElementById('trainingPlan').style.display = 'grid';
    document.querySelector('.training-actions').style.display = 'flex';
    document.getElementById('startTrainingBtn').style.display = 'flex';
    document.getElementById('viewHistoryBtn').style.display = 'flex';
    document.getElementById('trainingTimer').textContent = '00:00';

    document.querySelector('.guide-section').style.display = 'none';
    document.querySelector('.add-pet-section').style.display = 'none';
    document.querySelector('.pets-section').style.display = 'none';
    document.getElementById('trainingSection').style.display = 'block';
}

function goBack() {
    if (isTraining) {
        if (!confirm('训练还在进行中，确定要离开吗？')) return;
        endTraining();
    }

    currentPet = null;
    document.querySelector('.guide-section').style.display = 'block';
    document.querySelector('.pets-section').style.display = 'block';
    document.querySelector('.add-pet-section').style.display = 'block';
    document.getElementById('trainingSection').style.display = 'none';
}

document.getElementById('startTrainingBtn').addEventListener('click', startTraining);
document.getElementById('endTrainingBtn').addEventListener('click', endTraining);
document.getElementById('addCheckinBtn').addEventListener('click', addCheckin);
document.getElementById('checkinInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') addCheckin();
});
document.getElementById('viewHistoryBtn').addEventListener('click', showHistory);
document.getElementById('closeHistoryBtn').addEventListener('click', closeHistory);

function toggleAddPetForm() {
    const formWrapper = document.getElementById('addPetFormWrapper');
    const toggleBtn = document.getElementById('addPetToggleBtn');
    
    if (formWrapper.style.display === 'none') {
        formWrapper.style.display = 'block';
        toggleBtn.style.display = 'none';
    } else {
        formWrapper.style.display = 'none';
        toggleBtn.style.display = 'flex';
    }
}

function hideAddPetForm() {
    const formWrapper = document.getElementById('addPetFormWrapper');
    const toggleBtn = document.getElementById('addPetToggleBtn');
    formWrapper.style.display = 'none';
    toggleBtn.style.display = 'flex';
}

document.getElementById('addPetToggleBtn').addEventListener('click', toggleAddPetForm);

document.getElementById('cancelAddBtn').addEventListener('click', function() {
    hideAddPetForm();
    document.getElementById('addPetForm').reset();
});

document.getElementById('addPetForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const newPet = {
        id: Date.now(),
        name: document.getElementById('petName').value,
        type: document.getElementById('petType').value,
        breed: document.getElementById('petBreed').value,
        age: parseInt(document.getElementById('petAge').value) || null,
        gender: document.getElementById('petGender').value,
        weight: parseFloat(document.getElementById('petWeight').value) || null,
        behavior: document.getElementById('petBehavior').value
    };

    pets.push(newPet);
    renderPets();

    this.reset();
    hideAddPetForm();
});

document.getElementById('backBtn').addEventListener('click', goBack);

document.addEventListener('DOMContentLoaded', renderPets);