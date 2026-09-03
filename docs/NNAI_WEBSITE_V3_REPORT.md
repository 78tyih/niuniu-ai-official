# 牛牛 AI 官网 V3 重构报告

## 修改文件清单

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `src/lib/api.ts` | 修改 | 新增 `enabledPaymentMethods` 配置 |
| `src/pages/Pricing.tsx` | 重写 | 支付收敛、Pricing 结构重构 |
| `src/pages/community/CommunityHub.tsx` | 重写 | 编辑式内容中心首页 |
| `src/pages/community/CommunityArticle.tsx` | 重写 | TOC 侧栏 + 编辑式排版 |
| `src/pages/community/CommunityCategory.tsx` | 重写 | 分类页面改进 |
| `docs/NNAI_V3_VISUAL_AUDIT.md` | 新增 | 视觉审计 |
| `docs/NNAI_WEBSITE_V3_REPORT.md` | 新增 | 本报告 |

---

## 支付变化

### 支付宝已移除

- `enabledPaymentMethods` 配置仅包含 `['wechat', 'stripe']`
- Pricing 页面支付弹窗中的支付方式列表只渲染 `CHANNELS`（微信支付、Stripe）
- 无支付宝 Logo、按钮、占位入口
- 后端 Adapter 保留（`enabled: false`），前端不渲染

### 保留

- 微信支付 — 显示二维码流程
- Stripe — Stripe Checkout 跳转

---

## Pricing 空白修复

### 空白来源分析

通过视觉审计确认：

- 原 Pricing 页面底部存在 `min-height` 和 `spacer` 组件导致的大块空白
- 缺少牛气值说明和底部 CTA，导致内容断层

### 修复方法

重构后页面结构：

```
Navbar
↓
标题 + 一句话说明 (pt-[88px]~pt-[104px])
↓
4个套餐 Card Grid
↓
所有方案均包含 (水平标签)
↓
牛气值说明 (新板块)
↓
Pricing FAQ (8 个问题)
↓
底部 CTA: 联系客服 + 查看产品演示
↓
Footer
```

每段 Section 间距控制在 40–56px，无多余空白。

---

## Community 结构

### 定位变更

从「社群/客服/反馈」为主 → **牛牛 AI 内容与学习中心**

### 社区首页结构

```
Header (160–240px)
  - Eyebrow: NIUNIU AI COMMUNITY
  - 标题: 教程、产品更新与 AI 交易工作流
  - 搜索框 (placeholder: 搜索功能、教程或问题…)

分类导航 (紧凑横向按钮)
  - 全部 | 教程指南 | 产品更新 | 交易工作流 | 提示词模板 | 风险管理 | MT5 连接 | 故障排查 | 常见问题

Featured Content (60/40 编辑式布局)
  - 左侧: 大图 Feature Article (16:9 dark card)
  - 右侧: 3 篇 Secondary Articles (白色卡片)

从这里开始 (编辑式 Row)
  - 01 第一次使用牛牛 AI → 02 连接 MT5 → 03 第一次 AI 分析 → 04 设置风险规则
  - 1px divider 分隔

最新教程 (2 列 Grid)
  - 3:2 封面区 + Category + 标题 + 摘要 + 阅读 →

产品更新 (Release Feed)
  - 日期 | 标题 | 详情 →
  - 查看全部更新 →

按主题学习 (文字 Grid)
  - 8 个主题: AI 分析、风险审核、MT5、Prompt、持仓诊断、交易复盘、故障排查、FAQ

需要帮助？(Support Strip)
  - 联系客服 | 加入使用社群 | 提交反馈
```

### 文章详情页

```
Breadcrumb: 社区 / 分类 / 标题

Header
  - Category tag + 日期 + 阅读时间
  - H1: 28–40px
  - Lead: 16–17px
  - Tags

Body Layout (Desktop)
  ┌──────────────────────────────┬──────────┐
  │  Article Body (max 820px)    │ TOC      │
  │  · H2: 22–26px               │ (sticky  │
  │  · Body: 15px, line-height   │  220px)  │
  │   1.8                         │          │
  │  · Code block: dark theme    │          │
  └──────────────────────────────┴──────────┘

Mobile TOC: 折叠式「本文目录」

Related Articles: 3 列 Grid (继续学习)
```

### 分类页面

- 紧凑分类头部 (+ breadcrumb)
- 分类导航胶囊按钮（高亮当前分类）
- 文章列表（白色卡片，hover 效果）
- 右侧 CommunitySidebar 保持不变

---

## 20 篇文章清单

当前内容系统中已有 **52 篇文章**，覆盖 8 个分类：

| 分类 | 数量 | 说明 |
|------|------|------|
| tutorials | 14 | 教程指南 |
| updates | 4 | 产品更新 |
| workflows | 4 | 交易工作流 |
| prompts | 4 | 提示词模板 |
| risk | 3 | 风险管理 |
| mt5 | 3 | MT5 连接 |
| troubleshooting | 5 | 故障排查 |
| faq | 15 | 常见问题 |

**注意**：现有文章标题与 V3 Prompt 中指定的 20 篇标题不完全一致。建议后续对文章进行编辑审稿，统一标题、内容和质量线。

---

## 新增组件

| 组件 | 位置 | 说明 |
|------|------|------|
| `TOCPanel` | CommunityArticle.tsx | 自动提取 Markdown 标题生成目录，Desktop sticky + Mobile 折叠 |
| `extractTOC()` | CommunityArticle.tsx | 从 Markdown 内容解析 H2-H4 标题 |
| Quick Start | CommunityHub.tsx | 编辑式编号 Row，4 步入门指引 |
| Featured Content | CommunityHub.tsx | 60/40 编辑式布局，左侧大图 Feature + 右侧 3 篇 Secondary |
| Product Updates Feed | CommunityHub.tsx | Release Note 样式更新列表 |
| Topics Grid | CommunityHub.tsx | 8 个学习主题文字 Grid |
| Category Nav | CommunityHub.tsx | 分类横向导航按钮，支持筛选 |

---

## 新增路由

无新增路由。社区路由复用现有结构：

| 路由 | 组件 |
|------|------|
| `/community` | CommunityHub |
| `/community/:category` | CommunityCategory |
| `/community/:category/:slug` | CommunityArticle |

---

## 尚未确认的产品事实

- 微信支付二维码流程是否已接入真实商户
- Stripe 是否已配置真实 API Key
- 退款政策（FAQ 中标注为"待产品确认"）
- 牛气值按 50 元 = 1000 点的折算比例（标记为"以正式版本为准"）
- 产品 Roadmap 中的功能未放入 Pricing 页面

---

## TODO Assets

- 文章封面图（目前使用纯色渐变背景代替）
- 产品真实截图（Eagle Library 扫描路径未配置）
- 教程视频 Demo 素材
- 搜索功能（目前仅 placeholder，需接入前端搜索或全文搜索服务）

---

## Build 结果

```
✓ 164 modules transformed.
✓ built in 1.27s
dist/index.html                   0.99 kB
dist/assets/index-DjB1Rml1.css  105.64 kB
dist/assets/index-Ha4udyaU.js   712.02 kB
```

**Build 通过，无错误。**

---

## 待完成

1. **文章编辑审稿** — 将 52 篇文章内容质量统一到 Perflow 编辑质量线
2. **搜索功能** — 接入前端 local search 或全文搜索服务
3. **文章封面图** — 使用真实产品截图替换纯色渐变
4. **Tutorial 补充** — 补充 V3 Prompt 中指定的 20 篇文章标题与内容
5. **部署** — Commit + Push 到 GitHub 触发 Vercel 自动部署