"""
视频处理服务模块 - 核心视频处理逻辑
"""
import os
import subprocess
import json
import random
from datetime import datetime


def get_video_info(filepath):
    """获取视频详细信息"""
    try:
        result = subprocess.run([
            'ffprobe', '-v', 'quiet',
            '-print_format', 'json',
            '-show_format', '-show_streams',
            filepath
        ], capture_output=True, text=True)
        
        info = json.loads(result.stdout)
        return info
    except Exception as e:
        print(f"获取视频信息失败: {e}")
        return None


def generate_final_video(project, output_folder):
    """
    根据项目配置生成最终视频
    
    Args:
        project: 项目数据
        output_folder: 输出目录
    
    Returns:
        dict: 生成结果
    """
    project_id = project['id']
    output_dir = os.path.join(output_folder, project_id)
    os.makedirs(output_dir, exist_ok=True)
    
    # 获取所有上传的视频文件
    video_files = [f['path'] for f in project['files']]
    
    if not video_files:
        raise ValueError("没有可用的视频素材")
    
    # 获取聊天历史中的最后一条AI消息
    actions = []
    for msg in reversed(project['chatHistory']):
        if msg['role'] == 'assistant' and 'actions' in msg:
            actions = msg.get('actions', [])
            break
    
    # 如果没有明确的操作指令，执行默认处理
    if not actions:
        # 默认：合并所有视频
        output_path = os.path.join(output_dir, f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
        result = concat_videos(video_files, output_path)
        return {'output_path': result}
    
    # 执行操作
    current_clips = []
    output_path = os.path.join(output_dir, f"output_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
    
    for action in actions:
        action_type = action.get('type')
        
        if action_type == 'trim':
            # 裁剪视频片段
            file_name = action.get('file', '')
            start = action.get('start', 0)
            end = action.get('end', 10)
            
            # 查找文件
            target_file = None
            for f in project['files']:
                if file_name in f['name'] or file_name == f['name']:
                    target_file = f['path']
                    break
            
            if target_file:
                clip_path = os.path.join(output_dir, f"clip_{len(current_clips)}.mp4")
                trim_video(target_file, clip_path, start, end)
                current_clips.append(clip_path)
        
        elif action_type == 'concat':
            # 合并视频
            files = action.get('files', [])
            duration = action.get('duration')
            
            target_files = []
            for fname in files:
                for f in project['files']:
                    if fname in f['name'] or fname == f['name']:
                        target_files.append(f['path'])
                        break
            
            if target_files:
                concat_path = os.path.join(output_dir, "concat_temp.mp4")
                concat_videos(target_files, concat_path)
                
                if duration:
                    # 调整到指定时长
                    trim_video(concat_path, output_path, 0, duration)
                    os.remove(concat_path)
                else:
                    os.rename(concat_path, output_path)
                return {'output_path': output_path}
        
        elif action_type == 'highlight':
            # 自动提取精彩片段
            target_duration = action.get('duration', 60)
            clips = extract_highlights(video_files, output_dir, target_duration)
            if clips:
                concat_videos(clips, output_path)
                return {'output_path': output_path}
        
        elif action_type == 'set_duration':
            # 设置目标时长
            target_duration = action.get('duration', 30)
            if video_files:
                # 自动提取片段来满足时长
                clips = auto_extract_clips(video_files, output_dir, target_duration)
                if clips:
                    concat_videos(clips, output_path)
                    return {'output_path': output_path}
        
        elif action_type == 'transition':
            # 添加转场效果
            effect = action.get('effect', 'fade')
            trans_duration = action.get('duration', 1.0)
            
            if current_clips:
                output_path = add_transitions(current_clips, output_path, effect, trans_duration)
            elif video_files:
                output_path = add_transitions(video_files, output_path, effect, trans_duration)
            
            return {'output_path': output_path}
    
    # 如果有裁剪的片段，合并它们
    if current_clips:
        concat_videos(current_clips, output_path)
        return {'output_path': output_path}
    
    # 默认：合并所有视频
    if video_files:
        concat_videos(video_files, output_path)
        return {'output_path': output_path}
    
    raise ValueError("无法生成视频")


def trim_video(input_path, output_path, start, end):
    """
    裁剪视频片段
    
    Args:
        input_path: 输入视频路径
        output_path: 输出视频路径
        start: 开始时间（秒）
        end: 结束时间（秒）
    """
    cmd = [
        'ffmpeg', '-y',
        '-i', input_path,
        '-ss', str(start),
        '-to', str(end),
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-strict', 'experimental',
        output_path
    ]
    
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path


def concat_videos(video_paths, output_path):
    """
    合并多个视频
    
    Args:
        video_paths: 视频路径列表
        output_path: 输出路径
    """
    if len(video_paths) == 0:
        raise ValueError("没有视频可合并")
    
    if len(video_paths) == 1:
        # 单个视频，直接复制
        import shutil
        shutil.copy(video_paths[0], output_path)
        return output_path
    
    # 创建临时文件列表
    list_file = os.path.join(os.path.dirname(output_path), 'filelist.txt')
    with open(list_file, 'w', encoding='utf-8') as f:
        for path in video_paths:
            # 使用绝对路径并替换反斜杠
            abs_path = os.path.abspath(path).replace('\\', '/')
            f.write(f"file '{abs_path}'\n")
    
    # 合并视频
    cmd = [
        'ffmpeg', '-y',
        '-f', 'concat',
        '-safe', '0',
        '-i', list_file,
        '-c:v', 'libx264',
        '-c:a', 'aac',
        '-strict', 'experimental',
        output_path
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
    finally:
        # 清理临时文件
        if os.path.exists(list_file):
            os.remove(list_file)
    
    return output_path


def add_transitions(video_paths, output_path, effect='fade', duration=1.0):
    """
    为视频添加转场效果
    
    Args:
        video_paths: 视频路径列表
        output_path: 输出路径
        effect: 转场效果 (fade, dissolve, wipe)
        duration: 转场时长（秒）
    """
    # 简化处理：直接合并并添加淡入淡出
    temp_concat = os.path.join(os.path.dirname(output_path), 'temp_concat.mp4')
    concat_videos(video_paths, temp_concat)
    
    # 获取视频时长
    info = get_video_info(temp_concat)
    video_duration = float(info['format']['duration']) if info else 60
    
    # 添加淡入淡出效果
    cmd = [
        'ffmpeg', '-y',
        '-i', temp_concat,
        '-vf', f'fade=t=in:st=0:d={duration},fade=t=out:st={video_duration-duration}:d={duration}',
        '-c:v', 'libx264',
        '-c:a', 'copy',
        output_path
    ]
    
    try:
        subprocess.run(cmd, capture_output=True, check=True)
    finally:
        if os.path.exists(temp_concat):
            os.remove(temp_concat)
    
    return output_path


def extract_highlights(video_paths, output_dir, target_duration=60):
    """
    提取精彩片段
    
    Args:
        video_paths: 视频路径列表
        output_dir: 输出目录
        target_duration: 目标总时长（秒）
    
    Returns:
        list: 提取的片段路径列表
    """
    clips = []
    remaining_duration = target_duration
    
    for video_path in video_paths:
        if remaining_duration <= 0:
            break
        
        # 获取视频信息
        info = get_video_info(video_path)
        if not info:
            continue
        
        duration = float(info['format']['duration'])
        
        # 简单策略：从每个视频中均匀提取片段
        clip_duration = min(10, remaining_duration)
        
        if duration > clip_duration:
            # 随机选择起始点
            max_start = duration - clip_duration
            start = random.uniform(0, max_start)
        else:
            start = 0
            clip_duration = duration
        
        clip_path = os.path.join(output_dir, f"highlight_{len(clips)}.mp4")
        trim_video(video_path, clip_path, start, start + clip_duration)
        clips.append(clip_path)
        remaining_duration -= clip_duration
    
    return clips


def auto_extract_clips(video_paths, output_dir, target_duration):
    """
    自动提取视频片段以满足目标时长
    
    Args:
        video_paths: 视频路径列表
        output_dir: 输出目录
        target_duration: 目标时长（秒）
    
    Returns:
        list: 提取的片段路径列表
    """
    clips = []
    remaining_duration = target_duration
    
    for video_path in video_paths:
        if remaining_duration <= 0:
            break
        
        # 获取视频信息
        info = get_video_info(video_path)
        if not info:
            continue
        
        duration = float(info['format']['duration'])
        
        # 计算需要的片段长度
        clip_duration = min(duration, remaining_duration)
        
        clip_path = os.path.join(output_dir, f"clip_{len(clips)}.mp4")
        
        if clip_duration >= duration:
            # 使用整个视频
            import shutil
            shutil.copy(video_path, clip_path)
        else:
            # 裁剪片段
            trim_video(video_path, clip_path, 0, clip_duration)
        
        clips.append(clip_path)
        remaining_duration -= clip_duration
    
    return clips


def add_background_music(video_path, music_path, output_path, volume=0.5):
    """
    添加背景音乐
    
    Args:
        video_path: 视频路径
        music_path: 音乐路径
        output_path: 输出路径
        volume: 音乐音量 (0.0 - 1.0)
    """
    cmd = [
        'ffmpeg', '-y',
        '-i', video_path,
        '-i', music_path,
        '-filter_complex', f'[1:a]volume={volume}[a1];[0:a][a1]amix=inputs=2:duration=first',
        '-c:v', 'copy',
        '-c:a', 'aac',
        output_path
    ]
    
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path


def add_text_overlay(video_path, output_path, text, position='center', 
                     start_time=0, end_time=None, fontsize=48, color='white'):
    """
    添加文字叠加
    
    Args:
        video_path: 视频路径
        output_path: 输出路径
        text: 文字内容
        position: 位置 (center, top, bottom)
        start_time: 开始时间（秒）
        end_time: 结束时间（秒）
        fontsize: 字体大小
        color: 字体颜色
    """
    # 计算位置
    positions = {
        'center': '(w-text_w)/2:(h-text_h)/2',
        'top': '(w-text_w)/2:50',
        'bottom': '(w-text_w)/2:h-100'
    }
    
    pos = positions.get(position, positions['center'])
    
    # 构建滤镜
    filter_str = f"drawtext=text='{text}':fontsize={fontsize}:fontcolor={color}:x={pos}"
    
    if start_time > 0 or end_time:
        end = end_time if end_time else 999999
        filter_str += f":enable='between(t,{start_time},{end})'"
    
    cmd = [
        'ffmpeg', '-y',
        '-i', video_path,
        '-vf', filter_str,
        '-c:v', 'libx264',
        '-c:a', 'copy',
        output_path
    ]
    
    subprocess.run(cmd, capture_output=True, check=True)
    return output_path