document.addEventListener('DOMContentLoaded', function () {
    // === 预约表单：localStorage 自动填充 & 提交时保存 ===
    var form = document.getElementById('reserveForm');
    if (form) {
        var saved = {};
        try { saved = JSON.parse(localStorage.getItem('reserve_info') || '{}'); } catch(e) {}
        var fields = form.querySelectorAll('[data-autofill]');
        fields.forEach(function(el) {
            var key = el.getAttribute('data-autofill');
            if (saved[key] && !el.value) {
                el.value = saved[key];
            }
        });

        form.addEventListener('submit', function() {
            var data = {};
            fields.forEach(function(el) {
                var key = el.getAttribute('data-autofill');
                data[key] = el.value;
            });
            localStorage.setItem('reserve_info', JSON.stringify(data));
        });
    }

    // === 预约成功后保存预约ID到 localStorage ===
    var newIdEl = document.getElementById('newReserveId');
    if (newIdEl && newIdEl.value) {
        try {
            var ids = JSON.parse(localStorage.getItem('my_reserve_ids') || '[]');
            var newId = parseInt(newIdEl.value, 10);
            if (newId > 0 && ids.indexOf(newId) === -1) {
                ids.push(newId);
                localStorage.setItem('my_reserve_ids', JSON.stringify(ids));
            }
        } catch(e) {}
    }

    // === 门上签到表单：同样保存工号 ===
    var doorForm = document.querySelector('.door-form');
    if (doorForm) {
        var empInput = doorForm.querySelector('input[name="employee_id"]');
        if (empInput) {
            try {
                var saved = JSON.parse(localStorage.getItem('reserve_info') || '{}');
                if (saved.employee_id && !empInput.value) {
                    empInput.value = saved.employee_id;
                }
            } catch(e) {}
        }
    }

    // === 时段页面自动刷新（60秒） ===
    if (location.pathname.indexOf('resource.php') > -1) {
        setTimeout(function () { location.reload(); }, 60000);
    }
});
