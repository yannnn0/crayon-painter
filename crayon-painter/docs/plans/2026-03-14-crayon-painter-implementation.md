# 蜡笔画笔 (Crayon Painter) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 一个用真实物件作画的 Web 应用，用摄像头捕捉颜色并生成蜡笔质感的笔触

**Architecture:** 单页 HTML 应用，纯前端 JavaScript，使用 Canvas 2D API 渲染

**Tech Stack:** HTML5, CSS3, JavaScript (ES6+), MediaDevices API, Web Speech API

---

### Task 1: 项目结构与基础 HTML

**Files:**
- Create: `crayon-painter.html`

**Step 1: 创建基础 HTML 结构**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>蜡笔画笔 - 用真实物件作画</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            overflow: hidden;
            background: #f5f0e8;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }

        #canvas {
            display: block;
            cursor: crosshair;
        }

        #camera-preview {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 180px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            opacity: 0.85;
            transform: scaleX(-1);
        }

        #start-screen {
            position: fixed;
            inset: 0;
            background: linear-gradient(135deg, #f5f0e8 0%, #e8e0d5 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 100;
        }

        #start-screen h1 {
            font-size: 3rem;
            color: #2c2c2c;
            margin-bottom: 1rem;
            letter-spacing: -1px;
        }

        #start-screen p {
            color: #666;
            margin-bottom: 2rem;
            font-size: 1.1rem;
        }

        #start-btn {
            padding: 16px 48px;
            font-size: 1.2rem;
            background: #2c2c2c;
            color: #fff;
            border: none;
            border-radius: 50px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        #start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        }

        #current-color-bar {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 60px;
            background: rgba(255,255,255,0.95);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
        }

        #current-swatch {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid #fff;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        #label-btn {
            padding: 8px 20px;
            background: #f0f0f0;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.95rem;
            transition: background 0.2s;
        }

        #label-btn:hover {
            background: #e0e0e0;
        }

        #source-modal {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.5);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 200;
        }

        #source-modal.show {
            display: flex;
        }

        #source-modal-content {
            background: #fff;
            padding: 32px 48px;
            border-radius: 20px;
            text-align: center;
            animation: popIn 0.3s ease;
        }

        @keyframes popIn {
            from { transform: scale(0.8); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }

        #source-modal-content h2 {
            font-size: 1.3rem;
            color: #666;
            margin-bottom: 8px;
        }

        #source-modal-content p {
            font-size: 2rem;
            font-weight: 600;
            color: #2c2c2c;
        }

        #source-modal-close {
            margin-top: 20px;
            padding: 10px 30px;
            background: #2c2c2c;
            color: #fff;
            border: none;
            border-radius: 25px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div id="start-screen">
        <h1>蜡笔画笔</h1>
        <p>拿起身边的彩色物品，对着摄像头作画</p>
        <button id="start-btn">开始作画</button>
    </div>

    <canvas id="canvas"></canvas>
    <video id="camera-preview" autoplay playsinline muted></video>

    <div id="current-color-bar">
        <div id="current-swatch"></div>
        <button id="label-btn">点击设置物品名称</button>
    </div>

    <div id="source-modal">
        <div id="source-modal-content">
            <h2>这个颜色来自——</h2>
            <p id="source-object">苹果</p>
            <button id="source-modal-close">知道了</button>
        </div>
    </div>

    <script>
        // Main application will be added in Task 2
    </script>
</body>
</html>
```

**Step 2: 验证文件创建成功**

Run: `ls -la crayon-painter.html`
Expected: 文件存在

**Step 3: Commit**

```bash
git add crayon-painter.html
git commit -m "feat: 创建蜡笔画笔基础 HTML 结构"
```

---

### Task 2: 摄像头管理器

**Files:**
- Modify: `crayon-painter.html` - 在 `<script>` 中添加 CameraManager 类

**Step 1: 添加 CameraManager 类**

在 `<script>` 标签开头添加：

```javascript
class CameraManager {
    constructor() {
        this.video = document.getElementById('camera-preview');
        this.stream = null;
    }

