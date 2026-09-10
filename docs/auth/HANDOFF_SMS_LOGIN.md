# HANDOFF · 登录与短信验证码（工程交接）

交接日期：2026-09-10
交接方：Trae
接办方：WorkBuddy
状态：**BLOCKED** —— 等待阿里云控制台侧完成授权与配置

---

## 一、任务目标

1. 修复「忘记密码 → 邮箱验证码登录」不可用的故障
2. 新增「手机号短信验证码登录」能力

---

## 二、已完成

| # | 事项 | 结果 |
|---|---|---|
| 1 | 排查邮箱验证码失败根因 | ✅ 已定位（见 §三） |
| 2 | 实测账号登录链路 | ✅ 正常，验证码校验与会话签发均通过 |
| 3 | 选定短信方案 | ✅ 阿里云号码认证服务（PNVS）短信认证 |
| 4 | 接收并配置云凭证 | ✅ 已写入本地 `official/.env`（未进仓库） |
| 5 | 安装阿里云 SDK | ✅ `@alicloud/dypnsapi20170525` / `openapi-client` / `tea-util` |
| 6 | 诊断文档 | ✅ `official/docs/auth/EMAIL_SMS_FIX_PLAN.md` |

---

## 三、根因（已实测）

登录与找回密码均使用 **Supabase Auth**，邮件由 Supabase 发送。

| 场景 | 接口 | 实测返回 |
|---|---|---|
| 邮箱验证码登录 | `POST /auth/v1/otp` | **500** `unexpected_failure` — Error sending magic link email |
| 找回密码 | `POST /auth/v1/recover` | **429** `over_email_send_rate_limit` |
| 手机号验证码 | `POST /auth/v1/otp` | **422** `otp_disabled` |

**结论：认证链路本身正常，卡点在邮件投递。** Supabase 默认内置邮件服务限流为 **2 封/小时**，且官方声明不保证送达、无 SLA。

**影响面**：邮箱验证码登录、找回密码、注册邮箱验证 **三条路都不通**；邮箱+密码登录不受影响。

---

## 四、BLOCKED（必须先在控制台完成）

### 4.1 阿里云 RAM 子账号缺权限

实测调用 `SendSmsVerifyCode` 返回：

```
code    : Forbidden.NoPermission
message : You are not authorized to perform this action.
AuthAction             : dypns:SendSmsVerifyCode
AuthPrincipalType      : SubUser
PolicyType             : AccountLevelIdentityBasedPolicy
NoPermissionType       : ImplicitDeny
```

**说明凭证本身有效（签名通过），但该 RAM 子账号没有被显式授权。**

**解决**：RAM 控制台 → 用户 → 该子账号 → 授权 → 添加 `AliyunDypnsFullAccess`

### 4.2 需确认服务已开通

号码认证服务控制台 → 确认「**短信认证**」功能已开通。
（注意：是「号码认证服务」，不是「短信服务」。后者需企业认证。）

### 4.3 需要从控制台取两个值

| 变量 | 说明 |
|---|---|
| `ALIYUN_SMS_SIGN_NAME` | **官方赠送的短信签名**（不要自定义，运营商已加强签名管控） |
| `ALIYUN_SMS_TEMPLATE_CODE` | **官方赠送的验证码模板 code**（赠送签名必须搭配赠送模板） |

两者目前在 `official/.env` 中为空，待回填。

### 4.4 邮箱侧仍缺 SMTP

短信方案**不解决**邮箱验证码/找回密码/注册验证。要一并修复需配置自定义 SMTP：

- 入口：Supabase Dashboard → Authentication → Emails → SMTP Settings
- 建议同步调高：Authentication → Rate Limits → 邮件发送上限（Supabase 自身限流独立于 SMTP 服务商）

---

## 五、技术方案（待执行）

### 推荐方案：Supabase Send SMS Hook

Supabase 官方支持用自有短信服务替换内置发送，Hook 返回 200 即视为成功。

```
前端 supabase.auth.signInWithOtp({ phone })
  → Supabase Auth 生成 OTP
  → Send SMS Hook（HTTP Hook 指向后端）
  → 后端调阿里云 SendSmsVerifyCode（OTP 作为模板参数发出）
  → 用户输入
  → supabase.auth.verifyOtp({ phone, token, type: 'sms' })
```

**需同步开启**：Supabase Dashboard → Authentication → Providers → Phone

**备选方案**：完全自建验证码体系（后端生成/存储/校验 + 管理接口签发会话），改动更大，仅在 Hook 不可用时采用。

---

## 六、代码位置

| 用途 | 路径 |
|---|---|
| 登录页（含验证码登录 UI） | `official/src/pages/Login.tsx` |
| 找回密码页 | `official/src/pages/ForgotPassword.tsx` |
| 认证 Hook | `official/src/hooks/useAuth.tsx` |
| Supabase 客户端 | `official/src/lib/supabase.ts` |
| 云函数（含 nodemailer / SMTP 支持） | `official/cloud-functions/api/[[default]].js` |
| 本地后端 | `official/server/index.cjs` |
| 诊断文档 | `official/docs/auth/EMAIL_SMS_FIX_PLAN.md` |

---

## 七、环境与凭证（只记位置，不记值）

| 项 | 位置 |
|---|---|
| 阿里云 AK/SK | 本地 `official/.env` → `ALIYUN_ACCESS_KEY_ID` / `ALIYUN_ACCESS_KEY_SECRET`；生产需加到 Zeabur 服务变量 |
| Supabase 配置 | 本地 `official/.env`；生产在 Zeabur 服务变量 |
| 仓库 | `78tyih/niuniu-ai-official`（**公开仓库，密钥严禁提交**） |
| 部署 | Zeabur，推 `main` 自动部署（服务 ID `6a99d0884177ab13f998d479`） |

---

## 八、接手步骤

1. 阿里云控制台：确认「号码认证服务 → 短信认证」已开通
2. RAM 控制台：给子账号加 `AliyunDypnsFullAccess`
3. 控制台取**赠送签名名**与**赠送模板 code**，回填 `official/.env`
4. 用真实手机号发一条测试短信，确认送达
5. 实现后端 Hook 端点（收 `{ user.phone, sms.otp }` → 调阿里云发送）
6. Supabase Dashboard 配置 Send SMS Hook + 开启 Phone Provider
7. 前端 `Login.tsx` 增加手机号登录入口
8. 加频率限制与图形验证，防短信轰炸
9. 同步把阿里云凭证加到 Zeabur 服务变量
10. 提交并部署，线上验证

---

## 九、验收标准

- [ ] 真实手机号能收到验证码短信
- [ ] 输入验证码能成功登录并进入 `/account`
- [ ] 同号 60 秒内不能重复发送
- [ ] 单日单号有发送上限
- [ ] 错误手机号/过期验证码有明确提示
- [ ] 邮箱侧（若同时配 SMTP）验证码登录与找回密码恢复

---

## 十、风险提示

- 运营商已加强短信签名管控，**务必用赠送签名 + 赠送模板**，自定义签名易下发失败
- 短信按运营商回执计费（约 0.06 元/次），提交成功但回执失败不计费；核验免费
- 必须加防刷（频率限制 + 图形/行为验证），否则易被刷爆
- AccessKey 仅放服务端环境变量，**不得进公开仓库**
