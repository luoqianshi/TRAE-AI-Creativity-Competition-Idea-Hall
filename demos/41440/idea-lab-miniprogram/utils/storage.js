// 本地存储封装

const STORAGE_KEY = 'ideas';
const NEXT_ID_KEY = 'nextId';

function getIdeas() {
  return wx.getStorageSync(STORAGE_KEY) || [];
}

function saveIdeas(ideas) {
  wx.setStorageSync(STORAGE_KEY, ideas);
}

function getNextId() {
  let id = wx.getStorageSync(NEXT_ID_KEY);
  if (!id) {
    id = 1;
    wx.setStorageSync(NEXT_ID_KEY, id);
  }
  return id;
}

function incrementNextId() {
  const id = getNextId() + 1;
  wx.setStorageSync(NEXT_ID_KEY, id);
  return id;
}

function addIdea(idea) {
  const ideas = getIdeas();
  idea.id = getNextId();
  ideas.unshift(idea);
  saveIdeas(ideas);
  incrementNextId();
  return idea;
}

function updateIdea(updatedIdea) {
  const ideas = getIdeas();
  const index = ideas.findIndex(i => i.id === updatedIdea.id);
  if (index !== -1) {
    ideas[index] = updatedIdea;
    saveIdeas(ideas);
    return true;
  }
  return false;
}

function deleteIdea(id) {
  const ideas = getIdeas().filter(i => i.id !== id);
  saveIdeas(ideas);
}

function togglePin(id) {
  const ideas = getIdeas();
  const idea = ideas.find(i => i.id === id);
  if (idea) {
    idea.pinned = !idea.pinned;
    saveIdeas(ideas);
    return idea.pinned;
  }
  return false;
}

function clearAll() {
  wx.removeStorageSync(STORAGE_KEY);
  wx.removeStorageSync(NEXT_ID_KEY);
}

module.exports = {
  getIdeas,
  saveIdeas,
  getNextId,
  addIdea,
  updateIdea,
  deleteIdea,
  togglePin,
  clearAll
};