    async init() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            this.video.srcObject = this.stream;
            await this.video.play();
            return true;
        } catch (err) {
            console.error('摄像头初始化失败:', err);
            alert('无法访问摄像头，请确保已授予权限');
            return false;
        }
    }

    getVideoElement() {
        return this.video;
    }

    destroy() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }
}
```

**Step 2: 验证语法正确**

Run: `node --check crayon-painter.html 2>&1 || echo "HTML 文件需要用浏览器验证"`
Expected: 提示需要浏览器验证（这是正常的）

**Step 3: Commit**

```bash
git add crayon-painter.html
git commit -feat: 添加 CameraManager 类"
```

---

### Task 3: 颜色提取器

**Files:**
- Modify: `crayon-painter.html` - 添加 ColorExtractor 类

**Step 1: 添加 ColorExtractor 类**

在 CameraManager 类后添加：

```javascript
class ColorExtractor {
    constructor(videoElement) {
        this.video = videoElement;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
        this.canvas.width = 50;
        this.canvas.height = 50;

        // 平滑处理
        this.colorHistory = [];
        this.historySize = 5;
    }

    extractColor() {
        const centerX = Math.floor(this.video.videoWidth / 2);
        const centerY = Math.floor(this.video.videoHeight / 2);
        const sampleSize = 25;

        // 从中心区域采样
        this.ctx.drawImage(
            this.video,
            centerX - sampleSize, centerY - sampleSize,
            sampleSize * 2, sampleSize * 2,
            0, 0, this.canvas.width, this.canvas.height
        );

        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;

        // 计算平均颜色
        let r = 0, g = 0, b = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
            // 跳过透明像素
            if (data[i + 3] < 128) continue;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            count++;
        }

