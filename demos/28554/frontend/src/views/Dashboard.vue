<template>
  <div class="page dashboard-page">
    <!-- 机构班级筛选 -->
    <van-cell-group inset class="filter-section">
      <van-field
        v-model="selectedOrgName"
        is-link
        readonly
        label="机构"
        placeholder="请选择机构"
        @click="showOrgPicker = true"
      />
      <van-field
        v-model="selectedClassName"
        is-link
        readonly
        label="班级"
        placeholder="请选择班级"
        @click="showClassPicker = true"
      />
      <van-button
        v-if="authStore.isAdmin"
        type="primary"
        size="small"
        @click="showAddExpense = true"
      >
        新增费用
      </van-button>
    </van-cell-group>

    <!-- 核心指标卡片 -->
    <div class="stats-cards">
      <van-grid :column-num="3" :border="false" class="stats-grid">
        <van-grid-item>
          <div class="stat-card">
            <div class="stat-icon collected">
              <van-icon name="balance-pay" size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatAmount(stats.total_collected) }}</div>
              <div class="stat-label">总收缴金额</div>
            </div>
          </div>
        </van-grid-item>

        <van-grid-item>
          <div class="stat-card">
            <div class="stat-icon expended">
              <van-icon name="cash-back" size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ formatAmount(stats.total_expended) }}</div>
              <div class="stat-label">已支出总额</div>
            </div>
          </div>
        </van-grid-item>

        <van-grid-item>
          <div class="stat-card">
            <div class="stat-icon balance" :class="{ negative: stats.balance < 0 }">
              <van-icon name="gold-coin" size="24" />
            </div>
            <div class="stat-info">
              <div class="stat-value" :class="{ negative: stats.balance < 0 }">
                {{ formatAmount(stats.balance) }}
              </div>
              <div class="stat-label">当前余额</div>
            </div>
          </div>
        </van-grid-item>
      </van-grid>
    </div>

    <!-- 快速操作 -->
    <van-cell-group inset class="quick-actions" v-if="authStore.isAdmin">
      <van-cell title="快速操作" />
      <van-grid :column-num="4" :border="false">
        <van-grid-item icon="plus" text="新增费用" @click="showAddExpense = true" />
        <van-grid-item icon="apps-o" text="类目管理" to="/categories" />
        <van-grid-item icon="shop-o" text="机构班级" to="/organizations" v-if="authStore.isSuperAdmin" />
        <van-grid-item icon="manager-o" text="管理员" to="/admins" v-if="authStore.isSuperAdmin" />
        <van-grid-item icon="records" text="操作日志" to="/logs" />
      </van-grid>
    </van-cell-group>

    <!-- 新增费用弹窗 -->
    <van-popup
      v-model:show="showAddExpense"
      position="bottom"
      round
      :style="{ height: '80%' }"
    >
      <AddExpenseForm @success="onExpenseAdded" @cancel="showAddExpense = false" />
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'
import { statsApi } from '@/api'
import type { OverviewStats } from '@/types'
import { formatAmount } from '@/utils'
import AddExpenseForm from '@/components/AddExpenseForm.vue'

const appStore = useAppStore()
const authStore = useAuthStore()

const stats = ref<OverviewStats>({
  total_collected: 0,
  total_expended: 0,
  balance: 0,
  categoryStats: [],
  statusStats: [],
  classStats: []
})

const showAddExpense = ref(false)
const showOrgPicker = ref(false)
const showClassPicker = ref(false)

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

const loadStats = async () => {
  try {
    const params: any = {}
    if (appStore.selectedOrgId) params.org_id = appStore.selectedOrgId
    if (appStore.selectedClassId) params.class_id = appStore.selectedClassId

    const res = await statsApi.getOverview(params)
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const onExpenseAdded = () => {
  showAddExpense.value = false
  loadStats()
}

const onOrgSelect = ({ value }: any) => {
  appStore.selectOrg(value)
  showOrgPicker.value = false
}

const onClassSelect = ({ value }: any) => {
  appStore.selectClass(value)
  showClassPicker.value = false
}

// 监听筛选条件变化
watch(
  () => [appStore.selectedOrgId, appStore.selectedClassId],
  () => {
    loadStats()
  }
)

onMounted(async () => {
  await appStore.initData()
  await loadStats()

  // 调试：控制台打印当前用户权限
  if (authStore.user) {
    const u = authStore.user as any
    console.log('[权限调试] 当前用户:', {
      角色: authStore.roleName(),
      角色列表: u.roles?.map((r: any) => r.name) ?? u.role ?? '无',
      权限列表: u.permissions ?? [],
      isSuperAdmin: authStore.isSuperAdmin,
      isAdmin: authStore.isAdmin
    })
  } else {
    console.log('[权限调试] 当前为未登录状态（Viewer/家长可查看面板）')
  }
})
</script>

<style scoped>
.dashboard-page {
  padding-bottom: 70px;
}

.filter-section {
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.filter-section .van-button {
  margin: 8px 16px;
}

.stats-cards {
  margin: 12px;
}

.stats-grid {
  background: transparent;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin: 4px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.stat-icon.collected {
  background: rgba(7, 193, 96, 0.1);
  color: #07c160;
}

.stat-icon.expended {
  background: rgba(255, 151, 106, 0.1);
  color: #ff976a;
}

.stat-icon.balance {
  background: rgba(25, 137, 250, 0.1);
  color: #1989fa;
}

.stat-icon.balance.negative {
  background: rgba(238, 10, 36, 0.1);
  color: #ee0a24;
}

.stat-info {
  text-align: center;
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #323233;
  margin-bottom: 4px;
}

.stat-value.negative {
  color: #ee0a24;
}

.stat-label {
  font-size: 12px;
  color: #969799;
}

.quick-actions {
  margin: 12px;
  border-radius: 8px;
  overflow: hidden;
}

.quick-actions .van-grid-item {
  padding: 12px 0;
}
</style>
