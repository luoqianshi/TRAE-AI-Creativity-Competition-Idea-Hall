<template>
  <div class="page expenses-page">
    <!-- 筛选栏 -->
    <van-cell-group inset class="filter-bar">
      <van-field
        v-model="selectedOrgName"
        is-link
        readonly
        label="机构"
        placeholder="全部"
        @click="showOrgPicker = true"
      />
      <van-field
        v-model="selectedClassName"
        is-link
        readonly
        label="班级"
        placeholder="全部"
        @click="showClassPicker = true"
      />
      <van-field
        v-model="selectedStatus"
        is-link
        readonly
        label="状态"
        placeholder="全部"
        @click="showStatusPicker = true"
      />
    </van-cell-group>

    <!-- 操作按钮 -->
    <div class="action-bar" v-if="authStore.isAdmin">
      <van-button type="primary" size="small" icon="plus" @click="showAddExpense = true">
        新增费用
      </van-button>
      <van-button type="success" size="small" icon="arrow-up" @click="showAddToCategory = true">
        追加金额
      </van-button>
    </div>

    <!-- 费用列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div class="expense-list">
          <van-card
            v-for="expense in expenses"
            :key="expense.id"
            :desc="`${expense.handler} · ${formatDate(expense.date)}`"
            :title="expense.category"
            :thumb="getCategoryThumb(expense.category)"
          >
            <template #tags>
              <van-tag :color="getStatusColor(expense.status)" plain>
                {{ expense.status }}
              </van-tag>
              <van-tag v-if="expense.class_id" type="primary" plain>
                {{ getClassName(expense.class_id) }}
              </van-tag>
            </template>
            <template #price>
              <span class="amount" :style="{ color: getStatusColor(expense.status) }">
                {{ formatAmount(expense.amount) }}
              </span>
            </template>
            <template #footer>
              <div class="card-actions" v-if="authStore.isAdmin">
                <van-button size="mini" type="primary" plain @click="editExpense(expense)">
                  编辑
                </van-button>
                <van-button size="mini" type="danger" plain @click="deleteExpense(expense.id)">
                  删除
                </van-button>
              </div>
            </template>
          </van-card>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 新增费用弹窗 -->
    <van-popup
      v-model:show="showAddExpense"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <AddExpenseForm
        :expense="editingExpense"
        @success="onExpenseSaved"
        @cancel="showAddExpense = false"
      />
    </van-popup>

    <!-- 追加金额弹窗 -->
    <van-popup
      v-model:show="showAddToCategory"
      position="bottom"
      round
      :style="{ height: '60%' }"
    >
      <AddToCategoryForm @success="onAddToCategory" @cancel="showAddToCategory = false" />
    </van-popup>

    <!-- 机构选择器 -->
    <van-action-sheet
      v-model:show="showOrgPicker"
      :actions="orgActions"
      title="选择机构"
      @select="onOrgSelect"
    />

    <!-- 班级选择器 -->
    <van-action-sheet
      v-model:show="showClassPicker"
      :actions="classActions"
      title="选择班级"
      @select="onClassSelect"
    />

    <!-- 状态选择器 -->
    <van-action-sheet
      v-model:show="showStatusPicker"
      :actions="statusActions"
      title="选择状态"
      @select="onStatusSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { showConfirmDialog, showToast } from 'vant'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { expenseApi } from '@/api'
import type { Expense } from '@/types'
import { formatDate, formatAmount, getCategoryColor, getStatusColor } from '@/utils'
import AddExpenseForm from '@/components/AddExpenseForm.vue'
import AddToCategoryForm from '@/components/AddToCategoryForm.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const expenses = ref<Expense[]>([])
const loading = ref(false)
const finished = ref(false)
const refreshing = ref(false)
const page = ref(1)
const pageSize = 20

const showAddExpense = ref(false)
const editingExpense = ref<Expense | null>(null)
const showAddToCategory = ref(false)
const showOrgPicker = ref(false)
const showClassPicker = ref(false)
const showStatusPicker = ref(false)

const selectedStatus = ref('')

