# 云端画展功能设计

## 概述

将现有本地存储的画展升级为云端画展，使用 Supabase 作为后端服务。实现用户登录、公共画展、私有画展功能。

## 功能需求

### 1. 用户认证
- Supabase Auth Google OAuth 登录
- 登录状态持久化
- 登录/登出 UI

### 2. 公共画展
- 展示所有用户的作品
- 按时间倒序排列
- 匿名用户也可浏览

### 3. 我的画展
- 登录后查看自己的作品
- 上传新作品到云端
- 删除自己的作品

### 4. 数据迁移
- 保留本地 localStorage 数据
- 登录后可选择同步本地作品到云端

## 技术方案

### Supabase 配置

**数据表：artworks**
```sql
CREATE TABLE artworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  materials JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
-- 启用 RLS
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;
-- 所有人都可读取
CREATE POLICY "Public read" ON artworks FOR SELECT USING (true);
-- 用户可创建自己的记录
CREATE POLICY "Users create" ON artworks FOR INSERT WITH CHECK (auth.uid() = user_id);
-- 用户可删除自己的记录
CREATE POLICY "Users delete" ON artworks FOR DELETE USING (auth.uid() = user_id);
```

**Storage Bucket**
- Bucket 名称: `artworks`
- 存储图片文件

### 前端架构

```
crayon-painter.html (主应用)
  ├── 登录/登出按钮
  ├── 公共画展链接
  └── 保存时上传到 Supabase Storage

gallery.html (画展页面)
  ├── 公共画展（所有用户作品）
  ├── 我的画展（当前用户作品）
  └── 登录/登出
```

### 数据结构

```javascript
// 上传后的作品对象
{
  id: "uuid",
  user_id: "user-uuid",
  name: "画作名字",
  image_url: "storage-url",
  materials: [
    { color: {r,g,b}, thumbnail: "base64" }
  ],
  created_at: "2026-03-15T..."
}
```

## 页面设计

### 首页 (crayon-painter.html)
- START 按钮
- 登录按钮（未登录时）/ 用户信息 + 登出（已登录）
- 浏览画展链接

### 画展页面 (gallery.html)
- 顶部切换：公共画展 | 我的画展
- 登录状态显示
- 作品网格展示

### 登录弹窗
- Google 登录按钮

## 验收标准

1. 用户可以通过 Google 登录
2. 公共画展显示所有用户作品
3. 我的画展只显示当前用户作品
4. 保存作品时图片上传到 Supabase Storage
5. 登录后可查看本地数据并同步到云端
