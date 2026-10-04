# 牛牛AI 官网（订阅制全栈 Demo）

连接 MT5 的 AI 交易助手官网：产品落地页 + 用户注册登录 + 订阅定价 + 支付。

**在线：** [产品官网 niuniuai.app](https://niuniuai.app) · [交互展示页](https://78tyih.github.io/niuniu-ai-official/showcase.html)（功能视频 ×10 在线播放 + 场景导览 + 架构拆解）

## 功能

- 落地页：Hero / 痛点 / 三层 AI 工作流 / 六步流程 / 真实界面 / FAQ / 风险声明
- 账户：邮箱注册登录（Supabase Auth）、手机号绑定、我的订阅（套餐、到期、牛气值、订单记录）
- 定价：3天体验卡 ¥19.9 / 月卡 ¥980 / 季卡 ¥2,018 / 年卡 ¥6,980（官方直营价）
- 支付：Stripe 真实 Checkout（test 模式）+ 微信/支付宝演示收银台

## 架构

| 层 | 技术 |
|---|---|
| 前端 | React + Vite + Tailwind（`src/`） |
| 数据库与认证 | Supabase（建库脚本 `supabase/schema.sql`） |
| 服务端逻辑 | Vercel Functions（`api/`）与 EdgeOne Pages 云函数（`cloud-functions/`）双版本同源逻辑 |
| 支付 | Stripe Checkout + 入账 RPC `mark_order_paid` |

## 本地运行

```bash
npm install
npm run dev        # 前端（Vite，端口 3000，/api 代理到 8787）
vercel dev         # 或者用它同时跑前端 + api/ 云函数
```

环境变量写在 `.env`（不要提交）：

```
SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
STRIPE_SECRET_KEY
PUBLIC_BASE_URL
```

## 部署

**当前线上：Zeabur（niuniuai.app）**，已开启 `main` 分支自动部署——push 后自动构建上线。

| 项 | 值 |
|---|---|
| 构建 | 仓库根目录 `Dockerfile`（多阶段：`node:22` 构建 → `node:22-slim` 运行） |
| 运行 | `node server/zeabur.mjs`，监听 `8080`，同时托管 `dist/` 与 `/api` |
| 前端构建变量 | `.env.production`（仅 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY`，均为会打进前端 JS 的公开值） |
| 运行时变量 | 在 Zeabur 服务变量中配置：`SUPABASE_URL`、`SUPABASE_ANON_KEY`、`SUPABASE_SERVICE_ROLE_KEY`、`STRIPE_SECRET_KEY`、`PUBLIC_BASE_URL` |

> 服务端密钥只放 Zeabur 环境变量。仓库是公开的，切勿提交 `.env`。

**EdgeOne Pages（国内备选）**：控制台关联本仓库即可，构建配置已在 `edgeone.json`；
云函数在 `cloud-functions/api/[[default]].js`（Express 导出，无需监听端口）；
部署后在项目设置里添加上述运行时环境变量。

## 合规

页面文案遵循「无收益承诺、风险可见」原则；价格与牛气值规则以上线前厂家确认为准。

## 四问速览

| 问 | 答 |
|---|---|
| **解决什么问题** | 给 MT5 交易者一个开箱即用的 AI 辅助层（连接 → 助手 → 分析 → 复盘）；同时给开发者一套「订阅制 AI 产品」的完整参考实现——落地页、Auth、定价、支付、合规文案一次配齐 |
| **什么场景 → 什么结果** | 交易者：注册 → 连接 MT5 → AI 助手/分析/复盘，订阅后解锁完整功能。开发者：clone 下来改环境变量即可得到一套可上线的订阅付费产品骨架 |
| **什么结构** | React+Vite+Tailwind 前端 → Supabase（Auth + Postgres，`supabase/schema.sql` 建库）→ 服务端逻辑双版本同源（Vercel Functions `api/` 与 EdgeOne 云函数 `cloud-functions/`）→ Stripe Checkout + 入账 RPC `mark_order_paid` → Zeabur Docker 部署 |
| **能复用什么** | ① 订阅定价页 + 支付回调入账闭环（`mark_order_paid` RPC 模式）；② Supabase Auth 邮箱注册/手机绑定/密码重置全流程；③ 「无收益承诺、风险可见」的合规文案结构；④ 双云函数（Vercel/EdgeOne）同源逻辑的部署形态 |

> 风险声明：本产品与页面不构成投资建议，无收益承诺；交易有风险。价格以 [niuniuai.app](https://niuniuai.app) 实时页面为准。
