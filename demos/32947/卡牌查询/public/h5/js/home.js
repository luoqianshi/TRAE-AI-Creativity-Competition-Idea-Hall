(function () {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const home = document.getElementById('h5Home');
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastDesc = document.getElementById('toastDesc');
  const loading = document.getElementById('loading');

  function showToast(title, desc) {
    toastTitle.textContent = title || '提示';
    toastDesc.textContent = desc || '';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function showLoading(show) {
    loading.classList.toggle('show', !!show);
  }

  function applyHomeBg(url) {
    if (url) {
      home.style.backgroundImage = `url('${url}')`;
    }
  }

  fetch('/api/config').then(r => r.json()).then(res => {
    if (res.ok && res.data && res.data.home_bg) {
      applyHomeBg(res.data.home_bg);
    }
  }).catch(() => {});

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const val = (input.value || '').trim();
    if (!val) {
      showToast('请填写编号', '请填写有效的内部编号');
      input.focus();
      return;
    }
    showLoading(true);
    fetch('/api/query?inner_no=' + encodeURIComponent(val))
      .then(r => r.json().then(j => ({ status: r.status, body: j })))
      .then(({ status, body }) => {
        showLoading(false);
        if (status === 200 && body.ok) {
          const id = body.data.id;
          window.location.href = 'detail.html?id=' + encodeURIComponent(id);
        } else {
          showToast('未查询到结果', body.msg || '未查询到该编号卡牌信息,请核对编号');
        }
      })
      .catch(err => {
        showLoading(false);
        showToast('网络错误', '查询失败,请稍后重试');
      });
  });

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });
})();
