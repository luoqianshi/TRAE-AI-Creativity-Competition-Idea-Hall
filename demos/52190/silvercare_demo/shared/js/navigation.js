function navigateTo(pagePath, params) {
  // 处理相对路径中的 ../ 前缀，确保从当前目录正确跳转
  let target = pagePath;
  if (params) {
    const query = Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&');
    target = target + '?' + query;
  }
  window.location.href = target;
}

// 兼容旧版 onclick 直接赋值 window.location 的写法
function navTo(pagePath) {
  window.location.href = pagePath;
}

function getUrlParam(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

function goBack() {
  if (document.referrer && document.referrer.includes(window.location.host)) {
    window.history.back();
  } else {
    window.history.back();
  }
}

function openFamilyView() {
  navigateTo('../family/family_home.html');
}

function openMyView() {
  navigateTo('../me/me_home.html');
}

// 获取当前页面相对于根目录的路径前缀
function getBasePath() {
  const path = window.location.pathname;
  if (path.includes('/me/')) return '../';
  if (path.includes('/family/')) return '../';
  if (path.includes('/common/')) return '';
  return '';
}