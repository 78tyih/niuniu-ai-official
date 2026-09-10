# NiuNiu AI Learning Center Redesign PRD

> Status: Planning only. Do not deploy from this branch.
> Canonical direction: rename the public-facing “社区” experience to “学习 / Learning Center”.

## 1. Product decision

The current Community information architecture mixes product updates, tutorials, workflows, prompts, risk, MT5, troubleshooting, FAQ, and social-group entry points. The redesign changes the primary user intent from “browse community content” to “solve a usage problem and learn one task quickly”.

Public navigation label: **学习**

Recommended canonical route: `/learn`

Backward compatibility:
- `/community` → redirect to `/learn`
- existing `/community/...` article routes → 301/SPA redirect to equivalent `/learn/...`

Do not delete old URLs without redirects.

## 2. Learning Center positioning

### Hero

**牛牛 AI 学习中心**

从连接 MT5，到让 AI 按你的方法分析，一步一步学会牛牛 AI。

Search placeholder:

> 你现在想解决什么问题？

The Learning Center should feel like a task-oriented help center, not a news feed or forum.

## 3. Core information architecture

Do not use content type as the primary classification. Use the learner’s task/stage.

### A. 快速上手
For the first 10 minutes of use.
- 第一次登录与连接 MT5
- 开启必要的 MT5 / 算法交易设置
- 第一次 AI 分析
- 常见连接检查

### B. AI 分析与下单
For reading the market and turning analysis into a plan.
- AI 行情分析
- 截图分析
- 多方案对比
- 自动划线
- 一键布局
- 入场 / SL / TP / Lot 修改

### C. 风控与持仓
For controlling execution boundaries and managing open positions.
- 风控审核
- 开仓执行度
- 每日交易限制
- 最大亏损 / 最大持仓
- 持仓监控
- 新闻 / 时间段相关规则

### D. 自定义 AI
For users who want the AI to follow their own method.
- Prompt 模板
- 自定义 Prompt
- 分析周期与指标
- 克隆分析师 / 分析风格复制

### E. 复盘与进阶
For reviewing decisions and building a repeatable workflow.
- AI 日志
- 交易复盘
- 策略配置
- 账户 / 牛气值说明（如果仍属于当前正式产品）

### F. 常见问题与排错
For high-intent support queries.
- MT5 连不上
- 没有行情 / 持仓数据
- 自动交易相关开关
- AI 没有返回结果
- 牛气值 / 账户常见问题

### Secondary content
`产品更新` no longer occupies a top-level learning category. Put it near the bottom of `/learn` or under `/updates` as secondary content.

`加入社群` is no longer a primary right sidebar. Move it to the bottom support CTA:

> 还是没解决？查看常见问题或加入使用群。

## 4. Learning Center homepage structure

1. Compact Hero + search
2. “第一次使用？从这里开始” 4-step learning path
3. “按你要解决的问题找教程” category grid
4. “最常被问的问题” question-title cards
5. “全部教程” searchable/filterable list
6. Product updates (secondary)
7. Support / join group CTA

### Quick Start path

1. **怎么登录并连接 MT5？**
2. **怎么让牛牛 AI 完成第一次 AI 分析？**
3. **怎么用一键布局生成一套挂单方案？**
4. **每天最多做几单、亏多少就停，怎么设置？**

## 5. Title writing rule

Every tutorial title must answer a user question.

Bad:
- 自动交易入门
- 风控审核机制
- 提示词模板与自定义
- 克隆分析师

Good:
- 怎么让牛牛 AI 开始自动盯盘？
- AI 为什么有时候会拒绝开仓？
- 怎么让 AI 按你的交易习惯来分析？
- 怎么把你的分析风格复制给 AI？

### Title formula
Prefer one of:
- 怎么……？
- 如何……？
- 为什么……？
- ……是什么意思？
- ……应该怎么设置？
- ……出问题了先检查什么？

Rules:
- plain Chinese
- one problem per title
- avoid internal feature names as the entire title
- avoid “完整教程 / 入门 / 机制 / 说明” as the main title unless needed as a suffix
- the user should understand the problem solved without opening the article

## 6. Video title rewrite map

| ID | Current title | Recommended question title |
|---|---|---|
| 02 | 登录并连接 MT5 | 第一次用牛牛 AI，怎么登录并连接 MT5？ |
| 03 | 自动交易入门 | 怎么让牛牛 AI 开始自动盯盘？ |
| 04 | 自动交易参数设置 | 自动交易的方向、手数和止损止盈怎么设置？ |
| 05 | 风控审核机制 | AI 为什么有时候会拒绝开仓？ |
| 06 | 一键布局：自动划线 | 不会画支撑阻力，怎么让 AI 自动帮你画？ |
| 07 | 一键布局完整教程 | 怎么用一键布局生成一套挂单方案？ |
| 08 | AI 截图分析 | 只有一张行情截图，也能让 AI 帮你分析吗？ |
| 09 | AI 分析：多方案选择 | 同一个行情有多个方案，应该怎么选？ |
| 10 | 交易策略配置 | 怎么配置自己的交易策略？ |
| 11 | AI 模型：开仓执行度 | 开仓执行度调高或调低，会发生什么？ |
| 12 | 持仓监控与自动风控 | 开仓以后，怎么让 AI 持续盯着持仓风险？ |
| 13 | 风控设置完整教程 | 每天最多做几单、亏多少就停，怎么设置？ |
| 14 | 提示词模板与自定义 | 怎么让 AI 按你的交易习惯来分析？ |
| 15 | AI 日志与复盘 | 一笔交易为什么发生，怎么从 AI 日志里看出来？ |
| 16 | MT5 连接排错 | MT5 连不上牛牛 AI，应该先检查什么？ |
| 17 | 账户与牛气值说明 | 牛气值是什么？一次 AI 分析会怎么扣？ |
| 18 | 克隆分析师 | 怎么把你的分析风格复制给 AI？ |

