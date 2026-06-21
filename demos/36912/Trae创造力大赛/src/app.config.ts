export default defineAppConfig({
  pages: [
    'pages/control/index',
    'pages/settings/index',
    'pages/mine/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0a1628',
    navigationBarTitleText: '机器人控制',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0a1628'
  },
  tabBar: {
    color: '#718096',
    selectedColor: '#0066ff',
    backgroundColor: '#0a1628',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/control/index',
        text: '控制台'
      },
      {
        pagePath: 'pages/settings/index',
        text: '设置'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})