        if (count === 0) return { r: 200, g: 200, b: 200 };

        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);

        // 添加到历史记录进行平滑
        this.colorHistory.push({ r, g, b });
        if (this.colorHistory.length > this.historySize) {
            this.colorHistory.shift();
        }

        // 返回平滑后的颜色
        return this.getSmoothColor();
    }

    getSmoothColor() {
        if (this.colorHistory.length === 0) return { r: 200, g: 200, b: 200 };

        let r = 0, g = 0, b = 0;
        this.colorHistory.forEach(c => {
            r += c.r;
            g += c.g;
            b += c.b;
        });

        return {
            r: Math.round(r / this.colorHistory.length),
            g: Math.round(g / this.colorHistory.length),
            b: Math.round(b / this.colorHistory.length)
        };
    }

    rgbToHsl(r, g, b) {
        r /= 255; g /= 255; b /= 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
                case g: h = ((b - r) / d + 2) / 6; break;
                case b: h = ((r - g) / d + 4) / 6; break;
            }
        }

        return { h: h * 360, s: s * 100, l: l * 100 };
    }
}
```

**Step 2: Commit**

```bash
git add crayon-painter.html
git commit -m "feat: 添加 ColorExtractor 类实现颜色提取与平滑"
```

---

### Task 4: 蜡笔笔触渲染器

**Files:**
- Modify: `crayon-painter.html` - 添加 StrokeRenderer 类

**Step 1: 添加 StrokeRenderer 类**

在 ColorExtractor 类后添加：

```javascript
class StrokeRenderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    // 将 RGB 转换为 HSL 并添加随机变化
    randomizeColor(r, g, b) {
        // 转换为 HSL
        let hr = r / 255, hg = g / 255, hb = b / 255;
        const max = Math.max(hr, hg, hb), min = Math.min(hr, hg, hb);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case hr: h = ((hg - hb) / d + (hg < hb ? 6 : 0)) / 6; break;
                case hg: h = ((hb - hr) / d + 2) / 6; break;
                case hb: h = ((hr - hg) / d + 4) / 6; break;
            }
        }

        // 添加 ±5% 的随机变化
        h = (h * 360 + (Math.random() - 0.5) * 10) % 360;
        if (h < 0) h += 360;
        s = Math.max(0, Math.min(100, s * 100 + (Math.random() - 0.5) * 10));
        l = Math.max(0, Math.min(100, l * 100 + (Math.random() - 0.5) * 10));

        return this.hslToRgb(h, s, l);
    }

    hslToRgb(h, s, l) {
        h /= 360; s /= 100; l /= 100;
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }

    // 生成蜡笔质感笔触
    drawCrayonStroke(x, y, color, pressure = 1) {
        const { r, g, b } = this.randomizeColor(color.r, color.g, color.b);

        // 主笔触 - 3 到 5 个重叠的圆形
        const blobs = 3 + Math.floor(Math.random() * 3);
        const baseRadius = 15 * pressure;

        for (let i = 0; i < blobs; i++) {
            // 随机偏移
            const offsetX = (Math.random() - 0.5) * 20 * pressure;
            const offsetY = (Math.random() - 0.5) * 20 * pressure;
            const radius = baseRadius * (0.7 + Math.random() * 0.6);

            // 创建蜡笔纹理效果
            this.drawCrayonBlob(x + offsetX, y + offsetY, radius, r, g, b);
        }
    }

    drawCrayonBlob(x, y, radius, r, g, b) {
        const ctx = this.ctx;

        // 创建径向渐变模拟蜡笔边缘
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.7)`);
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, 0.4)`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();

        // 添加噪点纹理
        this.addNoiseTexture(x, y, radius, r, g, b);
    }

    addNoiseTexture(x, y, radius, r, g, b) {
        const ctx = this.ctx;
        const particleCount = Math.floor(radius * radius / 10);

        for (let i = 0; i < particleCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * radius;
            const px = x + Math.cos(angle) * dist;
            const py = y + Math.sin(angle) * dist;

            const alpha = Math.random() * 0.3;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(px, py, 1 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
```

**Step 2: Commit**

```bash
git add crayon-painter.html
git commit -m "feat: 添加 StrokeRenderer 类实现蜡笔质感笔触"
```

---

### Task 5: 画布管理器

**Files:**
- Modify: `crayon-painter.html` - 添加 CanvasManager 类

**Step 1: 添加 CanvasManager 类**

在 StrokeRenderer 类后添加：

```javascript
class CanvasManager {
    constructor(canvas, strokeRenderer) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.strokeRenderer = strokeRenderer;

        // 画布尺寸
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 笔触历史记录（用于点击识别）
        this.strokeHistory = [];

        // 当前状态
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.currentColor = { r: 200, g: 200, b: 200 };
        this.currentLabel = '未知物品';

        // 绑定事件
        this.bindEvents();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindEvents() {
        // 鼠标事件
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseleave', () => this.stopDrawing());

        // 触摸事件
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        // 点击识别事件
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
    }

    startDrawing(e) {
        this.isDrawing = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
    }

    draw(e) {
        if (!this.isDrawing) return;

        const x = e.clientX;
        const y = e.clientY;

        // 计算距离
        const dist = Math.sqrt(
            Math.pow(x - this.lastX, 2) + Math.pow(y - this.lastY, 2)
        );

        // 只有移动一定距离才绘制
        if (dist > 5) {
            // 绘制两点之间的插值
            const steps = Math.ceil(dist / 5);
            for (let i = 0; i < steps; i++) {
                const t = i / steps;
                const px = this.lastX + (x - this.lastX) * t;
                const py = this.lastY + (y - this.lastY) * t;

                this.strokeRenderer.drawCrayonStroke(px, py, this.currentColor);

                // 记录笔触历史
                this.strokeHistory.push({
                    x: px,
                    y: py,
                    color: { ...this.currentColor },
                    label: this.currentLabel,
                    radius: 15
                });
            }

            this.lastX = x;
            this.lastY = y;
        }
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    setCurrentColor(color) {
        this.currentColor = color;
    }

    setCurrentLabel(label) {
        this.currentLabel = label;
    }

    handleClick(e) {
        const x = e.clientX;
        const y = e.clientY;

        // 查找最近的笔触
        let closest = null;
        let minDist = Infinity;

        for (const stroke of this.strokeHistory) {
            const dist = Math.sqrt(
                Math.pow(x - stroke.x, 2) + Math.pow(y - stroke.y, 2)
            );
            if (dist < stroke.radius * 2 && dist < minDist) {
                minDist = dist;
                closest = stroke;
            }
        }

        if (closest) {
            this.showSourceModal(closest.label);
        }
    }

    showSourceModal(label) {
        const modal = document.getElementById('source-modal');
        const text = document.getElementById('source-object');
        text.textContent = label;
        modal.classList.add('show');
    }
}
```

**Step 2: Commit**

```bash
git add crayon-painter.html
git commit -m "feat: 添加 CanvasManager 类实现画布管理与点击识别"
```

---

### Task 6: 主应用程序集成

**Files:**
- Modify: `crayon-painter.html` - 完善主应用逻辑

**Step 1: 添加主应用初始化逻辑**

替换现有的空 `<script>` 标签内容：

```javascript
// 主应用程序
class CrayonPainterApp {
    constructor() {
        this.cameraManager = null;
        this.colorExtractor = null;
        this.canvasManager = null;
        this.strokeRenderer = null;
        this.isRunning = false;
        this.colorUpdateInterval = null;
    }

    async init() {
        // 初始化摄像头
        this.cameraManager = new CameraManager();
        const success = await this.cameraManager.init();

        if (!success) {
            document.getElementById('start-screen').innerHTML = `
                <h1>摄像头不可用</h1>
                <p>请允许摄像头访问后刷新页面</p>
                <button onclick="location.reload()" style="padding: 16px 48px; font-size: 1.2rem; background: #2c2c2c; color: #fff; border: none; border-radius: 50px; cursor: pointer;">重新加载</button>
            `;
            return;
        }

        // 初始化颜色提取器
        this.colorExtractor = new ColorExtractor(
            this.cameraManager.getVideoElement()
        );

        // 初始化画布
        const canvas = document.getElementById('canvas');
        this.strokeRenderer = new StrokeRenderer(canvas.getContext('2d'));
        this.canvasManager = new CanvasManager(canvas, this.strokeRenderer);

        // 绑定 UI 事件
        this.bindUIEvents();

        // 开始运行
        this.start();
    }

    bindUIEvents() {
        // 关闭模态框
        document.getElementById('source-modal-close').addEventListener('click', () => {
            document.getElementById('source-modal').classList.remove('show');
        });

        document.getElementById('source-modal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('show');
            }
        });

        // 标签按钮
        document.getElementById('label-btn').addEventListener('click', () => {
            this.showLabelPicker();
        });

        // 更新颜色指示器
        const updateSwatch = (color) => {
            const swatch = document.getElementById('current-swatch');
            swatch.style.backgroundColor = `rgb(${color.r}, ${color.g}, ${color.b})`;
        };

        this.colorExtractor.updateSwatch = updateSwatch;
    }

    start() {
        this.isRunning = true;

        // 隐藏启动画面
        document.getElementById('start-screen').style.display = 'none';

        // 定期更新颜色
        this.colorUpdateInterval = setInterval(() => {
            if (this.isRunning) {
                const color = this.colorExtractor.extractColor();
                this.canvasManager.setCurrentColor(color);

                // 更新指示器
                if (this.colorExtractor.updateSwatch) {
                    this.colorExtractor.updateSwatch(color);
                }
            }
        }, 100);
    }

    showLabelPicker() {
        // 创建标签选择器
        const presetLabels = [
            '苹果', '树叶', '橙子', '香蕉', '草莓', '蓝莓',
            '红色杯子', '蓝色杯子', '绿色杯子', '咖啡杯',
            '衣服', '口红', '指甲油', '钥匙', '笔记本',
            '其他'
        ];

        // 创建选择器 UI
        let pickerHTML = `
            <div id="label-picker" style="
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: white;
                padding: 16px;
                border-radius: 16px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.2);
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                z-index: 150;
            ">
        `;

        presetLabels.forEach(label => {
            pickerHTML += `
                <button class="label-option" data-label="${label}" style="
                    padding: 8px 12px;
                    background: #f5f5f5;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background 0.2s;
                ">${label}</button>
            `;
        });

        // 添加语音输入按钮
        pickerHTML += `
            <button id="voice-label-btn" style="
                grid-column: span 5;
                padding: 10px;
                background: #2c2c2c;
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
            ">🎤 语音输入</button>
        `;

        pickerHTML += '</div>';

        // 添加到页面
        const picker = document.createElement('div');
        picker.innerHTML = pickerHTML;
        document.body.appendChild(picker);

        // 绑定事件
        picker.querySelectorAll('.label-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const label = btn.dataset.label;
                this.canvasManager.setCurrentLabel(label);
                document.getElementById('label-btn').textContent = label;
                picker.remove();
            });
        });

        // 语音输入
        picker.querySelector('#voice-label-btn').addEventListener('click', () => {
            this.startVoiceInput();
            picker.remove();
        });

        // 点击外部关闭
        setTimeout(() => {
            document.addEventListener('click', function closePicker(e) {
                if (!picker.contains(e.target) && e.target.id !== 'label-btn') {
                    picker.remove();
                    document.removeEventListener('click', closePicker);
                }
            });
        }, 100);
    }

    startVoiceInput() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert('您的浏览器不支持语音识别');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'zh-CN';
        recognition.interimResults = false;

        const voiceBtn = document.getElementById('voice-label-btn');
        if (voiceBtn) {
            voiceBtn.textContent = '🎤 正在听...';
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.canvasManager.setCurrentLabel(transcript);
            document.getElementById('label-btn').textContent = transcript;
        };

        recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            alert('语音识别失败，请重试或手动选择');
        };

        recognition.onend = () => {
            if (voiceBtn) {
                voiceBtn.textContent = '🎤 语音输入';
            }
        };

        recognition.start();
    }
}

