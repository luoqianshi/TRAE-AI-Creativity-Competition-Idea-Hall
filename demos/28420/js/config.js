// API配置
const API_CONFIG = {
    // 接口基础地址（使用Nginx代理时为空）
    baseURL: '',
    
    // 接口路径
    endpoints: {
        login: '/sys/login',         // 登录接口
        register: '/sys/user/add',   // 注册接口
        userInfo: '/sys/user/info',  // 用户信息接口
        addRecon: '/recon/add',      // 添加理智持仓
        visitLog: '/visit/log'       // 访问日志
    }
};

// 构建完整URL
function buildURL(endpoint) {
    return `${API_CONFIG.baseURL}${endpoint}`;
}
