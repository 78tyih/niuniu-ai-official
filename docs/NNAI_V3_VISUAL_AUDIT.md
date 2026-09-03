# 牛牛 AI 官网 V3 视觉审计

> 审计日期：2026-09-04
> 审计方式：Browser DOM 分析 + 截图 + 代码审查

---

## 一、牛牛 AI 当前页面

### Pricing 页面

**当前布局**（从上到下）：

| 区块 | 高度 | 说明 |
|------|------|------|
| Navbar | 68px | 固定顶部 |
| Hero | 370px | 标题「选择适合你的方案」+ 副标题 |
| Pricing Cards | 452px | 4 列 Grid 布局（lg:grid-cols-4），gap-4 |
| 功能对比表 | ~600px | 含所有方案均包含 + 对比表格 + 脚注 |
| FAQ | ~8914px | 12 个折叠问题 |
| Footer | 138px | 深色页脚 |

**页面总高度**：10005px — 确实过长。

**空白来源分析**：
- **无 `min-height: 100vh` 或 `height: 100vh` 元素** — 不是 vh 单位引起的空白
- **Section 3 (FAQ 区) 高度异常** 8914px — 主要来自 FAQ 内容区，但对比表格后的 Disclaimer 区域存在较大垂直间距
- **Pricing Cards 到功能对比表之间** 间距约 40px (pb-[52px] sm:pb-[80px])，在 Desktop 上偏大
- **Footer 前** 无明显空组件，但 FAQ 区的 `pb-20` (80px) 在 Desktop 上造成底部偏空

**Desktop 状态**：
- 四列卡片在 xl 断点正常展示
- 卡片间距 gap-4 (16px)
- 功能对比表可滚动，无溢出

**Mobile 状态**：
- 卡片为单列
- 功能对比表可横向滚动
- FAQ 折叠正常

**Section Spacing**：
- Hero: `pt-[104px] sm:pt-[128px] pb-8`
- Cards: `pb-[52px] sm:pb-[80px]`
- FAQ: Section variant="compact" => `py-[44px] sm:py-[60px]` + `pb-20`

**Card Spacing**：
- Card 内边距: `p-6`
- 卡片间距: `gap-4`
- 卡片高度: 由内容撑开，无固定高度

### Subscription / Payment 弹窗

**当前支付按钮**（在弹窗内）：
- 微信支付（wechat）
- 支付宝（alipay）
- Stripe（stripe）

三列等宽按钮，选中态为 2px Orange Border。

### Community 页面

**当前结构**（V1 版本）：
- 分类导航：2 列 Grid 链接
- 最新内容：6 条文章列表（链接式，无封面图）
- 侧边栏（320px）：社群二维码 / 客服 / 反馈表单

**问题**：
- 无 Featured Article
- 无搜索
- 无编辑式层级
- 侧边栏占据 320px 但内容价值低
- 社群/客服占据主体，内容消费反而不突出
- 分类为 2 列卡片墙，非 Perflow 式横向标签导航

---

## 二、Perflow Articles 参考

> URL: https://propfirm-intelligence-preview-siyua.vercel.app/zh/articles

### Header 后内容入口

Navbar 36px → 面包屑 → Hero Banner → 直接进入内容。无大 Hero 图。

### 首屏标题

48px / 600 Semi-bold / 深灰 `#111827` / 居中 / 字间距 -1.2px

### Featured Article 布局

4 列网格（lg:grid-cols-4），gap-4：
- 卡片 292×364px
- 图片 290×181px（16:10）
- 标题 15px/600
- 摘要 13px，2 行截断
- 蓝色「精选」胶囊标签

### 分类导航

水平滚动胶囊按钮容器：
- 16 个分类 + 1 个「全部」
- 选中态：蓝底白字
- 未选中：中灰文字
- 右侧搜索按钮 + 目录按钮

### 最新内容展示

5 列网格（gap-5），卡片 256×351px：
- 图片 159px 高
- 分类标签 → 日期·阅读时间 → 标题(2行) → 摘要(2行) → 品牌 Logo

### 卡片密度

中等偏密。图片占卡片 45%，文字紧凑。标题和摘要各限制 2 行。

### 标题与摘要关系

- 标题 15px/600/深灰
- 摘要 13px/400/中灰
- 间距 6px
- 视觉层次通过字号、字重、颜色三要素建立

### 页面留白

- Hero 区上下 60-80px
- Section 间 40-80px
- 容器 max-width: 1280px, padding: 0 32px

### 分割线

**不使用 `<hr>` 分割线**。通过卡片边框 (1px solid `rgba(148,163,184,0.28)`) + 间距区分区块。

### Article Detail（推测）

- 正文宽度约 760-820px
- TOC 为 sticky 侧边栏
- 面包屑导航
- Metadata 小字展示

---

## 三、关键差异总结

| 维度 | 牛牛 AI 当前 | Perflow 参考 |
|------|-------------|-------------|
| 内容层级 | 平铺式分类卡片 | 编辑式：Featured → 分类 → 网格 |
| 分类导航 | 2 列大卡片 | 水平胶囊标签 |
| Featured | 无 | 大图精选 |
| 卡片密度 | 宽松（card-light 类） | 紧凑（边框+阴影） |
| 图片占比 | 无图 | 占卡片 45% |
| 侧边栏 | 320px 社群/客服 | 无 |
| 搜索 | 无 | 搜索按钮 |
| 文章排版 | 面包屑+正文+相关 | 面包屑+TOC+正文+相关 |
| 留白控制 | 偏大（pb-20） | 紧凑（40-80px） |

---

## 四、TODO 修复项

- [x] Pricing: 移除支付宝支付按钮
- [x] Pricing: 检查并修复底部空白
- [x] Community: 重写为编辑式内容中心
- [x] Community: 添加 Featured Article
- [x] Community: 水平分类导航
- [x] Community: 文章网格展示
- [x] Article Detail: 添加 TOC
- [x] Article Detail: 控制正文宽度 760-820px
- [x] Article Detail: 改进排版和 Metadata
- [x] 新增 20 篇真实教程内容