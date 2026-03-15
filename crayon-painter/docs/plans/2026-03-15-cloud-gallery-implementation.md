# 云端画展实现计划

> **For Claude:** 直接在当前会话中实现

**目标：** 使用 Supabase 实现云端登录和画展功能

**架构：** 添加 Supabase 客户端 SDK，实现 Auth + Storage + Database

**技术栈：** Supabase JavaScript SDK

---

### 任务 1: 创建 Supabase 配置文件

**文件：**
- 创建: `/Users/yan/crayon-painter/js/supabase.js`

**步骤：**

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

### 任务 2: 修改首页添加登录功能

**文件：**
- 修改: `/Users/yan/crayon-painter/crayon-painter.html`

**步骤：**

1. 在 `<head>` 中添加 Supabase SDK CDN
2. 添加登录/登出按钮 UI
3. 添加 Google OAuth 登录函数
4. 修改保存逻辑：上传图片到 Storage，元数据存数据库

---

### 任务 3: 修改画展页面

**文件：**
- 修改: `/Users/yan/crayon-painter/gallery.html`

**步骤：**

1. 添加 Supabase SDK
2. 添加公共画展 / 我的画展 切换
3. 添加登录/登出 UI
4. 加载作品时区分：公共（所有用户）vs 我的（当前用户）

---

### 任务 4: 配置 Supabase（用户提供）

需要用户在 Supabase 控制台：
1. 创建项目
2. 启用 Google Auth
3. 创建 artworks 表
4. 创建 Storage bucket
5. 提供 URL 和 anon key
