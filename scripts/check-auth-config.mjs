#!/usr/bin/env node
/**
 * 牛牛AI 登录配置自检
 *
 * 用法：在 official/ 目录下执行
 *   node scripts/check-auth-config.mjs
 *
 * 只做只读探测：不会真的发出短信，也不会产生费用。
 * 阿里云权限探测用的是明显非法的手机号，用于区分「未授权」与「已授权但参数错误」。
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// ---------- 读取 .env ----------
const env = {}
for (const file of ['.env', '.env.local']) {
  const p = path.join(root, file)
  if (!fs.existsSync(p)) continue
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
}
const SUPABASE_URL = env.SUPABASE_URL || process.env.SUPABASE_URL || ''
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const ANON = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || ''

const OK = '✅'
const NO = '❌'
const WARN = '⚠️ '
const lines = []
const todos = []

const say = (icon, label, detail = '') =>
  lines.push(`  ${icon} ${label}${detail ? `  ${detail}` : ''}`)
const section = (t) => lines.push(`\n${t}`)

const withTimeout = (url, opts = {}) =>
  fetch(url, { ...opts, signal: AbortSignal.timeout(10000) })

// ---------- 1. Supabase ----------
section('Supabase')
if (!SUPABASE_URL || !SERVICE_KEY) {
  say(NO, '未配置 SUPABASE_URL / SERVICE_ROLE_KEY')
  todos.push('补齐 .env 中的 Supabase 配置')
} else {
  try {
    const r = await withTimeout(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
    })
    if (r.ok) {
      const d = await r.json()
      say(OK, '连接正常', `账号数 ${(d.users || []).length}`)
    } else {
      say(NO, '连接失败', `HTTP ${r.status}`)
      todos.push('检查 SUPABASE_URL 与 SERVICE_ROLE_KEY 是否正确')
    }
  } catch (e) {
    say(NO, '连接异常', String(e.message || e))
  }

  // 公开认证配置
  try {
    const r = await withTimeout(`${SUPABASE_URL}/auth/v1/settings`, { headers: { apikey: ANON } })
    const s = await r.json()
    say(s.mailer_autoconfirm === false ? OK : WARN, '邮箱自动确认', `mailer_autoconfirm=${s.mailer_autoconfirm}`)
  } catch {
    /* 忽略：不影响主流程 */
  }
}

// ---------- 2. 邮件通道 ----------
section('邮件通道（邮箱验证码登录 / 找回密码）')
const resend = env.RESEND_API_KEY || process.env.RESEND_API_KEY || ''
const smtpOk = Boolean(
  (env.SMTP_HOST || process.env.SMTP_HOST) &&
    (env.SMTP_USER || process.env.SMTP_USER) &&
    (env.SMTP_PASS || process.env.SMTP_PASS),
)
if (resend) {
  try {
    const r = await withTimeout('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${resend}` },
    })
    if (r.ok) {
      const d = await r.json()
      const domains = (d.data || []).map((x) => x.name).join(', ')
      const verified = (d.data || []).find((x) => x.name === 'niuniuai.app')
      say(OK, 'Resend API Key 有效', `域名：${domains || '无'}`)
      if (verified) {
        say(verified.status === 'verified' ? OK : WARN, 'niuniuai.app 域名状态', verified.status)
        if (verified.status !== 'verified') {
          todos.push('在 Resend 完成 niuniuai.app 域名验证（Cloudflare 加 TXT 记录）')
        }
      } else {
        say(WARN, 'niuniuai.app 未添加到 Resend')
        todos.push('在 Resend 添加并验证域名 niuniuai.app')
      }
    } else {
      say(NO, 'Resend API Key 无效', `HTTP ${r.status}`)
      todos.push('更换有效的 RESEND_API_KEY')
    }
  } catch (e) {
    say(NO, 'Resend 请求失败', String(e.message || e))
  }
} else if (smtpOk) {
  say(OK, '已配置 SMTP（将作为邮件通道）')
} else {
  say(NO, '没有任何邮件通道')
  todos.push('设置 RESEND_API_KEY（推荐）或配齐 SMTP_HOST/USER/PASS')
}

