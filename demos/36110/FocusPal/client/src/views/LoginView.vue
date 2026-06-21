<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const showPassword = ref(false)

async function handleLogin() {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const data = await response.json()
    if (data.success) {
      authStore.setAuth(data.data)
      router.push('/')
    } else {
      alert(data.message || '登录失败')
    }
  } catch (error) {
    alert('登录失败，请检查服务器是否启动')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="bg-gradient"></div>
    <div class="login-card">
      <div class="login-header">
        <h1 class="logo">FocusPal</h1>
        <p class="subtitle">AI 学习监督官</p>
      </div>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>邮箱</label>
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="请输入邮箱"
            required
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <div class="password-input">
            <input 
              v-model="form.password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="请输入密码"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="login-footer">
        还没有账号？ <router-link to="/register">立即注册</router-link>
      </div>
      <div class="trae-badge">
        <span>Powered by TRAE</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(circle at 20% 80%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
    var(--bg-primary);
}

.login-card {
  position: relative;
  width: 400px;
  padding: 40px;
  background: rgba(26, 31, 53, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-family: 'Orbitron', sans-serif;
  font-size: 36px;
  font-weight: 700;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: 8px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-group input {
  padding: 14px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.password-input {
  position: relative;
}

.password-input input {
  width: 100%;
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}

.btn-primary {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  font-size: 14px;
  color: var(--text-muted);
}

.login-footer a {
  color: var(--accent-primary);
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.trae-badge {
  position: absolute;
  bottom: 16px;
  right: 16px;
  padding: 6px 12px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(34, 211, 238, 0.2) 100%);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 20px;
  font-size: 11px;
  color: var(--accent-secondary);
  font-family: 'Orbitron', sans-serif;
  letter-spacing: 1px;
}
</style>
