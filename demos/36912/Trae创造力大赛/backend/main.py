"""
机器人控制后端服务
使用 FastAPI 框架，SDK 占位符实现
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime
import asyncio

app = FastAPI(
    title="机器人控制 API",
    description="用于微信小程序远程控制机器人的后端服务",
    version="1.0.0"
)

# 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应限制来源
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== 数据模型 ====================

class RobotConfig(BaseModel):
    """机器人配置"""
    name: str
    ip: str
    port: int
    autoConnect: bool = False


class MotionControl(BaseModel):
    """运动控制参数"""
    direction: Literal["forward", "backward", "left", "right", "stop"]
    speed: int = 50
    angle: int = 0


class GripperControl(BaseModel):
    """夹爪控制参数"""
    action: Literal["open", "close"]


class RobotStatus(BaseModel):
    """机器人状态"""
    connectionStatus: Literal["disconnected", "connecting", "connected", "error"]
    batteryLevel: int
    temperature: float
    isMoving: bool
    gripperState: Literal["open", "closed", "moving"]
    lastUpdate: str


class ApiResponse(BaseModel):
    """API 响应"""
    success: bool
    data: Optional[dict] = None
    message: Optional[str] = None


# ==================== 全局状态 ====================

current_status = RobotStatus(
    connectionStatus="disconnected",
    batteryLevel=85,
    temperature=36.5,
    isMoving=False,
    gripperState="open",
    lastUpdate=datetime.now().isoformat()
)

robot_config: Optional[RobotConfig] = None


# ==================== SDK 占位符 ====================

class RobotSDK:
    """
    机器人 SDK 占位符
    TODO: 替换为真实机器人厂家的 SDK
    """
    
    def __init__(self):
        self.connected = False
    
    async def connect(self, ip: str, port: int) -> bool:
        """连接机器人"""
        print(f"[SDK Placeholder] 连接机器人: {ip}:{port}")
        await asyncio.sleep(1.5)  # 模拟连接延迟
        self.connected = True
        return True
    
    async def disconnect(self) -> bool:
        """断开连接"""
        print("[SDK Placeholder] 断开连接")
        await asyncio.sleep(0.5)
        self.connected = False
        return True
    
    async def move(self, direction: str, speed: int, angle: int) -> bool:
        """运动控制"""
        print(f"[SDK Placeholder] 运动: {direction}, 速度: {speed}, 角度: {angle}")
        await asyncio.sleep(0.2)
        return True
    
    async def stop(self) -> bool:
        """停止运动"""
        print("[SDK Placeholder] 停止运动")
        await asyncio.sleep(0.1)
        return True
    
    async def gripper_open(self) -> bool:
        """张开夹爪"""
        print("[SDK Placeholder] 张开夹爪")
        await asyncio.sleep(0.3)
        return True
    
    async def gripper_close(self) -> bool:
        """闭合夹爪"""
        print("[SDK Placeholder] 闭合夹爪")
        await asyncio.sleep(0.3)
        return True
    
    async def get_status(self) -> dict:
        """获取状态"""
        return {
            "batteryLevel": 85,
            "temperature": 36.5,
            "isMoving": False,
            "gripperState": "open"
        }


# 全局 SDK 实例
sdk = RobotSDK()


# ==================== API 路由 ====================

@app.get("/")
async def root():
    """根路径"""
    return {"message": "机器人控制 API 服务运行中", "version": "1.0.0"}


@app.post("/api/connect", response_model=ApiResponse)
async def connect_robot(config: RobotConfig):
    """
    连接机器人（上电初始化）
    """
    global current_status, robot_config
    
    try:
        current_status.connectionStatus = "connecting"
        
        # 调用 SDK 连接
        success = await sdk.connect(config.ip, config.port)
        
        if success:
            robot_config = config
            current_status.connectionStatus = "connected"
            current_status.lastUpdate = datetime.now().isoformat()
            
            return ApiResponse(
                success=True,
                data=current_status.model_dump(),
                message="连接成功"
            )
        else:
            current_status.connectionStatus = "error"
            return ApiResponse(
                success=False,
                message="连接失败"
            )
            
    except Exception as e:
        print(f"[Error] 连接异常: {e}")
        current_status.connectionStatus = "error"
        return ApiResponse(
            success=False,
            message=f"连接异常: {str(e)}"
        )


@app.post("/api/disconnect", response_model=ApiResponse)
async def disconnect_robot():
    """断开连接"""
    global current_status, robot_config
    
    try:
        await sdk.disconnect()
        current_status.connectionStatus = "disconnected"
        robot_config = None
        current_status.lastUpdate = datetime.now().isoformat()
        
        return ApiResponse(
            success=True,
            message="已断开连接"
        )
    except Exception as e:
        print(f"[Error] 断开连接异常: {e}")
        return ApiResponse(
            success=False,
            message=f"断开连接异常: {str(e)}"
        )


@app.get("/api/status", response_model=ApiResponse)
async def get_status():
    """获取机器人状态"""
    global current_status
    
    if current_status.connectionStatus != "connected":
        return ApiResponse(
            success=True,
            data=current_status.model_dump()
        )
    
    try:
        # 获取最新状态
        status_data = await sdk.get_status()
        current_status.batteryLevel = status_data["batteryLevel"]
        current_status.temperature = status_data["temperature"]
        current_status.isMoving = status_data["isMoving"]
        current_status.gripperState = status_data["gripperState"]
        current_status.lastUpdate = datetime.now().isoformat()
        
        return ApiResponse(
            success=True,
            data=current_status.model_dump()
        )
    except Exception as e:
        print(f"[Error] 获取状态异常: {e}")
        return ApiResponse(
            success=False,
            message=f"获取状态异常: {str(e)}"
        )


@app.post("/api/motion", response_model=ApiResponse)
async def control_motion(control: MotionControl):
    """运动控制"""
    global current_status
    
    if current_status.connectionStatus != "connected":
        return ApiResponse(
            success=False,
            message="机器人未连接"
        )
    
    try:
        if control.direction == "stop":
            await sdk.stop()
            current_status.isMoving = False
        else:
            await sdk.move(control.direction, control.speed, control.angle)
            current_status.isMoving = True
        
        current_status.lastUpdate = datetime.now().isoformat()
        
        return ApiResponse(
            success=True,
            message=f"执行{control.direction}操作成功"
        )
    except Exception as e:
        print(f"[Error] 运动控制异常: {e}")
        return ApiResponse(
            success=False,
            message=f"运动控制异常: {str(e)}"
        )


@app.post("/api/gripper", response_model=ApiResponse)
async def control_gripper(control: GripperControl):
    """夹爪控制"""
    global current_status
    
    if current_status.connectionStatus != "connected":
        return ApiResponse(
            success=False,
            message="机器人未连接"
        )
    
    try:
        if control.action == "open":
            await sdk.gripper_open()
            current_status.gripperState = "open"
        else:
            await sdk.gripper_close()
            current_status.gripperState = "closed"
        
        current_status.lastUpdate = datetime.now().isoformat()
        
        action_text = "张开" if control.action == "open" else "闭合"
        return ApiResponse(
            success=True,
            message=f"夹爪{action_text}成功"
        )
    except Exception as e:
        print(f"[Error] 夹爪控制异常: {e}")
        return ApiResponse(
            success=False,
            message=f"夹爪控制异常: {str(e)}"
        )


# ==================== 启动服务 ====================

if __name__ == "__main__":
    import uvicorn
    print("=" * 50)
    print("机器人控制后端服务启动中...")
    print("API 文档: http://localhost:8000/docs")
    print("=" * 50)
    uvicorn.run(app, host="0.0.0.0", port=8000)
