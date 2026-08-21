// SQLite 数据层：用户 / 套餐 / 订单 / 订阅
const Database = require('better-sqlite3')
const path = require('path')

const db = new Database(path.join(__dirname, 'data.sqlite'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,                          -- 邮箱登录需绑定手机号
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CNY',
  interval TEXT NOT NULL,              -- days3 / month / quarter / year
  months INTEGER NOT NULL DEFAULT 0,   -- 订阅时长（月）
  days INTEGER NOT NULL DEFAULT 0,     -- 订阅时长（天，短期卡用）
  nq_credit INTEGER NOT NULL DEFAULT 0,-- 赠送牛气值（规则待厂家确认）
  features TEXT NOT NULL DEFAULT '[]',
  is_active INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_no TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  amount_cents INTEGER NOT NULL,
  channel TEXT NOT NULL,               -- wechat / alipay / stripe
  status TEXT NOT NULL DEFAULT 'pending', -- pending / paid / cancelled
  stripe_session_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
  plan_id INTEGER NOT NULL REFERENCES plans(id),
  status TEXT NOT NULL DEFAULT 'active',  -- active / expired / cancelled
  started_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  nq_balance INTEGER NOT NULL DEFAULT 0,
  last_order_no TEXT
);
`)

// 套餐种子数据 —— 官方 C 端直营价（2026-08 厂家价格表）；牛气值规则待厂家确认
const planCount = db.prepare('SELECT COUNT(*) AS c FROM plans').get().c
if (planCount === 0) {
  const insert = db.prepare(`
    INSERT INTO plans (code, name, price_cents, interval, months, days, nq_credit, features)
    VALUES (@code, @name, @price_cents, @interval, @months, @days, @nq_credit, @features)
  `)
  const seed = db.transaction((plans) => plans.forEach((p) => insert.run(p)))
  seed([
    {
      code: 'days3', name: '3天体验卡', price_cents: 19900, interval: 'days3', months: 0, days: 3, nq_credit: 300,
      features: JSON.stringify(['完整功能 3 天体验', '三层 AI 工作流（分析/审核/诊断）', '适合渠道体验与活动', '含 300 牛气值（规则待确认）']),
    },
    {
      code: 'monthly', name: '月卡', price_cents: 98000, interval: 'month', months: 1, days: 0, nq_credit: 3000,
      features: JSON.stringify(['三层 AI 工作流（分析/审核/诊断）', '风控与过滤设置', 'AI 日志与复盘', '含 3,000 牛气值（规则待确认）']),
    },
    {
      code: 'quarterly', name: '季卡', price_cents: 201800, interval: 'quarter', months: 3, days: 0, nq_credit: 10000,
      features: JSON.stringify(['包含月卡全部功能', '克隆分析师（自定义提示词）', '历史订单逻辑提炼', '含 10,000 牛气值（规则待确认）']),
    },
    {
      code: 'yearly', name: '年卡', price_cents: 698000, interval: 'year', months: 12, days: 0, nq_credit: 45000,
      features: JSON.stringify(['包含季卡全部功能', '优先兼容性检测与部署协助', '版本更新优先体验', '含 45,000 牛气值（规则待确认）']),
    },
  ])
  console.log('[db] seeded official plans（官方直营价）')
}

module.exports = db
