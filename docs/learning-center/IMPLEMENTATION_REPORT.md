# 牛牛 AI 学习中心 V1 · 实施报告

分支：`feat/learning-center-v1`
状态：**实现完成，Build 与 QA 通过，等待人工验收**
日期：2026-09-10

---

## 1. 结论

社区（Community）已重构为**学习中心（NiuNiu AI Learn）**。

- 主导航「社区」→「学习」，URL 从 `/community` 切到 `/learn`
- 旧地址全部保留兼容跳转，**不产生 404**
- 17 条视频教程与图文教程**合并为同一份数据源**，视频不再是独立内容系统
- 全部标题改为问题式，新增 `shortAnswer` 直接回答问题
- 首页按「问题优先 / 任务优先」重组，不再是媒体 Feed

---

## 2. 新建文件

### 数据层 `src/content/learn/`

| 文件 | 说明 |
|---|---|
| `types.ts` | `LearningArticle` 统一模型（含 `LearningVideo` / `LearningStep` / `LearningFAQ`） |
| `tracks.ts` | 六大学习分类定义 |
| `articles.ts` | 17 篇教程数据（唯一 Source of Truth） |
| `faq.ts` | 首页常见问题 + Quick Start 四步 |
| `index.ts` | 查询层：按 slug/track 取文章、搜索、相关推荐、上/下一篇 |

### 组件层 `src/components/learn/`

`LearningCard` · `LearningVideo` · `LearningStep` · `LearningSearch` · `LearningTrackCard` · `LearningFAQ` · `LearningNext` · `LearningBreadcrumb` · `LearningProgress`

### 页面层 `src/pages/learn/`

| 文件 | 路由 |
|---|---|
| `LearnHub.tsx` | `/learn` |
| `LearnTrack.tsx` | `/learn/{track}` |
| `LearnArticle.tsx` | `/learn/{slug}` |
| `LearnSearch.tsx` | `/learn/search` |
| `LegacyCommunityRedirect.tsx` | `/community/**` 兼容跳转 |

---

## 3. 路由变化

| 新路由 | 说明 |
|---|---|
| `/learn` | 学习中心首页 |
| `/learn/search` | 搜索结果页 |
| `/learn/getting-started` `/analysis` `/risk` `/custom-ai` `/review` `/troubleshooting` | 六大分类 |
| `/learn/{slug}` | 教程文章，如 `/learn/how-to-connect-mt5` |
| `/support` | → `/learn` |

### 旧地址兼容（`src/pages/learn/LegacyCommunityRedirect.tsx`）

- `/community` → `/learn`
- `/community/:category` → `/learn`（`faq` → `/learn/troubleshooting`）
- `/community/:category/:slug` → 按 slug 查映射表跳对应文章，**映射不到则回 `/learn`**

映射表覆盖旧站 26 个 id（含 `connect-mt5`、`risk-control-setup`、`ai-log`、`nq-credit-issue` 等）。

**旧目录 `src/pages/community/` 未删除**，按 SPEC §4 保留。

---

## 4. 修改文件

| 文件 | 改动 |
|---|---|
| `src/App.tsx` | 接入 learn 路由；community 改为兼容跳转 |
| `src/sections/Nav.tsx` | 「社区」→「学习」，`/community` → `/learn` |
| `src/sections/Footer.tsx` | 支持/学习两列链接指向 `/learn` |
| `src/pages/Home.tsx` | 2 处 `/community#contact` → `/learn#contact` |
| `src/pages/Pricing.tsx` | `/community/faq` → `/learn/troubleshooting`；`#contact` 同步 |
| `src/pages/Login.tsx` | `/community#contact` → `/learn#contact` |
| `src/pages/Account.tsx` | `/community#groups` → `/learn#groups` |

---

## 5. 首页结构（SPEC §7）

```
Hero（牛牛 AI 学习中心 + 搜索）
→ 第一次使用？从这里开始（编辑式 Row，01–04）
→ 按你要解决的问题学习（六大分类卡片）
→ 大家最常问的问题（6 条）
→ 全部教程（分类筛选 + 网格）
→ 最近更新（折叠式，轻量）
→ 还是没解决？（常见问题 / 用户群 / 客服）
```

