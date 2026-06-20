export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/capture/index',
    'pages/analysis/index',
    'pages/practice/index',
    'pages/mine/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#ffffff',
    navigationBarTitleText: 'AI智错题',
    navigationBarTextStyle: 'black',
    backgroundColor: '#f8fafc'
  },
  tabBar: {
    color: '#94a3b8',
    selectedColor: '#6366f1',
    backgroundColor: '#ffffff',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '错题本'
      },
      {
        pagePath: 'pages/capture/index',
        text: '拍照录入'
      },
      {
        pagePath: 'pages/mine/index',
        text: '我的'
      }
    ]
  }
})