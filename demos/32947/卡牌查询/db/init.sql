-- ============================================================
-- AGC 鉴真卡牌评级查询系统 · Supabase 初始化 SQL
-- 在 Supabase 控制台 → SQL Editor 中执行本脚本
-- ============================================================

-- 启用 UUID 扩展(可选,本系统用 text 类型 id)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------
-- 表 1: card_info (卡牌信息表)
-- 对应需求文档第四点 1.1
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.card_info (
  id          TEXT PRIMARY KEY,                         -- 主键
  card_name   TEXT        NOT NULL,                     -- 卡牌名称
  card_no     TEXT        NOT NULL,                     -- 卡牌编号
  inner_no    TEXT        NOT NULL UNIQUE,              -- 内部编号(查询主键,全局唯一)
  score       TEXT        NOT NULL,                     -- 评级分数
  version     TEXT        NOT NULL,                     -- 卡牌版本
  img_front   TEXT        NOT NULL DEFAULT '',          -- 正面图片 URL
  img_back    TEXT        NOT NULL DEFAULT '',          -- 背面图片 URL
  create_time TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- 创建时间
);

CREATE INDEX IF NOT EXISTS idx_card_info_inner_no ON public.card_info (inner_no);
CREATE INDEX IF NOT EXISTS idx_card_info_create_time ON public.card_info (create_time DESC);

COMMENT ON TABLE  public.card_info              IS '卡牌信息表';
COMMENT ON COLUMN public.card_info.id            IS '主键';
COMMENT ON COLUMN public.card_info.card_name     IS '卡牌名称';
COMMENT ON COLUMN public.card_info.card_no       IS '卡牌编号';
COMMENT ON COLUMN public.card_info.inner_no      IS '内部编号(查询主键,唯一)';
COMMENT ON COLUMN public.card_info.score         IS '评级分数';
COMMENT ON COLUMN public.card_info.version       IS '卡牌版本';
COMMENT ON COLUMN public.card_info.img_front     IS '正面图片 URL';
COMMENT ON COLUMN public.card_info.img_back      IS '背面图片 URL';
COMMENT ON COLUMN public.card_info.create_time   IS '录入时间';

-- -----------------------------------------------------------
-- 表 2: sys_config (系统配置表)
-- 对应需求文档第四点 1.2
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sys_config (
  key         TEXT PRIMARY KEY,                         -- 配置键
  value       TEXT        NOT NULL DEFAULT '',          -- 配置值
  description TEXT        NOT NULL DEFAULT '',          -- 配置描述
  update_time TIMESTAMPTZ NOT NULL DEFAULT NOW()         -- 更新时间
);

COMMENT ON TABLE  public.sys_config              IS '系统配置表';
COMMENT ON COLUMN public.sys_config.key          IS '配置键';
COMMENT ON COLUMN public.sys_config.value        IS '配置值';
COMMENT ON COLUMN public.sys_config.description  IS '配置描述';
COMMENT ON COLUMN public.sys_config.update_time  IS '更新时间';

-- -----------------------------------------------------------
-- 初始化系统配置(背景图占位)
-- -----------------------------------------------------------
INSERT INTO public.sys_config (key, value, description)
VALUES
  ('home_bg',   '', 'H5 首页背景图 URL'),
  ('detail_bg', '', 'H5 详情页头部背景图 URL')
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------
-- 关闭 RLS(本系统通过后端 anon key 直连,不在前端直连)
-- 若后续需要前端直连,请启用 RLS 并配置 policy
-- -----------------------------------------------------------
ALTER TABLE public.card_info  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sys_config DISABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------
-- 验证(可选):如已看到两张表创建成功,这段可忽略
-- -----------------------------------------------------------
SELECT
  (SELECT COUNT(*) FROM public.card_info)  AS card_info_count,
  (SELECT COUNT(*) FROM public.sys_config) AS sys_config_count;
