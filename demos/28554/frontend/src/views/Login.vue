<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>幼儿园财务管理系统</h1>
        <p>幼儿园班级费用记账管理系统</p>
      </div>

      <van-form @submit="onSubmit">
        <van-cell-group inset>
          <van-field
            v-model="form.phone"
            name="phone"
            label="手机号"
            placeholder="请输入手机号"
            :rules="[{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }]"
            type="tel"
            maxlength="11"
          />
          <van-field
            v-model="form.password"
            type="password"
            name="password"
            label="密码"
            placeholder="请输入密码"
            :rules="passwordRule"
          />
        </van-cell-group>

        <div class="form-actions">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            :loading="loading"
            loading-text="登录中..."
          >
            登录
          </van-button>
        </div>
      </van-form>

      <div class="login-footer">
        <p>家长用户可免登录查看费用信息</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { validatePassword } from '@/utils'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  phone: '',
  password: ''
})

const loading = ref(false)

const passwordRule = [
  { required: true, message: '请输入密码' },
  { validator: validatePassword, message: '密码至少6位' }
] as any[]

const onSubmit = async () => {
  loading.value = true
  try {
    const result = await authStore.login(form.phone, form.password)
    if (result.success) {
      showToast({
        type: 'success',
        message: '登录成功'
      })
      router.push('/')
    } else {
      showToast({
        type: 'fail',
        message: result.message || '登录失败'
      })
    }
  } catch (error) {
    showToast({
      type: 'fail',
      message: '网络错误，请重试'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 8px;
}

.login-header p {
  font-size: 14px;
  color: #969799;
}

.form-actions {
  margin-top: 24px;
}

.login-footer {
  margin-top: 24px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: #969799;
}
</style>