const selectedOrgName = computed(() => {
  if (!appStore.selectedOrgId) return ''
  const org = appStore.organizations.find(o => o.id === appStore.selectedOrgId)
  return org?.name || ''
})

const selectedClassName = computed(() => {
  if (!appStore.selectedClassId) return ''
  const cls = appStore.classes.find(c => c.id === appStore.selectedClassId)
  return cls?.name || ''
})

const orgActions = computed(() => {
  const actions = appStore.organizations.map(org => ({
    name: org.name,
    value: org.id as number
  }))
  actions.unshift({ name: '全部', value: undefined as unknown as number })
  return actions
})

const classActions = computed(() => {
  const base = appStore.selectedOrgId
    ? appStore.getClassesByOrg(appStore.selectedOrgId)
    : appStore.classes
  const actions = base.map(cls => ({
    name: cls.name,
    value: cls.id as number
  }))
  actions.unshift({ name: '全部', value: undefined as unknown as number })
  return actions
})

const statusActions = [
  { name: '全部', value: '' },
  { name: '待审核', value: '待审核' },
  { name: '进行中', value: '进行中' },
  { name: '已完成', value: '已完成' }
]

const getClassName = (classId: number) => {
  const cls = appStore.classes.find(c => c.id === classId)
  return cls?.name || ''
}

const getCategoryThumb = (category: string) => {
  const colors = getCategoryColor(category)
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="${colors}"/><text x="50%" y="50%" font-size="20" fill="white" text-anchor="middle" dy=".3em">${category[0]}</text></svg>`
}

const loadData = async (refresh = false) => {
  if (refresh) {
    page.value = 1
    finished.value = false
    expenses.value = []
  }

  try {
    const params: any = {
      page: page.value,
      page_size: pageSize
    }

    if (appStore.selectedOrgId) params.org_id = appStore.selectedOrgId
    if (appStore.selectedClassId) params.class_id = appStore.selectedClassId
    if (selectedStatus.value) params.status = selectedStatus.value

    const res = await expenseApi.getAll(params)
    if (res.code === 200) {
      const newData = res.data
      if (refresh) {
        expenses.value = newData
      } else {
        expenses.value.push(...newData)
      }
      finished.value = newData.length < pageSize
    }
  } catch (error) {
    console.error('加载费用列表失败:', error)
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

const onLoad = () => {
  page.value++
  loadData()
}

const onRefresh = () => {
  loadData(true)
}

const onExpenseSaved = () => {
  editingExpense.value = null
  showAddExpense.value = false
  loadData(true)
}

const onAddToCategory = () => {
  showAddToCategory.value = false
  loadData(true)
}

const editExpense = (expense: Expense) => {
  editingExpense.value = expense
  showAddExpense.value = true
}

const deleteExpense = async (id: number) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条费用记录吗？'
    })

    const res = await expenseApi.delete(id)
    if (res.code === 200) {
      showToast('删除成功')
      loadData(true)
    } else {
      showToast(res.message || '删除失败')
    }
  } catch (error) {
    // 用户取消
  }
}

const onOrgSelect = ({ value }: any) => {
  appStore.selectOrg(value)
  showOrgPicker.value = false
}

const onClassSelect = ({ value }: any) => {
  appStore.selectClass(value)
  showClassPicker.value = false
}

const onStatusSelect = ({ value }: any) => {
  selectedStatus.value = value
  showStatusPicker.value = false
}

watch(
  () => [appStore.selectedOrgId, appStore.selectedClassId, selectedStatus.value],
  () => {
    loadData(true)
  }
)

onMounted(async () => {
  await appStore.initData()
  await loadData(true)
})
</script>

<style scoped>
.expenses-page {
  padding-bottom: 70px;
}

.filter-bar {
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.action-bar {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #fff;
  margin: 0 12px 12px;
  border-radius: 8px;
}

.expense-list {
  padding: 0 12px;
}

.expense-list .van-card {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.expense-list .van-card__content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.expense-list .amount {
  font-size: 16px;
  font-weight: 600;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
</style>
