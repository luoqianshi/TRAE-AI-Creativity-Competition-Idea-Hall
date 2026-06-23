<template>
  <div class="page admins-page">
    <div class="action-bar">
      <van-button type="primary" icon="plus" @click="showAddAdmin = true">
        新增管理员
      </van-button>
    </div>

    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="admin-list">
          <van-cell
            v-for="admin in admins"
            :key="admin.id"
            :title="admin.name"
            :label="admin.phone"
            center
          >
            <template #icon>
              <van-icon name="user-circle-o" size="40" color="#1989fa" />
            </template>
            <template #right-icon>
              <van-tag :type="admin.role === 'SuperAdmin' ? 'danger' : 'primary'" plain>
                {{ admin.role === 'SuperAdmin' ? '超级管理员' : '财务老师' }}
              </van-tag>
            </template>
            <template #label>
              <div class="admin-info">
                <div>{{ admin.phone }}</div>
                <div class="login-time" v-if="admin.last_login_at">
                  最后登录: {{ formatDate(admin.last_login_at, 'YYYY-MM-DD HH:mm') }}
                </div>
              </div>
            </template>
          </van-cell>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 新增管理员弹窗 -->
    <van-popup
      v-model:show="showAddAdmin"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <div class="popup-content">
        <h3 class="popup-title">新增管理员</h3>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.name"
              name="name"
              label="姓名"
              placeholder="请输入姓名"
              :rules="[{ required: true, message: '请输入姓名' }]"
            />
            <van-field
              v-model="form.phone"
              name="phone"
              label="手机号"
              placeholder="请输入手机号"
              :rules="[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
              ]"
              type="tel"
              maxlength="11"
            />
            <van-field
              v-model="form.password"
              type="password"
              name="password"
              label="初始密码"
              placeholder="请输入初始密码"
              :rules="[{ required: true, message: '请输入初始密码' }]"
            />
            <van-field
              v-model="form.role"
              is-link
              readonly
              name="role"
              label="角色"
              placeholder="请选择角色"
              @click="showRolePicker = true"
            />
          </van-cell-group>
          <div class="form-actions">
            <van-button @click="showAddAdmin = false">取消</van-button>
            <van-button type="primary" native-type="submit" :loading="loading">
              确定
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 角色选择器 -->
    <van-action-sheet
      v-model:show="showRolePicker"
      :actions="roleOptions"
      title="选择角色"
      @select="onRoleSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { adminApi } from '@/api'
import type { Admin } from '@/types'
import { formatDate, validatePhone, validatePassword } from '@/utils'

const admins = ref<Admin[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)

const showAddAdmin = ref(false)
const showRolePicker = ref(false)

const form = reactive({
  name: '',
  phone: '',
  password: '',
  role: 'Admin'
})

// 仅允许创建 Admin 或 Viewer，不允许创建 SuperAdmin
const roleOptions = [
  { name: '财务老师', value: 'Admin' },
  { name: '查看者', value: 'Viewer' }
]

const loadData = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    finished.value = false
    admins.value = []
  }

  try {
    const res = await adminApi.getAll()
    if (res.code === 200) {
      admins.value = res.data
      finished.value = true
    }
  } catch (error) {
    console.error('加载管理员列表失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onLoad = () => {
  loadData()
}

const onRefresh = () => {
  loadData(true)
}

const onSubmit = async () => {
  if (!validatePhone(form.phone)) {
    showToast('手机号格式不正确')
    return
  }
  if (!validatePassword(form.password)) {
    showToast('密码至少6位')
    return
  }

  loading.value = true
  try {
    const payload = {
      ...form,
      role: form.role as 'Admin' | 'SuperAdmin'
    }
    const res = await adminApi.create(payload)
    if (res.code === 200) {
      showToast('新增成功')
      showAddAdmin.value = false
      Object.assign(form, {
        name: '',
        phone: '',
        password: '',
        role: 'Admin'
      })
      await loadData(true)
    } else {
      showToast(res.message || '新增失败')
    }
  } catch (error) {
    showToast('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const onRoleSelect = ({ value }: any) => {
  form.role = value
  showRolePicker.value = false
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.admins-page {
  padding-bottom: 70px;
}

.action-bar {
  padding: 12px;
  background: #fff;
  margin-bottom: 12px;
}

.admin-list {
  background: #fff;
}

.admin-info .login-time {
  font-size: 12px;
  color: #969799;
  margin-top: 4px;
}

.popup-content {
  padding: 20px;
}

.popup-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 20px;
  text-align: center;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.form-actions .van-button {
  flex: 1;
}
</style>
