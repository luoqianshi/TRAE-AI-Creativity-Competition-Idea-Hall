<template>
  
  <div class="container">
    <div class="header">
      <img src="/src/components/logo.png" alt="logo" class="logo" />
      <h3>访客登记</h3>
    </div>
    <input ref="fileInput" type="file" accept="image/*" style="display:none" @change="handlePhoto" />
    <input ref="cameraInput" type="file" accept="image/*" capture="environment" style="display:none" @change="handlePhoto" />
    <div class="btn-group">
      <button class="btn-upload" @click="cameraInput.click()">拍摄身份证</button>
      <button class="btn-upload" @click="fileInput.click()">选择身份证</button>
    </div>

    <img v-if="previewUrl" :src="previewUrl" class="preview" />

    <div v-if="ocrLoading" class="loading">识别中，请稍候...</div>

    <template v-if="!ocrLoading">
      <div class="field">
        <label>来访姓名</label>
        <input v-model="form.name" placeholder="姓名" />
      </div>
      <div class="field">
        <label>身份证号</label>
        <input v-model="form.idNumber" placeholder="身份证号码" />
      </div>
      <div class="field">
        <label>所在单位</label>
        <input v-model="companySearch" placeholder="输入单位名称" @input="onCompanyInput" @focus="showCompanyDrop=companySuggestions.length>0" @blur="hideCompanyDrop" autocomplete="off" />
        <div v-if="showCompanyDrop && companySuggestions.length" class="dropdown">
          <div v-for="c in companySuggestions" :key="c" class="drop-item" @mousedown.prevent="selectCompany(c)">{{ c }}</div>
        </div>
      </div>
      <div class="field">
        <label>联系电话</label>
        <input v-model="form.phone" placeholder="手机或电话" />
      </div>
      <div class="field">
        <label>车牌号码</label>
        <input v-model="form.carPlate" placeholder="车牌号码（选填）" />
      </div>
      <div class="field">
        <label>邮箱</label>
        <input v-model="form.email" placeholder="邮箱（选填但如需接收通知请填写）" type="email" />
      </div>
      <div class="field">
        <label>职位</label>
        <input v-model="form.position" placeholder="职位/职称（选填）" />
      </div>
      <div class="field">
        <label>拜访人</label>
        <input v-model="visitorSearch" placeholder="输入姓名搜索" @input="filterUsers" @focus="showDrop=true" @blur="hideDrop" autocomplete="off" />
        <div v-if="showDrop && filtered.length" class="dropdown">
          <div v-for="u in filtered" :key="u.id" class="drop-item" @mousedown.prevent="selectUser(u)">
            {{ u.display_name || u.username }}
          </div>
        </div>
      </div>
      <div class="field">
        <label>拜访部门</label>
        <input v-model="form.visitDept" placeholder="拜访部门" />
      </div>
      <div class="field">
        <label>拜访描述</label>
        <textarea v-model="form.description" placeholder="拜访描述" rows="3"></textarea>
      </div>
      <div class="field">
        <label>预计到访日期</label>
        <input v-model="form.visitTime" type="datetime-local" />
      </div>

      <button class="btn-submit" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? '提交中...' : '提交' }}
      </button>
      <button class="btn-clear" @click="clearForm">清空</button>
      <button class="btn-query" @click="goQuery">查询审批状态</button>
      <div v-if="successMsg" class="success">{{ successMsg }}</div>
      <div v-if="errorMsg" class="error">{{ errorMsg }}</div>
    </template>
    <div class="copyright">访客系统</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const fileInput = ref(null);
const cameraInput = ref(null);
const photo = ref(null);
const previewUrl = ref('');
const ocrLoading = ref(false);
const submitting = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const userList = ref([]);
const visitorSearch = ref('');
const filtered = ref([]);
const showDrop = ref(false);

onMounted(async () => {
  try {
    const res = await fetch('/api/users/list');
    if (res.ok) userList.value = await res.json();
  } catch {}
});

function filterUsers() {
  const q = visitorSearch.value.toLowerCase();
  filtered.value = q
    ? userList.value.filter(u => u.username !== 'admin' && (u.display_name || u.username).toLowerCase().includes(q))
    : [];
}

function selectUser(u) {
  form.visitor = u.username;
  form.visitDept = u.department || '';
  visitorSearch.value = u.display_name || u.username;
  showDrop.value = false;
}

function clearForm() {
  Object.keys(form).forEach(k => form[k] = '');
  visitorSearch.value = '';
  companySearch.value = '';
  companySuggestions.value = [];
  previewUrl.value = '';
  photo.value = null;
  successMsg.value = '';
  errorMsg.value = '';
}

