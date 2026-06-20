const { app, BrowserWindow, ipcMain, Menu } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 414,
        height: 896,
        minWidth: 375,
        minHeight: 812,
        frame: false,
        title: '心眠小筑',
        icon: path.join(__dirname, 'build/icon.ico'),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    const menu = Menu.buildFromTemplate([
        {
            label: '编辑',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: '视图',
            submenu: [
                { role: 'reload' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: '帮助',
            submenu: [
                {
                    label: '关于心眠小筑',
                    click: () => {
                        const aboutWindow = new BrowserWindow({
                            width: 400,
                            height: 300,
                            title: '关于心眠小筑',
                            icon: path.join(__dirname, 'build/icon.ico'),
                            webPreferences: {
                                nodeIntegration: true,
                                contextIsolation: false
                            }
                        });
                        aboutWindow.loadURL(`data:text/html;charset=utf-8,
                            <html>
                                <head>
                                    <title>关于心眠小筑</title>
                                    <style>
                                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; text-align: center; }
                                        h1 { color: #6366f1; }
                                        .version { color: #666; margin-top: 20px; }
                                        .description { margin-top: 20px; line-height: 1.6; }
                                    </style>
                                </head>
                                <body>
                                    <h1>💤 心眠小筑</h1>
                                    <p class="description">情绪与睡眠管理助手，陪伴你度过每一个夜晚</p>
                                    <p class="version">版本 1.0.0</p>
                                </body>
                            </html>`);
                    }
                }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

ipcMain.handle('minimize', () => {
    mainWindow.minimize();
});

ipcMain.handle('close', () => {
    mainWindow.close();
});

ipcMain.handle('ai-chat', async (event, message, emotion) => {
    try {
        const response = await fetch('https://api.xinmianxiaozhu.com/v1/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: message,
                emotion: emotion,
                model: 'emotion-support'
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, response: data.response };
        } else {
            return { 
                success: false, 
                error: '服务暂时不可用',
                fallback: generateFallbackResponse(message, emotion)
            };
        }
    } catch (error) {
        console.error('AI请求失败:', error);
        return { 
            success: false, 
            error: '网络异常',
            fallback: generateFallbackResponse(message, emotion)
        };
    }
});

ipcMain.handle('ai-analyze-emotion', async (event, text) => {
    try {
        const response = await fetch('https://api.xinmianxiaozhu.com/v1/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, result: data };
        } else {
            return { success: false, error: '分析服务不可用' };
        }
    } catch (error) {
        console.error('情绪分析失败:', error);
        return { success: false, error: '网络异常' };
    }
});

ipcMain.handle('ai-recommend-music', async (event, emotion, category) => {
    try {
        const response = await fetch('https://api.xinmianxiaozhu.com/v1/music', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                emotion: emotion,
                category: category
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, music: data };
        } else {
            return { 
                success: false, 
                error: '推荐服务不可用',
                fallback: getFallbackMusic(category)
            };
        }
    } catch (error) {
        console.error('音乐推荐失败:', error);
        return { 
            success: false, 
            error: '网络异常',
            fallback: getFallbackMusic(category)
        };
    }
});

ipcMain.handle('ai-get-sleep-advice', async (event, sleepDuration, quality) => {
    try {
        const response = await fetch('https://api.xinmianxiaozhu.com/v1/sleep-advice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                duration: sleepDuration,
                quality: quality
            })
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, advice: data.advice };
        } else {
            return { success: false, error: '建议服务不可用' };
        }
    } catch (error) {
        console.error('睡眠建议失败:', error);
        return { success: false, error: '网络异常' };
    }
});

function generateFallbackResponse(message, emotion) {
    const responses = {
        happy: [
            '听到你心情好真开心！继续保持这份美好的心情吧！',
            '太棒了！愿这份快乐永远伴随你！',
            '好心情是最好的礼物，好好珍惜哦！',
            '你的笑容是世界上最美的风景！',
            '愿你每天都充满阳光和快乐！'
        ],
        calm: [
            '内心平静是很珍贵的状态，享受这份宁静吧',
            '深呼吸，感受当下的美好',
            '平静的内心能让你更好地面对一切',
            '此刻的宁静是最好的礼物',
            '静下心来，聆听内心的声音'
        ],
        anxious: [
            '别担心，一切都会好起来的',
            '试着放松，深呼吸，你已经很棒了',
            '焦虑只是暂时的，相信自己能度过',
            '一步一步来，你能行的',
            '放轻松，事情总会有解决的办法'
        ],
        angry: [
            '先冷静下来，深呼吸3秒',
            '愤怒会伤害自己，试着放下',
            '冷静下来再做决定会更好',
            '深呼吸，让怒火慢慢平息',
            '退一步海阔天空，不要被愤怒控制'
        ],
        sad: [
            '难过的时候可以哭出来，我在这里陪着你',
            '一切都会过去的，不要独自承受',
            '你不是一个人，我们一起面对',
            '想哭就哭吧，释放出来会好受些',
            '黑暗过后就是黎明，坚持住'
        ]
    };

    const emotionResponses = responses[emotion] || responses.calm;
    return emotionResponses[Math.floor(Math.random() * emotionResponses.length)];
}

function getFallbackMusic(category) {
    const musicMap = {
        story: [
            { title: '森林深处的夜晚', duration: '15:30', cover: '📖' },
            { title: '星空下的童话', duration: '18:00', cover: '⭐' },
            { title: '月光下的故事', duration: '20:00', cover: '🌙' },
            { title: '海洋深处的秘密', duration: '16:30', cover: '🌊' }
        ],
        whiteNoise: [
            { title: '轻柔雨声', duration: '30:00', cover: '🌧️' },
            { title: '海浪沙滩', duration: '45:00', cover: '🌊' },
            { title: '森林鸟鸣', duration: '35:00', cover: '🌲' },
            { title: '壁炉燃烧', duration: '40:00', cover: '🔥' }
        ],
        meditation: [
            { title: '深度冥想', duration: '25:00', cover: '🧘' },
            { title: '呼吸练习', duration: '20:00', cover: '💨' },
            { title: '瑜伽放松', duration: '30:00', cover: '🧘‍♀️' },
            { title: '正念冥想', duration: '22:00', cover: '✨' }
        ],
        piano: [
            { title: '月光奏鸣曲', duration: '12:45', cover: '🎹' },
            { title: '秋日私语', duration: '15:00', cover: '🍂' },
            { title: '星空钢琴', duration: '18:30', cover: '⭐' },
            { title: '夜的钢琴曲', duration: '14:00', cover: '🌙' }
        ]
    };

    return musicMap[category] || musicMap.whiteNoise;
}
