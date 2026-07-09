/**
 * solong-nav.js — 底部导航统一组件
 * =============================================
 * 所有页面共享同一份导航 HTML，通过 renderBottomNav(pageName) 生成。
 * 用法: 在各页面 <body> 末尾调用 renderBottomNav('home') 即可。
 */

function renderBottomNav(activePage) {
  var pages = [
    { key: 'home',      label: '首页', icon: '\uD83C\uDFE0', href: 'index.html' },
    { key: 'discover',  label: '发现', icon: '\uD83D\uDD0D', href: 'browse.html' },
    { key: 'create',    label: '发起', icon: '\u270F\uFE0F', href: 'create.html' },
    { key: 'profile',   label: '我的', icon: '\uD83D\uDC64', href: 'mine.html' }
  ];

  var html = '';
  html += '<!-- 底部导航（统一组件） -->\n';
  html += '<nav class="solong-bottom-nav" id="solong-bottom-nav">\n';

  for (var i = 0; i < pages.length; i++) {
    var p = pages[i];
    var activeClass = (p.key === activePage) ? ' active' : '';
    html += '  <div class="solong-nav-item' + activeClass + '" data-page="' + p.key + '">\n';
    html += '    <span class="solong-nav-icon">' + p.icon + '</span>\n';
    html += '    <span class="solong-nav-text">' + p.label + '</span>\n';
    html += '  </div>\n';
  }

  html += '</nav>\n';

  // 插入到 body 末尾（在 script 标签之前）
  var scripts = document.body.querySelectorAll('script');
  if (scripts.length > 0) {
    scripts[0].insertAdjacentHTML('beforebegin', html);
  } else {
    document.body.insertAdjacentHTML('beforeend', html);
  }

  // 绑定点击事件
  var nav = document.getElementById('solong-bottom-nav');
  if (!nav) return;

  var items = nav.querySelectorAll('.solong-nav-item');
  for (var i = 0; i < items.length; i++) {
    (function(item) {
      item.addEventListener('click', function() {
        var key = this.getAttribute('data-page');
        for (var j = 0; j < pages.length; j++) {
          if (pages[j].key === key) {
            window.location.href = pages[j].href;
            return;
          }
        }
      });
    })(items[i]);
  }
}
