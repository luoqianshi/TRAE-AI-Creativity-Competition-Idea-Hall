<template>
  <div class="form-container">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.category"
          is-link
          readonly
          name="category"
          label="类目"
          placeholder="请选择类目"
          @click="showCategoryPicker = true"
        />
        <van-action-sheet
          v-model:show="showCategoryPicker"
          :actions="categoryActions"
          title="选择类目"
          @select="onCategorySelect"
        />

        <van-field
          v-model="form.amount"
          name="amount"
          label="追加金额"
          placeholder="请输入金额"
          type="digit"
          :rules="[{ required: true, message: '请输入金额' }]"
        />
      </van-cell-group>

      <div class="form-actions">
        <van-button @click="$emit('cancel')">取消</van-button>
        <van-button type="primary" native-type="submit" :loading="loading">
          确定
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { showToast } from 'vant'
import { useAppStore } from '@/stores/app'
import { expenseApi } from '@/api'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const appStore = useAppStore()

const form = reactive({
  category: '',
  amount: undefined
})

const loading = ref(false)
const showCategoryPicker = ref(false)

const categoryActions = computed(() => {
  return appStore.categories.map(cat => ({
    name: cat.name,
    value: cat.name
  }))
})

const onCategorySelect = ({ value }: any) => {
  form.category = value
  showCategoryPicker.value = false
}

const onSubmit = async () => {
  if (!form.category || !form.amount) {
    showToast('请填写完整信息')
    return
  }

  if (Number(form.amount) <= 0) {
    showToast('金额必须大于0')
    return
  }

  loading.value = true
  try {
    const res = await expenseApi.addToCategory({
      category: form.category,
      amount: Number(form.amount)
    })

    if (res.code === 200) {
      showToast('追加成功')
      emit('success')
    } else {
      showToast(res.message || '追加失败')
    }
  } catch (error) {
    showToast('网络错误，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.form-container {
  padding: 20px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  padding: 20px 16px;
  margin-top: 20px;
}

.form-actions .van-button {
  flex: 1;
}
</style>
