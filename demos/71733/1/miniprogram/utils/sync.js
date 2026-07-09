// sync.js - 数据同步模块
const { get, post } = require('./request')
const { ensureLogin } = require('./auth')

/**
 * 拉取云端宠物数据
 * @returns {Promise<object|null>} 云端 PetData
 */
async function fetchCloudData() {
  try {
    await ensureLogin()
    const data = await get('/pet/data')
    return data
  } catch (err) {
    console.error('拉取云端数据失败:', err)
    return null
  }
}

/**
 * 保存数据到云端（单向推送）
 * @param {object} petData - 完整 PetData（含 updatedAt）
 * @returns {Promise<object>} { saved, updatedAt }
 */
async function saveToCloud(petData) {
  try {
    await ensureLogin()
    // 确保有 updatedAt
    if (!petData.updatedAt) {
      petData.updatedAt = new Date().toISOString()
    }
    const result = await post('/pet/save', { data: petData })
    return result
  } catch (err) {
    console.error('保存数据到云端失败:', err)
    throw err
  }
}

/**
 * 双向同步：上传本地数据，根据时间戳决定接受或覆盖
 * @param {object} localData - 本地完整 PetData（含 updatedAt）
 * @returns {Promise<object>} { action, serverData }
 */
async function syncWithCloud(localData) {
  try {
    await ensureLogin()
    if (!localData.updatedAt) {
      localData.updatedAt = new Date().toISOString()
    }
    const result = await post('/pet/sync', { localData })
    return result
  } catch (err) {
    console.error('双向同步失败:', err)
    throw err
  }
}

/**
 * 合并本地与云端数据（基于 updatedAt Last-Write-Wins）
 * @param {object|null} localData - 本地数据
 * @param {object} cloudData - 云端数据
 * @returns {object} 合并后的数据
 */
function mergeData(localData, cloudData) {
  // 本地无数据，直接使用云端
  if (!localData) {
    return cloudData
  }

  // 云端无数据，保持本地
  if (!cloudData) {
    return localData
  }

  const localTime = localData.updatedAt ? new Date(localData.updatedAt).getTime() : 0
  const cloudTime = cloudData.updatedAt ? new Date(cloudData.updatedAt).getTime() : 0

  if (cloudTime > localTime) {
    // 云端更新，使用云端数据
    return cloudData
  } else if (localTime > cloudTime) {
    // 本地更新，使用本地数据（同时推送到云端）
    // 异步推送，不阻塞
    saveToCloud(localData).catch(err => {
      console.error('合并后推送失败:', err)
    })
    return localData
  } else {
    // 时间戳相同，无需操作
    return localData
  }
}

module.exports = {
  fetchCloudData,
  saveToCloud,
  syncWithCloud,
  mergeData
}
