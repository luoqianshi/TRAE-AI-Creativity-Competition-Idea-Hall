"""配置文件"""
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # 应用配置
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'ai-video-editor-secret-key'
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    OUTPUT_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'outputs')
    MAX_CONTENT_LENGTH = 500 * 1024 * 1024  # 最大上传500MB
    
    # 允许的视频格式
    ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv'}
    
    # AI配置
    AI_API_KEY = os.environ.get('AI_API_KEY', '')
    AI_API_BASE = os.environ.get('AI_API_BASE', 'https://api.openai.com/v1')
    AI_MODEL = os.environ.get('AI_MODEL', 'gpt-4o')
    
    @staticmethod
    def init_app():
        """初始化应用，创建必要目录"""
        os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
        os.makedirs(Config.OUTPUT_FOLDER, exist_ok=True)