import { useState, type FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { api } from '../lib/api'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [loginWay, setLoginWay] = useState<'password' | 'otp' | 'phone'>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  // 邮箱验证码登录（不走 Supabase 内置邮件服务，改由后端自建投递）
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [hasCode, setHasCode] = useState(true)
  const [resendCountdown, setResendCountdown] = useState(0)
  // 手机号短信登录（Supabase 生成 OTP，经 Send SMS Hook 由阿里云投递）
  const [phoneSent, setPhoneSent] = useState(false)
  const [phoneCode, setPhoneCode] = useState('')
  const { login, register, backendReady } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCountdown])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(email, password)
      else await register(email, password, name, phone || undefined)
      navigate('/account')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const sendLoginLink = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('请输入正确的邮箱')
      return
    }
    if (resendCountdown > 0) return
    setError('')
    setBusy(true)
    try {
      const r = await api<{ ok: boolean; hasCode?: boolean }>('/auth/email-link', {
        method: 'POST',
        body: { email, purpose: 'magiclink' },
      })
      setHasCode(r.hasCode !== false)
      setOtpCode('')
      setOtpSent(true)
      setResendCountdown(60)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const verifyOtp = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      // 验证码由 Supabase 生成并校验，我们只负责投递
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpCode.trim(),
        type: 'email',
      })
      if (error) throw new Error(error.message)
      navigate('/account')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // 手机号短信登录：Supabase 生成 OTP → Send SMS Hook → 阿里云投递
  const sendPhoneOtp = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setError('请输入正确的 11 位手机号')
      return
    }
    if (resendCountdown > 0) return
    setError('')
    setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() })
      if (error) throw new Error(error.message)
      setPhoneCode('')
      setPhoneSent(true)
      setResendCountdown(60)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const verifyPhoneOtp = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: phone.trim(),
        token: phoneCode.trim(),
        type: 'sms',
      })
      if (error) throw new Error(error.message)
      navigate('/account')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src="/assets/logo.png" alt="牛牛AI" className="h-12 w-auto" />
          <span className="font-display text-xl font-bold text-[#14171f]">
            牛牛<span className="text-[#ff6a1a]">AI</span>
          </span>
        </Link>

        <div className="card-light rounded-2xl p-8 shadow-[0_20px_60px_-30px_rgba(20,23,31,0.25)]">
          <h1 className="text-center text-xl font-bold">登录你的账号</h1>
          <p className="mt-1.5 text-center text-sm text-[#9aa0ad]">欢迎回来，请登录你的牛牛 AI 账号。</p>

          {!backendReady && (
            <div className="mt-5 rounded-lg border border-[#ff6a1a]/30 bg-[#ff6a1a]/8 px-4 py-3 text-xs leading-relaxed text-[#d4530f]">
              后端尚未接入：本演示需要配置 Supabase 环境变量后才能注册登录。
            </div>
          )}

          <div className="mt-6 mb-6 grid grid-cols-2 gap-1 rounded-xl bg-[#f0eee9] p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setOtpSent(false) }}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === m ? 'bg-white text-[#14171f] shadow-sm' : 'text-[#6b7280] hover:text-[#14171f]'
                }`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          {/* 手机号短信登录 */}
          {mode === 'login' && loginWay === 'phone' ? (
            <form onSubmit={verifyPhoneOtp} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#9aa0ad]">手机号</label>
                <div className="flex gap-2.5">
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={phoneSent}
                    maxLength={11}
                    className="flex-1 rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a] disabled:bg-[#f5f3ee]"
                    placeholder="11 位手机号"
                  />
                  <button
                    type="button"
                    onClick={sendPhoneOtp}
                    disabled={busy || !supabaseConfigured || resendCountdown > 0}
                    className="shrink-0 rounded-lg border border-[#ff6a1a] px-4 py-2.5 text-sm font-medium text-[#ff6a1a] transition-all hover:bg-[#ff6a1a]/5 disabled:opacity-50"
                  >
                    {resendCountdown > 0 ? `${resendCountdown}s` : phoneSent ? '重新发送' : '发送验证码'}
                  </button>
                </div>
              </div>
              {phoneSent && (
                <div>
                  <label className="mb-1.5 block text-xs text-[#9aa0ad]">短信验证码</label>
                  <input
                    required
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    maxLength={8}
                    className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 font-mono text-lg tracking-[0.4em] outline-none focus:border-[#ff6a1a]"
                    placeholder="6 位数字"
                  />
                  <p className="mt-1.5 text-xs text-[#9aa0ad]">验证码已发送，请留意短信，没收到请稍后再试。</p>
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-[#ff6a1a]/30 bg-[#ff6a1a]/8 px-4 py-2.5 text-sm text-[#d4530f]">
                  {error}
                </div>
              )}
              {phoneSent && (
                <button
                  type="submit"
                  disabled={busy || phoneCode.length < 4}
                  className="w-full rounded-xl bg-[#ff6a1a] py-3 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d] disabled:opacity-50"
                >
                  {busy ? '验证中…' : '登录'}
                </button>
              )}
              <p className="text-center text-xs text-[#9aa0ad]">
                没有账号也没关系，验证通过后自动为你创建。
                <button type="button" onClick={() => { setLoginWay('password'); setError('') }} className="ml-1 text-[#ff6a1a] underline underline-offset-4">
                  改用密码登录
                </button>
              </p>
            </form>
          ) : /* 邮箱验证码登录 */
          mode === 'login' && loginWay === 'otp' ? (
            <form onSubmit={hasCode ? verifyOtp : (e) => e.preventDefault()} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#9aa0ad]">邮箱</label>
                <div className="flex gap-2.5">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                    className="flex-1 rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a] disabled:bg-[#f5f3ee]"
                    placeholder="you@example.com"
                  />
                  <button
                    type="button"
                    onClick={sendLoginLink}
                    disabled={busy || !supabaseConfigured || resendCountdown > 0}
                    className="shrink-0 rounded-lg border border-[#ff6a1a] px-4 py-2.5 text-sm font-medium text-[#ff6a1a] transition-all hover:bg-[#ff6a1a]/5 disabled:opacity-50"
                  >
                    {resendCountdown > 0 ? `${resendCountdown}s` : otpSent ? '重新发送' : '发送验证码'}
                  </button>
                </div>
              </div>
              {otpSent && hasCode && (
                <div>
                  <label className="mb-1.5 block text-xs text-[#9aa0ad]">邮箱验证码</label>
                  <input
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    maxLength={8}
                    className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 font-mono text-lg tracking-[0.4em] outline-none focus:border-[#ff6a1a]"
                    placeholder="8 位数字"
                  />
                  <p className="mt-1.5 text-xs text-[#9aa0ad]">
                    验证码已发送至 {email}，邮件中另有一键登录链接，1 小时内有效。
                  </p>
                </div>
              )}
              {otpSent && !hasCode && (
                <div className="rounded-lg border border-[#e0ddd6] bg-white px-4 py-3 text-xs leading-relaxed text-[#6b7280]">
                  登录链接已发送至 <b className="text-[#14171f]">{email}</b>。
                  <br />
                  请到邮箱点击链接完成登录，链接 1 小时内有效且只能使用一次。
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-[#ff6a1a]/30 bg-[#ff6a1a]/8 px-4 py-2.5 text-sm text-[#d4530f]">
                  {error}
                </div>
              )}
              {otpSent && hasCode && (
                <button
                  type="submit"
                  disabled={busy || otpCode.length < 6}
                  className="w-full rounded-xl bg-[#ff6a1a] py-3 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d] disabled:opacity-50"
                >
                  {busy ? '验证中…' : '登录'}
                </button>
              )}
              <p className="text-center text-xs text-[#9aa0ad]">
                没有账号也没关系，验证通过后自动为你创建。
                <button type="button" onClick={() => { setLoginWay('password'); setError('') }} className="ml-1 text-[#ff6a1a] underline underline-offset-4">
                  改用密码登录
                </button>
              </p>
            </form>
          ) : (
          <>
          {mode === 'login' && (
            <p className="-mt-2 mb-4 flex items-center justify-end gap-4 text-xs">
              <button type="button" onClick={() => { setLoginWay('phone'); setError('') }} className="text-[#ff6a1a] underline underline-offset-4">
                用手机号登录 →
              </button>
              <button type="button" onClick={() => { setLoginWay('otp'); setError('') }} className="text-[#ff6a1a] underline underline-offset-4">
                用邮箱验证码登录 →
              </button>
            </p>
          )}
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs text-[#9aa0ad]">昵称（选填）</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                  placeholder="怎么称呼你"
                />
              </div>
            )}
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs text-[#9aa0ad]">手机号（建议填写，用于账户安全与订单通知）</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                  placeholder="11 位手机号"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs text-[#9aa0ad]">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs text-[#9aa0ad]">密码{mode === 'register' && '（至少 6 位）'}</label>
                {mode === 'login' && (
                  <Link to="/forgot-password" className="text-xs text-[#9aa0ad] hover:text-[#ff6a1a]">忘记密码？</Link>
                )}
              </div>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                placeholder="••••••••"
              />
            </div>

            {mode === 'login' && (
              <label className="flex items-center gap-2 text-xs text-[#6b7280]">
                <input type="checkbox" defaultChecked className="accent-[#ff6a1a]" /> 记住我
              </label>
            )}

            {error && (
              <div className="rounded-lg border border-[#ff6a1a]/30 bg-[#ff6a1a]/8 px-4 py-2.5 text-sm text-[#d4530f]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-[#ff6a1a] py-3 text-sm font-semibold text-white transition-all hover:bg-[#f45d0d] disabled:opacity-50"
            >
              {busy ? '处理中…' : mode === 'login' ? '登录' : '创建账户'}
            </button>
          </form>
          </>
          )}

          <p className="mt-5 text-center text-xs leading-relaxed text-[#9aa0ad]">
            登录即表示你同意《用户协议》与《隐私政策》
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          登录遇到问题？<Link to="/learn#contact" className="text-[#ff6a1a] underline underline-offset-4">联系客服</Link>
          <span className="mx-3 text-[#d8d4cb]">·</span>
          <Link to="/" className="transition-colors hover:text-[#14171f]">← 返回首页</Link>
        </p>
      </div>
    </div>
  )
}
