const STORAGE_KEY = 'quick_notes_data';

let notes = [];
let currentEditingId = null;
let selectedTags = [];
let searchQuery = '';
let previewImage = null;

const notesContainer = document.getElementById('notesContainer');
const emptyState = document.getElementById('emptyState');
const addBtn = document.getElementById('addBtn');
const noteModal = document.getElementById('noteModal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
const saveBtn = document.getElementById('saveBtn');
const deleteBtn = document.getElementById('deleteBtn');
const noteContent = document.getElementById('noteContent');
const tagInput = document.getElementById('tagInput');
const addTagBtn = document.getElementById('addTagBtn');
const modalTags = document.getElementById('modalTags');
const tagList = document.getElementById('tagList');
const searchInput = document.getElementById('searchInput');
const imageUpload = document.getElementById('imageUpload');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const modalTitle = document.getElementById('modalTitle');

function init() {
  lucide.createIcons();
  loadNotes();
  renderTags();
  renderNotes();
  
  addBtn.addEventListener('click', openModal);
  closeModal.addEventListener('click', closeModalHandler);
  saveBtn.addEventListener('click', saveNote);
  deleteBtn.addEventListener('click', deleteNote);
  addTagBtn.addEventListener('click', addTag);
  tagInput.addEventListener('keypress', (e) => e.key === 'Enter' && addTag());
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderNotes();
  });
  imageUpload.addEventListener('change', handleImageUpload);
  removeImage.addEventListener('click', clearImage);
  
  noteModal.addEventListener('click', (e) => {
    if (e.target === noteModal) closeModalHandler();
  });
}

function loadNotes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    notes = JSON.parse(stored);
  } else {
    notes = [
      {
        id: '1',
        content: '今天学到了一个新的前端技巧：使用CSS Grid实现响应式布局，比flexbox更适合复杂场景。',
        tags: ['学习', '前端'],
        createdAt: Date.now() - 3600000,
        updatedAt: Date.now() - 3600000
      },
      {
        id: '2',
        content: '通勤时想到的产品点子：一个智能待办清单，根据优先级自动排序',
        tags: ['灵感', '产品'],
        createdAt: Date.now() - 7200000,
        updatedAt: Date.now() - 7200000
      },
      {
        id: '3',
        content: '会议记录：下周需要完成项目进度报告，重点关注用户留存率指标',
        tags: ['工作', '会议'],
        createdAt: Date.now() - 1800000,
        updatedAt: Date.now() - 1800000
      }
    ];
    saveNotes();
  }
}

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderTags() {
  const allTags = [...new Set(notes.flatMap(n => n.tags))];
  let html = '<button class="tag-btn active px-4 py-1.5 rounded-full text-sm font-medium bg-green-500 text-white transition-all whitespace-nowrap">全部</button>';
  
  allTags.forEach(tag => {
    const isActive = selectedTags.includes(tag);
    html += `
      <button 
        class="tag-btn px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${isActive ? 'active' : ''}"
        data-tag="${tag}"
        onclick="toggleTag('${tag}')"
      >
        ${tag}
      </button>
    `;
  });
  
  tagList.innerHTML = html;
}

function toggleTag(tag) {
  const index = selectedTags.indexOf(tag);
  if (index > -1) {
    selectedTags.splice(index, 1);
  } else {
    selectedTags.push(tag);
  }
  renderTags();
  renderNotes();
}