// ---------- 3. 阿里云短信 ----------
section('阿里云短信（手机号登录）')
const ak = env.ALIYUN_ACCESS_KEY_ID || process.env.ALIYUN_ACCESS_KEY_ID || ''
const sk = env.ALIYUN_ACCESS_KEY_SECRET || process.env.ALIYUN_ACCESS_KEY_SECRET || ''
const sign = env.ALIYUN_SMS_SIGN_NAME || process.env.ALIYUN_SMS_SIGN_NAME || ''
const tpl = env.ALIYUN_SMS_TEMPLATE_CODE || process.env.ALIYUN_SMS_TEMPLATE_CODE || ''

say(ak ? OK : NO, 'AccessKey ID', ak ? `${ak.slice(0, 6)}…` : '未填写')
say(sk ? OK : NO, 'AccessKey Secret', sk ? '已填写' : '未填写')
say(sign ? OK : NO, '赠送签名名', sign || '未填写')
say(tpl ? OK : NO, '赠送模板 code', tpl || '未填写（登录/注册一般为 100001）')

if (!ak || !sk) {
  todos.push('补齐 ALIYUN_ACCESS_KEY_ID / ALIYUN_ACCESS_KEY_SECRET')
}
if (ak && sk && !sign) todos.push('到控制台复制「赠送签名名」填入 ALIYUN_SMS_SIGN_NAME')
if (ak && sk && !tpl) todos.push('到控制台复制「赠送模板 code」填入 ALIYUN_SMS_TEMPLATE_CODE（登录/注册=100001）')

if (ak && sk && sign && tpl) {
  try {
    const DypnsapiMod = await import('@alicloud/dypnsapi20170525')
    const OpenApi = await import('@alicloud/openapi-client')
    const Util = await import('@alicloud/tea-util')
    const Client = DypnsapiMod.default || DypnsapiMod
    const client = new Client(
      new OpenApi.Config({ accessKeyId: ak, accessKeySecret: sk, endpoint: 'dypnsapi.aliyuncs.com' }),
    )
    try {
      await client.sendSmsVerifyCodeWithOptions(
        new DypnsapiMod.SendSmsVerifyCodeRequest({
          // 明显非法的号码：用于探测权限，不会真正下发
          phoneNumber: '10000000000',
          signName: sign,
          templateCode: tpl,
          countryCode: '86',
          templateParam: JSON.stringify({ code: '000000', min: '5' }),
        }),
        new Util.RuntimeOptions({}),
      )
      say(WARN, '权限探测：调用意外成功，请确认是否真的发出了短信')
    } catch (e) {
      const code = e?.data?.Code || e?.code || ''
      if (code === 'Forbidden.NoPermission') {
        say(NO, 'RAM 子账号未授权', 'dypns:SendSmsVerifyCode')
        todos.push('RAM 控制台给子账号授予 AliyunDypnsFullAccess')
      } else if (/Forbidden|Unauthorized/i.test(code)) {
        say(NO, '鉴权失败', code || String(e.message || e))
      } else {
        // 权限校验已通过，剩下的都是参数/业务错误
        say(OK, '权限已通过', `返回 ${code || '业务错误'}（非权限问题，说明授权生效）`)
      }
    }
  } catch (e) {
    say(NO, 'SDK 加载失败', String(e.message || e))
  }
} else {
  say(WARN, '凭证或签名模板不全，跳过权限探测')
}

// ---------- 输出 ----------
console.log('\n🔍 牛牛AI 登录配置自检\n')
console.log(lines.join('\n'))
if (todos.length) {
  console.log('\n📌 还需要做：')
  todos.forEach((t, i) => console.log(`   ${i + 1}. ${t}`))
} else {
  console.log('\n🎉 全部就绪')
}
console.log('')
