document.addEventListener('DOMContentLoaded', function() {
    initScheduleTabs();
    initNutritionCalculator();
    initLightbox();
    initForms();
});

function initScheduleTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSchedule(type) {
    const weekday = document.getElementById('weekday-schedule');
    const weekend = document.getElementById('weekend-schedule');
    
    if (type === 'weekday') {
        weekday.classList.remove('hidden');
        weekend.classList.add('hidden');
    } else {
        weekday.classList.add('hidden');
        weekend.classList.remove('hidden');
    }
}

function initNutritionCalculator() {
    const form = document.getElementById('calcForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const gender = form.gender.value;
            const age = parseInt(form.age.value);
            const height = parseInt(form.height.value);
            const weight = parseInt(form.weight.value);
            const activity = parseFloat(form.activity.value);
            
            let bmr;
            if (gender === 'male') {
                bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            } else {
                bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            }
            
            const tdee = Math.round(bmr * activity);
            
            document.getElementById('result').innerHTML = `
                <p style="font-size: 18px; margin-bottom: 10px;">您的每日热量需求</p>
                <p style="font-size: 36px; font-weight: bold; color: #4CAF50;">${tdee} 千卡/天</p>
                <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    减脂：每日摄入 ${Math.round(tdee - 500)} 千卡<br>
                    增肌：每日摄入 ${Math.round(tdee + 250)} 千卡
                </p>
            `;
        });
    }
}

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const caption = document.getElementById('caption');
    
    window.openLightbox = function(element) {
        lightbox.style.display = 'block';
        lightboxImg.src = element.querySelector('img').src;
        caption.innerHTML = element.querySelector('.gallery-overlay span').innerHTML;
        document.body.style.overflow = 'hidden';
    }
    
    window.closeLightbox = function() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    if (lightbox) {
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.style.display === 'block') {
                closeLightbox();
            }
        });
    }
}

function initForms() {
    const registerForm = document.getElementById('registerForm');
    const contactForm = document.getElementById('contactForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;
            
            if (password !== confirmPassword) {
                alert('两次输入的密码不一致！');
                return;
            }
            
            alert('注册成功！感谢您加入FitLife！');
            registerForm.reset();
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('留言已发送！我们会尽快与您联系！');
            contactForm.reset();
        });
    }
}

const bookButtons = document.querySelectorAll('.book-btn');
bookButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        alert('课程预约成功！请准时到达健身房。');
    });
});

const joinButtons = document.querySelectorAll('.join-btn');
joinButtons.forEach(btn => {
    btn.addEventListener('click', function() {
        alert('正在跳转到支付页面...');
    });
});