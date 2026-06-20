const app = getApp()

Page({
  data: {
    journeyData: {},
    mapCenter: {
      latitude: 31.2,
      longitude: 121.4
    },
    mapScale: 4,
    markers: [],
    polyline: []
  },

  onLoad() {
    this.loadJourneyData()
  },

  loadJourneyData() {
    const journeyData = app.globalData.journeyData
    const path = journeyData.path

    // 生成地图标记
    const markers = path.map((item, index) => ({
      id: index,
      latitude: item.lat,
      longitude: item.lng,
      title: item.city,
      iconPath: '/images/marker.png',
      width: 30,
      height: 30,
      callout: {
        content: `${item.city} - ${item.event}`,
        color: '#4A3F3A',
        fontSize: 12,
        borderRadius: 8,
        bgColor: '#FFF8F5',
        padding: 8,
        display: 'BYCLICK'
      }
    }))

    // 生成轨迹线
    const points = path.map(item => ({
      latitude: item.lat,
      longitude: item.lng
    }))

    const polyline = [{
      points: points,
      color: '#C97B63',
      width: 3,
      dottedLine: true,
      arrowLine: true
    }]

    // 计算地图中心
    const lats = path.map(p => p.lat)
    const lngs = path.map(p => p.lng)
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2

    this.setData({
      journeyData,
      markers,
      polyline,
      mapCenter: {
        latitude: centerLat,
        longitude: centerLng
      }
    })
  }
})
