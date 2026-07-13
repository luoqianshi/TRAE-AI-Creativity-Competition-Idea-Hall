/**
 * PocketBase Collection 自动创建脚本
 * 用法：先启动 pocketbase.exe，然后 node pb_setup.js
 * 或者手动在 PocketBase Admin UI (http://127.0.0.1:8090/_/) 中创建
 */
const PB_URL = "http://127.0.0.1:8090";
const ADMIN_EMAIL = "admin@example.com";
const ADMIN_PASSWORD = "admin123456";

async function request(path, options = {}) {
  const url = PB_URL + path;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  return res;
}

async function main() {
  // 1. 登录管理员
  console.log(">>> 登录管理员...");
  const authRes = await request("/api/admins/auth-with-password", {
    method: "POST",
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!authRes.ok) {
    console.error("管理员登录失败:", await authRes.text());
    console.error("请先启动 PocketBase 并通过 Admin UI 创建管理员账号");
    console.error("然后修改此文件中的 ADMIN_EMAIL 和 ADMIN_PASSWORD");
    process.exit(1);
  }
  const authData = await authRes.json();
  const token = authData.token;
  const adminHeaders = { Authorization: token };

  // 2. 创建 Collections
  const collections = [
    // ===== 1. users (PocketBase 内置，只需扩展字段) =====
    {
      name: "users",
      type: "auth",
      fields: [
        { name: "nickname", type: "text", options: { max: 50 } },
        { name: "avatar_seed", type: "number", options: { min: 0 } },
        { name: "grade", type: "text", options: { max: 30 } },
        { name: "textbook", type: "text", options: { max: 30 } },
        { name: "total_points", type: "number", options: { min: 0 } },
        { name: "level", type: "number", options: { min: 1, max: 10 } },
        { name: "streak", type: "number", options: { min: 0 } },
        { name: "last_sign", type: "number" },
        { name: "vip_level", type: "text", options: { max: 10 } },
        { name: "vip_expire", type: "number" },
      ],
      indexes: [],
      rules: [
        { type: "read", action: "list", query: "id = @request.auth.id" },
        { type: "read", action: "view", query: "id = @request.auth.id" },
        { type: "update", action: "", query: "id = @request.auth.id" },
      ],
    },

    // ===== 2. cards =====
    {
      name: "cards",
      type: "base",
      fields: [
        { name: "qid", type: "text", options: { max: 100 } },
        { name: "uid", type: "text", options: { max: 50 } },
        { name: "textbook", type: "text", options: { max: 30 } },
        { name: "zh", type: "text", options: { max: 500 } },
        { name: "summary", type: "text", options: { max: 500 } },
        { name: "unit", type: "number", options: { min: 0 } },
        { name: "lesson", type: "number", options: { min: 0 } },
        { name: "due", type: "number" },
        { name: "stability", type: "number", options: { min: 0 } },
        { name: "difficulty", type: "number", options: { min: 1, max: 10 } },
        { name: "elapsed_days", type: "number", options: { min: 0 } },
        { name: "scheduled_days", type: "number", options: { min: 0 } },
        { name: "reps", type: "number", options: { min: 0 } },
        { name: "lapses", type: "number", options: { min: 0 } },
        { name: "state", type: "number", options: { min: 0, max: 3 } },
        { name: "last_review", type: "number" },
        { name: "best_ms", type: "number" },
        { name: "updated_at", type: "autodate", options: { onUpdate: true } },
      ],
      indexes: [
        "CREATE INDEX idx_cards_uid_due ON cards (uid, due)",
        "CREATE INDEX idx_cards_uid_state ON cards (uid, state)",
        "CREATE INDEX idx_cards_uid_textbook ON cards (uid, textbook)",
      ],
      rules: [
        { type: "read", action: "list", query: "uid = @request.auth.id" },
        { type: "read", action: "view", query: "uid = @request.auth.id" },
        { type: "create", action: "" },
        { type: "update", action: "", query: "uid = @request.auth.id" },
        { type: "delete", action: "", query: "uid = @request.auth.id" },
      ],
    },

    // ===== 3. review_logs =====
    {
      name: "review_logs",
      type: "base",
      fields: [
        { name: "uid", type: "text", options: { max: 50 } },
        { name: "qid", type: "text", options: { max: 100 } },
        { name: "rating", type: "number", options: { min: 1, max: 4 } },
        { name: "state", type: "number", options: { min: 0, max: 3 } },
        { name: "stability", type: "number" },
        { name: "difficulty", type: "number" },
        { name: "reviewed_at", type: "number" },
        { name: "elapsed_ms", type: "number", options: { min: 0 } },
        { name: "correct", type: "bool" },
        { name: "typo_count", type: "number", options: { min: 0 } },
      ],
      indexes: [
        "CREATE INDEX idx_logs_uid_reviewed ON review_logs (uid, reviewed_at)",
        "CREATE INDEX idx_logs_uid_qid ON review_logs (uid, qid)",
      ],
      rules: [
        { type: "read", action: "list", query: "uid = @request.auth.id" },
        { type: "read", action: "view", query: "uid = @request.auth.id" },
        { type: "create", action: "" },
      ],
    },

    // ===== 4. daily_stats =====
    {
      name: "daily_stats",
      type: "base",
      fields: [
        { name: "uid", type: "text", options: { max: 50 } },
        { name: "date", type: "text", options: { max: 10 } },
        { name: "done", type: "number", options: { min: 0 } },
        { name: "correct", type: "number", options: { min: 0 } },
        { name: "points", type: "number", options: { min: 0 } },
        { name: "learn_ms", type: "number", options: { min: 0 } },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_stats_uid_date ON daily_stats (uid, date)",
        "CREATE INDEX idx_stats_date ON daily_stats (date)",
      ],
      rules: [
        { type: "read", action: "list", query: "uid = @request.auth.id" },
        { type: "read", action: "view", query: "uid = @request.auth.id" },
        { type: "create", action: "" },
        { type: "update", action: "", query: "uid = @request.auth.id" },
      ],
    },

    // ===== 5. leaderboard =====
    {
      name: "leaderboard",
      type: "base",
      fields: [
        { name: "uid", type: "text", options: { max: 50 } },
        { name: "name", type: "text", options: { max: 50 } },
        { name: "avatar", type: "text", options: { max: 200 } },
        { name: "total_points", type: "number", options: { min: 0 } },
        { name: "today_points", type: "number", options: { min: 0 } },
        { name: "level", type: "number", options: { min: 1, max: 10 } },
        { name: "streak", type: "number", options: { min: 0 } },
        { name: "updated", type: "autodate", options: { onUpdate: true } },
      ],
      indexes: [
        "CREATE INDEX idx_lb_total ON leaderboard (total_points DESC)",
        "CREATE INDEX idx_lb_today ON leaderboard (today_points DESC)",
        "CREATE UNIQUE INDEX idx_lb_uid ON leaderboard (uid)",
      ],
      rules: [
        { type: "read", action: "list" },  // 所有人可读
        { type: "read", action: "view" },
        { type: "create", action: "" },
        { type: "update", action: "", query: "uid = @request.auth.id" },
      ],
    },

    // ===== 6. questions =====
    {
      name: "questions",
      type: "base",
      fields: [
        { name: "qid", type: "text", options: { max: 100 } },
        { name: "textbook", type: "text", options: { max: 30 } },
        { name: "unit", type: "number", options: { min: 0 } },
        { name: "lesson", type: "number", options: { min: 0 } },
        { name: "zh", type: "text", options: { max: 500 } },
        { name: "words", type: "editor" },
        { name: "tags", type: "editor" },
        { name: "phonetics", type: "editor" },
        { name: "pattern", type: "text", options: { max: 500 } },
        { name: "grammarNotes", type: "text", options: { max: 2000 } },
        { name: "grammarPoints", type: "editor" },
        { name: "variants", type: "editor" },
        { name: "difficulty", type: "number", options: { min: 1, max: 5 } },
        { name: "source", type: "select", options: { values: ["textbook", "exam"] } },
        { name: "exam_year", type: "number", options: { min: 2010, max: 2030 } },
        { name: "exam_type", type: "text", options: { max: 30 } },
        { name: "vip_only", type: "bool" },
      ],
      indexes: [
        "CREATE INDEX idx_q_textbook_unit ON questions (textbook, unit)",
        "CREATE INDEX idx_q_vip_only ON questions (vip_only)",
        "CREATE INDEX idx_q_difficulty ON questions (difficulty)",
        "CREATE UNIQUE INDEX idx_q_qid ON questions (qid)",
      ],
      rules: [
        { type: "read", action: "list" },  // vip_only 的过滤用 API hook
        { type: "read", action: "view" },
        // 前端不可写
      ],
    },

    // ===== 7. orders =====
    {
      name: "orders",
      type: "base",
      fields: [
        { name: "uid", type: "text", options: { max: 50 } },
        { name: "plan", type: "select", options: { values: ["month", "quarter", "year"] } },
        { name: "amount", type: "number", options: { min: 0 } },
        { name: "status", type: "select", options: { values: ["pending", "paid", "cancelled", "refunded"] } },
        { name: "channel", type: "select", options: { values: ["alipay", "wechat"] } },
        { name: "trade_no", type: "text", options: { max: 100 } },
        { name: "out_trade_no", type: "text", options: { max: 100 } },
        { name: "paid_at", type: "number" },
        { name: "created", type: "autodate" },
        { name: "updated", type: "autodate", options: { onUpdate: true } },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_orders_out_trade ON orders (out_trade_no)",
        "CREATE INDEX idx_orders_uid ON orders (uid)",
      ],
      rules: [
        { type: "read", action: "list", query: "uid = @request.auth.id" },
        { type: "read", action: "view", query: "uid = @request.auth.id" },
        { type: "create", action: "" },
        { type: "update", action: "" },  // 仅服务端/支付回调更新
      ],
    },

    // ===== 8. vip_status =====
    {
      name: "vip_status",
      type: "base",
      fields: [
        { name: "uid", type: "text", options: { max: 50 } },
        { name: "level", type: "select", options: { values: ["free", "vip"] } },
        { name: "plan", type: "select", options: { values: ["month", "quarter", "year"] } },
        { name: "expire_at", type: "number" },
        { name: "source_order", type: "text", options: { max: 50 } },
        { name: "updated", type: "autodate", options: { onUpdate: true } },
      ],
      indexes: [
        "CREATE UNIQUE INDEX idx_vip_uid ON vip_status (uid)",
      ],
      rules: [
        { type: "read", action: "view", query: "uid = @request.auth.id" },
        { type: "create", action: "" },
        { type: "update", action: "" },  // 仅服务端更新
      ],
    },
  ];

  // 创建每个 collection
  for (const col of collections) {
    if (col.name === "users") {
      console.log(">>> users 是 PocketBase 内置 collection，请通过 Admin UI 扩展字段");
      console.log("    需要添加的字段:", col.fields.map(f => f.name).join(", "));
      continue;
    }
    try {
      const res = await request("/api/collections", {
        method: "POST",
        headers: adminHeaders,
        body: JSON.stringify(col),
      });
      if (res.ok) {
        console.log(`>>> 创建 ${col.name} 成功`);
      } else if (res.status === 400) {
        const err = await res.json();
        console.log(`>>> ${col.name} 已存在或创建失败: ${JSON.stringify(err.data?.message || err.message)}`);
      } else {
        console.error(`>>> 创建 ${col.name} 失败:`, res.status, await res.text());
      }
    } catch (e) {
      console.error(`>>> 创建 ${col.name} 异常:`, e.message);
    }
  }

  console.log("\n===== 完成 =====");
  console.log("请访问 http://127.0.0.1:8090/_/ 查看管理后台");
}

main().catch(console.error);
