export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/plan/index',
    'pages/question/index',
    'pages/wrong/index',
    'pages/mine/index',
    'pages/detail/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '备考助手',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#5B7FFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页',
        iconPath: 'assets/tabbar/home.svg',
        selectedIconPath: 'assets/tabbar/home-selected.svg'
      },
      {
        pagePath: 'pages/plan/index',
        text: '计划',
        iconPath: 'assets/tabbar/plan.svg',
        selectedIconPath: 'assets/tabbar/plan-selected.svg'
      },
      {
        pagePath: 'pages/question/index',
        text: '题库',
        iconPath: 'assets/tabbar/book.svg',
        selectedIconPath: 'assets/tabbar/book-selected.svg'
      },
      {
        pagePath: 'pages/wrong/index',
        text: '错题',
        iconPath: 'assets/tabbar/wrong.svg',
        selectedIconPath: 'assets/tabbar/wrong-selected.svg'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的',
        iconPath: 'assets/tabbar/mine.svg',
        selectedIconPath: 'assets/tabbar/mine-selected.svg'
      }
    ]
  }
})