「视频教程」独立板块已从社区页移除（SPEC §39），视频改为每篇文章内部元素。

---

## 6. 17 篇迁移状态

| # | id | 新标题 | Track | 视频 |
|---|---|---|---|---|
| 1 | 02-connect-mt5 | 第一次用牛牛 AI，怎么登录并连接 MT5？ | 快速上手 | 23.75s |
| 2 | 03-auto-trading-basics | 怎么让牛牛 AI 开始自动盯盘？ | 快速上手 | 24.96s |
| 3 | 04-auto-trading-params | 自动分析时，方向、手数和止损止盈怎么设置？ | AI 分析与下单 | 25.36s |
| 4 | 05-risk-review-mechanism | AI 为什么有时候会拒绝开仓？ | 风控与持仓 | 25.96s |
| 5 | 06-one-click-layout-lines | 不会画支撑阻力，怎么让 AI 自动帮你画？ | AI 分析与下单 | 24s |
| 6 | 07-one-click-layout | 怎么用一键布局生成一套挂单方案？ | AI 分析与下单 | 27s |
| 7 | 08-ai-screenshot-analysis | 只有一张行情截图，也能让 AI 帮你分析吗？ | AI 分析与下单 | 24s |
| 8 | 09-ai-analysis-multi-plan | 同一个行情有多个方案，应该怎么选？ | AI 分析与下单 | 25s |
| 9 | 10-trading-strategies | 怎么配置自己的交易策略？ | AI 分析与下单 | 26s |
| 10 | 11-ai-model-execution | 开仓执行度调高或调低，会发生什么？ | 自定义 AI | 26s |
| 11 | 12-position-monitoring | 开仓以后，怎么让 AI 持续盯着持仓风险？ | 风控与持仓 | 25s |
| 12 | 13-risk-control | 每天最多做几单、亏多少就停，怎么设置？ | 风控与持仓 | 26.61s |
| 13 | 14-prompt-templates | 怎么让 AI 按你的交易习惯来分析？ | 自定义 AI | 26s |
| 14 | 15-ai-logs-review | 一笔交易为什么发生，怎么从 AI 日志里看出来？ | 复盘与进阶 | 24s |
| 15 | 16-mt5-troubleshooting | MT5 连不上牛牛 AI，应该先检查什么？ | 常见问题与排错 | 26s |
| 16 | 17-account-niuqi-intro | 牛气值是什么？一次 AI 分析会怎么扣？ | 常见问题与排错 | 24s |
| 17 | 18-clone-analyst | 怎么把你的分析风格复制给 AI？ | 自定义 AI | 26s |

**字段完整性：17/17** —— `title` / `shortAnswer` / `track` / `video` / `steps` / `related` 全部存在。

Track 分布：快速上手 2 · AI 分析与下单 6 · 风控与持仓 3 · 自定义 AI 3 · 复盘与进阶 1 · 常见问题与排错 2。

### 另加 4 篇无视频的迁移文章

从现有 `workflows.ts` / `tutorials.ts` / `troubleshooting.ts` 中迁移独立主题，内容自现有资料改写，未新增产品能力描述：

| 文章 | 来源 |
|---|---|
| 牛牛 AI 的完整交易流程是怎样的？ | 完整交易工作流 / 三脑 AI 协作 |
| 怎么用一套流程同时分析多个品种？ | 多品种分析 |
| 怎么从历史订单里提炼自己的交易逻辑？ | 从历史订单提炼交易逻辑 |
| 支付成功后没收到授权码，怎么办？ | 支付后未收到授权码 |

**合计 21 篇**（17 篇含视频 + 4 篇纯图文）。详见 `CONTENT_MIGRATION_REPORT.md`。

---

## 7. Build 状态

```
npm install   ✓
npm run build ✓  （tsc -b && vite build）
176 modules transformed
dist/index.html                0.99 kB
dist/assets/index-*.css      114.23 kB
dist/assets/index-*.js       743.30 kB
```

