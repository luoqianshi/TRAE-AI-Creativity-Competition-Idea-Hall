// 路由管理

const routes = {};
let currentRoute = '';

function registerRoute(path, renderFn) {
  routes[path] = renderFn;
}

function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('popstate', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/welcome';
  const route = hash.split('/').slice(0, 2).join('/');
  const params = hash.split('/').slice(2);

  if (routes[route]) {
    navigateTo(route, params, false);
  } else {
    navigateTo('#/welcome', [], false);
  }
}

function navigateTo(route, params = [], addHistory = true) {
  const fullHash = params.length > 0 ? `${route}/${params.join('/')}` : route;

  if (addHistory) {
    window.location.hash = fullHash;
    return;
  }

  // 内部切换，不触发 hashchange
  if (currentRoute === route) {
    // 同路由刷新
    const renderFn = routes[route];
    if (renderFn) {
      renderFn(params);
    }
    return;
  }

  // 隐藏当前页面
  const currentPage = document.querySelector('.page.active');
  if (currentPage) {
    currentPage.classList.remove('active');
  }

  currentRoute = route;

  // 渲染新页面
  const renderFn = routes[route];
  if (renderFn) {
    renderFn(params);
  }
}

function showPage(pageId) {
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));

  const targetPage = document.getElementById(pageId);
  if (targetPage) {
    targetPage.classList.add('active');
    window.scrollTo(0, 0);
  }
}