async function onCompanyInput() {
  form.company = companySearch.value;
  clearTimeout(companyTimer);
  if (!companySearch.value.trim()) { companySuggestions.value = []; return; }
  companyTimer = setTimeout(async () => {
    try {
      const res = await fetch('/api/company-search', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: companySearch.value })
      });
      const data = await res.json();
      companySuggestions.value = data.list || [];
      showCompanyDrop.value = companySuggestions.value.length > 0;
    } catch { companySuggestions.value = []; }
  }, 300);
}

function selectCompany(name) {
  form.company = name;
  companySearch.value = name;
  showCompanyDrop.value = false;
}

function hideCompanyDrop() { setTimeout(() => { showCompanyDrop.value = false; }, 150); }

function goQuery() {
  const params = form.name && form.idNumber
    ? `?name=${encodeURIComponent(form.name)}&idNumber=${encodeURIComponent(form.idNumber)}`
    : '';
  router.push('/query' + params);
}

const companySearch = ref('');
const companySuggestions = ref([]);
const showCompanyDrop = ref(false);
let companyTimer = null;

const form = reactive({
  name: '', idNumber: '', visitor: '', description: '',
  company: '', phone: '', email: '', position: '', visitTime: '', carPlate: '', visitDept: ''
});

async function handlePhoto(e) {
  photo.value = e.target.files[0];
  if (!photo.value) return;
  previewUrl.value = URL.createObjectURL(photo.value);
  ocrLoading.value = true;
  errorMsg.value = '';
  try {
    const fd = new FormData();
    fd.append('photo', photo.value);
    const res = await fetch('/api/ocr', { method: 'POST', body: fd });
    const data = await res.json();
    Object.assign(form, data);
  } catch {
    errorMsg.value = '识别失败，请手动填写';
  } finally {
    ocrLoading.value = false;
  }
}

async function handleSubmit() {
  if (!form.name || !form.idNumber || !form.visitor || !form.company || !form.phone || !form.visitTime) {
    errorMsg.value = '姓名、身份证、单位、电话、拜访日期为必填项';
    return;
  }
  submitting.value = true;
  errorMsg.value = '';
  successMsg.value = '';
  try {
    const fd = new FormData();
    if (photo.value) fd.append('photo', photo.value);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const res = await fetch('/api/submit', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      successMsg.value = '提交成功，等待审核';
      // 不自动清空，保留内容供用户查询
    } else {
      errorMsg.value = data.error || '提交失败';
    }
  } catch {
    errorMsg.value = '网络错误，请重试';
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 480px;
  margin: 0 auto;
  padding: 16px;
  font-size: 16px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}
.logo {
  height: 48px;
  width: auto;
}
.btn-group { display: flex; gap: 8px; margin-bottom: 4px; }
.btn-group .btn-upload { flex: 1; }
.btn-upload {
  width: 100%;
  padding: 14px;
  background: #1677ff;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
}
.preview {
  width: 100%;
  max-height: 220px;
  object-fit: contain;
  margin: 12px 0;
  border-radius: 6px;
  border: 1px solid #ddd;
}
.loading { text-align: center; padding: 20px; color: #888; }
.field { margin: 10px 0; position: relative; display: flex; align-items: center; gap: 8px; }
.field label { min-width: 86px; color: #555; font-size: 14px; flex-shrink: 0; }
.field input, .field textarea {
  flex: 1;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}
.btn-submit {
  width: 100%;
  padding: 14px;
  background: #52c41a;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 17px;
  cursor: pointer;
  margin-top: 12px;
}
.btn-submit:disabled { background: #b7eb8f; cursor: not-allowed; }
.btn-clear { width: 100%; padding: 12px; background: #ff7a45; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 8px; }
.btn-query { width: 100%; padding: 12px; background: #722ed1; color: #fff; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-top: 8px; }
.dropdown { position: absolute; background: #fff; border: 1px solid #ccc; border-radius: 6px; max-height: 180px; overflow-y: auto; z-index: 50; width: 100%; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
.drop-item { padding: 10px 12px; cursor: pointer; font-size: 15px; }
.drop-item:hover { background: #f0f0f0; }
.success { color: #52c41a; text-align: center; margin-top: 10px; }
.error { color: #ff4d4f; text-align: center; margin-top: 10px; }
.copyright { text-align: center; color: #bbb; font-size: 12px; padding: 24px 0 8px; }
</style>
