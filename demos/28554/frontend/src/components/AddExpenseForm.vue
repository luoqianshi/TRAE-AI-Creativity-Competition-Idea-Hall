<template>
  <div class="form-container">
    <van-form @submit="onSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.date"
          name="date"
          label="日期"
          placeholder="选择日期"
          readonly
          @click="showDatePicker = true"
        />
        <van-popup v-model:show="showDatePicker" position="bottom" round>
          <van-date-picker
            v-model="currentDate"
            @confirm="onDateConfirm"
            @cancel="showDatePicker = false"
          />
        </van-popup>

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
          label="金额"
          placeholder="请输入金额"
          type="digit"
          :rules="[{ required: true, message: '请输入金额' }]"
        />

        <van-field
          v-model="form.handler"
          name="handler"
          label="经手人"
          placeholder="请输入经手人"
          :rules="[{ required: true, message: '请输入经手人' }]"
        />

        <van-field
          v-model="selectedOrgName"
          is-link
          readonly
          label="机构"
          placeholder="请选择机构（可选）"
          @click="showOrgPicker = true"
        />
        <van-action-sheet
          v-model:show="showOrgPicker"
          :actions="orgActions"
          title="选择机构"
          @select="onOrgSelect"
        />

        <van-field
          v-model="selectedClassName"
          is-link
          readonly
          label="班级"
          placeholder="请选择班级（可选）"
          @click="showClassPicker = true"
        />
        <van-action-sheet
          v-model:show="showClassPicker"
          :actions="classActions"
          title="选择班级"
          @select="onClassSelect"
        />

        <van-field
          v-model="form.status"
          is-link
          readonly
          name="status"
          label="状态"
          placeholder="请选择状态"
          @click="showStatusPicker = true"
        />
        <van-action-sheet
          v-model:show="showStatusPicker"
          :actions="statusActions"
          title="选择状态"
          @select="onStatusSelect"
        />

        <van-field
          v-model="form.remark"
          name="remark"
          label="备注"
          placeholder="请输入备注（可选）"
          type="textarea"
          rows="2"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { showToast } from 'vant'
import { useAppStore } from '@/stores/app'
import { expenseApi } from '@/api'
import type { Expense } from '@/types'
import { formatDate as formatDateUtil } from '@/utils'

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const props = defineProps<{
  expense?: Expense | null
}>()

const appStore = useAppStore()

const form = reactive<Partial<Expense>>({
  date: formatDateUtil(new Date()),
  category: '',
  amount: undefined,
  handler: '',
  class_id: undefined,
  org_id: undefined,
  status: '待审核',
  remark: ''
})

const loading = ref(false)
const showDatePicker = ref(false)
const showCategoryPicker = ref(false)
const showOrgPicker = ref(false)
const showClassPicker = ref(false)
const showStatusPicker = ref(false)

const currentDate = ref([])

const selectedOrgName = computed(() => {
  if (!form.org_id) return ''
  const org = appStore.organizations.find(o => o.id === form.org_id)
  return org?.name || ''
})

const selectedClassName = computed(() => {
  if (!form.class_id) return ''
  const cls = appStore.classes.find(c => c.id === form.class_id)
  return cls?.name || ''
})

const categoryActions = computed(() => {
  return appStore.categories.map(cat => ({
    name: cat.name,
    value: cat.name
  }))
})

const orgActions = computed(() => {
  return appStore.organizations.map(org => ({
    name: org.name,
    value: org.id
  }))
})

const classActions = computed(() => {
  const base = form.org_id
    ? appStore.getClassesByOrg(form.org_id)
    : appStore.classes
  return base.map(cls => ({
    name: cls.name,
    value: cls.id
  }))
})

const statusActions = [
  { name: '待审核', value: '待审核' },
  { name: '进行中', value: '进行中' },
  { name: '已完成', value: '已完成' }
]

const loadData = async () => {
  await appStore.initData()
  if (props.expense) {
    Object.assign(form, props.expense)
  }
}

const onDateConfirm = ({ selectedValues }: any) => {
  const [year, month, day] = selectedValues
  form.date = `${year}-${month}-${day}`
  showDatePicker.value = false
}

const onCategorySelect = ({ value }: any) => {
  form.category = value
  showCategoryPicker.value = false
}

const onOrgSelect = ({ value }: any) => {
  form.org_id = value
  form.class_id = undefined
  showOrgPicker.value = false
}

const onClassSelect = ({ value }: any) => {
  form.class_id = value
  showClassPicker.value = false
}

const onStatusSelect = ({ value }: any) => {
  form.status = value
  showStatusPicker.value = false
}

const onSubmit = async () => {
  if (!form.category || !form.amount || !form.handler) {
    showToast('请填写必填字段')
    return
  }

  if (Number(form.amount) <= 0) {
    showToast('金额必须大于0')
    return
  }

  loading.value = true
  try {
    const payload: any = {
      date: form.date,
      category: form.category,
      amount: Number(form.amount),
      handler: form.handler,
      status: form.status,
      remark: form.remark || ''
    }

    if (form.class_id) payload.class_id = form.class_id
    if (form.org_id) payload.org_id = form.org_id

    if (props.expense?.id) {
      await expenseApi.update(props.expense.id, payload)
    } else {
      await expenseApi.create(payload)
    }

    showToast(props.expense ? '更新成功' : '新增成功')
    emit('success')
  } catch (error) {
    showToast('操作失败，请重试')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
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
