# 视频片头需要重新渲染 · 清单

日期：2026-09-10
分支：`feat/learning-center-v1`

---

## 1. 结论

**视频片头标题已烧录在画面中，本次未修改，也未假装修改。**

网站 V1 不因此阻塞：网页端所有标题均来自 `LearningArticle.title`（问题式），且视频标题不再是任何地方的独立来源。

重新渲染的原因有两个：

1. **标题为陈述式**，与学习中心的问题式标题不一致（同一教程在网页与视频里看到两个不同标题）
2. **`11-ai-model-execution` 的主/副标题与字幕都含「把握」表述**，属需规避的用词

---

## 2. 渲染源

| 项 | 位置 |
|---|---|
| 渲染模板 | `tutorial-production/07-template/templates/{id}.json` |
| 模板字段 | `title`（主标题）、`subtitle`（副标题，烧录在片头） |
| 渲染脚本 | `tutorial-production/07-template/render_tutorial.py` |
| 批量脚本 | `tutorial-production/07-template/build_all.sh` / `build_tutorial.sh` |
| 渲染产物 | `tutorial-production/08-renders/review-v2/{id}/` |
| 官网使用 | `official/public/videos/tutorials/{id}.mp4` + `covers/{id}.jpg` |

`07-template/templates/` 下共 17 个模板，与 17 条教程一一对应。

---

## 3. 逐条清单

| # | ID | 当前片头标题 | 当前副标题 | 新标题（问题式） | 需重新渲染 |
|---|---|---|---|---|---|
| 1 | `02-connect-mt5` | 登录并连接 MT5 | 新手第一步 | 第一次用牛牛 AI，怎么登录并连接 MT5？ | 是 |
| 2 | `03-auto-trading-basics` | 自动交易入门 | 先打开分析开关 | 怎么让牛牛 AI 开始自动盯盘？ | 是 |
| 3 | `04-auto-trading-params` | 自动交易参数设置 | 按你的习惯下单 | 自动分析时，方向、手数和止损止盈怎么设置？ | 是 |
| 4 | `05-risk-review-mechanism` | 风控审核机制 | AI 什么时候才开仓 | AI 为什么有时候会拒绝开仓？ | 是 |
| 5 | `06-one-click-layout-lines` | 一键布局：自动划线 | 支撑阻力不用自己画 | 不会画支撑阻力，怎么让 AI 自动帮你画？ | 是 |
| 6 | `07-one-click-layout` | 一键布局完整教程 | 操作演示 | 怎么用一键布局生成一套挂单方案？ | 是 |
| 7 | `08-ai-screenshot-analysis` | AI 截图分析 | 手动让 AI 读图 | 只有一张行情截图，也能让 AI 帮你分析吗？ | 是 |
| 8 | `09-ai-analysis-multi-plan` | AI 分析：多方案选择 | 对比着挑一套 | 同一个行情有多个方案，应该怎么选？ | 是 |
| 9 | `10-trading-strategies` | 交易策略配置 | 让自动交易更稳 | 怎么配置自己的交易策略？ | 是 |
| 10 | **`11-ai-model-execution`** | AI 模型：开仓执行度 | **把握不够就不开** ⚠️ | 开仓执行度调高或调低，会发生什么？ | 是（**优先**） |
| 11 | `12-position-monitoring` | 持仓监控与自动风控 | 风险持续看管 | 开仓以后，怎么让 AI 持续盯着持仓风险？ | 是 |
| 12 | `13-risk-control` | 风控设置完整教程 | 操作演示 | 每天最多做几单、亏多少就停，怎么设置？ | 是 |
| 13 | `14-prompt-templates` | 提示词模板与自定义 | 让 AI 按你的要求分析 | 怎么让 AI 按你的交易习惯来分析？ | 是 |
| 14 | `15-ai-logs-review` | AI 日志与复盘 | 看它为什么这样判断 | 一笔交易为什么发生，怎么从 AI 日志里看出来？ | 是 |
| 15 | `16-mt5-troubleshooting` | MT5 连接排错 | 连不上就看这里 | MT5 连不上牛牛 AI，应该先检查什么？ | 是 |
| 16 | `17-account-niuqi-intro` | 账户与牛气值说明 | 消耗与充值 | 牛气值是什么？一次 AI 分析会怎么扣？ | 是 |
| 17 | `18-clone-analyst` | 克隆分析师 | 让 AI 更像你的风格 | 怎么把你的分析风格复制给 AI？ | 是 |

---

## 4. 优先项：`11-ai-model-execution`

这条需要**改的不仅是标题**，片头副标题与视频内字幕都含需规避的用词：

| 位置 | 原文 | 建议改法 |
|---|---|---|
| 片头副标题 | 把握不够就不开 | 门槛不到就不提交 |
| 视频字幕第 2 句 | 它决定 AI 有多大把握才会开仓。 | 它决定 AI 在什么条件下才会提交开仓。 |
| 视频字幕第 3 句 | 比如设成百分之六十五，低于这个值就不开。 | 保留（描述机制，无规避用词） |

字幕源：`tutorial-production/05-pages/11-ai-model-execution/captions.json`
音频源：`tutorial-production/06-audio/11-ai-model-execution/`

**改字幕需同时重做该条配音**，建议与片头重渲染一并处理。

---

## 5. 重新渲染后的操作

1. 更新 `07-template/templates/{id}.json` 的 `title` / `subtitle`
2. 运行 `07-template/build_tutorial.sh {id}`（或 `build_all.sh` 全量）
3. 产物替换到 `official/public/videos/tutorials/{id}.mp4`
4. 封面同步替换：`official/public/videos/tutorials/covers/{id}.jpg`
5. 因 `LearningArticle.video.src` 引用路径不变，**网页代码无需任何改动**

---

## 6. 影响范围

- 网站 V1 **不受阻塞**（网页标题已是问题式，视频只是文章内的辅助素材）
- 只影响「打开视频后片头显示的标题」与「网页标题不一致」的观感
- 有一条涉及合规用词（`11`），建议排在其他条之前处理