// 启动应用
document.getElementById('start-btn').addEventListener('click', () => {
    const app = new CrayonPainterApp();
    app.init();
});
```

**Step 2: Commit**

```bash
git add crayon-painter.html
git commit -m "feat: 集成主应用程序逻辑，完成颜色提取与标签系统"
```

---

### Task 7: 测试与验证

**Files:**
- Test: 在浏览器中打开 `crayon-painter.html`

**Step 1: 在浏览器中测试**

Run: 手动在 Chrome/Safari 中打开文件

**Step 2: 验证功能**

验收清单：
- [ ] 点击"开始作画"按钮后，摄像头预览显示
- [ ] 拿起彩色物品在摄像头前移动，画布出现对应颜色的笔触
- [ ] 笔触具有蜡笔质感（粗糙边缘、纹理）
- [ ] 点击底部"点击设置物品名称"按钮，显示预设标签
- [ ] 选择标签后，标签按钮显示选中内容
- [ ] 点击画布任意位置，显示该颜色的物品来源
- [ ] 模态框可以正常关闭

**Step 3: Commit**

```bash
git add crayon-painter.html
git commit -m "test: 完成功能验证"
```

---

### Task 8: 最终优化（可选）

**Files:**
- Modify: `crayon-painter.html` - 如有需要，进行微调

**Step 1: 检查并修复问题**

根据测试结果，修复发现的 bug 或体验问题。

**Step 2: 最终提交**

```bash
git add crayon-painter.html
git commit -m "feat: 蜡笔画笔完成"
```