构建期修掉 4 处 `difficulty: '必备'` 越界（schema 仅允许 入门/进阶/高级），已改为「进阶」。

---

## 8. QA 状态

### 路由 QA（SPEC §43）

| 路由 | 结果 |
|---|---|
| `/learn` | 200，渲染完整（207 KB DOM） |
| 六大分类 | 全部 200 且正确渲染 |
| `/learn/how-to-connect-mt5` | 渲染标题正确 |
| `/learn/why-ai-rejects-trade` | 渲染标题正确 |
| `/learn/how-to-use-one-click-layout` | 渲染标题正确 |
| `/learn/how-to-clone-analysis-style` | 渲染标题正确 |
| `/community` | → 渲染学习中心首页 ✓ |
| `/community/tutorials/connect-mt5` | → 渲染对应文章 ✓ |
| `/community/faq` | → 渲染排错分类 ✓ |
| `/support` | → 200 ✓ |

### 内容 QA（SPEC §44）

- **17 篇含视频的核心教程：17/17 通过** —— `title` / `shortAnswer` / `track` / `video` / `steps` / `related` 全部存在
- 另有 4 篇无视频的迁移文章，字段同样完整
- 首页统计实测渲染为「共 21 篇教程 · 17 条视频」，列表卡片 21 张
- 本版**不含步骤截图**，`steps[].image` 全部未提供（见 §10），**未使用任何假截图**

### 视频 QA（SPEC §45）

17 条视频与 17 张封面在 `public/videos/tutorials/`，抽查返回 `video/mp4` / `image/jpeg`，无 404。文章内播放器位于 Header 之后、图文之前（SPEC §14）。

### 搜索 QA（SPEC §18 / §46）

| 输入 | 结果 |
|---|---|
| `不开仓` | 首条命中「AI 为什么有时候会拒绝开仓？」✓ |
| `MT5` | 前两条为「第一次用牛牛 AI，怎么登录并连接 MT5？」「MT5 连不上牛牛 AI，应该先检查什么？」✓ |

客户端搜索，检索 `title` / `shortAnswer` / `tags` / `track` / `step.title` / `commonProblems`，无后端依赖。

### 响应式 QA（SPEC §47）

Chrome DevTools Protocol 实测 4 页面 × 4 断点：

```
1440 / 1024 / 768 / 390 px
横向溢出检查：16/16 通过（overflow = 0px）
```

### 验收截图（SPEC §49）

`docs/learning-center/screenshots/`

- `learning-home-desktop.png` / `learning-home-mobile.png`
- `article-desktop.png` / `article-mobile.png`
- `search-result.png`
- `track-page.png`

---

## 9. 内容与设计约束

- 视觉完全沿用官网：背景 `#FAFAF8`、文字 `#111111`、次要 `#6B7280`、强调 `#F97316`、描边 `#ECEAE6`
- 未引入 CMS / 后端 / 用户等级 / 评论 / 点赞 / 积分 / 排行榜 / 论坛
- UI、内容、路由三层分离，未把文章塞进 JSX
- 产品更新降级为首页轻量区块，不再占主视觉

---

## 10. 未完成项

| 项 | 说明 |
|---|---|
| 步骤截图 | `steps[].image` 全部未提供，本版为纯文字步骤。**未使用任何假截图。** 需要真实产品截图素材后补。 |
| 视频片头标题 | 视频内烧录的仍是旧标题，未改动。见 `VIDEO_TITLE_RERENDER_REQUIRED.md`。 |
| 产品事实待确认 | 见 `CONTENT_FACT_CHECK.md`。 |
| 旧图文内容迁移 | 现有 `tutorials.ts` / `risk.ts` / `prompts.ts` / `mt5.ts` / `troubleshooting.ts` 中**未被 17 篇覆盖**的独立主题（如「智能 K 线」「历史订单分析」「多品种分析」）尚未单独建文章，目前仅通过兼容跳转承接。见 `CONTENT_MIGRATION_REPORT.md`。 |

---

## 11. 未 Merge

按要求**未合并 main**，停留在 `feat/learning-center-v1`，等待最终人工验收。