function renderNotes() {
  let filtered = notes;
  
  if (selectedTags.length > 0) {
    filtered = filtered.filter(n => selectedTags.some(t => n.tags.includes(t)));
  }
  
  if (searchQuery) {
    filtered = filtered.filter(n => n.content.toLowerCase().includes(searchQuery));
  }
  
  filtered.sort((a, b) => b.updatedAt - a.updatedAt);
  
  if (filtered.length === 0) {
    notesContainer.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  notesContainer.innerHTML = filtered.map(note => `
    <div 
      class="note-card bg-white rounded-xl p-5 shadow-sm border border-gray-100 cursor-pointer"
      onclick="editNote('${note.id}')"
    >
      ${note.image ? `<img src="${note.image}" class="w-full h-32 object-cover rounded-lg mb-3" alt="笔记图片">` : ''}
      <p class="note-content-preview text-gray-700 text-sm leading-relaxed mb-4">${escapeHtml(note.content)}</p>
      <div class="flex flex-wrap gap-2 mb-3">
        ${note.tags.map(tag => `<span class="tag-chip px-2 py-0.5 bg-green-50 text-green-600 text-xs rounded-full">${escapeHtml(tag)}</span>`).join('')}
      </div>
      <p class="text-xs text-gray-400">${formatTime(note.updatedAt)}</p>
    </div>
  `).join('');
}

function openModal() {
  currentEditingId = null;
  noteContent.value = '';
  selectedTags = [];
  previewImage = null;
  imagePreview.classList.add('hidden');
  modalTitle.textContent = '新建笔记';
  deleteBtn.classList.add('hidden');
  renderModalTags();
  
  noteModal.classList.remove('hidden');
  modalContent.classList.remove('modal-leave');
  modalContent.classList.add('modal-enter');
  
  setTimeout(() => noteContent.focus(), 100);
}

function closeModalHandler() {
  modalContent.classList.remove('modal-enter');
  modalContent.classList.add('modal-leave');
  
  setTimeout(() => {
    noteModal.classList.add('hidden');
  }, 200);
}

function editNote(id) {
  const note = notes.find(n => n.id === id);
  if (!note) return;
  
  currentEditingId = id;
  noteContent.value = note.content;
  selectedTags = [...note.tags];
  previewImage = note.image || null;
  
  if (previewImage) {
    previewImg.src = previewImage;
    imagePreview.classList.remove('hidden');
  } else {
    imagePreview.classList.add('hidden');
  }
  
  modalTitle.textContent = '编辑笔记';
  deleteBtn.classList.remove('hidden');
  renderModalTags();
  
  noteModal.classList.remove('hidden');
  modalContent.classList.remove('modal-leave');
  modalContent.classList.add('modal-enter');
  
  setTimeout(() => noteContent.focus(), 100);
}

function saveNote() {
  const content = noteContent.value.trim();
  if (!content && !previewImage) {
    closeModalHandler();
    return;
  }
  
  if (currentEditingId) {
    const index = notes.findIndex(n => n.id === currentEditingId);
    if (index > -1) {
      notes[index] = {
        ...notes[index],
        content,
        tags: selectedTags,
        image: previewImage,
        updatedAt: Date.now()
      };
    }
  } else {
    notes.push({
      id: Date.now().toString(),
      content,
      tags: selectedTags,
      image: previewImage,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
  
  saveNotes();
  renderTags();
  renderNotes();
  closeModalHandler();
}

function deleteNote() {
  if (!currentEditingId) return;
  
  notes = notes.filter(n => n.id !== currentEditingId);
  saveNotes();
  renderTags();
  renderNotes();
  closeModalHandler();
}

function addTag() {
  const tag = tagInput.value.trim();
  if (tag && !selectedTags.includes(tag)) {
    selectedTags.push(tag);
    tagInput.value = '';
    renderModalTags();
  }
}

function removeTag(tag) {
  const index = selectedTags.indexOf(tag);
  if (index > -1) {
    selectedTags.splice(index, 1);
    renderModalTags();
  }
}

function renderModalTags() {
  modalTags.innerHTML = selectedTags.map(tag => `
    <span class="tag-chip removeable px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full flex items-center gap-1">
      ${escapeHtml(tag)}
      <span class="remove-tag cursor-pointer" onclick="removeTag('${escapeHtml(tag)}')">×</span>
    </span>
  `).join('');
}

function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage = event.target.result;
    previewImg.src = previewImage;
    imagePreview.classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function clearImage() {
  previewImage = null;
  imagePreview.classList.add('hidden');
  imageUpload.value = '';
}

function formatTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  if (hours < 24) return `${hours}小时前`;
  if (days < 7) return `${days}天前`;
  
  return new Date(timestamp).toLocaleDateString('zh-CN');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.toggleTag = toggleTag;
window.editNote = editNote;
window.removeTag = removeTag;

init();