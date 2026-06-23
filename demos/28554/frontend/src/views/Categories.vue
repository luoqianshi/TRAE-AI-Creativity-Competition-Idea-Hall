<template>
  <div class="page categories-page">
    <div class="card">
      <div class="card-header">
        <span class="card-title">类目列表</span>
        <van-button
          v-if="authStore.isAdmin"
          type="primary"
          size="small"
          icon="plus"
          @click="showAddCategory = true"
        >
          新增类目
        </van-button>
      </div>

      <div v-if="categories.length === 0" class="empty-state">
        <van-empty description="暂无类目" />
      </div>
      <van-cell-group v-else inset class="category-list">
        <van-cell
          v-for="category in categories"
          :key="category.id"
          :title="category.name"
          center
        >
          <template #icon>
            <div
              class="category-color"
              :style="{ backgroundColor: category.color }"
            />
          </template>
          <template #right-icon>
            <van-button
              v-if="authStore.isAdmin"
              size="mini"
              type="danger"
              plain
              @click="deleteCategory(category.id, category.name)"
            >
              删除
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <!-- 新增类目弹窗 -->
    <van-popup
      v-model:show="showAddCategory"
      position="bottom"
      round
      :style="{ height: '50%' }"
    >
      <div class="popup-content">
        <h3 class="popup-title">新增类目</h3>
        <van-form @submit="onSubmit">
          <van-cell-group inset>
            <van-field
              v-model="form.name"
              name="name"
              label="类目名称"
              placeholder="请输入类目名称"
              :rules="[{ required: true, message: '请输入类目名称' }]"
            />
            <van-field
              v-model="form.color"
              name="color"
              label="颜色"
              placeholder="选择颜色"
              readonly
              @click="showColorPicker = true"
            >
              <template #right-icon>
                <div
                  class="color-preview"
                  :style="{ backgroundColor: form.color || '#1989fa' }"
                />
              </template>
            </van-field>
          </van-cell-group>
          <div class="form-actions">
            <van-button @click="showAddCategory = false">取消</van-button>
            <van-button type="primary" native-type="submit" :loading="loading">
              确定
            </van-button>
          </div>
        </van-form>
      </div>
    </van-popup>

    <!-- 颜色选择器 -->
    <van-action-sheet
      v-model:show="showColorPicker"
      :actions="colorOptions"
      title="选择颜色"
      @select="onColorSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { showToast, showConfirmDialog } from 'vant'
import { useAuthStore } from '@/stores/auth'
import { categoryApi } from '@/api'
import type { Category } from '@/types'

const authStore = useAuthStore()

const categories = ref<Category[]>([])
const showAddCategory = ref(false)
const showColorPicker = ref(false)
const loading = ref(false)

const form = reactive({
  name: '',
  color: '#1989fa'
})

const colorOptions = [
  { name: '蓝色', value: '#1989fa' },
  { name: '绿色', value: '#07c160' },
  { name: '橙色', value: '#ff976a' },
  { name: '红色', value: '#ee0a24' },
  { name: '紫色', value: '#6467f0' },
  { name: '灰色', value: '#969799' }
]

const loadCategories = async () => {
  try {
    const res = await categoryApi.getAll()
    if (res.code === 200) {
      categories.value = res.data
    }
  } catch (error) {
    console.error('加载类目列表失败:', error)
  }
}

const onSubmit = async () => {
  loading.value = true
  try {
    const res = await categoryApi.create(form)
    if (res.code === 200) {
      showToast('新增成功')
      showAddCategory.value = false
      form.name = ''
      form.color = '#1989fa'
      await loadCategories()
    } else {
      showToast(res.message || '新增失败')
    }
  } catch (error) {
    showToast('网络错误，请重试')
  } finally {
    loading.value = false
  }
}

const deleteCategory = async (id: number, name: string) => {
  try {
    await showConfirmDialog({
      title: '确认删除',
      message: `确定要删除类目"${name}"吗？`
    })

    const res = await categoryApi.delete(id)
    if (res.code === 200) {
      showToast('删除成功')
      await loadCategories()
    } else {
      showToast(res.message || '删除失败')
    }
  } catch (error) {
    // 用户取消或网络错误
  }
}

const onColorSelect = ({ value }: any) => {
  form.color = value
  showColorPicker.value = false
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.categories-page {
  padding-bottom: 70px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #323233;
}

.empty-state {
  padding: 40px 0;
}

.category-list {
  border-radius: 8px;
  overflow: hidden;
}

.category-color {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 12px;
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

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #ebedf0;
}
</style>
