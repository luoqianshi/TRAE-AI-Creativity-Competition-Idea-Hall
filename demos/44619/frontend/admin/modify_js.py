import re

with open('checkin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Step 1: Modify renderDailyOrders function
old_render = '''        function renderDailyOrders(checkinOrders, checkoutOrders) {
            dailyCheckinOrders = checkinOrders || [];
            document.getElementById('todayCheckInCount').textContent = checkinOrders.length;
            document.getElementById('todayCheckOutCount').textContent = checkoutOrders.length;
            
            const checkinList = document.getElementById('todayCheckInList');
            if (checkinOrders.length === 0) {
                checkinList.innerHTML = '<div class="empty-list"><i class="fas fa-inbox"></i><span>暂无入住订单</span></div>';
            } else {
                checkinList.innerHTML = checkinOrders.map(order => `
                    <div class="daily-check-item" onclick="handleOrderCheckIn(${order.booking_id})">
                        <div class="daily-check-info">
                            <div class="name"><i class="fas fa-user"></i> ${order.guest_name || '-'}</div>
                            <div class="detail">
                                <i class="fas fa-calendar"></i> ${order.check_in_date || ''} ~ ${order.check_out_date || ''}
                                <span style="margin: 0 8px;">|</span>
                                <i class="fas fa-moon"></i> ${order.total_nights || 1}晚
                            </div>
                        </div>
                        <div class="daily-check-room">${order.room_number || '未分配'}</div>
                    </div>
                `).join('');
            }
            
            const checkoutList = document.getElementById('todayCheckOutList');
            if (checkoutOrders.length === 0) {
                checkoutList.innerHTML = '<div class="empty-list"><i class="fas fa-inbox"></i><span>暂无退房订单</span></div>';
            } else {
                checkoutList.innerHTML = checkoutOrders.map(order => `
                    <div class="daily-check-item" onclick="handleOrderCheckOut(${order.booking_id})">
                        <div class="daily-check-info">
                            <div class="name"><i class="fas fa-user"></i> ${order.actual_guest_name || order.guest_name || '-'}</div>
                            <div class="detail">
                                <i class="fas fa-calendar"></i> ${order.check_in_date || ''} ~ ${order.check_out_date || ''}
                                <span style="margin: 0 8px;">|</span>
                                <i class="fas fa-moon"></i> ${order.total_nights || 1}晚
                            </div>
                        </div>
                        <div class="daily-check-room">${order.room_number || '-'}</div>
                    </div>
                `).join('');
            }
        }'''

new_render = '''        function renderDailyOrders(checkinOrders, checkoutOrders) {
            dailyCheckinOrders = checkinOrders || [];
            document.getElementById('todayCheckInCount').textContent = checkinOrders.length;
            document.getElementById('todayCheckInCountMain').textContent = checkinOrders.length;
            document.getElementById('todayCheckOutCount').textContent = checkoutOrders.length;
            
            // 渲染今日入住主区域 - 横向滚动卡片列表
            const checkinGrid = document.getElementById('todayCheckInGrid');
            if (checkinOrders.length === 0) {
                checkinGrid.innerHTML = '<div class="empty-list" style="min-width: auto; flex: 1;"><i class="fas fa-inbox"></i><span>暂无今日入住订单</span></div>';
            } else {
                checkinGrid.innerHTML = checkinOrders.map(order => {
                    const isAssigned = !!order.room_number;
                    return `
                        <div class="checkin-order-card ${isAssigned ? '' : 'unassigned'}" onclick="handleOrderCheckIn(${order.booking_id})">
                            <div class="checkin-order-status ${isAssigned ? 'assigned' : 'unassigned'}">
                                ${isAssigned ? '<i class="fas fa-check"></i> 已分配' : '<i class="fas fa-clock"></i> 待分配'}
                            </div>
                            <div class="checkin-order-guest">
                                <i class="fas fa-user"></i> ${order.guest_name || '-'}
                            </div>
                            <div class="checkin-order-room">
                                <i class="fas fa-bed room-icon"></i>
                                <span class="room-type">${order.room_type_name || order.room_type || '标准间'}</span>
                                <span class="room-number ${isAssigned ? '' : 'unassigned-text'}">${order.room_number || '未分配'}</span>
                            </div>
                            <div class="checkin-order-date">
                                <i class="fas fa-calendar-alt"></i>
                                <span>${order.check_in_date || ''} ~ ${order.check_out_date || ''}</span>
                            </div>
                            <div class="checkin-order-footer">
                                <div class="checkin-order-nights">
                                    <i class="fas fa-moon"></i> ${order.total_nights || 1}晚
                                </div>
                                <div class="checkin-order-amount">
                                    ¥${parseFloat(order.total_amount || 0).toFixed(0)}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
            
            // 渲染今日预离列表
            const checkoutList = document.getElementById('todayCheckOutList');
            if (checkoutOrders.length === 0) {
                checkoutList.innerHTML = '<div class="empty-list"><i class="fas fa-inbox"></i><span>暂无退房订单</span></div>';
            } else {
                checkoutList.innerHTML = checkoutOrders.map(order => `
                    <div class="daily-check-item" onclick="handleOrderCheckOut(${order.booking_id})">
                        <div class="daily-check-info">
                            <div class="name"><i class="fas fa-user"></i> ${order.actual_guest_name || order.guest_name || '-'}</div>
                            <div class="detail">
                                <i class="fas fa-calendar"></i> ${order.check_in_date || ''} ~ ${order.check_out_date || ''}
                                <span style="margin: 0 8px;">|</span>
                                <i class="fas fa-moon"></i> ${order.total_nights || 1}晚
                            </div>
                        </div>
                        <div class="daily-check-room">${order.room_number || '-'}</div>
                    </div>
                `).join('');
            }
        }'''

content = content.replace(old_render, new_render)

# Step 2: Modify handleOrderCheckIn function to support unassigned orders
old_handle = '''        function handleOrderCheckIn(bookingId) {
            const order = dailyCheckinOrders.find(o => o.booking_id === bookingId) || pendingOrders.find(o => o.booking_id === bookingId);
            if (!order) {
                showToast('订单信息不存在', 'error');
                return;
            }
            if (!order.room_number) {
                showToast('该订单尚未分配房间', 'error');
                return;
            }
            const room = roomData.find(r => r.room_number === order.room_number || r.name === order.room_number);
            if (!room) {
                showToast('未找到关联房间', 'error');
                return;
            }
            openCheckInModal(room);
            if (room.pendingOrders && room.pendingOrders.length > 0) {
                const targetOrder = room.pendingOrders.find(o => o.booking_id === bookingId);
                if (targetOrder) {
                    selectOrder(bookingId, room.room_id || room.id);
                }
            }
        }'''

new_handle = '''        function handleOrderCheckIn(bookingId) {
            const order = dailyCheckinOrders.find(o => o.booking_id === bookingId) || pendingOrders.find(o => o.booking_id === bookingId);
            if (!order) {
                showToast('订单信息不存在', 'error');
                return;
            }
            if (!order.room_number) {
                showToast('该订单尚未分配房间，请先在房间列表中分配房间', 'error');
                return;
            }
            const room = roomData.find(r => r.room_number === order.room_number || r.name === order.room_number);
            if (!room) {
                showToast('未找到关联房间', 'error');
                return;
            }
            openCheckInModal(room);
            if (room.pendingOrders && room.pendingOrders.length > 0) {
                const targetOrder = room.pendingOrders.find(o => o.booking_id === bookingId);
                if (targetOrder) {
                    selectOrder(bookingId, room.room_id || room.id);
                }
            }
        }'''

content = content.replace(old_handle, new_handle)

with open('checkin.html', 'w', encoding='utf-8') as f:
    f.write(content)

print('JS modifications done')