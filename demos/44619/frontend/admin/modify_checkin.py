import re

with open('checkin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Insert new today check-in main section before daily-check-section
new_section = '''        <!-- 今日入住主区域 -->
        <div class="today-checkin-main">
            <div class="today-checkin-header">
                <div class="today-checkin-title">
                    <i class="fas fa-door-open"></i> 今日入住
                </div>
                <div class="today-checkin-count-badge" id="todayCheckInCountMain">0</div>
            </div>
            <div class="today-checkin-subtitle">点击订单卡片直接办理入住</div>
            <div class="checkin-order-scroll">
                <div class="checkin-order-grid" id="todayCheckInGrid">
                    <div class="empty-list"><i class="fas fa-inbox"></i><span>暂无今日入住订单</span></div>
                </div>
            </div>
        </div>
        
        <!-- 今日入住/预离列表 -->'''

content = content.replace('        <!-- 今日入住/预离列表 -->', new_section)

# Step 2: Replace old daily-check-section with checkout only
old_pattern = r'        <!-- 今日入住/预离列表 -->\s+<div class="daily-check-section">\s+<div class="daily-check-row">\s+<div class="daily-check-card checkin-card">.*?</div>\s+<div class="daily-check-card checkout-card">(.*?)</div>\s+</div>\s+</div>'
new_pattern = '''        <!-- 今日预离列表 -->
        <div class="daily-check-section">
            <div class="daily-check-card checkout-card" style="max-width: 480px;">
                <div class="daily-check-header">
                    <div class="daily-check-icon" style="background: linear-gradient(135deg, #f87171, #ef4444);">
                        <i class="fas fa-sign-out-alt"></i>
                    </div>
                    <div>
                        <h3>今日预离</h3>
                        <span class="daily-check-count" id="todayCheckOutCount">0</span>
                    </div>
                </div>
                <div class="daily-check-list" id="todayCheckOutList">
                    <div class="empty-list"><i class="fas fa-inbox"></i><span>暂无退房订单</span></div>
                </div>
            </div>
        </div>'''

content = re.sub(old_pattern, new_pattern, content, flags=re.DOTALL)

with open('checkin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('HTML modifications done')