These titles are editorial proposals. Before publishing, verify wording against current product behavior, especially auto-execution, credit consumption, and any feature whose current policy may change.

## 7. Article = Video + Visual Tutorial

A video is not a separate content island. Each tutorial is one canonical article page.

### Required article order

1. Breadcrumb
2. H1 question title
3. One-sentence answer / what the user will learn
4. **Embedded video at the top**
5. “这篇教程解决什么问题”
6. Step-by-step visual guide
7. “你应该看到什么结果”
8. Common mistakes / troubleshooting
9. One core takeaway
10. Next lesson / related lesson

### Example

H1: **怎么把你的分析风格复制给 AI？**

Lead:
> 如果你已经有自己的交易方法，可以把周期、指标、判断条件和避开条件整理给 AI，让它按同一套规则分析。

Then video embed.

Then article:
- 第一步：先说清楚你看哪些周期
- 第二步：告诉 AI 你真正使用的指标或价格行为
- 第三步：写清楚什么时候不做
- 第四步：生成并检查分析师规则
- 第五步：用同一张图做一次测试

Each step should have a real UI screenshot or cropped annotation where possible.

## 8. Video component requirements

Every article should support:
- poster image
- 16:9 MP4/WebM
- subtitle track (VTT)
- duration
- optional chapters
- mute/unmute
- fullscreen

Video comes before the long-form text body.

Do not create a second, disconnected “video tutorial library” as the primary user experience. A separate video filter can exist, but all videos resolve to their canonical article page.

## 9. Visual tutorial rules

The text below the video must be visual, not a transcript dump.

For each step:
- short action heading
- 1–3 short explanatory sentences
- real screenshot / crop / GIF when useful
- callout pointing to the exact button/field
- expected result

Prefer:

> **1. 先打开「MT5 实例」**
> 在左侧设置中找到 MT5 实例。第一次使用时，先确认软件识别到你当前运行的 MT5。
> [annotated screenshot]
> **看到“已连接”再继续。**

Avoid 5–8 paragraph blocks with no visual anchor.

## 10. Content model

Recommended canonical content type:

```ts
interface LearningArticle {
  id: string
  slug: string
  title: string
  shortAnswer: string
  summary: string
  track: 'start' | 'analysis' | 'risk' | 'custom-ai' | 'review' | 'troubleshooting'
  level: '入门' | '进阶'
  video?: {
    src: string
    poster: string
    vtt?: string
    durationSeconds: number
  }
  steps: Array<{
    title: string
    body: string
    media?: string
    callout?: string
    expected?: string
  }>
  faq?: Array<{ q: string; a: string }>
  relatedIds: string[]
  updatedAt: string
}
```

One source of truth should drive:
- Learning homepage cards
- category pages
- article page
- search
- related lessons
- video metadata

Do not maintain a separate `VIDEO_TUTORIALS` title list that can drift from article titles.

## 11. Search behavior

Search should match human problems, not only product nouns.

Examples:
- “连不上” → MT5 troubleshooting
- “怎么下单” → one-click layout / order tutorial
- “止损怎么设” → risk / trade parameter tutorial
- “AI 不按我的方法” → Prompt / clone analyst
- “为什么没开仓” → risk review / execution threshold / logs

Include aliases / keywords in content metadata.

## 12. Homepage copy proposal

Eyebrow: `NIUNIU AI LEARN`

H1: **牛牛 AI 学习中心**

Subtitle:
> 不用先看完一大堆说明。告诉我们你现在卡在哪一步，直接找到对应教程。

Search:
> 你现在想解决什么问题？

First section:
**第一次使用？按这 4 步开始**

Category section:
**按你要解决的问题找教程**

Popular section:
**大家最常问这些问题**

Support CTA:
**还是没解决？**
查看常见问题，或者加入使用群继续问。

## 13. UX direction

Keep the site’s current warm-white / near-black / orange visual system.

Change the page behavior from editorial magazine feed to learning/help-center navigation.

Use:
- large search
- obvious learning path
- question titles
- low-card-density list rows
- real product thumbnails / screenshots
- article reading width around 760–820px
- sticky TOC on desktop for longer guides

Avoid:
- community feed feeling
- too many equal-weight categories
- generic category hero images on every article card
- right sidebar dominated by QR codes
- duplicate video library and article library

## 14. Migration plan

Phase 1 — Content model
- create canonical LearningArticle model
- map existing articles/videos to the same IDs
- add question titles and aliases

Phase 2 — `/learn`
- build new LearningHub
- quick-start path
- category tracks
- search
- popular questions

Phase 3 — article template
- top video embed
- step-by-step visual body
- FAQ / related lessons

Phase 4 — migration
- redirect `/community` to `/learn`
- preserve old article URLs with redirects
- move product updates to secondary section
- move social groups to support CTA

Phase 5 — editorial cleanup
- rewrite all titles in question form
- verify product facts
- replace generic covers with real UI thumbnails where possible
- attach VTT subtitles to tutorial videos

## 15. Definition of done

A first-time visitor should be able to answer within 5 seconds:
1. Where do I start?
2. Where is the tutorial for the problem I have?
3. Does this article have a video?
4. What will I learn after opening it?

A tutorial is not complete unless it has a clear question, a short answer, a top video when available, visual steps, expected result, and a next lesson.
