-- ============================================================
-- 修复脚本:关闭 RLS + 重新写入默认配置
-- 在 Supabase SQL Editor → New query → 粘贴执行
-- ============================================================

ALTER TABLE public.card_info  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_config DISABLE ROW LEVEL SECURITY;

INSERT INTO public.sys_config (key, value, description)
VALUES
  ('home_bg',   '', 'H5 首页背景图 URL'),
  ('detail_bg', '', 'H5 详情页头部背景图 URL')
ON CONFLICT (key) DO NOTHING;

SELECT
  (SELECT COUNT(*) FROM public.card_info)  AS card_info_count,
  (SELECT COUNT(*) FROM public.sys_config) AS sys_config_count;
