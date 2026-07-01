/**
 * 统一文件上传模块（基于 .upload-group DOM 模式）
 * 
 * 用法：
 *   FileUploader.handle(input).then(function(res) {
 *     // res.file_url — 上传后的文件地址
 *   }).catch(function() {
 *     // 上传失败，toast 已显示，input 已自动重置
 *   });
 */
(function() {
  function handle(input) {
    return new Promise(function(resolve, reject) {
      var file = input.files[0];
      if (!file) return reject(new Error('未选择文件'));

      var container = input.closest('.upload-group');
      var btn = container ? container.querySelector('.upload-btn') : null;
      var preview = container ? container.querySelector('.upload-preview') : null;

      if (btn) { btn.disabled = true; btn.textContent = '上传中...'; }

      apiUpload(file).then(function(res) {
        if (preview) {
          preview.innerHTML = '<img src="' + escapeHtml(res.file_url) + '" style="max-width:200px;max-height:200px;border-radius:4px;">';
        }
        if (btn) btn.textContent = '更换照片';
        resolve(res);
      }).catch(function(e) {
        input.value = '';
        reject(e);
      }).finally(function() {
        if (btn) btn.disabled = false;
      });
    });
  }

  window.FileUploader = { handle: handle };
})();
