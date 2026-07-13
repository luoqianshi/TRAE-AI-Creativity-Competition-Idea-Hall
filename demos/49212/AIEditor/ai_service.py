"""
AI服务模块 - 处理AI对话和剪辑指令解析
"""
import json
import re
from openai import OpenAI


def process_chat_message(api_key, api_base, model, project, user_message):
    """
    处理用户消息，返回AI响应
    
    Args:
        api_key: AI API密钥
        api_base: AI API基础URL
        model: 使用的模型
        project: 项目数据
        user_message: 用户消息
    
    Returns:
        dict: AI响应，包含message和actions
    """
    if not api_key:
        return {
            'message': '请先配置AI API密钥。点击右上角设置按钮，输入您的API密钥。',
            'actions': []
        }
    
    # 构建上下文
    files_info = []
    for f in project['files']:
        files_info.append(f"- {f['name']} (时长: {f['duration']}秒, 大小: {f['size']}MB)")
    
    files_context = "\n".join(files_info) if files_info else "暂无上传的视频素材"
    
    # 构建聊天历史
    chat_history = []
    for msg in project['chatHistory'][-10:]:  # 只取最近10条
        chat_history.append({
            'role': msg['role'],
            'content': msg['content']
        })
    
    system_prompt = f"""你是一个专业的AI视频剪辑助手。你的任务是根据用户的需求，帮助他们剪辑视频。

当前项目状态:
- 项目ID: {project['id']}
- 上传的素材文件:
{files_context}

你需要理解用户的需求，并将其转换为具体的剪辑指令。当用户提出剪辑需求时，你需要返回:
1. 对用户的友好回复
2. 结构化的剪辑操作指令（JSON格式）

剪辑指令格式示例:
```json
{{
    "actions": [
        {{
            "type": "trim",
            "file": "文件名",
            "start": 0,
            "end": 10,
            "description": "截取0-10秒片段"
        }},
        {{
            "type": "concat",
            "files": ["文件1", "文件2"],
            "description": "合并多个片段"
        }},
        {{
            "type": "add_text",
            "text": "要添加的文字",
            "position": "center",
            "start": 5,
            "end": 10
        }},
        {{
            "type": "add_music",
            "style": "happy",
            "volume": 0.5
        }},
        {{
            "type": "set_duration",
            "duration": 30,
            "description": "设置目标时长为30秒"
        }},
        {{
            "type": "highlight",
            "description": "自动提取精彩片段"
        }}
        {{
            "type": "transition",
            "effect": "fade",
            "duration": 1.0,
            "description": "添加转场效果"
        }}
    ]
}}
```

操作类型说明:
- trim: 裁剪视频片段
- concat: 合并多个视频
- add_text: 添加文字
- add_music: 添加背景音乐
- set_duration: 设置目标时长
- highlight: 自动提取精彩片段
- transition: 添加转场效果

请根据用户需求灵活组合这些操作。如果用户的需求不够明确，请询问更多细节。
在回复中，请用自然语言解释你的剪辑计划，并在最后附上JSON格式的操作指令。
"""

    try:
        client = OpenAI(api_key=api_key, base_url=api_base)
        
        messages = [
            {"role": "system", "content": system_prompt},
            *chat_history,
            {"role": "user", "content": user_message}
        ]
        
        response = client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=0.7,
            max_tokens=2000
        )
        
        ai_message = response.choices[0].message.content
        
        # 解析AI响应中的操作指令
        actions = parse_actions(ai_message)
        
        return {
            'message': ai_message,
            'actions': actions
        }
        
    except Exception as e:
        return {
            'message': f'AI处理出错: {str(e)}。请检查API配置是否正确。',
            'actions': []
        }


def parse_actions(message):
    """从AI消息中解析操作指令"""
    actions = []
    
    # 尝试提取JSON代码块
    json_pattern = r'```json\s*([\s\S]*?)\s*```'
    matches = re.findall(json_pattern, message)
    
    for match in matches:
        try:
            data = json.loads(match)
            if 'actions' in data:
                actions.extend(data['actions'])
        except json.JSONDecodeError:
            continue
    
    # 也尝试匹配没有代码块的JSON
    if not actions:
        try:
            # 尝试找到最后一个JSON对象
            json_pattern2 = r'\{[\s\S]*"actions"[\s\S]*\}'
            match = re.search(json_pattern2, message)
            if match:
                data = json.loads(match.group())
                if 'actions' in data:
                    actions = data['actions']
        except:
            pass
    
    return actions


def analyze_video_content(api_key, api_base, model, video_description):
    """
    分析视频内容，生成剪辑建议
    """
    if not api_key:
        return []
    
    prompt = f"""请分析以下视频描述，给出专业的剪辑建议:

视频描述: {video_description}

请返回JSON格式的建议列表，每条建议包含:
- type: 建议类型 (cut, effect, music, text)
- description: 建议描述
- reason: 建议理由
"""
    
    try:
        client = OpenAI(api_key=api_key, base_url=api_base)
        response = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7
        )
        
        # 解析建议
        return response.choices[0].message.content
    except:
        return "无法分析视频内容"