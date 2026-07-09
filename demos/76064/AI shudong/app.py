from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import json
import os
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
CORS(app)

API_KEY = 'sk-48d353bbb78c4cce8e4be4992b95e0a1'
BASE_URL = "https://api.deepseek.com/v1"

DATA_DIR = 'data'
MOOD_FILE = os.path.join(DATA_DIR, 'mood_records.json')
CHAT_FILE = os.path.join(DATA_DIR, 'chat_sessions.json')

os.makedirs(DATA_DIR, exist_ok=True)


def load_json_file(filepath):
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []


def save_json_file(filepath, data):
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def generate_id():
    return datetime.now().strftime('%Y%m%d%H%M%S') + str(os.urandom(4).hex())


MOOD_CONFIG = {
    'happy': {'label': '开心', 'emoji': '😊'},
    'sad': {'label': '难过', 'emoji': '😢'},
    'angry': {'label': '生气', 'emoji': '😤'},
    'anxious': {'label': '焦虑', 'emoji': '😰'},
    'calm': {'label': '平静', 'emoji': '😌'},
    'confused': {'label': '困惑', 'emoji': '😕'}
}


@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        messages = data.get('messages', [])
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {API_KEY}'
        }

        payload = {
            'model': 'deepseek-chat',
            'messages': [
                {
                    'role': 'system',
                    'content': '你是一个温暖、专业的心理咨询师助手。请用温柔、理解的语气倾听用户的心声，给予恰当的心理支持和建议。避免使用过于专业的术语，保持亲切自然。'
                }
            ] + messages,
            'temperature': 0.7
        }

        response = requests.post(
            f'{BASE_URL}/chat/completions',
            headers=headers,
            json=payload,
            timeout=60
        )

        if response.status_code == 200:
            result = response.json()
            content = result.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            sessions = load_json_file(CHAT_FILE)
            if sessions:
                session = sessions[0]
            else:
                session = {
                    'id': generate_id(),
                    'title': messages[-1].get('content', '')[:20] + '...' if messages else '新对话',
                    'messages': [],
                    'created_at': datetime.now().isoformat(),
                    'updated_at': datetime.now().isoformat()
                }

            for msg in messages:
                session['messages'].append({
                    'id': generate_id(),
                    'content': msg['content'],
                    'role': msg['role'],
                    'timestamp': datetime.now().timestamp()
                })

            session['messages'].append({
                'id': generate_id(),
                'content': content,
                'role': 'assistant',
                'timestamp': datetime.now().timestamp()
            })

            session['title'] = messages[-1].get('content', '')[:20] + '...' if messages else '新对话'
            session['updated_at'] = datetime.now().isoformat()

            if sessions:
                sessions[0] = session
            else:
                sessions.insert(0, session)

            save_json_file(CHAT_FILE, sessions)

            return jsonify({'content': content})

        return jsonify({'error': f'API Error: {response.status_code}'}), 500

    except Exception as e:
        app.logger.error(f'Chat error: {str(e)}')
        return jsonify({'content': '抱歉，我现在有点累了，请稍后再试。你可以先说说看，我会尽力倾听的。'}), 200


@app.route('/api/mood', methods=['POST'])
def save_mood():
    try:
        data = request.json
        mood = data.get('mood')
        note = data.get('note', '')

        if mood not in MOOD_CONFIG:
            return jsonify({'error': 'Invalid mood'}), 400

        record = {
            'id': generate_id(),
            'mood': mood,
            'note': note,
            'timestamp': datetime.now().timestamp(),
            'config': MOOD_CONFIG[mood]
        }

        records = load_json_file(MOOD_FILE)
        records.insert(0, record)
        save_json_file(MOOD_FILE, records)

        return jsonify({'success': True, 'message': '心情记录成功'})

    except Exception as e:
        app.logger.error(f'Save mood error: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/api/mood', methods=['GET'])
def get_mood_records():
    try:
        records = load_json_file(MOOD_FILE)
        return jsonify(records)
    except Exception as e:
        app.logger.error(f'Get mood records error: {str(e)}')
        return jsonify([]), 500


@app.route('/api/chat/sessions', methods=['GET'])
def get_chat_sessions():
    try:
        sessions = load_json_file(CHAT_FILE)
        return jsonify(sessions)
    except Exception as e:
        app.logger.error(f'Get chat sessions error: {str(e)}')
        return jsonify([]), 500


@app.route('/api/chat/sessions/<session_id>', methods=['DELETE'])
def delete_chat_session(session_id):
    try:
        sessions = load_json_file(CHAT_FILE)
        sessions = [s for s in sessions if s['id'] != session_id]
        save_json_file(CHAT_FILE, sessions)
        return jsonify({'success': True, 'message': '删除成功'})
    except Exception as e:
        app.logger.error(f'Delete chat session error: {str(e)}')
        return jsonify({'error': str(e)}), 500


@app.route('/')
def index():
    return send_from_directory('.', 'index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)