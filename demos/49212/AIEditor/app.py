"""
AI视频剪辑助手 - 主应用
"""
import os
import uuid
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import Config

# 创建Flask应用
app = Flask(__name__)
app.config.from_object(Config)
CORS(app)
Config.init_app()

# 项目数据存储（生产环境应使用数据库）
projects = {}


def allowed_file(filename):
    """检查文件格式是否允许"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']


def get_file_size(filepath):
    """获取文件大小（MB）"""
    size_bytes = os.path.getsize(filepath)
    return round(size_bytes / (1024 * 1024), 2)


def get_video_duration(filepath):
    """获取视频时长（秒）"""
    try:
        from moviepy.editor import VideoFileClip
        with VideoFileClip(filepath) as clip:
            return round(clip.duration, 2)
    except Exception as e:
        print(f"获取视频时长失败: {e}")
        return 0


def get_video_info(filepath):
    """获取视频信息"""
    return {
        'size': get_file_size(filepath),
        'duration': get_video_duration(filepath),
        'path': filepath
    }


@app.route('/')
def index():
    """主页"""
    return render_template('index.html')


@app.route('/api/config', methods=['GET'])
def get_config():
    """获取当前配置"""
    return jsonify({
        'success': True,
        'data': {
            'hasApiKey': bool(app.config['AI_API_KEY']),
            'apiBase': app.config['AI_API_BASE'],
            'model': app.config['AI_MODEL']
        }
    })


@app.route('/api/config', methods=['POST'])
def update_config():
    """更新配置"""
    data = request.json
    if not data:
        return jsonify({'success': False, 'message': '无效的请求数据'}), 400
    
    if 'apiKey' in data:
        app.config['AI_API_KEY'] = data['apiKey']
        os.environ['AI_API_KEY'] = data['apiKey']
    
    if 'apiBase' in data:
        app.config['AI_API_BASE'] = data['apiBase']
        os.environ['AI_API_BASE'] = data['apiBase']
    
    if 'model' in data:
        app.config['AI_MODEL'] = data['model']
        os.environ['AI_MODEL'] = data['model']
    
    return jsonify({'success': True, 'message': '配置已更新'})


@app.route('/api/upload', methods=['POST'])
def upload_file():
    """上传视频文件"""
    if 'file' not in request.files:
        return jsonify({'success': False, 'message': '没有选择文件'}), 400
    
    file = request.files['file']
    project_id = request.form.get('projectId')
    
    if file.filename == '':
        return jsonify({'success': False, 'message': '没有选择文件'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'success': False, 'message': '不支持的视频格式'}), 400
    
    # 创建或使用现有项目
    if not project_id:
        project_id = str(uuid.uuid4())
        projects[project_id] = {
            'id': project_id,
            'files': [],
            'chatHistory': [],
            'createdAt': datetime.now().isoformat(),
            'status': 'draft'
        }
    
    if project_id not in projects:
        projects[project_id] = {
            'id': project_id,
            'files': [],
            'chatHistory': [],
            'createdAt': datetime.now().isoformat(),
            'status': 'draft'
        }
    
    # 保存文件
    filename = secure_filename(file.filename)
    project_dir = os.path.join(app.config['UPLOAD_FOLDER'], project_id)
    os.makedirs(project_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_path = os.path.join(project_dir, f"{file_id}_{filename}")
    file.save(file_path)
    
    # 获取视频信息
    video_info = get_video_info(file_path)
    
    file_info = {
        'id': file_id,
        'name': filename,
        'path': file_path,
        'size': video_info['size'],
        'duration': video_info['duration'],
        'uploadedAt': datetime.now().isoformat()
    }
    
    projects[project_id]['files'].append(file_info)
    
    return jsonify({
        'success': True,
        'data': {
            'projectId': project_id,
            'file': file_info
        }
    })


@app.route('/api/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    """获取项目信息"""
    if project_id not in projects:
        return jsonify({'success': False, 'message': '项目不存在'}), 404
    
    return jsonify({
        'success': True,
        'data': projects[project_id]
    })


@app.route('/api/chat', methods=['POST'])
def chat():
    """AI对话接口"""
    data = request.json
    project_id = data.get('projectId')
    user_message = data.get('message')
    
    if not project_id or not user_message:
        return jsonify({'success': False, 'message': '缺少必要参数'}), 400
    
    if project_id not in projects:
        return jsonify({'success': False, 'message': '项目不存在'}), 404
    
    project = projects[project_id]
    
    # 添加用户消息到历史
    project['chatHistory'].append({
        'role': 'user',
        'content': user_message,
        'timestamp': datetime.now().isoformat()
    })
    
    # 调用AI处理
    from ai_service import process_chat_message
    try:
        ai_response = process_chat_message(
            api_key=app.config['AI_API_KEY'],
            api_base=app.config['AI_API_BASE'],
            model=app.config['AI_MODEL'],
            project=project,
            user_message=user_message
        )
    except Exception as e:
        return jsonify({'success': False, 'message': f'AI处理失败: {str(e)}'}), 500
    
    # 添加AI回复到历史
    project['chatHistory'].append({
        'role': 'assistant',
        'content': ai_response['message'],
        'actions': ai_response.get('actions', []),
        'timestamp': datetime.now().isoformat()
    })
    
    return jsonify({
        'success': True,
        'data': {
            'message': ai_response['message'],
            'actions': ai_response.get('actions', []),
            'project': project
        }
    })


@app.route('/api/preview/<project_id>', methods=['GET'])
def preview_project(project_id):
    """预览项目视频"""
    if project_id not in projects:
        return jsonify({'success': False, 'message': '项目不存在'}), 404
    
    # 返回预览视频路径
    output_dir = os.path.join(app.config['OUTPUT_FOLDER'], project_id)
    preview_file = os.path.join(output_dir, 'preview.mp4')
    
    if os.path.exists(preview_file):
        return send_from_directory(output_dir, 'preview.mp4')
    else:
        return jsonify({'success': False, 'message': '预览视频不存在，请先生成'}), 404


@app.route('/api/generate', methods=['POST'])
def generate_video():
    """生成最终视频"""
    data = request.json
    project_id = data.get('projectId')
    
    if not project_id or project_id not in projects:
        return jsonify({'success': False, 'message': '项目不存在'}), 400
    
    project = projects[project_id]
    
    if not project['files']:
        return jsonify({'success': False, 'message': '请先上传视频素材'}), 400
    
    # 执行视频生成
    from video_service import generate_final_video
    try:
        result = generate_final_video(
            project=project,
            output_folder=app.config['OUTPUT_FOLDER']
        )
    except Exception as e:
        return jsonify({'success': False, 'message': f'视频生成失败: {str(e)}'}), 500
    
    project['status'] = 'completed'
    project['outputFile'] = result['output_path']
    
    return jsonify({
        'success': True,
        'data': {
            'message': '视频生成成功',
            'outputPath': result['output_path']
        }
    })


@app.route('/api/download/<project_id>', methods=['GET'])
def download_video(project_id):
    """下载生成的视频"""
    if project_id not in projects:
        return jsonify({'success': False, 'message': '项目不存在'}), 404
    
    project = projects[project_id]
    if 'outputFile' not in project:
        return jsonify({'success': False, 'message': '视频尚未生成'}), 404
    
    output_dir = os.path.dirname(project['outputFile'])
    filename = os.path.basename(project['outputFile'])
    
    return send_from_directory(output_dir, filename, as_attachment=True)


@app.route('/uploads/<project_id>/<filename>')
def serve_upload(project_id, filename):
    """提供上传的文件访问"""
    upload_dir = os.path.join(app.config['UPLOAD_FOLDER'], project_id)
    return send_from_directory(upload_dir, filename)


if __name__ == '__main__':
    print("=" * 50)
    print("AI视频剪辑助手")
    print("=" * 50)
    print("访问地址: http://localhost:5000")
    print("请确保已安装 FFmpeg 并添加到系统环境变量")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)