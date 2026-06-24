/**
 * Hi_Seven 高动效语音助手 - 核心逻辑
 * 模块：颗粒动画系统 / 语音识别 / API 客户端 / 配置管理 / 语音合成
 * 作者：Hi_Seven Team
 */

(() => {
    'use strict';

    /* ============================================================
     * 1. 工具函数
     * ============================================================ */
    const $ = (sel) => document.querySelector(sel);
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const lerp = (a, b, t) => a + (b - a) * t;
    const rand = (min, max) => min + Math.random() * (max - min);

    /** 显示 toast 提示 */
    const toastEl = $('#toast');
    let toastTimer = null;
    function showToast(msg, duration = 2200) {
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toastEl.classList.remove('show'), duration);
    }

    /* ============================================================
     * 2. 配置管理模块
     * ============================================================ */
    const STORAGE_KEY = 'hi_seven_config_v1';

    /** 服务商预设（OpenAI 兼容接口） */
    const PROVIDER_PRESETS = {
        deepseek:  { apiBase: 'https://api.deepseek.com/v1',    model: 'deepseek-chat' },
        qwen:      { apiBase: 'https://dashscope.aliyuncs.com/compatible-mode/v1', model: 'qwen-plus' },
        glm:       { apiBase: 'https://open.bigmodel.cn/api/paas/v4', model: 'glm-4-flash' },
        moonshot:  { apiBase: 'https://api.moonshot.cn/v1',     model: 'moonshot-v1-8k' },
        doubao:    { apiBase: 'https://ark.cn-beijing.volces.com/api/v3', model: 'doubao-pro-32k' },
        custom:    { apiBase: '',                                model: '' }
    };

    const DEFAULT_CONFIG = {
        provider: 'deepseek',
        apiKey: '',
        apiBase: PROVIDER_PRESETS.deepseek.apiBase,
        model: PROVIDER_PRESETS.deepseek.model,
        temperature: 0.7,
        maxTokens: 1024,
        systemPrompt: '你是 Hi_Seven，一个高动效语音助手。回答简洁、富有科技感。',
        tts: true
    };

    const ConfigManager = {
        data: { ...DEFAULT_CONFIG },

        /** 从 localStorage 加载配置 */
        load() {
            try {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (raw) {
                    this.data = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
                }
            } catch (e) {
                console.warn('配置加载失败:', e);
            }
            return this.data;
        },

        /** 保存配置到 localStorage */
        save() {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
                return true;
            } catch (e) {
                console.error('配置保存失败:', e);
                return false;
            }
        },

        /** 重置为默认配置 */
        reset() {
            this.data = { ...DEFAULT_CONFIG };
            this.save();
        },

        /** 应用服务商预设 */
        applyPreset(provider) {
            const preset = PROVIDER_PRESETS[provider];
            if (preset) {
                this.data.provider = provider;
                if (preset.apiBase) this.data.apiBase = preset.apiBase;
                if (preset.model) this.data.model = preset.model;
            }
        }
    };

    /* ============================================================
     * 3. 颗粒动画系统
     * ============================================================ */

    /** 单个粒子 */
    class Particle {
        constructor(x, y, target) {
            this.x = x;
            this.y = y;
            this.tx = target.x;
            this.ty = target.y;
            this.vx = 0;
            this.vy = 0;
            this.size = rand(1.2, 2.6);
            this.hue = rand(260, 320); // 紫色到品红
            this.alpha = rand(0.5, 1);
            this.life = 1;
            this.trail = [];
            this.maxTrail = 6;
            this.depth = 0; // 3D 深度值，用于近大远小
        }

        /** 更新粒子位置 */
        update(volume, energy) {
            // 向目标点弹性靠拢
            const dx = this.tx - this.x;
            const dy = this.ty - this.y;
            const stiffness = 0.06;
            const damping = 0.82;
            this.vx = (this.vx + dx * stiffness) * damping;
            this.vy = (this.vy + dy * stiffness) * damping;

            // 受音量驱动的随机扰动
            const noise = volume * 18 + energy * 6;
            this.vx += (Math.random() - 0.5) * noise;
            this.vy += (Math.random() - 0.5) * noise;

            this.x += this.vx;
            this.y += this.vy;

            // 拖尾
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > this.maxTrail) this.trail.shift();
        }

        /** 绘制粒子（根据深度调整大小与透明度，营造立体感） */
        draw(ctx) {
            // 深度因子：近大远小、近亮远暗
            const depthFactor = clamp((this.depth + 2) / 4, 0.35, 1.3);
            const size = this.size * depthFactor;
            const alpha = this.alpha * clamp(depthFactor, 0.4, 1);

            // 拖尾
            for (let i = 0; i < this.trail.length; i++) {
                const t = this.trail[i];
                const a = (i / this.trail.length) * alpha * 0.4;
                ctx.beginPath();
                ctx.arc(t.x, t.y, size * (i / this.trail.length), 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 90%, 65%, ${a})`;
                ctx.fill();
            }
            // 主体（带辉光）
            const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size * 4);
            grad.addColorStop(0, `hsla(${this.hue}, 95%, 75%, ${alpha})`);
            grad.addColorStop(0.4, `hsla(${this.hue}, 90%, 60%, ${alpha * 0.5})`);
            grad.addColorStop(1, `hsla(${this.hue}, 90%, 50%, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(this.x, this.y, size * 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 85%, ${alpha})`;
            ctx.fill();
        }
    }

    /** 颗粒动画系统：3D 立体智能体核心（球体 + 环带 + 自由粒子） */
    class ParticleSystem {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.particles = [];
            this.targets = [];
            this.volume = 0;        // 当前音量 0-1
            this.smoothVolume = 0;  // 平滑后的音量
            this.energy = 0;        // 累积能量
            this.state = 'idle';    // idle / listening / thinking / speaking
            this.stateTime = 0;
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.mouseX = 0;
            this.mouseY = 0;
            this.rotY = 0;          // Y 轴旋转角度
            this.rotX = 0;          // X 轴旋转角度

            this.resize();
            this.generateAgent();
            this.bindEvents();
            this.lastTime = performance.now();
            this.loop = this.loop.bind(this);
            requestAnimationFrame(this.loop);
        }

        bindEvents() {
            window.addEventListener('resize', () => {
                this.resize();
                this.generateAgent();
            });
            window.addEventListener('mousemove', (e) => {
                this.mouseX = e.clientX;
                this.mouseY = e.clientY;
            });
        }

        resize() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.canvas.width = w * this.dpr;
            this.canvas.height = h * this.dpr;
            this.canvas.style.width = w + 'px';
            this.canvas.style.height = h + 'px';
            this.ctx.scale(this.dpr, this.dpr);
            this.w = w;
            this.h = h;
        }

        /** 生成 3D 智能体核心目标点（球面 + 双环带 + 自由粒子） */
        generateAgent() {
            const targets = [];
            const sphereCount = 260;

            // 核心球面 - 斐波那契球面均匀分布
            for (let i = 0; i < sphereCount; i++) {
                const y = 1 - (i / (sphereCount - 1)) * 2; // y 从 1 到 -1
                const radius = Math.sqrt(Math.max(0, 1 - y * y));
                const theta = Math.PI * (1 + Math.sqrt(5)) * i; // 黄金角
                targets.push({
                    x3: Math.cos(theta) * radius,
                    y3: y,
                    z3: Math.sin(theta) * radius,
                    role: 'sphere',
                    idx: i
                });
            }

            // 环带 1（赤道环）
            const ring1Count = 90;
            for (let i = 0; i < ring1Count; i++) {
                const a = (i / ring1Count) * Math.PI * 2;
                targets.push({
                    x3: Math.cos(a) * 1.35,
                    y3: 0,
                    z3: Math.sin(a) * 1.35,
                    role: 'ring',
                    ring: 0,
                    idx: i
                });
            }

            // 环带 2（倾斜 60 度环）
            const ring2Count = 90;
            const tilt = Math.PI / 3;
            for (let i = 0; i < ring2Count; i++) {
                const a = (i / ring2Count) * Math.PI * 2;
                const x = Math.cos(a) * 1.55;
                const z = Math.sin(a) * 1.55;
                targets.push({
                    x3: x,
                    y3: z * Math.sin(tilt),
                    z3: z * Math.cos(tilt),
                    role: 'ring',
                    ring: 1,
                    idx: i
                });
            }

            // 自由游走粒子（轨道运动）
            for (let i = 0; i < 50; i++) {
                targets.push({
                    x3: 0, y3: 0, z3: 0,
                    role: 'free',
                    idx: i,
                    speed: rand(0.4, 1.2),
                    phase: rand(0, Math.PI * 2),
                    phaseY: rand(0, Math.PI * 2)
                });
            }

            this.targets = targets;

            // 同步粒子数量
            const cx = this.w / 2;
            const cy = this.h / 2;
            while (this.particles.length < targets.length) {
                this.particles.push(new Particle(cx + rand(-200, 200), cy + rand(-200, 200), targets[this.particles.length]));
            }
            if (this.particles.length > targets.length) {
                this.particles.length = targets.length;
            }
            // 重新绑定目标
            this.particles.forEach((p, i) => {
                p.tx = targets[i].x;
                p.ty = targets[i].y;
                p.role = targets[i].role;
            });
        }

        /** 3D 点旋转 + 透视投影到 2D 屏幕 */
        project(x3, y3, z3, rotY, rotX, cx, cy, scale) {
            // Y 轴旋转
            const x1 = x3 * Math.cos(rotY) + z3 * Math.sin(rotY);
            const z1 = -x3 * Math.sin(rotY) + z3 * Math.cos(rotY);
            const y1 = y3;
            // X 轴旋转
            const y2 = y1 * Math.cos(rotX) - z1 * Math.sin(rotX);
            const z2 = y1 * Math.sin(rotX) + z1 * Math.cos(rotX);
            // 透视投影
            const persp = 3.5;
            const depth = Math.max(0.1, persp + z2);
            const projScale = (persp / depth) * scale;
            return {
                x: cx + x1 * projScale,
                y: cy + y2 * projScale,
                depth: z2
            };
        }

        /** 设置状态 */
        setState(state) {
            this.state = state;
            this.stateTime = 0;
        }

        /** 设置音量 */
        setVolume(v) {
            this.volume = clamp(v, 0, 1);
        }

        /** 主循环 */
        loop(now) {
            const dt = (now - this.lastTime) / 16.67;
            this.lastTime = now;
            this.stateTime += dt;

            // 平滑音量
            this.smoothVolume = lerp(this.smoothVolume, this.volume, 0.15);
            this.energy = this.energy * 0.96 + this.smoothVolume * 0.04;

            this.update(dt);
            this.draw();
            requestAnimationFrame(this.loop);
        }

        update(dt) {
            const cx = this.w / 2;
            const cy = this.h / 2;
            const t = this.stateTime;
            const scale = Math.min(this.w, this.h) * 0.16;

            // 状态驱动的旋转速度
            let rotSpeed = 0.008;
            if (this.state === 'listening') rotSpeed = 0.018;
            else if (this.state === 'thinking') rotSpeed = 0.005;
            else if (this.state === 'speaking') rotSpeed = 0.022;

            this.rotY += rotSpeed * dt;
            this.rotX = Math.sin(t * 0.004) * 0.25 + this.smoothVolume * 0.1;

            const stateHue = this.getStateHue();

            this.particles.forEach((p, i) => {
                const target = this.targets[i];
                let x3 = target.x3;
                let y3 = target.y3;
                let z3 = target.z3;

                if (target.role === 'sphere') {
                    // 球面呼吸 + 音量脉动
                    const pulse = 1 + this.smoothVolume * 0.18 + Math.sin(t * 0.03 + target.idx * 0.1) * 0.04;
                    x3 *= pulse;
                    y3 *= pulse;
                    z3 *= pulse;
                    // 思考状态：球面波动
                    if (this.state === 'thinking') {
                        const wave = Math.sin(t * 0.08 + target.idx * 0.3) * 0.08;
                        x3 *= (1 + wave);
                        y3 *= (1 + wave);
                        z3 *= (1 + wave);
                    }
                } else if (target.role === 'ring') {
                    // 环带自旋（两条环带反向旋转）
                    const ringRot = t * (target.ring === 0 ? 0.025 : -0.02);
                    const cosR = Math.cos(ringRot);
                    const sinR = Math.sin(ringRot);
                    const nx = x3 * cosR - z3 * sinR;
                    const nz = x3 * sinR + z3 * cosR;
                    x3 = nx;
                    z3 = nz;
                    // 音量扩张
                    const expand = 1 + this.smoothVolume * 0.25;
                    x3 *= expand;
                    z3 *= expand;
                    if (target.ring === 1) y3 *= expand;
                } else if (target.role === 'free') {
                    // 自由粒子轨道运动
                    const a = t * 0.02 * target.speed + target.phase;
                    const r = 1.9 + Math.sin(t * 0.03 + target.phase) * 0.4 + this.smoothVolume * 0.6;
                    x3 = Math.cos(a) * r;
                    y3 = Math.sin(a * 0.7 + target.phaseY) * r * 0.85;
                    z3 = Math.sin(a) * r;
                }

                // 3D 旋转 + 透视投影
                const proj = this.project(x3, y3, z3, this.rotY, this.rotX, cx, cy, scale);
                p.tx = proj.x;
                p.ty = proj.y;
                p.depth = proj.depth;

                // 状态驱动颜色（环带略偏色相）
                p.hue = stateHue + (target.role === 'ring' ? 20 : 0) + (i % 10) * 2;

                p.update(this.smoothVolume, this.energy);
            });
        }

        draw() {
            const ctx = this.ctx;
            // 拖影背景
            ctx.fillStyle = 'rgba(5, 3, 13, 0.18)';
            ctx.fillRect(0, 0, this.w, this.h);

            // 中心光晕
            const cx = this.w / 2;
            const cy = this.h / 2;
            const glowR = 200 + this.smoothVolume * 140;
            const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
            const stateColor = this.getStateColor();
            glow.addColorStop(0, `${stateColor}33`);
            glow.addColorStop(0.5, `${stateColor}11`);
            glow.addColorStop(1, `${stateColor}00`);
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(cx, cy, glowR, 0, Math.PI * 2);
            ctx.fill();

            // 中心核心光球（智能体能量核）
            const coreR = 30 + this.smoothVolume * 25 + Math.sin(this.stateTime * 0.05) * 4;
            const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
            coreGrad.addColorStop(0, `${stateColor}cc`);
            coreGrad.addColorStop(0.5, `${stateColor}44`);
            coreGrad.addColorStop(1, `${stateColor}00`);
            ctx.fillStyle = coreGrad;
            ctx.beginPath();
            ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
            ctx.fill();

            // 粒子（按深度排序，近后画）
            ctx.globalCompositeOperation = 'lighter';
            const sorted = this.particles.slice().sort((a, b) => a.depth - b.depth);
            sorted.forEach(p => p.draw(ctx));
            ctx.globalCompositeOperation = 'source-over';

            // 状态扫描线
            if (this.state === 'listening' || this.state === 'speaking') {
                const scanY = (this.stateTime * 2) % this.h;
                const scanGrad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
                scanGrad.addColorStop(0, `${stateColor}00`);
                scanGrad.addColorStop(0.5, `${stateColor}22`);
                scanGrad.addColorStop(1, `${stateColor}00`);
                ctx.fillStyle = scanGrad;
                ctx.fillRect(0, scanY - 60, this.w, 120);
            }
        }

        /** 状态对应的色相值 */
        getStateHue() {
            switch (this.state) {
                case 'listening': return 185; // 青色
                case 'thinking':  return 275; // 紫色
                case 'speaking':  return 200; // 蓝色
                default:          return 285; // 紫品
            }
        }

        getStateColor() {
            switch (this.state) {
                case 'listening': return '#22d3ee';
                case 'thinking':  return '#a855f7';
                case 'speaking':  return '#38bdf8';
                default:          return '#6B21A8';
            }
        }
    }

    /* ============================================================
     * 4. 语音识别模块
     * ============================================================ */
    class SpeechRecognizer {
        constructor(onResult, onEnd, onError) {
            this.recognition = null;
            this.onResult = onResult;
            this.onEnd = onEnd;
            this.onError = onError;
            this.listening = false;
            this.finalText = '';

            const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SR) {
                this.recognition = new SR();
                this.recognition.lang = 'zh-CN';
                this.recognition.continuous = false;
                this.recognition.interimResults = true;
                this.recognition.onresult = (e) => this.handleResult(e);
                this.recognition.onend = () => this.handleEnd();
                this.recognition.onerror = (e) => this.onError && this.onError(e.error);
            }
        }

        get supported() { return !!this.recognition; }

        handleResult(e) {
            let interim = '';
            this.finalText = '';
            for (let i = 0; i < e.results.length; i++) {
                const r = e.results[i];
                if (r.isFinal) this.finalText += r[0].transcript;
                else interim += r[0].transcript;
            }
            this.onResult && this.onResult(this.finalText + interim, !!this.finalText);
        }

        handleEnd() {
            this.listening = false;
            this.onEnd && this.onEnd(this.finalText);
            this.finalText = '';
        }

        start() {
            if (!this.recognition) {
                this.onError && this.onError('unsupported');
                return false;
            }
            try {
                this.recognition.start();
                this.listening = true;
                return true;
            } catch (e) {
                this.onError && this.onError(e.message);
                return false;
            }
        }

        stop() {
            if (this.recognition && this.listening) {
                try { this.recognition.stop(); } catch (e) {}
            }
        }
    }

    /* ============================================================
     * 5. 音量分析模块（AudioContext + AnalyserNode）
     * ============================================================ */
    class VolumeAnalyser {
        constructor() {
            this.ctx = null;
            this.analyser = null;
            this.stream = null;
            this.dataArray = null;
            this.running = false;
            this.rafId = null;
            this.onLevel = null;
        }

        async start() {
            try {
                this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 512;
                this.analyser.smoothingTimeConstant = 0.6;
                const source = this.ctx.createMediaStreamSource(this.stream);
                source.connect(this.analyser);
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.running = true;
                this.tick();
                return true;
            } catch (e) {
                console.error('麦克风访问失败:', e);
                return false;
            }
        }

        tick() {
            if (!this.running) return;
            this.analyser.getByteFrequencyData(this.dataArray);
            // 计算平均音量
            let sum = 0;
            for (let i = 0; i < this.dataArray.length; i++) sum += this.dataArray[i];
            const avg = sum / this.dataArray.length / 255;
            this.onLevel && this.onLevel(avg);
            this.rafId = requestAnimationFrame(() => this.tick());
        }

        stop() {
            this.running = false;
            if (this.rafId) cancelAnimationFrame(this.rafId);
            if (this.stream) {
                this.stream.getTracks().forEach(t => t.stop());
                this.stream = null;
            }
            if (this.ctx) {
                try { this.ctx.close(); } catch (e) {}
                this.ctx = null;
            }
            this.onLevel && this.onLevel(0);
        }
    }

    /* ============================================================
     * 6. API 客户端模块（OpenAI 兼容，支持流式）
     * ============================================================ */
    class ApiClient {
        constructor(config) {
            this.config = config;
        }

        setConfig(config) { this.config = config; }

        /**
         * 发送聊天请求（流式）
         * @param {Array<{role:string,content:string}>} messages
         * @param {(chunk:string)=>void} onChunk 流式回调
         * @returns {Promise<string>} 完整回复
         */
        async chat(messages, onChunk) {
            const { apiBase, apiKey, model, temperature, maxTokens } = this.config;
            if (!apiKey) throw new Error('未配置 API Key');
            if (!apiBase) throw new Error('未配置 API Base URL');

            const url = apiBase.replace(/\/$/, '') + '/chat/completions';
            const body = {
                model: model || 'gpt-3.5-turbo',
                messages,
                temperature: Number(temperature) || 0.7,
                max_tokens: Number(maxTokens) || 1024,
                stream: true
            };

            const resp = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body)
            });

            if (!resp.ok) {
                const errText = await resp.text().catch(() => '');
                throw new Error(`API 请求失败 (${resp.status}): ${errText.slice(0, 200)}`);
            }

            // 流式解析 SSE
            const reader = resp.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let buffer = '';
            let full = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data:')) continue;
                    const data = trimmed.slice(5).trim();
                    if (data === '[DONE]') return full;
                    try {
                        const json = JSON.parse(data);
                        const delta = json.choices?.[0]?.delta?.content || '';
                        if (delta) {
                            full += delta;
                            onChunk && onChunk(delta);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }
            return full;
        }
    }

    /* ============================================================
     * 7. 语音合成模块
     * ============================================================ */
    class SpeechSynth {
        constructor() {
            this.supported = 'speechSynthesis' in window;
            this.voice = null;
            if (this.supported) {
                this.loadVoice();
                speechSynthesis.onvoiceschanged = () => this.loadVoice();
            }
        }

        loadVoice() {
            const voices = speechSynthesis.getVoices();
            // 优先中文语音
            this.voice = voices.find(v => /zh(-|_)?CN/i.test(v.lang))
                      || voices.find(v => /zh/i.test(v.lang))
                      || voices[0];
        }

        speak(text, onEnd) {
            if (!this.supported || !text) {
                onEnd && onEnd();
                return;
            }
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            if (this.voice) u.voice = this.voice;
            u.lang = 'zh-CN';
            u.rate = 1;
            u.pitch = 1;
            u.onend = () => onEnd && onEnd();
            u.onerror = () => onEnd && onEnd();
            speechSynthesis.speak(u);
        }

        stop() {
            if (this.supported) speechSynthesis.cancel();
        }
    }

    /* ============================================================
     * 8. 应用主控
     * ============================================================ */
    class App {
        constructor() {
            ConfigManager.load();
            this.config = ConfigManager.data;
            this.apiClient = new ApiClient(this.config);
            this.synth = new SpeechSynth();
            this.analyser = new VolumeAnalyser();
            this.recognizer = new SpeechRecognizer(
                (text) => this.onRecognizeInterim(text),
                (text) => this.onRecognizeEnd(text),
                (err) => this.onRecognizeError(err)
            );
            this.particles = new ParticleSystem($('#particle-canvas'));
            this.history = []; // 对话历史
            this.busy = false;
            this.autoListening = false; // 是否处于自动连续听取模式

            this.bindUI();
            this.syncConfigForm();
            this.analyser.onLevel = (v) => {
                this.particles.setVolume(v);
                this.updateVuMeter(v);
            };
        }

        /* ---------- UI 绑定 ---------- */
        bindUI() {
            // 麦克风按钮
            $('#mic-btn').addEventListener('click', () => this.toggleListen());

            // 清空对话记录
            $('#chat-clear-btn').addEventListener('click', () => this.clearChat());

            // 设置面板
            $('#settings-btn').addEventListener('click', () => this.openPanel());
            $('#close-panel').addEventListener('click', () => this.closePanel());
            $('#mask').addEventListener('click', () => this.closePanel());

            // 服务商切换
            $('#provider-select').addEventListener('change', (e) => {
                ConfigManager.applyPreset(e.target.value);
                this.config = ConfigManager.data;
                this.syncConfigForm();
            });

            // 保存配置
            $('#save-config').addEventListener('click', () => this.saveConfig());
            $('#reset-config').addEventListener('click', () => this.resetConfig());

            // 全屏
            $('#fullscreen-btn').addEventListener('click', () => this.toggleFullscreen());

            // 键盘快捷键
            document.addEventListener('keydown', (e) => {
                if (e.code === 'Space' && e.target === document.body) {
                    e.preventDefault();
                    this.toggleListen();
                }
                if (e.code === 'Escape') this.closePanel();
            });
        }

        syncConfigForm() {
            $('#provider-select').value = this.config.provider;
            $('#api-key').value = this.config.apiKey;
            $('#api-base').value = this.config.apiBase;
            $('#model-name').value = this.config.model;
            $('#temperature').value = this.config.temperature;
            $('#max-tokens').value = this.config.maxTokens;
            $('#system-prompt').value = this.config.systemPrompt;
            $('#tts-toggle').checked = this.config.tts;
        }

        openPanel() {
            $('#config-panel').classList.add('open');
            $('#mask').classList.add('show');
            $('#config-panel').setAttribute('aria-hidden', 'false');
        }

        closePanel() {
            $('#config-panel').classList.remove('open');
            $('#mask').classList.remove('show');
            $('#config-panel').setAttribute('aria-hidden', 'true');
        }

        saveConfig() {
            ConfigManager.data.apiKey = $('#api-key').value.trim();
            ConfigManager.data.apiBase = $('#api-base').value.trim();
            ConfigManager.data.model = $('#model-name').value.trim();
            ConfigManager.data.temperature = parseFloat($('#temperature').value) || 0.7;
            ConfigManager.data.maxTokens = parseInt($('#max-tokens').value) || 1024;
            ConfigManager.data.systemPrompt = $('#system-prompt').value.trim();
            ConfigManager.data.tts = $('#tts-toggle').checked;

            if (!ConfigManager.data.apiKey) {
                this.showPanelTip('请填写 API Key', true);
                return;
            }
            const ok = ConfigManager.save();
            this.config = ConfigManager.data;
            this.apiClient.setConfig(this.config);
            this.showPanelTip(ok ? '配置已保存' : '保存失败', !ok);
            if (ok) setTimeout(() => this.closePanel(), 800);
        }

        resetConfig() {
            ConfigManager.reset();
            this.config = ConfigManager.data;
            this.apiClient.setConfig(this.config);
            this.syncConfigForm();
            this.showPanelTip('已恢复默认配置', false);
        }

        showPanelTip(msg, isError) {
            const tip = $('#panel-tip');
            tip.textContent = msg;
            tip.style.color = isError ? '#f87171' : 'var(--cyan)';
        }

        toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen?.().catch(() => {});
            } else {
                document.exitFullscreen?.();
            }
        }

        /* ---------- 语音识别流程 ---------- */
        async toggleListen() {
            // 处理中（思考/说话），点击则中断当前流程
            if (this.busy) {
                this.stopAll();
                return;
            }
            // 正在聆听时点击则停止，并退出自动听取模式
            if (this.recognizer.listening) {
                this.autoListening = false;
                this.recognizer.stop();
                return;
            }
            if (!this.recognizer.supported) {
                showToast('当前浏览器不支持语音识别，建议使用 Chrome');
                return;
            }
            if (!this.config.apiKey) {
                showToast('请先在设置中配置 API Key');
                this.openPanel();
                return;
            }

            // 启动音量分析
            const ok = await this.analyser.start();
            if (!ok) {
                showToast('麦克风访问失败，请检查权限');
                return;
            }

            this.setStatus('正在聆听...', 'active');
            $('#mic-btn').classList.add('recording');
            $('#mic-hint').textContent = '点击停止';
            $('#vu-meter').classList.add('active');
            this.particles.setState('listening');

            this.recognizer.start();
        }

        onRecognizeInterim(text) {
            // 实时更新用户消息气泡（流式识别）
            this.appendUserInterim(text);
        }

        onRecognizeEnd(text) {
            $('#mic-btn').classList.remove('recording');
            $('#mic-hint').textContent = '点击开始';
            $('#vu-meter').classList.remove('active');
            this.analyser.stop();
            this.particles.setVolume(0);

            const finalText = (text || '').trim();
            if (!finalText) {
                // 无识别结果，若处于自动听取模式则继续等待，否则回到空闲
                if (!this.autoListening) {
                    this.setStatus('点击麦克风开始对话');
                    this.particles.setState('idle');
                }
                return;
            }
            // 定稿用户消息并发送给 AI
            this.appendUserFinal(finalText);
            this.sendToAI(finalText);
        }

        onRecognizeError(err) {
            console.warn('识别错误:', err);
            $('#mic-btn').classList.remove('recording');
            $('#mic-hint').textContent = '点击开始';
            $('#vu-meter').classList.remove('active');
            this.analyser.stop();
            this.particles.setVolume(0);
            if (err === 'unsupported') {
                showToast('浏览器不支持语音识别');
            } else if (err === 'not-allowed') {
                showToast('麦克风权限被拒绝');
            } else if (err !== 'no-speech' && err !== 'aborted') {
                showToast('识别错误: ' + err);
            }
            this.autoListening = false;
            this.setStatus('点击麦克风开始对话');
            this.particles.setState('idle');
        }

        /* ---------- 调用 AI ---------- */
        async sendToAI(userText) {
            this.busy = true;
            this.setStatus('思考中...', 'thinking');
            this.particles.setState('thinking');
            // 创建 AI 消息气泡（流式填充）
            this.appendAiChunk('');

            // 构造消息
            const messages = [{ role: 'system', content: this.config.systemPrompt }];
            this.history.push({ role: 'user', content: userText });
            messages.push(...this.history);

            let aiText = '';
            try {
                await this.apiClient.chat(messages, (chunk) => {
                    aiText += chunk;
                    this.appendAiChunk(aiText);
                });

                this.history.push({ role: 'assistant', content: aiText });
                // 限制历史长度
                if (this.history.length > 10) this.history = this.history.slice(-10);

                this.finalizeAiMessage();

                this.setStatus('语音输出中...', 'speaking');
                this.particles.setState('speaking');

                if (this.config.tts && aiText) {
                    // 语音合成期间模拟音量驱动动画
                    this.simulateSpeakingVolume();
                    this.synth.speak(aiText, () => {
                        this.finishSpeak();
                    });
                } else {
                    this.finishSpeak();
                }
            } catch (e) {
                console.error(e);
                this.appendAiChunk('请求失败: ' + e.message);
                this.finalizeAiMessage();
                this.setStatus('点击麦克风开始对话');
                this.particles.setState('idle');
                this.busy = false;
            }
        }

        /** 语音合成期间模拟音量（无麦克风输入） */
        simulateSpeakingVolume() {
            let t = 0;
            const sim = () => {
                if (!this.busy) return;
                t += 0.1;
                const v = 0.3 + Math.abs(Math.sin(t)) * 0.35 + Math.random() * 0.1;
                this.particles.setVolume(v);
                this.updateVuMeter(v);
                requestAnimationFrame(sim);
            };
            sim();
        }

        /** AI 回复结束后自动开始听取，用户点击按钮可关闭 */
        finishSpeak() {
            this.busy = false;
            this.particles.setVolume(0);
            this.updateVuMeter(0);
            // 自动连续听取
            this.startAutoListen();
        }

        /** 自动开始听取（AI 回复后触发） */
        async startAutoListen() {
            if (!this.recognizer.supported) {
                this.setStatus('点击麦克风开始对话');
                this.particles.setState('idle');
                return;
            }

            this.autoListening = true;
            this.setStatus('正在聆听...', 'active');
            $('#mic-btn').classList.add('recording');
            $('#mic-hint').textContent = '点击停止';
            $('#vu-meter').classList.add('active');
            this.particles.setState('listening');

            // 启动音量分析
            const ok = await this.analyser.start();
            if (!ok) {
                this.autoListening = false;
                this.setStatus('点击麦克风开始对话');
                this.particles.setState('idle');
                $('#mic-btn').classList.remove('recording');
                $('#mic-hint').textContent = '点击开始';
                $('#vu-meter').classList.remove('active');
                return;
            }

            this.recognizer.start();
        }

        /** 中断所有进行中的流程（思考/说话） */
        stopAll() {
            this.busy = false;
            this.autoListening = false;
            this.synth.stop();
            this.recognizer.stop();
            this.analyser.stop();
            this.particles.setVolume(0);
            this.updateVuMeter(0);
            $('#mic-btn').classList.remove('recording');
            $('#mic-hint').textContent = '点击开始';
            $('#vu-meter').classList.remove('active');
            this.setStatus('点击麦克风开始对话');
            this.particles.setState('idle');
        }

        /* ---------- 对话框辅助 ---------- */
        /** 创建一条消息节点 */
        createMessage(role) {
            const msg = document.createElement('div');
            msg.className = 'chat-msg ' + (role === 'user' ? 'user-msg' : 'ai-msg');
            const label = document.createElement('div');
            label.className = 'msg-label';
            label.textContent = role === 'user' ? '你' : 'Seven';
            const bubble = document.createElement('div');
            bubble.className = 'msg-bubble';
            msg.appendChild(label);
            msg.appendChild(bubble);
            return msg;
        }

        /** 滚动到最新消息 */
        scrollChat() {
            const messages = $('#chat-messages');
            messages.scrollTop = messages.scrollHeight;
        }

        /** 追加/更新用户实时识别文本 */
        appendUserInterim(text) {
            const messages = $('#chat-messages');
            let last = messages.lastElementChild;
            if (!last || !last.classList.contains('user-msg') || last.dataset.final === '1') {
                last = this.createMessage('user');
                messages.appendChild(last);
            }
            last.querySelector('.msg-bubble').textContent = text;
            this.scrollChat();
        }

        /** 定稿用户消息 */
        appendUserFinal(text) {
            const messages = $('#chat-messages');
            let last = messages.lastElementChild;
            if (last && last.classList.contains('user-msg') && last.dataset.final !== '1') {
                last.querySelector('.msg-bubble').textContent = text;
                last.dataset.final = '1';
            } else {
                const msg = this.createMessage('user');
                msg.querySelector('.msg-bubble').textContent = text;
                msg.dataset.final = '1';
                messages.appendChild(msg);
            }
            this.scrollChat();
        }

        /** 追加/更新 AI 流式回复文本 */
        appendAiChunk(text) {
            const messages = $('#chat-messages');
            let last = messages.lastElementChild;
            if (!last || !last.classList.contains('ai-msg') || last.dataset.final === '1') {
                last = this.createMessage('ai');
                messages.appendChild(last);
            }
            last.querySelector('.msg-bubble').textContent = text;
            this.scrollChat();
        }

        /** 定稿 AI 消息（移除光标） */
        finalizeAiMessage() {
            const messages = $('#chat-messages');
            const last = messages.lastElementChild;
            if (last && last.classList.contains('ai-msg')) {
                last.classList.add('final');
                last.dataset.final = '1';
            }
        }

        /** 清空对话记录 */
        clearChat() {
            $('#chat-messages').innerHTML = '';
        }

        /* ---------- 辅助 ---------- */
        setStatus(text, cls = '') {
            const el = $('#status-text');
            el.textContent = text;
            el.className = 'status-text' + (cls ? ' ' + cls : '');
        }

        updateVuMeter(v) {
            const bars = document.querySelectorAll('.vu-bar');
            const level = Math.floor(v * bars.length * 1.4);
            bars.forEach((bar, i) => {
                const active = i < level;
                bar.style.height = active ? (6 + i * 1.5) + 'px' : '6px';
                bar.style.opacity = active ? '0.9' : '0.3';
            });
        }
    }

    /* ============================================================
     * 9. 启动
     * ============================================================ */
    window.addEventListener('DOMContentLoaded', () => {
        window.hiSeven = new App();
        console.log('%cHi_Seven 已启动', 'color:#a855f7;font-size:14px;font-weight:bold;');
    });

})();
