import re

with open(r'c:\Users\1\Documents\酒店预订管理系统\frontend\admin\checkin.html', 'r', encoding='utf-8') as f:
    content = f.read()

menu_html = '''
    <!-- 房间操作菜单 -->
    <div class="room-action-menu-overlay" id="roomActionMenuOverlay" onclick="closeRoomActionMenu()"></div>
    <div class="room-action-menu" id="roomActionMenu">
        <div class="room-action-menu-header">
            <i class="fas fa-door-open"></i>
            <span class="room-num" id="menuRoomNumber">房间</span>
        </div>
        <div class="room-action-menu-items" id="roomActionMenuItems">
            <!-- 菜单项将通过JS动态生成 -->
        </div>
    </div>
'''

content = content.replace('</body>', menu_html + '\n</body>')

with open(r'c:\Users\1\Documents\酒店预订管理系统\frontend\admin\checkin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('HTML structure added successfully')
