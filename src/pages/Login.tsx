import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [socialHint, setSocialHint] = useState<string | null>(null)
  const { login, register, backendReady } = useAuth()
  const navigate = useNavigate()

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
                onClick={() => { setMode(m); setError('') }}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === m ? 'bg-white text-[#14171f] shadow-sm' : 'text-[#6b7280] hover:text-[#14171f]'
                }`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

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

          {/* 第三方登录 */}
          <div className="mt-6">
            <div className="flex items-center gap-3 text-xs text-[#b0a89c]">
              <span className="h-px flex-1 bg-[#e8e6e0]" />其他登录方式<span className="h-px flex-1 bg-[#e8e6e0]" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setSocialHint('wechat')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#e0ddd6] bg-white py-2.5 text-sm text-[#3f4756] transition-all hover:border-emerald-400"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">微</span>
                微信登录
              </button>
              <button
                onClick={() => setSocialHint('qq')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#e0ddd6] bg-white py-2.5 text-sm text-[#3f4756] transition-all hover:border-sky-400"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-500 text-[10px] font-bold text-white">QQ</span>
                QQ 登录
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-[#9aa0ad]">
            登录即表示你同意《用户协议》与《隐私政策》
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          登录遇到问题？<Link to="/community#contact" className="text-[#ff6a1a] underline underline-offset-4">联系客服</Link>
          <span className="mx-3 text-[#d8d4cb]">·</span>
          <Link to="/" className="transition-colors hover:text-[#14171f]">← 返回首页</Link>
        </p>
      </div>

      {/* 第三方登录说明弹窗 */}
      {socialHint && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm" onClick={() => setSocialHint(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#e8e6e0] bg-white p-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold">
              {socialHint === 'wechat' ? '微信登录' : 'QQ 登录'}（即将接入）
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#6b7280]">
              {socialHint === 'wechat'
                ? '微信扫码登录需要「微信开放平台」企业开发者资质与网站应用审核，目前正在申请流程中。'
                : 'QQ 登录需要「QQ 互联」开发者资质与网站应用审核，目前正在申请流程中。'}
            </p>
            <p className="mt-2 text-sm text-[#9aa0ad]">当前请使用邮箱注册 / 登录，并绑定手机号。</p>
            <button
              onClick={() => setSocialHint(null)}
              className="mt-6 w-full rounded-xl bg-[#ff6a1a] py-2.5 text-sm font-semibold text-white hover:bg-[#f45d0d]"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
