# 画展与画材记录功能实现计划

> **For Claude:** 直接在当前会话中实现，不需要子任务模式

**目标：** 为蜡笔绘画应用添加画材自动记录和画展展示功能

**架构：** 在现有单页 HTML 应用中扩展：1) 自动记录画材的数据结构和方法 2) 保存弹窗 UI 3) 画展页面

**技术栈：** 纯 HTML/CSS/JS，使用 localStorage 存储

---

### 任务 1: 添加画材记录数据结构

**文件：**
- 修改: `/Users/yan/crayon-painter/crayon-painter.html`

**步骤：**

在 ColorExtractor 类的构造函数中添加画材记录相关属性：

```javascript
// 画材记录
this.materials = []; // 记录用到的画材
this.maxMaterials = 10; // 最多10个画材
this.lastMaterialColor = null; // 上一个画材颜色
this.materialCaptureCanvas = document.createElement('canvas');
this.materialCaptureCanvas.width = 80;
this.materialCaptureCanvas.height = 60;
```

---

### 任务 2: 实现画材自动捕获逻辑

**文件：**
- 修改: `/Users/yan/crayon-painter/crayon-painter.html`

**步骤：**

在 ColorExtractor 类中添加 captureMaterial() 方法，在检测到颜色明显变化时调用：

```javascript
// 捕获画材
captureMaterial(color, video) {
    // 如果颜色变化明显，记录新画材
    if (this.lastMaterialColor) {
        const dist = Math.sqrt(
            Math.pow(color.r - this.lastMaterialColor.r, 2) +
            Math.pow(color.g - this.lastMaterialColor.g, 2) +
            Math.pow(color.b - this.lastMaterialColor.b, 2)
        );
        if (dist < 50) return; // 颜色变化不够大
    }

    // 避免重复记录相同颜色
    for (const m of this.materials) {
        const dist = Math.sqrt(
            Math.pow(color.r - m.color.r, 2) +
            Math.pow(color.g - m.color.g, 2) +
            Math.pow(color.b - m.color.b, 2)
        );
        if (dist < 30) return;
    }

    // 捕获当前画面作为缩略图
    const ctx = this.materialCaptureCanvas.getContext('2d');
    ctx.drawImage(video, 0, 0, 80, 60);
    const thumbnail = this.materialCaptureCanvas.toDataURL('image/jpeg', 0.5);

    this.materials.push({
        color: { ...color },
        thumbnail,
        time: new Date().toLocaleTimeString()
    });

    // 限制数量
    if (this.materials.length > this.maxMaterials) {
        this.materials.shift();
    }

    this.lastMaterialColor = { ...color };
}
```

在 detectMotion() 方法末尾调用此方法（当检测到有效物体时）。

---

### 任务 3: 修改 SAVE 按钮行为

**文件：**
- 修改: `/Users/yan/crayon-painter/crayon-painter.html`

**步骤：**

将原来的 saveImage() 改为显示保存弹窗：

```javascript
// 保存弹窗 HTML
const savePopup = document.createElement('div');
savePopup.id = 'save-popup';
savePopup.innerHTML = `
    <div class="save-overlay"></div>
    <div class="save-card">
        <h2>保存画作</h2>
        <div class="artwork-preview">
            <canvas id="artwork-preview-canvas"></canvas>
        </div>
        <div class="materials-list" id="materials-list"></div>
        <input type="text" id="artwork-name" placeholder="为你的画命名..." maxlength="30">
        <div class="save-buttons">
            <button id="save-confirm-btn">保存</button>
            <button id="view-gallery-btn">查看画展</button>
        </div>
    </div>
`;
document.body.appendChild(savePopup);
```

添加对应 CSS 样式（弹窗、卡片、输入框、按钮）。

---

### 任务 4: 实现保存逻辑

**文件：**
- 修改: `/Users/yan/crayon-painter/crayon-painter.html`

**步骤：**

点击"保存"按钮时：

```javascript
// 获取或创建存储
const stored = localStorage.getItem('wuse_artworks');
const artworks = stored ? JSON.parse(stored) : [];

// 创建新画作
const artwork = {
    id: Date.now(),
    name: nameInput.value || '无题',
    createdAt: new Date().toLocaleString('zh-CN'),
    imageData: canvas.toDataURL('image/png'),
    materials: [...this.colorExtractor.materials]
};

// 保存
artworks.unshift(artwork); // 最新在前
localStorage.setItem('wuse_artworks', JSON.stringify(artworks));

// 关闭弹窗
savePopup.remove();
```

---

### 任务 5: 创建画展页面

**文件：**
- 创建: `/Users/yan/crayon-painter/gallery.html`

**步骤：**

创建独立的画展页面，包含：

1. 顶部标题 "我的画展"
2. 读取 localStorage 中的所有画作
3. 网格布局展示作品卡片
4. 每张卡片显示：缩略图、名字、日期、画材色点
5. 点击卡片可查看大图（可选）

---

### 任务 6: 在绘制循环中调用画材捕获

**文件：**
- 修改: `/Users/yan/crayon-painter/crayon-painter.html`

**步骤：**

在 app 的绘制循环中，当检测到有效物体时调用 captureMaterial：

```javascript
// 在检测到物体时捕获画材
if (motion.hasObject && motion.color) {
    this.colorExtractor.captureMaterial(motion.color, this.cameraManager.getVideoElement());
}
```

---

### 任务 7: 测试完整流程

1. 刷新页面，开始绘画
2. 更换不同颜色的物体，确认画材被记录
3. 点击 SAVE，确认弹窗显示画作和画材
4. 输入名字，点击保存
5. 点击"查看画展"，确认作品展示正确
