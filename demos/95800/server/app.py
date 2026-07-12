#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
元件管理系统 - Flask 后端
"""

import os
import json
import uuid
import shutil
import configparser
import hashlib
import sys
import subprocess
import threading
import time
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, Response

# 加载配置
config = configparser.ConfigParser(inline_comment_prefixes=('#', ';'))
config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config.ini')
with open(config_path, 'r', encoding='utf-8') as f:
    config.read_file(f)

# 服务器配置
HOST = config.get('Server', 'host', fallback='0.0.0.0')
PORT = config.getint('Server', 'port', fallback=5000)

# 存储配置
MAX_QUOTA_SIZE_MB = config.getint('Storage', 'max_quota', fallback=500)
MAX_QUOTA_SIZE = MAX_QUOTA_SIZE_MB * 1024 * 1024

VERSION = config.get('Version', 'version', fallback='D1')

# 安全配置 - 密码 SHA512 哈希
PASSWORD = config.get('Security', 'password', fallback='').strip()

app = Flask(__name__, static_folder='../static')

# 文件路径配置
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(SCRIPT_DIR, 'data.json')
UPLOAD_DIR = os.path.join(SCRIPT_DIR, 'uploads')

# 确保上传目录存在
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'images'), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, 'datasheets'), exist_ok=True)

class DataStorage:
    """单一 JSON 文件存储管理器"""

    DEFAULT_DATA = {
        'components': [],
        'categories': [],
        'importCart': [],
        'exportCart': [],
        'settings': {}
    }

    def __init__(self, data_file):
        self.data_file = data_file
        self._cache = self._load()

    def _load(self):
        """从文件加载数据"""
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                # 补齐缺失字段
                for key in self.DEFAULT_DATA:
                    if key not in data:
                        data[key] = self.DEFAULT_DATA[key]
                return data
            except (json.JSONDecodeError, IOError):
                pass
        return dict(self.DEFAULT_DATA)

    def _save(self):
        """保存到文件（写入前检查配额）"""
        # 预计算新的 data.json 大小
        new_json = json.dumps(self._cache, ensure_ascii=False, indent=2)
        new_data_size = len(new_json.encode('utf-8'))
        
        # 计算当前已用空间（不含 data.json，因为要替换它）
        uploads_size = get_uploads_size()
        
        # 检查配额
        total_after = uploads_size + new_data_size
        if total_after > MAX_QUOTA_SIZE:
            raise QuotaError(
                f'配额不足。数据文件: {new_data_size / 1024 / 1024:.2f}MB + '
                f'上传文件: {uploads_size / 1024 / 1024:.2f}MB = '
                f'{total_after / 1024 / 1024:.2f}MB，'
                f'超过配额 {MAX_QUOTA_SIZE / 1024 / 1024:.2f}MB'
            )
        
        with open(self.data_file, 'w', encoding='utf-8') as f:
            f.write(new_json)

    def get_all(self, collection):
        """获取集合中所有数据"""
        return self._cache.get(collection, [])

    def get_by_id(self, collection, item_id):
        """根据 ID 获取项目"""
        for item in self._cache.get(collection, []):
            if item.get('id') == item_id:
                return item
        return None

    def add(self, collection, item):
        """添加项目"""
        if collection not in self._cache:
            self._cache[collection] = []
        self._cache[collection].append(item)
        self._save()
        return item

    def update(self, collection, item_id, updates):
        """更新项目"""
        items = self._cache.get(collection, [])
        for i, item in enumerate(items):
            if item.get('id') == item_id:
                items[i].update(updates)
                self._save()
                return items[i]
        return None

    def delete(self, collection, item_id):
        """删除项目"""
        items = self._cache.get(collection, [])
        for i, item in enumerate(items):
            if item.get('id') == item_id:
                items.pop(i)
                self._save()
                return True
        return False

    def save_all(self, collection, items):
        """保存整个集合（用于导入/清空）"""
        self._cache[collection] = items
        self._save()

    def get_settings(self):
        """获取设置"""
        return self._cache.get('settings', {})

    def save_settings(self, settings):
        """保存设置"""
        self._cache['settings'] = settings
        self._save()

# 初始化存储
storage = DataStorage(DATA_FILE)


def generate_id():
    """生成唯一 ID"""
    return str(uuid.uuid4())


def clean_item_for_json(item):
    """清理数据，移除不可序列化字段"""
    if isinstance(item, dict):
        return {k: clean_item_for_json(v) for k, v in item.items()}
    elif isinstance(item, list):
        return [clean_item_for_json(v) for v in item]
    else:
        return item


def get_uploads_size():
    """计算上传文件总大小"""
    total = 0
    for subdir in ['images', 'datasheets']:
        subdir_path = os.path.join(UPLOAD_DIR, subdir)
        if os.path.exists(subdir_path):
            for root, dirs, files in os.walk(subdir_path):
                for f in files:
                    total += os.path.getsize(os.path.join(root, f))
    return total


def get_data_size():
    """获取 data.json 文件大小"""
    if os.path.exists(DATA_FILE):
        return os.path.getsize(DATA_FILE)
    return 0


def get_total_storage_size():
    """获取总存储大小（data.json + 上传文件）"""
    return get_data_size() + get_uploads_size()


def check_quota(additional_size=0):
    """检查配额是否足够
    
    Args:
        additional_size: 额外需要预留的空间（字节）
    
    Returns:
        tuple: (可以存储, 当前大小, 剩余配额, 错误信息)
    """
    current_size = get_total_storage_size()
    remaining = MAX_QUOTA_SIZE - current_size
    can_store = remaining >= additional_size
    error_msg = ''
    
    if not can_store:
        error_msg = f'配额不足。当前已用 {current_size / 1024 / 1024:.2f}MB，剩余 {remaining / 1024 / 1024:.2f}MB，无法存储 {additional_size / 1024 / 1024:.2f}MB 的文件'
    
    return can_store, current_size, remaining, error_msg


# 配额超限异常
class QuotaError(Exception):
    """存储配额超限异常"""
    pass


@app.errorhandler(QuotaError)
def handle_quota_error(error):
    """处理配额超限错误，返回 507"""
    return jsonify({'error': str(error)}), 507


# ==================== 静态文件服务 ====================

@app.route('/')
def index():
    return send_from_directory('../static', 'index.html')


@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('../static', path)


# ==================== 配置信息 API ====================

@app.route('/api/config', methods=['GET'])
def get_config():
    """获取系统配置信息"""
    return jsonify({
        'version': VERSION,
        'maxQuotaSizeMb': MAX_QUOTA_SIZE_MB
    })


# ==================== 器件 API ====================

@app.route('/api/components', methods=['GET'])
def get_components():
    components = storage.get_all('components')
    return jsonify(components)


@app.route('/api/components/<component_id>', methods=['GET'])
def get_component(component_id):
    component = storage.get_by_id('components', component_id)
    if component:
        return jsonify(component)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/components', methods=['POST'])
def add_component():
    data = request.get_json()
    data['id'] = generate_id()
    data['createdAt'] = datetime.now().isoformat()
    data['updatedAt'] = datetime.now().isoformat()
    data = clean_item_for_json(data)
    result = storage.add('components', data)
    return jsonify(result), 201


@app.route('/api/components/<component_id>', methods=['PUT'])
def update_component(component_id):
    data = request.get_json()
    data['updatedAt'] = datetime.now().isoformat()
    data = clean_item_for_json(data)
    result = storage.update('components', component_id, data)
    if result:
        return jsonify(result)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/components/<component_id>', methods=['DELETE'])
def delete_component(component_id):
    component = storage.get_by_id('components', component_id)
    if component:
        for url in component.get('imageUrls', []):
            if url.startswith('/uploads/'):
                file_path = os.path.join(os.path.dirname(__file__), url[1:])
                if os.path.exists(file_path):
                    os.remove(file_path)
        for url in component.get('datasheetUrls', []):
            if url.startswith('/uploads/'):
                file_path = os.path.join(os.path.dirname(__file__), url[1:])
                if os.path.exists(file_path):
                    os.remove(file_path)
        for url in component.get('attachmentUrls', []):
            if url.startswith('/uploads/'):
                file_path = os.path.join(os.path.dirname(__file__), url[1:])
                if os.path.exists(file_path):
                    os.remove(file_path)

    if storage.delete('components', component_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/components/batch-delete', methods=['POST'])
def batch_delete_components():
    data = request.get_json()
    ids = data.get('ids', [])

    for component_id in ids:
        component = storage.get_by_id('components', component_id)
        if component:
            for url in component.get('imageUrls', []) + component.get('datasheetUrls', []) + component.get('attachmentUrls', []):
                if url.startswith('/uploads/'):
                    file_path = os.path.join(os.path.dirname(__file__), url[1:])
                    if os.path.exists(file_path):
                        os.remove(file_path)
        storage.delete('components', component_id)

    return jsonify({'success': True, 'deleted': len(ids)})


# ==================== 分类 API ====================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = storage.get_all('categories')
    return jsonify(categories)


@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.get_json()
    data['id'] = generate_id()
    data['createdAt'] = datetime.now().isoformat()
    result = storage.add('categories', data)
    return jsonify(result), 201


@app.route('/api/categories/<category_id>', methods=['PUT'])
def update_category(category_id):
    data = request.get_json()
    result = storage.update('categories', category_id, data)
    if result:
        return jsonify(result)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/categories/<category_id>', methods=['DELETE'])
def delete_category(category_id):
    if storage.delete('categories', category_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Not found'}), 404


# ==================== 购物车 API ====================

@app.route('/api/cart/import', methods=['GET'])
def get_import_cart():
    cart = storage.get_all('importCart')
    return jsonify(cart)


@app.route('/api/cart/import', methods=['POST'])
def add_to_import_cart():
    data = request.get_json()
    data['id'] = data.get('id') or generate_id()
    result = storage.add('importCart', data)
    return jsonify(result), 201


@app.route('/api/cart/import/<item_id>', methods=['PUT'])
def update_import_cart_item(item_id):
    data = request.get_json()
    result = storage.update('importCart', item_id, data)
    if result:
        return jsonify(result)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/cart/import/<item_id>', methods=['DELETE'])
def remove_from_import_cart(item_id):
    if storage.delete('importCart', item_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/cart/import/clear', methods=['POST'])
def clear_import_cart():
    storage.save_all('importCart', [])
    return jsonify({'success': True})


@app.route('/api/cart/export', methods=['GET'])
def get_export_cart():
    cart = storage.get_all('exportCart')
    return jsonify(cart)


@app.route('/api/cart/export', methods=['POST'])
def add_to_export_cart():
    data = request.get_json()
    data['id'] = data.get('id') or generate_id()
    result = storage.add('exportCart', data)
    return jsonify(result), 201


@app.route('/api/cart/export/<item_id>', methods=['PUT'])
def update_export_cart_item(item_id):
    data = request.get_json()
    result = storage.update('exportCart', item_id, data)
    if result:
        return jsonify(result)
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/cart/export/<item_id>', methods=['DELETE'])
def remove_from_export_cart(item_id):
    if storage.delete('exportCart', item_id):
        return jsonify({'success': True})
    return jsonify({'error': 'Not found'}), 404


@app.route('/api/cart/export/clear', methods=['POST'])
def clear_export_cart():
    storage.save_all('exportCart', [])
    return jsonify({'success': True})


# ==================== 设置 API ====================

@app.route('/api/settings', methods=['GET'])
def get_settings():
    settings = storage.get_settings()
    return jsonify(settings)


@app.route('/api/settings', methods=['POST'])
def save_settings():
    data = request.get_json()
    storage.save_settings(data)
    return jsonify({'success': True})


# ==================== 文件上传 API ====================

@app.route('/api/upload/image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # 预计算文件大小并检查配额
    file.seek(0, 2)  #移到末尾
    file_size = file.tell()
    file.seek(0)  # 恢复到开头
    
    can_store, current_size, remaining, error_msg = check_quota(file_size)
    if not can_store:
        return jsonify({'error': error_msg}), 507

    ext = os.path.splitext(file.filename)[1]
    filename = f"{generate_id()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, 'images', filename)
    file.save(filepath)

    return jsonify({
        'url': f'/uploads/images/{filename}',
        'filename': filename
    })


@app.route('/api/upload/datasheet', methods=['POST'])
def upload_datasheet():
    if 'file' not in request.files:
        return jsonify({'error': 'No file'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # 预计算文件大小并检查配额
    file.seek(0, 2)  #移到末尾
    file_size = file.tell()
    file.seek(0)  # 恢复到开头
    
    can_store, current_size, remaining, error_msg = check_quota(file_size)
    if not can_store:
        return jsonify({'error': error_msg}), 507

    ext = os.path.splitext(file.filename)[1]
    filename = f"{generate_id()}{ext}"
    filepath = os.path.join(UPLOAD_DIR, 'datasheets', filename)
    file.save(filepath)

    return jsonify({
        'url': f'/uploads/datasheets/{filename}',
        'filename': filename
    })


@app.route('/uploads/<path:filepath>')
def serve_upload(filepath):
    return send_from_directory(UPLOAD_DIR, filepath)


# ==================== 清空数据 API ====================

@app.route('/api/clear-all', methods=['POST'])
def clear_all_data():
    storage.save_all('components', [])
    storage.save_all('categories', [])
    storage.save_all('importCart', [])
    storage.save_all('exportCart', [])
    storage.save_settings({})

    for subdir in ['images', 'datasheets']:
        subdir_path = os.path.join(UPLOAD_DIR, subdir)
        if os.path.exists(subdir_path):
            shutil.rmtree(subdir_path)
            os.makedirs(subdir_path)

    return jsonify({'success': True})


# ==================== 存储信息 API ====================

@app.route('/api/storage-info', methods=['GET'])
def get_storage_info():
    data_size = get_data_size()
    uploads_size = get_uploads_size()

    return jsonify({
        'dataSize': data_size,
        'uploadsSize': uploads_size,
        'totalSize': data_size + uploads_size,
        'maxQuotaSizeMb': MAX_QUOTA_SIZE_MB
    })


# ==================== 服务器重启 API ====================

def verify_password(password_input):
    if not PASSWORD:
        return False
    try:
        stored_hash = PASSWORD.lower().strip()
        input_hash = hashlib.sha512(password_input.encode('utf-8')).hexdigest().lower()
        return input_hash == stored_hash
    except:
        return False


def do_restart():
    script_path = os.path.abspath(__file__)
    python_exe = sys.executable
    
    pythonw_exe = os.path.join(os.path.dirname(python_exe), 'pythonw.exe')
    if os.path.exists(pythonw_exe):
        python_exe = pythonw_exe
    
    env = os.environ.copy()
    env['FLASK_DEBUG'] = '0'
    
    if os.name == 'nt':
        subprocess.Popen([python_exe, script_path],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL,
                         creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.CREATE_NO_WINDOW,
                         env=env)
    else:
        subprocess.Popen([python_exe, script_path],
                         stdout=subprocess.DEVNULL,
                         stderr=subprocess.DEVNULL,
                         env=env)
    
    time.sleep(1)
    os._exit(0)

@app.route('/api/restart', methods=['POST'])
def restart_server():
    try:
        data = request.get_json(force=True)
        password_input = data.get('password', '') if data else ''
    except:
        password_input = ''

    if not verify_password(password_input):
        return jsonify({'success': False, 'message': '密码错误'}), 401

    try:
        thread = threading.Thread(target=do_restart)
        thread.daemon = True
        thread.start()
        
        return jsonify({'success': True, 'message': '服务器正在重启，请稍候...'})
    except Exception as e:
        return jsonify({'success': False, 'message': '重启失败: ' + str(e)}), 500


if __name__ == '__main__':
    print("=" * 50)
    print("元件管理系统 - Flask 后端")
    print("=" * 50)
    print(f"数据文件: {DATA_FILE}")
    print(f"上传目录: {UPLOAD_DIR}")
    print(f"总配额限制: {MAX_QUOTA_SIZE_MB} MB")
    print(f"版本: Version {VERSION}")
    print("=" * 50)
    print("服务启动中...")
    print(f"访问地址: http://localhost:{PORT}")
    print("=" * 50)

    app.run(host=HOST, port=PORT, debug=False, use_reloader=False)
