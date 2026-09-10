# 控制台配置清单 · 照着点即可

> 配套自检：`node scripts/check-auth-config.mjs`（在 `official/` 下执行）
> 每配完一節跑一次，绿灯表示这一步真的通了，不用猜。

两条路**互相独立**，可以先做邮件（快，解燃眉之急），短信稍后再补。

---

## A. 邮件通道（约 10 分钟）→ 恢复验证码登录 / 找回密码 / 注册验证

### A1. Resend 添加并验证域名

1. 打开 <https://resend.com/domains> → **Add Domain**
2. 域名填 `niuniuai.app`，地区选离你近的
3. 页面会给出一组 DNS 记录，去 **Cloudflare** 添加：
   - 类型 `TXT`，主机记录 `@`（或 Resend 指定的前缀），值为 Resend 给的验证值
   - 建议顺手把 Resend 给的 `MX`、`DKIM`、`SPF` 三条也加上，能显著降垃圾邮件概率
4. 回 Resend 点 **Verify**，状态变成 `Verified` 即完成

> 只有 TXT 也能过验证，但缺 SPF/DKIM 容易被国内邮箱判为垃圾邮件。

### A2. 取 API Key

<https://resend.com/api-keys> → **Create API Key** → 权限选 `Sending access` → 复制（形如 `re_xxx`）

### A3. 填入环境变量（命令）

在 `official/` 目录下执行，把 `re_你的key` 换成实际值：

```bash
npm run set:env RESEND_API_KEY=re_你的key
```

> 不想让密钥留在命令历史里？省略值即可，会进入隐藏输入：
> `npm run set:env RESEND_API_KEY`

### A4. 同步到生产（关键，别漏）

本地 `.env` 只给自检脚本用，**线上生效靠 Zeabur 环境变量**。

Zeabur 控制台 → 选中服务 → **Variables** → 新增 `RESEND_API_KEY`（值同上）→ 保存后会自动重新部署。

### A5. 验证

**本地：**

```bash
npm run check:auth
```

看到 `✅ Resend API Key 有效` + `✅ niuniuai.app 域名状态 verified` 即通过。

**线上：**

```bash
curl -s https://niuniuai.app/api/__health
```

关注这两个字段：

```json
"RESEND": true,
"EMAIL_CHANNEL_READY": true
```

> `EMAIL_CHANNEL_READY` 为 `true` 表示线上登录邮件通道真的通了。
> 这里只返回布尔值，不会暴露密钥内容。

---

## B. 短信登录（需阿里云控制台）

> 全程用的是**号码认证服务（Dypnsapi）**，**不是「短信服务（SMS）」**。
> 后者要企业资质，前者个人实名即可，且自带赠送签名和模板。

控制台入口：<https://dypns.console.aliyun.com>

### B1. 开通服务

进入控制台 → 勾选协议 → **开通服务**（若已开通会直接进控制台）

### B2. 取「赠送签名名」

左侧导航：**短信认证服务 → 短信认证参数管理**
→ 切到 **签名配置** 页签 → 选 **赠送签名配置**
→ 从列表里任选一个，复制**签名名称**

⚠️ 必须是**系统赠送**的签名，不能用自定义签名（运营商已加强管控，自定义签名易下发失败）。

### B3. 取「赠送模板 code」

同一页面的 **模板配置** 页签 → **赠送模板配置** → 复制模板 CODE

**登录/注册场景选 `100001`。** 五个赠送模板：

| CODE | 用途 |
|---|---|
| **100001** | 登录 / 注册 ← 我们要这个 |
| 100002 | 修改绑定手机号 |
| 100003 | 重置密码 |
| 100004 | 绑定新手机号 |
| 100005 | 验证绑定手机号 |

⚠️ CODE 是**纯数字**（如 `100001`），不是 `SMS_xxxxxx` 格式。看到 `SMS_` 说明进错产品了。
⚠️ **赠送签名必须搭配赠送模板**，两者不能混用。

### B4. RAM 子账号授权（当前卡在这一步）

1. 打开 <https://ram.console.aliyun.com/users>
2. 找到你创建 AccessKey 的那个**子账号**（不是主账号）→ 点进去
3. **权限管理 → 新增授权**
4. 权限策略搜索 `AliyunDypnsFullAccess` → 选中 → 确认

当前实测报错就是这个没做：

```
Code              : Forbidden.NoPermission
AuthAction        : dypns:SendSmsVerifyCode
AuthPrincipalType : SubUser
NoPermissionType  : ImplicitDeny
```

### B5. 填入环境变量（命令）

在 `official/` 目录下执行（AccessKey 两项已配好，只需补签名和模板）：

```bash
npm run set:env ALIYUN_SMS_SIGN_NAME=第B2步复制的签名名 ALIYUN_SMS_TEMPLATE_CODE=100001
```

然后同样到 **Zeabur → Variables** 补上这两个变量（AccessKey 若线上还没有也要一并加上）。

### B6. Supabase 开启手机号登录

Supabase Dashboard → **Authentication → Providers → Phone** → 开启

再配置投递 Hook：**Authentication → Hooks → Send SMS Hook**
→ 类型 `HTTPS Endpoint`
→ URL 填 `https://niuniuai.app/api/auth/sms-hook`

（后端端点已实现，无需再改代码。）

### B7. 验证

**本地探测阿里云权限：**

```bash
npm run check:auth
```

看到 `✅ 权限已通过` 即授权生效。
脚本用的是非法号码做探测，**不会真的发短信、不产生费用**。

**线上：**

```bash
curl -s https://niuniuai.app/api/__health
```

```json
"ALIYUN_AK": true,
"ALIYUN_SIGN": true,
"ALIYUN_TEMPLATE": true,
"SMS_CHANNEL_READY": true
```

四项全绿即短信通道就绪。

---

## 一页速查（照着复制）

```bash
cd /Users/a1234/Documents/kimi/workspace/niuniu-ai/official

# A. 邮件（Resend）
npm run set:env RESEND_API_KEY=re_你的key

# B. 短信（阿里云）
npm run set:env ALIYUN_SMS_SIGN_NAME=赠送签名名 ALIYUN_SMS_TEMPLATE_CODE=100001

# 本地自检
npm run check:auth

# 线上自检
curl -s https://niuniuai.app/api/__health
```

---

## 报错对照表

| 报错 | 含义 | 怎么处理 |
|---|---|---|
| `Forbidden.NoPermission` + `dypns:SendSmsVerifyCode` | RAM 子账号没授权 | 做 B4 |
| `签名或模板无效` | 用了自定义签名，或模板进错产品 | 用赠送签名 + 纯数字 CODE（B2/B3） |
| `模板参数不匹配` | 模板变量没传全 | 赠送模板需 `code` 和 `min` 两个变量，代码已处理 |
| `SMS_xxxxxx` 格式 | 进了「短信服务」不是「号码认证服务」 | 回到 dypns.console.aliyun.com |
| `otp_disabled`（手机） | Supabase 未开启 Phone Provider | 做 B6 |
| `unexpected_failure` / `Error sending magic link email` | Supabase 内置邮件不可用 | 做 A（配 Resend 后自动绕开） |
| `over_email_send_rate_limit` | Supabase 内置邮件限流 | 同上，配 Resend |

---

## 顺带一提

配 Resend 之后**不需要**再去 Supabase 后台配 SMTP。
验证码由 Supabase 生成并校验，我们只是接管了**投递**这一段，
所以 Supabase 自带的 2 封/小时限流对它不再生效。
