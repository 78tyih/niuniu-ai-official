# 牛牛AI 官网（订阅制全栈 Demo）

连接 MT5 的 AI 交易助手官网：产品落地页 + 用户注册登录 + 订阅定价 + 支付。

## 功能

- 落地页：Hero / 痛点 / 三层 AI 工作流 / 六步流程 / 真实界面 / FAQ / 风险声明
- 账户：邮箱注册登录（Supabase Auth）、手机号绑定、我的订阅（套餐、到期、牛气值、订单记录）
- 定价：3天体验卡 ¥199 / 月卡 ¥980 / 季卡 ¥2,018 / 年卡 ¥6,980（官方直营价）
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

- **Vercel**（当前线上）：已配置好，push 后 `vercel deploy --prod` 即可
- **EdgeOne Pages（国内推荐）**：控制台关联本仓库即可，构建配置已在 `edgeone.json`；
  云函数在 `cloud-functions/api/[[default]].js`（Express 导出，无需监听端口）；
  部署后在项目设置里添加上表中的环境变量

## 合规

页面文案遵循「无收益承诺、风险可见」原则；价格与牛气值规则以上线前厂家确认为准。
