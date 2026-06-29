document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    const errorMsg = document.createElement('div');
    errorMsg.className = 'error-msg';
    errorMsg.style.color = '#ff4d4f';
    errorMsg.style.marginTop = '10px';
    errorMsg.style.display = 'none';
    loginForm.appendChild(errorMsg);
    
    // 检查是否有保存的用户名
    const savedUsername = localStorage.getItem('savedUsername');
    if(savedUsername) {
        document.getElementById('username').value = savedUsername;
    }
    
    // 在登录表单提交事件中添加
    document.querySelector('.login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        this.submit(); // 改为直接提交表单，由PHP处理跳转
    });

    // 输入时隐藏错误信息
    document.getElementById('username').addEventListener('input', function() {
        errorMsg.style.display = 'none';
    });
    document.getElementById('password').addEventListener('input', function() {
        errorMsg.style.display = 'none';
    });
});