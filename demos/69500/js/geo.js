/**
 * 城市探险游戏生成器 - 地理与天气自动识别模块
 * 使用浏览器定位 API + Open-Meteo 免费天气 API + Nominatim 逆地理编码
 */

var GeoSensor = (function () {

  // === 获取浏览器定位 ===
  function getCurrentPosition() {
    return new Promise(function (resolve, reject) {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位功能'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        function (pos) {
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        function (err) {
          reject(new Error('定位失败: ' + err.message));
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
    });
  }

  // === IP 定位降级方案（无需 HTTPS）===
  function getIPLocation() {
    // 先用 ip-api.com（支持中文，国内可访问）
    return fetch('https://ip-api.com/json/?lang=zh-CN&fields=status,country,regionName,city,lat,lon')
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.status === 'success' && data.lat && data.lon) {
          return {
            lat: data.lat,
            lng: data.lon,
            city: data.city || data.regionName || '未知城市',
            source: 'ip'
          };
        }
        throw new Error('ip-api 定位失败');
      })
      .catch(function () {
        // 备用：ipapi.co
        return fetch('https://ipapi.co/json/')
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.latitude && data.longitude) {
              return {
                lat: data.latitude,
                lng: data.longitude,
                city: data.city || data.region || '未知城市',
                source: 'ip'
              };
            }
            throw new Error('IP 定位无坐标数据');
          });
      });
  }

  // === 逆地理编码：坐标 -> 城市名 ===
  function reverseGeocode(lat, lng) {
    var url = 'https://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lng + '&zoom=12&accept-language=zh-CN&addressdetails=1';
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var addr = data.address || {};
        var cityName = addr.city || addr.town || addr.municipality ||
                       addr.county || addr.city_district ||
                       addr.state || addr.region || '';

        // 如果字段没匹配到，从 display_name 提取
        if (!cityName && data.display_name) {
          var parts = data.display_name.split(',');
          // 第二个通常是城市/区级别
          if (parts.length >= 2) {
            cityName = parts[1].trim();
          } else {
            cityName = parts[0].trim();
          }
        }

        // 去掉"市"后缀中的"市"字
        if (cityName && cityName.length > 2 && cityName.lastIndexOf('市') === cityName.length - 1) {
          cityName = cityName.substring(0, cityName.length - 1);
        }

        return { city: cityName || '未知位置', raw: addr, displayName: data.display_name || '' };
      })
      .catch(function () {
        return { city: '未知位置', raw: {}, displayName: '' };
      });
  }

  // === 天气识别：Open-Meteo 免费天气 API ===
  function getWeather(lat, lng) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&current=temperature_2m,weather_code,is_day&timezone=auto';
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.current) return { weather: 'cloudy', temp: null, desc: '未知', icon: '☁️' };
        var code = data.current.weather_code;
        var temp = Math.round(data.current.temperature_2m);
        var isDay = data.current.is_day === 1;
        var w = parseWeatherCode(code);
        w.temp = temp;
        w.isDay = isDay;
        return w;
      })
      .catch(function () {
        return { weather: 'cloudy', temp: null, desc: '获取失败', icon: '☁️' };
      });
  }

  // WMO 天气代码 -> 简化天气类型
  function parseWeatherCode(code) {
    if (code === 0) return { weather: 'sunny', desc: '晴', icon: '☀️' };
    if (code <= 3) return { weather: 'cloudy', desc: '多云', icon: '☁️' };
    if (code <= 48) return { weather: 'cloudy', desc: '雾', icon: '🌫️' };
    if (code <= 67) return { weather: 'rainy', desc: '雨', icon: '🌧️' };
    if (code <= 77) return { weather: 'rainy', desc: '雪', icon: '🌨️' };
    if (code <= 82) return { weather: 'rainy', desc: '阵雨', icon: '🌧️' };
    if (code <= 86) return { weather: 'rainy', desc: '阵雪', icon: '🌨️' };
    if (code >= 95) return { weather: 'rainy', desc: '雷雨', icon: '⛈️' };
    return { weather: 'cloudy', desc: '多云', icon: '☁️' };
  }

  // === 时段识别：根据系统时间 ===
  function getTimeSlot() {
    var hour = new Date().getHours();
    if (hour >= 6 && hour < 16) return { id: 'day', name: '白天', icon: '🌅' };
    if (hour >= 16 && hour < 19) return { id: 'dusk', name: '黄昏', icon: '🌇' };
    return { id: 'night', name: '夜晚', icon: '🌙' };
  }

  // === 匹配最近的预设城市（用于 POI 匹配）===
  function findNearestCity(lat, lng) {
    var nearest = null;
    var minDist = Infinity;
    Object.keys(POI_DATABASE).forEach(function (key) {
      var city = POI_DATABASE[key];
      var dist = Math.sqrt(
        Math.pow(city.center[0] - lat, 2) +
        Math.pow(city.center[1] - lng, 2)
      );
      if (dist < minDist) {
        minDist = dist;
        nearest = key;
      }
    });
    return nearest;
  }

  // === 地点搜索：多源搜索 ===
  function searchPlace(query) {
    return searchByNominatim(query)
      .then(function (results) {
        return results;
      });
  }

  // Nominatim 搜索（支持 CORS）
  function searchByNominatim(query) {
    var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' +
      encodeURIComponent(query) +
      '&limit=5&accept-language=zh-CN&addressdetails=1';
    return fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!Array.isArray(data)) return [];
        return data.map(function (item) {
          var name = item.name || (item.display_name ? item.display_name.split(',')[0] : query);
          return {
            name: name,
            address: item.display_name || name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon)
          };
        });
      })
      .catch(function (err) {
        console.warn('Nominatim search failed:', err);
        return [];
      });
  }

  return {
    getPosition: getCurrentPosition,
    getIPLocation: getIPLocation,
    reverseGeocode: reverseGeocode,
    getWeather: getWeather,
    getTimeSlot: getTimeSlot,
    findNearestCity: findNearestCity,
    searchPlace: searchPlace
  };
})();
