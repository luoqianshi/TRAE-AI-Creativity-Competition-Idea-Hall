/* 年年有印 · 主脚本 */
(function () {
  // 平滑滚动
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    });
  });

  // 读取 URL 参数
  window.getQueryParam = function (key) {
    const params = new URLSearchParams(window.location.search);
    return params.get(key);
  };
})();
