/**
 * api.js - API调用封装模块
 * 使用Fetch API封装HTTP请求，支持Token管理、错误处理、请求拦截器
 */

const API = (() => {
    'use strict';

    const BASE_URL = '/api';
    let _token = null;
    const _interceptors = {
        request: [],
        response: []
    };

    // ============================================
    // Token 管理
    // ============================================

    /**
     * 获取存储的Token
     * @returns {string|null}
     */
    function getToken() {
        if (_token) return _token;
        _token = Utils.Storage.get('auth_token');
        return _token;
    }

    /**
     * 设置Token
     * @param {string} token
     */
    function setToken(token) {
        _token = token;
        Utils.Storage.set('auth_token', token);
    }

    /**
     * 清除Token
     */
    function clearToken() {
        _token = null;
        Utils.Storage.remove('auth_token');
    }

    /**
     * 检查是否已登录
     * @returns {boolean}
     */
    function isAuthenticated() {
        return !!getToken();
    }

    // ============================================
    // 拦截器
    // ============================================

    /**
     * 添加请求拦截器
     * @param {Function} fn - (config) => config
     */
    function addRequestInterceptor(fn) {
        _interceptors.request.push(fn);
    }

    /**
     * 添加响应拦截器
     * @param {Function} fn - (response) => response
     */
    function addResponseInterceptor(fn) {
        _interceptors.response.push(fn);
    }

    // ============================================
    // 核心请求方法
    // ============================================

    /**
     * 发送HTTP请求
     * @param {string} url - 请求地址（相对或绝对）
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>}
     */
    async function request(url, options = {}) {
        let config = {
            method: 'GET',
            headers: {},
            ...options
        };

        // 构建完整URL
        if (!url.startsWith('http')) {
            config.url = `${BASE_URL}${url}`;
        } else {
            config.url = url;
        }

        // 自动携带Token
        const token = getToken();
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // 设置默认Content-Type
        if (!config.headers['Content-Type'] && !(config.body instanceof FormData)) {
            config.headers['Content-Type'] = 'application/json';
        }

        // 如果是FormData，删除Content-Type让浏览器自动设置boundary
        if (config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        // 执行请求拦截器
        for (const interceptor of _interceptors.request) {
            config = await interceptor(config);
        }

        const { url: requestUrl, ...fetchOptions } = config;

        try {
            const response = await fetch(requestUrl, fetchOptions);

            // 执行响应拦截器
            let result = response;
            for (const interceptor of _interceptors.response) {
                result = await interceptor(result);
            }

            // 处理HTTP错误状态码
            if (!response.ok) {
                const error = await handleErrorResponse(response);
                throw error;
            }

            // 解析响应体
            const contentType = response.headers.get('Content-Type') || '';
            if (contentType.includes('application/json')) {
                return await response.json();
            }
            return await response.text();

        } catch (error) {
            // 处理网络错误
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw {
                    code: 'NETWORK_ERROR',
                    message: '网络连接失败，请检查网络设置',
                    original: error
                };
            }
            throw error;
        }
    }

    /**
     * 处理错误响应
     * @param {Response} response
     * @returns {Object}
     */
    async function handleErrorResponse(response) {
        let errorData = {};
        try {
            errorData = await response.json();
        } catch {
            errorData = { message: response.statusText };
        }

        const error = {
            code: response.status,
            message: errorData.message || errorData.error || '请求失败',
            data: errorData
        };

        // 401 未授权 - 清除Token并跳转登录
        if (response.status === 401) {
            clearToken();
            if (window.location.pathname !== '/login') {
                Utils.showToast('登录已过期，请重新登录', 'warning');
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 1500);
            }
        }

        // 403 禁止访问
        if (response.status === 403) {
            Utils.showToast('没有权限执行此操作', 'error');
        }

        // 422 验证错误
        if (response.status === 422 && errorData.errors) {
            error.validationErrors = errorData.errors;
        }

        return error;
    }

    // ============================================
    // 快捷请求方法
    // ============================================

    /**
     * GET 请求
     * @param {string} url
     * @param {Object} params - 查询参数
     * @returns {Promise<Object>}
     */
    function get(url, params = {}) {
        const queryString = buildQueryString(params);
        const fullUrl = queryString ? `${url}?${queryString}` : url;
        return request(fullUrl, { method: 'GET' });
    }

    /**
     * POST 请求
     * @param {string} url
     * @param {Object|FormData} data
     * @returns {Promise<Object>}
     */
    function post(url, data = {}) {
        const isFormData = data instanceof FormData;
        return request(url, {
            method: 'POST',
            body: isFormData ? data : JSON.stringify(data)
        });
    }

    /**
     * PUT 请求
     * @param {string} url
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    function put(url, data = {}) {
        return request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE 请求
     * @param {string} url
     * @returns {Promise<Object>}
     */
    function del(url) {
        return request(url, { method: 'DELETE' });
    }

    /**
     * 上传文件
     * @param {string} url
     * @param {FormData} formData
     * @param {Function} onProgress - 进度回调
     * @returns {Promise<Object>}
     */
    function upload(url, formData, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${BASE_URL}${url}`);
            xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress({
                        loaded: e.loaded,
                        total: e.total,
                        percent: Math.round((e.loaded / e.total) * 100)
                    });
                }
            });

            xhr.addEventListener('load', () => {
                try {
                    const data = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(data);
                    } else {
                        reject({ code: xhr.status, message: data.message || '上传失败' });
                    }
                } catch {
                    reject({ code: xhr.status, message: '响应解析失败' });
                }
            });

            xhr.addEventListener('error', () => {
                reject({ code: 'NETWORK_ERROR', message: '网络错误' });
            });

            xhr.send(formData);
        });
    }

    // ============================================
    // 辅助方法
    // ============================================

    /**
     * 构建查询字符串
     * @param {Object} params
     * @returns {string}
     */
    function buildQueryString(params) {
        const searchParams = new URLSearchParams();
        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        }
        return searchParams.toString();
    }

    // ============================================
    // API 接口定义
    // ============================================

    const Auth = {
        login: (data) => post('/auth/login', data),
        register: (data) => post('/auth/register', data),
        logout: () => post('/auth/logout'),
        profile: () => get('/auth/profile'),
        updateProfile: (data) => put('/auth/profile', data),
        changePassword: (data) => post('/auth/change-password', data)
    };

    const Projects = {
        list: (params) => get('/projects', params),
        detail: (id) => get(`/projects/${id}`),
        create: (data) => post('/projects', data),
        update: (id, data) => put(`/projects/${id}`, data),
        delete: (id) => del(`/projects/${id}`),
        search: (params) => get('/projects/search', params),
        favorite: (id) => post(`/projects/${id}/favorite`),
        unfavorite: (id) => del(`/projects/${id}/favorite`),
        files: (id) => get(`/projects/${id}/files`),
        uploadFile: (id, formData, onProgress) => upload(`/projects/${id}/files`, formData, onProgress)
    };

    const Components = {
        list: (params) => get('/components', params),
        detail: (id) => get(`/components/${id}`),
        create: (data) => post('/components', data),
        update: (id, data) => put(`/components/${id}`, data),
        delete: (id) => del(`/components/${id}`),
        search: (params) => get('/components/search', params),
        categories: () => get('/components/categories'),
        libraries: () => get('/components/libraries')
    };

    const Discussions = {
        posts: (params) => get('/discussions', params),
        postDetail: (id) => get(`/discussions/${id}`),
        createPost: (data) => post('/discussions', data),
        updatePost: (id, data) => put(`/discussions/${id}`, data),
        deletePost: (id) => del(`/discussions/${id}`),
        comments: (postId, params) => get(`/discussions/${postId}/comments`, params),
        addComment: (postId, data) => post(`/discussions/${postId}/comments`, data),
        like: (id) => post(`/discussions/${id}/like`),
        unlike: (id) => del(`/discussions/${id}/like`),
        categories: () => get('/discussions/categories')
    };

    // ============================================
    // 公共API
    // ============================================

    return {
        request,
        get,
        post,
        put,
        del,
        upload,
        getToken,
        setToken,
        clearToken,
        isAuthenticated,
        addRequestInterceptor,
        addResponseInterceptor,
        Auth,
        Projects,
        Components,
        Discussions
    };
})();

if (typeof window !== 'undefined') {
    window.API = API;
}
