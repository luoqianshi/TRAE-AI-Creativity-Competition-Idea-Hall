<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { 
  User, Mail, Bell, Moon, Sun, Download, LogOut, 
  ChevronRight, Save, Camera
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const editForm = ref({
  nickname: '',
  email: '',
  avatar: ''
})

const preferences = ref({
  darkMode: true,
  notifications: {
    studyReminder: true,
    taskReminder: true,
    achievementAlert: true
  },
  studySettings: {
    defaultPomodoro: 25,
    breakDuration: 5,
    autoStartBreak: false
  }
})

const isSaving = ref(false)
const showConfirmLogout = ref(false)

function loadUserData() {
  if (authStore.user) {
    editForm.value = {
      nickname: authStore.user.nickname || '',
      email: authStore.user.email || '',
      avatar: authStore.user.avatar || ''
    }
  }
}

async function handleSaveProfile() {
  isSaving.value = true
  try {
    await authStore.updateProfile(editForm.value)
    alert('保存成功！')
  } catch (error) {
    alert('保存失败，请稍后重试')
  } finally {
    isSaving.value = false
  }
}

async function handleExportData() {
  try {
    const response = await fetch('http://localhost:3000/api/user/export', {
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    const data = await response.json()
    if (data.success) {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `focuspal-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    alert('导出失败，请稍后重试')
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}

onMounted(() => {
  loadUserData()
})
</script>

<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="page-title">个人中心</h1>
    </div>

    <div class="profile-content">
      <div class="profile-card avatar-card">
        <div class="avatar-section">
          <div class="avatar-wrapper">
            <div class="avatar">
              <img v-if="editForm.avatar" :src="editForm.avatar" alt="avatar" />
              <User v-else :size="48" />
            </div>
            <button class="avatar-edit">
              <Camera :size="18" />
            </button>
          </div>
          <div class="user-info">
            <h2 class="user-name">{{ authStore.user?.nickname || '用户' }}</h2>
            <p class="user-email">{{ authStore.user?.email }}</p>
            <div class="user-level">
              <span>Lv{{ authStore.user?.level || 1 }}</span>
              <span class="level-name">{{ ['新手学员', '自律达人', '学霸', '学神', '卷王之王'][authStore.user?.level - 1] || '新手学员' }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">基本信息</h3>
        <div class="settings-card">
          <div class="form-group">
            <label class="form-label">
              <User :size="16" />
              <span>昵称</span>
            </label>
            <input 
              v-model="editForm.nickname" 
              type="text" 
              class="form-input"
              placeholder="请输入昵称"
            />
          </div>
          <div class="form-group">
            <label class="form-label">
              <Mail :size="16" />
              <span>邮箱</span>
            </label>
            <input 
              v-model="editForm.email" 
              type="email" 
              class="form-input"
              placeholder="请输入邮箱"
            />
          </div>
          <button class="btn-save" @click="handleSaveProfile" :disabled="isSaving">
            <Save :size="18" />
            <span>{{ isSaving ? '保存中...' : '保存修改' }}</span>
          </button>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">偏好设置</h3>
        <div class="settings-card">
          <div class="setting-item">
            <div class="setting-info">
              <Moon v-if="preferences.darkMode" :size="20" />
              <Sun v-else :size="20" />
              <div class="setting-text">
                <span class="setting-name">深色模式</span>
                <span class="setting-desc">开启深色主题，减少眼睛疲劳</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="preferences.darkMode" />
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-divider"></div>

          <div class="notification-settings">
            <div class="notification-header">
              <Bell :size="20" />
              <span class="notification-title">通知设置</span>
            </div>
            <div class="notification-item">
              <span>学习提醒</span>
              <label class="toggle-switch small">
                <input type="checkbox" v-model="preferences.notifications.studyReminder" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="notification-item">
              <span>任务提醒</span>
              <label class="toggle-switch small">
                <input type="checkbox" v-model="preferences.notifications.taskReminder" />
                <span class="toggle-slider"></span>
              </label>
            </div>
            <div class="notification-item">
              <span>成就提示</span>
              <label class="toggle-switch small">
                <input type="checkbox" v-model="preferences.notifications.achievementAlert" />
                <span class="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">学习设置</h3>
        <div class="settings-card">
          <div class="form-group inline">
            <label class="form-label">默认番茄钟时长</label>
            <div class="input-with-unit">
              <input 
                v-model.number="preferences.studySettings.defaultPomodoro" 
                type="number" 
                min="1" 
                max="60"
                class="form-input small"
              />
              <span class="unit">分钟</span>
            </div>
          </div>
          <div class="form-group inline">
            <label class="form-label">休息时长</label>
            <div class="input-with-unit">
              <input 
                v-model.number="preferences.studySettings.breakDuration" 
                type="number" 
                min="1" 
                max="30"
                class="form-input small"
              />
              <span class="unit">分钟</span>
            </div>
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-text">
                <span class="setting-name">自动开始休息</span>
                <span class="setting-desc">番茄钟结束后自动开始休息</span>
              </div>
            </div>
            <label class="toggle-switch">
              <input type="checkbox" v-model="preferences.studySettings.autoStartBreak" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h3 class="section-title">数据管理</h3>
        <div class="settings-card">
          <button class="action-button" @click="handleExportData">
            <Download :size="18" />
            <span>导出学习数据</span>
            <ChevronRight :size="18" class="arrow" />
          </button>
        </div>
      </div>

      <div class="settings-section danger-zone">
        <h3 class="section-title">账户操作</h3>
        <div class="settings-card">
          <button class="action-button logout" @click="handleLogout">
            <LogOut :size="18" />
            <span>退出登录</span>
            <ChevronRight :size="18" class="arrow" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 700px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 28px;
  color: var(--text-primary);
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.avatar-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid var(--border-color);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-edit {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--accent-primary);
  border: 3px solid var(--bg-card);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-edit:hover {
  transform: scale(1.1);
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.user-name {
  font-family: 'Orbitron', sans-serif;
  font-size: 22px;
  color: var(--text-primary);
}

.user-email {
  font-size: 14px;
  color: var(--text-muted);
}

.user-level {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.user-level span:first-child {
  padding: 4px 12px;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: white;
}

.level-name {
  font-size: 13px;
  color: var(--text-secondary);
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  padding-left: 4px;
}

.settings-card {
  background: var(--bg-card);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group.inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.form-group.inline .form-label {
  margin-bottom: 0;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 15px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.form-input.small {
  width: 100px;
  padding: 10px 12px;
  text-align: center;
}

.input-with-unit {
  display: flex;
  align-items: center;
  gap: 10px;
}

.unit {
  font-size: 14px;
  color: var(--text-muted);
}

.btn-save {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #6366f1 0%, #22d3ee 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
}

.setting-info {
  display: flex;
  align-items: center;
  gap: 14px;
  color: var(--text-primary);
}

.setting-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.setting-name {
  font-size: 15px;
  font-weight: 500;
}

.setting-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.toggle-switch {
  position: relative;
  width: 52px;
  height: 28px;
}

.toggle-switch.small {
  width: 44px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-secondary);
  border-radius: 14px;
  transition: all 0.3s ease;
}

.toggle-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  left: 3px;
  bottom: 3px;
  background: white;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.toggle-switch.small .toggle-slider::before {
  width: 18px;
  height: 18px;
}

.toggle-switch input:checked + .toggle-slider {
  background: var(--accent-primary);
}

.toggle-switch input:checked + .toggle-slider::before {
  transform: translateX(24px);
}

.toggle-switch.small input:checked + .toggle-slider::before {
  transform: translateX(20px);
}

.setting-divider {
  height: 1px;
  background: var(--border-color);
  margin: 8px 0;
}

.notification-settings {
  padding-top: 4px;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.notification-title {
  font-size: 15px;
  font-weight: 500;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.action-button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 16px;
  background: var(--bg-secondary);
  border: none;
  border-radius: 10px;
  color: var(--text-primary);
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-button:hover {
  background: var(--bg-primary);
}

.action-button .arrow {
  margin-left: auto;
  color: var(--text-muted);
}

.action-button.logout {
  color: #ef4444;
}

.action-button.logout:hover {
  background: rgba(239, 68, 68, 0.1);
}

.danger-zone .section-title {
  color: #ef4444;
}
</style>
