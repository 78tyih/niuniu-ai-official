# Evidence — niuniu-ai-official

Updated: 2026-10-05

## Observed（实查）

| 声明 | 证据 |
|---|---|
| 技术栈 React+Vite+Tailwind / Supabase / 双云函数 / Stripe | README 架构表 + `package.json` + `api/`、`cloud-functions/api/`、`supabase/schema.sql` 文件在仓 |
| Zeabur Docker 部署 + main 自动部署 | README 部署节 + 根目录 `Dockerfile` + `server/zeabur.mjs` |
| 11 张截图 + 10 段功能视频 | `public/screenshots/*.jpg`（20–132KB）、`public/videos/*.mp4`（ffprobe 实测 6–8s/段，0.9–5.6MB） |
| 定价四档 ¥19.9/¥980/¥2,018/¥6,980 | README 定价节原文 |
| 合规原则「无收益承诺、风险可见」 | README 合规节原文；showcase 页脚风险声明沿用同口径 |
| 秘钥治理 | README 明示服务端密钥只放 Zeabur 运行时变量；`.env.production` 仅含两个 VITE_ 公开值（键名核对，值未读取） |

## Inferred（自述/推断，附复核方式）

| 声明 | 复核方式 |
|---|---|
| 展示页的功能名与一句话描述 | 由媒体文件名推断（如 position-diagnosis → 持仓诊断）；以产品站实际文案为准 |
| 支付端到端可用 | Stripe 为 test 模式（README 自述），未真实下单验证 |

## Unknown

- niuniuai.app 生产环境实时状态（本展示包未探测线上可用性）
- `mark_order_paid` RPC 在真实订单下的对账表现

## 安全备注

- 本次改动仅新增 `docs/showcase.html`、`showcase/*` 与 README 追加，未触碰构建/部署文件
- 已知 main 推送触发 Zeabur 生产自动部署；README/docs 变更不影响构建产物
