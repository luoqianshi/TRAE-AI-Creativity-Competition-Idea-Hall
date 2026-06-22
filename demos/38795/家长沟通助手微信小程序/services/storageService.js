const TEMPLATES_KEY = 'templates'
const HISTORY_KEY = 'communication_history'

const getTemplates = function() {
  const templates = wx.getStorageSync(TEMPLATES_KEY)
  return templates ? JSON.parse(templates) : []
}

const saveTemplate = function(template) {
  const templates = getTemplates()
  templates.unshift(template)
  wx.setStorageSync(TEMPLATES_KEY, JSON.stringify(templates))
}

const updateTemplate = function(id, updates) {
  const templates = getTemplates()
  const index = templates.findIndex(t => t.id === id)
  if (index !== -1) {
    templates[index] = { ...templates[index], ...updates }
    wx.setStorageSync(TEMPLATES_KEY, JSON.stringify(templates))
  }
}

const deleteTemplate = function(id) {
  const templates = getTemplates()
  const filtered = templates.filter(t => t.id !== id)
  wx.setStorageSync(TEMPLATES_KEY, JSON.stringify(filtered))
}

const getHistory = function() {
  const history = wx.getStorageSync(HISTORY_KEY)
  return history ? JSON.parse(history) : []
}

const saveHistory = function(record) {
  const history = getHistory()
  record.id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
  history.unshift(record)
  if (history.length > 100) {
    history.pop()
  }
  wx.setStorageSync(HISTORY_KEY, JSON.stringify(history))
}

const deleteHistory = function(id) {
  const history = getHistory()
  const filtered = history.filter(h => h.id !== id)
  wx.setStorageSync(HISTORY_KEY, JSON.stringify(filtered))
}

const clearHistory = function() {
  wx.removeStorageSync(HISTORY_KEY)
}

module.exports = {
  getTemplates,
  saveTemplate,
  updateTemplate,
  deleteTemplate,
  getHistory,
  saveHistory,
  deleteHistory,
  clearHistory
}
