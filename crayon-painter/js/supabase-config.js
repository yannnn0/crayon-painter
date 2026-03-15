// Supabase 配置
const SUPABASE_URL = 'https://qrkgrqxlnmwzwxvvunbs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFya2dycXhsbm13end4dnVubnMiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTc3MzU3NjY0MSwiZXhwIjoyMDg5MTUyNjQxfQ.CCmthxPNWxuyUNdF4TjLEODd5yvbVMXG1cdsiiJYV2E'

// 初始化 Supabase 客户端
const { createClient } = window.supabase || {}
const supabase = createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

// 检查是否在 Supabase 加载后重新初始化
window.initSupabase = function(url, key) {
    if (createClient) {
        return createClient(url, key)
    }
    return null
}
