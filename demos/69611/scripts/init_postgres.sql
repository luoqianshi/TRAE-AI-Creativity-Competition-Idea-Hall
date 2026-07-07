-- PostgreSQL 初始化脚本
-- 创建 OmniLog Intelligence 所需的表结构

-- ============================================================
-- 采集运行记录表
-- ============================================================

CREATE TABLE IF NOT EXISTS ingestion_runs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'running',
    docs_count INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_source ON ingestion_runs(source);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_start_time ON ingestion_runs(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_status ON ingestion_runs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_runs_created_at ON ingestion_runs(created_at DESC);

-- ============================================================
-- 文档元数据表（可选，用于关系型查询）
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(255) PRIMARY KEY,
    source VARCHAR(255) NOT NULL,
    url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    language VARCHAR(10),
    tags JSONB DEFAULT '[]',
    fingerprint VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_timestamp ON documents(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_documents_language ON documents(language);
CREATE INDEX IF NOT EXISTS idx_documents_fingerprint ON documents(fingerprint);

-- ============================================================
-- 实体表（可选，用于关系型查询）
-- ============================================================

CREATE TABLE IF NOT EXISTS entities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(500) NOT NULL,
    type VARCHAR(100) NOT NULL,
    first_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    mention_count INTEGER DEFAULT 1,
    metadata JSONB DEFAULT '{}',
    UNIQUE(name, type)
);

CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_mention_count ON entities(mention_count DESC);

-- ============================================================
-- 事件表（可选，用于关系型查询）
-- ============================================================

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(255) PRIMARY KEY,
    summary TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    impact_score FLOAT DEFAULT 0.0,
    doc_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_events_impact_score ON events(impact_score DESC);

-- ============================================================
-- 系统配置表
-- ============================================================

CREATE TABLE IF NOT EXISTS system_config (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT INTO system_config (key, value, description) VALUES
    ('pipeline.batch_size', '50', '批量处理大小'),
    ('pipeline.dedup_threshold', '10', 'SimHash 去重阈值'),
    ('llm.max_retries', '3', 'LLM 调用最大重试次数'),
    ('llm.timeout', '30', 'LLM 调用超时时间（秒）')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 审计日志表
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id VARCHAR(255),
    user VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================
-- 触发器：自动更新 updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ingestion_runs_updated_at BEFORE UPDATE ON ingestion_runs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 实体知识库（用于实体链接与消歧）
-- ============================================================

CREATE TABLE IF NOT EXISTS entity_knowledge_base (
    entity_id VARCHAR(64) PRIMARY KEY,
    canonical_name VARCHAR(255) NOT NULL,
    aliases JSONB NOT NULL DEFAULT '[]',
    entity_type VARCHAR(32) NOT NULL,
    description TEXT,
    description_vec JSONB,  -- 向量存储为 JSONB（兼容无 pgvector 场景）
    wikidata_id VARCHAR(32),
    source_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entity_kb_aliases ON entity_knowledge_base USING gin (aliases);
CREATE INDEX IF NOT EXISTS idx_entity_kb_type ON entity_knowledge_base (entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_kb_canonical ON entity_knowledge_base (canonical_name);

-- ============================================================
-- pgvector 向量存储（替代 ChromaDB）
-- ============================================================

-- 启用 pgvector 扩展
CREATE EXTENSION IF NOT EXISTS vector;

-- 文档向量表（替代 ChromaDB）
CREATE TABLE IF NOT EXISTS document_vectors (
    doc_id VARCHAR(64) PRIMARY KEY,
    embedding vector(384),  -- sentence-transformers 默认维度
    content TEXT,
    source VARCHAR(128),
    timestamp TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

-- HNSW 索引（高性能向量检索）
CREATE INDEX IF NOT EXISTS idx_doc_vec_hnsw
    ON document_vectors USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_doc_vec_timestamp ON document_vectors (timestamp);
CREATE INDEX IF NOT EXISTS idx_doc_vec_source ON document_vectors (source);

-- ============================================================
-- 报告存储（替代 MongoDB）
-- ============================================================

CREATE TABLE IF NOT EXISTS daily_reports (
    id VARCHAR(64) PRIMARY KEY,
    report_date DATE NOT NULL UNIQUE,
    title VARCHAR(512),
    summary TEXT,
    full_markdown TEXT,
    html_content TEXT,
    metadata JSONB DEFAULT '{}',
    rag_info JSONB DEFAULT '{}',
    classification VARCHAR(32) DEFAULT 'internal',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_date ON daily_reports (report_date);
CREATE INDEX IF NOT EXISTS idx_reports_classification ON daily_reports (classification);

-- ============================================================
-- 告警规则表（Phase 1.4 可配置告警规则引擎）
-- ============================================================

CREATE TABLE IF NOT EXISTS alert_rules (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    severities TEXT[] NOT NULL DEFAULT '{}',
    entity_types TEXT[] NOT NULL DEFAULT '{}',
    sources TEXT[] NOT NULL DEFAULT '{}',
    keywords TEXT[] NOT NULL DEFAULT '{}',
    channels TEXT[] NOT NULL DEFAULT '{feishu}',
    template VARCHAR(64) NOT NULL DEFAULT 'default',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_enabled ON alert_rules (enabled);

-- 插入默认规则（与原有硬编码行为一致）
INSERT INTO alert_rules (name, enabled, severities, channels) VALUES
    ('Critical → all channels', TRUE, '{critical}', '{feishu,dingtalk,email}'),
    ('Warning → feishu + dingtalk', TRUE, '{warning}', '{feishu,dingtalk}'),
    ('Info → feishu only', TRUE, '{info}', '{feishu}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 地理空间实体表（Phase 1.2 地理空间模型）
-- ============================================================

CREATE TABLE IF NOT EXISTS geo_entities (
    id SERIAL PRIMARY KEY,
    entity_id VARCHAR(64) NOT NULL UNIQUE,
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(32) NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    geo_source VARCHAR(32) DEFAULT 'manual',
    geo_json JSONB,
    location GEOMETRY(POINT, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entity_id) REFERENCES entity_knowledge_base(entity_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_geo_entities_coords ON geo_entities (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_geo_entities_location ON geo_entities USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_geo_entities_type ON geo_entities (entity_type);

-- ============================================================
-- 监控关注列表表（Phase 3.2 实体监控看板）
-- ============================================================

CREATE TABLE IF NOT EXISTS watchlist (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(128) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    entity_name VARCHAR(255) NOT NULL,
    entity_type VARCHAR(32),
    notes TEXT,
    alert_on_appearance BOOLEAN DEFAULT TRUE,
    alert_on_trend_change BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_entity ON watchlist (entity_id);

-- ============================================================
-- 完成提示
-- ============================================================

DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL 初始化完成！';
    RAISE NOTICE '已创建表：ingestion_runs, documents, entities, events, system_config, audit_logs, entity_knowledge_base, document_vectors, daily_reports, alert_rules, geo_entities, watchlist';
END $$;
