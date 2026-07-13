# 栖知 Qizhi Home

AI 智能家庭管理应用，包含冰箱食材、药品健康和出门检查三个核心模块。

## 本地运行

```bash
npm install
npm run dev
```

生产构建：

```bash
npm run build
```

复制 `.env.example` 为 `.env` 后可配置 Supabase。数据库结构位于 `supabase/schema.sql`；未配置时应用使用内置模拟数据和 localStorage。`LLM_API_KEY` 等无 `VITE_` 前缀的变量仅供服务端 Edge Function 使用，严禁改成前端可见变量。

## 主要路由

- `/` 家庭总览
- `/fridge` 冰箱食材管理
- `/medicines` 药品健康管理
- `/checklist` 智能出门检查

`api/plan.ts` 是 Vercel Edge Function 模拟菜单接口，可替换为真实 LLM 请求。
