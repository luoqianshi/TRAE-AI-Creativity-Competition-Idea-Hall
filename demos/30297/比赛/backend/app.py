from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import random

app = Flask(__name__)
CORS(app)

STALL_DATA = [
    {"id": 1, "name": "老王煎饼", "type": "早餐", "location": "人民广场地铁站", "lat": 31.2304, "lng": 121.4737,
     "timeSlots": ["06:00-09:00", "17:00-20:00"], "rating": 4.8, "weather": "晴", "status": "available"},
    {"id": 2, "name": "张阿姨奶茶", "type": "饮品", "location": "静安寺商圈", "lat": 31.2397, "lng": 121.4498,
     "timeSlots": ["10:00-22:00"], "rating": 4.5, "weather": "多云", "status": "available"},
    {"id": 3, "name": "东北烤冷面", "type": "小吃", "location": "大学路夜市", "lat": 31.2618, "lng": 121.5132,
     "timeSlots": ["16:00-23:00"], "rating": 4.9, "weather": "阴", "status": "available"},
    {"id": 4, "name": "李记手作", "type": "手工艺品", "location": "田子坊", "lat": 31.2214, "lng": 121.4879,
     "timeSlots": ["10:00-21:00"], "rating": 4.7, "weather": "晴", "status": "occupied"},
    {"id": 5, "name": "阿婆粽子", "type": "小吃", "location": "豫园", "lat": 31.2320, "lng": 121.4908,
     "timeSlots": ["08:00-18:00"], "rating": 4.6, "weather": "小雨", "status": "available"},
]

WEATHER_DATA = {
    "today": {"temp": "26°C", "condition": "晴", "wind": "东北风3级", "pm2.5": "35"},
    "forecast": [
        {"day": "今天", "temp": "22-28°C", "condition": "晴", "suggest": "建议出摊"},
        {"day": "明天", "temp": "20-25°C", "condition": "多云", "suggest": "建议出摊"},
        {"day": "后天", "temp": "18-22°C", "condition": "小雨", "suggest": "谨慎出摊"},
        {"day": "周三", "temp": "19-24°C", "condition": "阴", "suggest": "建议出摊"},
        {"day": "周四", "temp": "21-26°C", "condition": "晴", "suggest": "建议出摊"},
        {"day": "周五", "temp": "23-29°C", "condition": "雷阵雨", "suggest": "不建议出摊"},
        {"day": "周六", "temp": "24-30°C", "condition": "晴", "suggest": "建议出摊"},
    ]
}

@app.route('/api/stalls', methods=['GET'])
def get_stalls():
    stall_type = request.args.get('type', '')
    status = request.args.get('status', '')
    
    filtered = STALL_DATA
    if stall_type:
        filtered = [s for s in filtered if s['type'] == stall_type]
    if status:
        filtered = [s for s in filtered if s['status'] == status]
    
    return jsonify(filtered)

@app.route('/api/stalls/<int:stall_id>', methods=['GET'])
def get_stall(stall_id):
    stall = next((s for s in STALL_DATA if s['id'] == stall_id), None)
    if stall:
        return jsonify(stall)
    return jsonify({"error": "Stall not found"}), 404

@app.route('/api/weather', methods=['GET'])
def get_weather():
    return jsonify(WEATHER_DATA)

@app.route('/api/recommend', methods=['POST'])
def recommend_stalls():
    data = request.get_json()
    time = data.get('time', '')
    preferences = data.get('preferences', [])
    
    recommendations = []
    for stall in STALL_DATA:
        if time in stall['timeSlots'] or not time:
            score = random.randint(70, 100)
            recommendations.append({
                "stall": stall,
                "score": score,
                "reason": f"人流评分: {score}, 时段匹配: 是"
            })
    
    recommendations.sort(key=lambda x: x['score'], reverse=True)
    return jsonify(recommendations[:3])

@app.route('/api/register', methods=['POST'])
def register_stall():
    data = request.get_json()
    new_id = max(s['id'] for s in STALL_DATA) + 1
    new_stall = {
        "id": new_id,
        "name": data.get('name', '新摊位'),
        "type": data.get('type', '小吃'),
        "location": data.get('location', '未知地点'),
        "lat": data.get('lat', 31.2304),
        "lng": data.get('lng', 121.4737),
        "timeSlots": data.get('timeSlots', ["10:00-20:00"]),
        "rating": 0,
        "weather": "晴",
        "status": "available"
    }
    STALL_DATA.append(new_stall)
    return jsonify(new_stall), 201

@app.route('/api/book', methods=['POST'])
def book_stall():
    data = request.get_json()
    stall_id = data.get('stall_id')
    stall = next((s for s in STALL_DATA if s['id'] == stall_id), None)
    
    if stall and stall['status'] == 'available':
        stall['status'] = 'occupied'
        return jsonify({"success": True, "message": "预订成功"})
    return jsonify({"success": False, "message": "摊位不可用"}), 400

@app.route('/api/weather/alert', methods=['GET'])
def weather_alert():
    alerts = []
    if WEATHER_DATA['today']['condition'] == '小雨':
        alerts.append({"type": "warning", "message": "当前有小雨，请注意防雨"})
    if int(WEATHER_DATA['today']['pm2.5']) > 100:
        alerts.append({"type": "danger", "message": "空气质量较差，建议减少户外活动"})
    return jsonify(alerts)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
