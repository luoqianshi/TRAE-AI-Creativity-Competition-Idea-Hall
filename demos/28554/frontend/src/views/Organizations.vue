<template>
  <div class="page organizations-page">
    <div class="action-bar">
      <van-button type="primary" icon="plus" @click="showAddOrg = true">
        新增机构
      </van-button>
    </div>

    <div class="org-list">
      <van-cell-group inset>
        <van-cell
          v-for="org in organizations"
          :key="org.id"
          :title="org.name"
          :label="`创建于 ${formatDate(org.created_at)}`"
          center
        >
          <template #icon>
            <van-icon name="shop-o" size="40" color="#1989fa" />
          </template>
          <template #right-icon>
            <van-button
              size="mini"
              type="primary"
              plain
              @click="showAddClass(org.id)"
            >
              新增班级
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 新增机构弹窗 -->
    <van-popup
      v-model:show="showAddOrg"
      position="bottom"
      round
      :style="{ height: '40%' }"
    >
      <div class="popup-content">
        <h3 class="popup-title">新增机构</h3>
        <van-form @submit="onOrgSubmit">
          <van-cell-group inset>
            <van-field
              v-model="orgForm.name"
              name="name"
              label="机构名称"
              placeholder="请输入机构名称"
              :rules="[{ required: true, message: '请输入机构名称' }]"
            />
          </van-cell-group>
          <div class="form-actions">
            <van-button @click="showAddOrg = false">取消</van-button>
            <van-button type="primary" native-type="submit" :loading="orgLoading">
              确定
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 新增班级弹窗 -->
    <van-popup
      v-model:show="showAddClassPopup"
      position="bottom"
      round
      :style="{ height: '40%' }"
    >
      <div class="popup-content">
        <h3 class="popup-title">新增班级</h3>
        <van-form @submit="onClassSubmit">
          <van-cell-group inset>
            <van-field
              v-model="classForm.name"
              name="name"
              label="班级名称"
              placeholder="如：大班一班"
              :rules="[{ required: true, message: '请输入班级名称' }]"
            />
          </van-cell-group>
          <div class="form-actions">
            <van-button @click="showAddClassPopup = false">取消</van-button>
            <van-button type="primary" native-type="submit" :loading="classLoading">
              确定
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { showToast } from 'vant'
import { orgApi, classApi } from '@/api'
import { formatDate } from '@/utils'

const organizations = ref<any[]>([])
const orgLoading = ref(false)
const classLoading = ref(false)

const showAddOrg = ref(false)
const showAddClassPopup = ref(false)

const orgForm = reactive({
  name: ''
})

const classForm = reactive({
  org_id: 0,
  name: ''
})

const loadOrganizations = async () => {
  try {
    const res = await orgApi.getAll()
    if (res.code === 200) {
      organizations.value = res.data
    }
  } catch (error) {
    console.error('加载机构列表失败:', error)
  }
}

const onOrgSubmit = async () => {
  orgLoading.value = true
  try {
    const res = await orgApi.create(orgForm)
    if (res.code === 200) {
      showToast('新增成功')
      showAddOrg.value = false
      orgForm.name = ''
      await loadOrganizations()
    } else {
      showToast(res.message || '新增失败')
    }
  } catch (error) {
    showToast('网络错误，请重试')
  } finally {
    orgLoading.value = false
  }
}

const showAddClass = (orgId: number) => {
  classForm.org_id = orgId
  showAddClassPopup.value = true
}

const onClassSubmit = async () => {
  classLoading.value = true
  try {
    const res = await classApi.create(classForm)
    if (res.code === 200) {
      showToast('新增成功')
      showAddClassPopup.value = false
      classForm.name = ''
      await loadOrganizations()
    } else {
      showToast(res.message || '新增失败')
    }
  } catch (error) {
    showToast('网络错误，请重试')
  } finally {
    classLoading.value = false
  }
}

onMounted(() => {
  loadOrganizations()
})
</script>

<style scoped>
.organizations-page {
  padding-bottom: 70px;
}

.action-bar {
  padding: 12px;
  background: #fff;
  margin-bottom: 12px;
}

.org-list {
  padding: 0 12px;
}

.org-list .van-cell {
  margin-bottom: 12px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
