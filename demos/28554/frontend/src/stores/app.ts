import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Organization, Class, Category } from '@/types'
import { orgApi, classApi, categoryApi } from '@/api'

export const useAppStore = defineStore('app', () => {
  const organizations = ref<Organization[]>([])
  const classes = ref<Class[]>([])
  const categories = ref<Category[]>([])

  const selectedOrgId = ref<number | null>(null)
  const selectedClassId = ref<number | null>(null)

  // 加载机构列表
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

  // 加载班级列表
  const loadClasses = async () => {
    try {
      const res = await classApi.getAll()
      if (res.code === 200) {
        classes.value = res.data
      }
    } catch (error) {
      console.error('加载班级列表失败:', error)
    }
  }

  // 加载类目列表
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

  // 初始化基础数据
  const initData = async () => {
    await Promise.all([
      loadOrganizations(),
      loadClasses(),
      loadCategories()
    ])
  }

  // 选择机构
  const selectOrg = (orgId: number | null) => {
    selectedOrgId.value = orgId
    selectedClassId.value = null
  }

  // 选择班级
  const selectClass = (classId: number | null) => {
    selectedClassId.value = classId
  }

  // 获取当前选中的机构
  const getSelectedOrg = () => {
    if (!selectedOrgId.value) return null
    return organizations.value.find(org => org.id === selectedOrgId.value) || null
  }

  // 获取当前选中的班级
  const getSelectedClass = () => {
    if (!selectedClassId.value) return null
    return classes.value.find(cls => cls.id === selectedClassId.value) || null
  }

  // 根据机构获取班级
  const getClassesByOrg = (orgId: number) => {
    return classes.value.filter(cls => cls.org_id === orgId)
  }

  // 获取类目名称列表
  const getCategoryNames = () => {
    return categories.value.map(cat => cat.name)
  }

  return {
    organizations,
    classes,
    categories,
    selectedOrgId,
    selectedClassId,
    loadOrganizations,
    loadClasses,
    loadCategories,
    initData,
    selectOrg,
    selectClass,
    getSelectedOrg,
    getSelectedClass,
    getClassesByOrg,
    getCategoryNames
  }
})
