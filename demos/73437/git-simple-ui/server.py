#!/usr/bin/env python3
"""
Git 简易操作面板 - 后端服务器
提供 Git 命令执行 API 并托管前端页面
"""

import subprocess
import os
import sys
import json
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__, static_url_path='', static_folder='.')

# 命令映射
COMMANDS = {
    'pull':       ['git', 'pull'],
    'push':       ['git', 'push'],
    'latest':     ['git', 'log', '--oneline', '--graph', '--all', '-15'],
    'conflict':   ['git', 'status'],
    'branch_info': ['git', 'status'],
}


def get_default_repo_path():
    """尝试获取当前目录或父目录中的 git 仓库路径"""
    cwd = os.getcwd()
    # 检查当前目录是否在 git 仓库中
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--show-toplevel'],
            cwd=cwd, capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    # 检查父目录
    parent = os.path.dirname(cwd)
    try:
        result = subprocess.run(
            ['git', 'rev-parse', '--show-toplevel'],
            cwd=parent, capture_output=True, text=True, timeout=5
        )
        if result.returncode == 0:
            return result.stdout.strip()
    except Exception:
        pass
    return ''


@app.route('/api/git', methods=['POST'])
def git_operation():
    """
    执行 Git 操作
    请求体: {"operation": "pull|push|latest|conflict|branch_info", "repo_path": "/path/to/repo"}
    """
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': '无效的请求体'}), 400

    operation = data.get('operation', '')
    repo_path = data.get('repo_path', '')

    if not repo_path:
        return jsonify({'error': '请提供仓库路径'}), 400

    if not os.path.isdir(repo_path):
        return jsonify({'error': f'路径不存在: {repo_path}'}), 400

    # sync: 先 pull 再 push
    if operation == 'sync':
        try:
            pull_result = subprocess.run(
                ['git', 'pull'], cwd=repo_path, capture_output=True, text=True, timeout=120
            )
            combined_stdout = pull_result.stdout
            combined_stderr = pull_result.stderr
            if pull_result.returncode != 0:
                return jsonify({
                    'stdout': combined_stdout,
                    'stderr': combined_stderr,
                    'returncode': pull_result.returncode
                })
            push_result = subprocess.run(
                ['git', 'push'], cwd=repo_path, capture_output=True, text=True, timeout=120
            )
            combined_stdout += '\n' + push_result.stdout
            combined_stderr += '\n' + push_result.stderr
            return jsonify({
                'stdout': combined_stdout,
                'stderr': combined_stderr,
                'returncode': push_result.returncode
            })
        except subprocess.TimeoutExpired:
            return jsonify({'error': '命令执行超时（> 120 秒）'}), 504
        except FileNotFoundError:
            return jsonify({'error': '未找到 git 命令，请确认已安装 Git'}), 500
        except Exception as e:
            return jsonify({'error': f'执行出错: {str(e)}'}), 500

    if operation not in COMMANDS:
        return jsonify({'error': f'未知操作: {operation}'}), 400

    cmd = COMMANDS[operation]

    try:
        result = subprocess.run(
            cmd,
            cwd=repo_path,
            capture_output=True,
            text=True,
            timeout=120  # 2 分钟超时，防止 push/pull 长时间挂起
        )
        return jsonify({
            'stdout': result.stdout,
            'stderr': result.stderr,
            'returncode': result.returncode
        })
    except subprocess.TimeoutExpired:
        return jsonify({'error': '命令执行超时（> 120 秒）'}), 504
    except subprocess.CalledProcessError as e:
        return jsonify({
            'stdout': e.stdout or '',
            'stderr': e.stderr or '',
            'returncode': e.returncode
        })
    except FileNotFoundError:
        return jsonify({'error': '未找到 git 命令，请确认已安装 Git'}), 500
    except Exception as e:
        return jsonify({'error': f'执行出错: {str(e)}'}), 500


@app.route('/')
def index():
    """返回前端页面"""
    return send_from_directory('.', 'git-simple-ui.html')


@app.route('/api/health', methods=['GET'])
def health():
    """健康检查"""
    return jsonify({'status': 'ok', 'message': 'Git 简易操作面板运行中'})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    default_path = get_default_repo_path()

    print('=' * 54)
    print('  🚀 Git 简易操作面板')
    print('  ' + '-' * 44)
    print(f'  📍 访问地址: http://localhost:{port}')
    print(f'  📂 检测到仓库: {default_path or "未检测到（可在界面中手动输入）"}')
    print(f'  ⌨️  快捷键: ⌘P Pull · ⌘U Push · ⌘L Latest · ⌘C Conflict')
    print('  ' + '-' * 44)
    print('  按 Ctrl+C 停止服务器')
    print('=' * 54)

    if default_path:
        print(f'\n  自动加载仓库: {default_path}\n')

    app.run(host='0.0.0.0', port=port, debug=False)