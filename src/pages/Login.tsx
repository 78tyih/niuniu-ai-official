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
    <div className="bg-grid flex min-h-screen items-center justify-center bg-[#070c18] px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src="assets/logo.png" alt="牛牛AI" className="h-12 w-auto" />
          <span className="font-display text-xl font-bold text-slate-100">
            牛牛<span className="text-orange-500">AI</span>
          </span>
        </Link>

        <div className="card-line rounded-2xl p-8">
          {!backendReady && (
            <div className="mb-5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-xs leading-relaxed text-orange-300">
              后端尚未接入：本演示需要配置 Supabase 环境变量后才能注册登录。
            </div>
          )}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-[#111c33] p-1">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`rounded-lg py-2 text-sm font-medium transition-all ${
                  mode === m ? 'bg-sky-400/15 text-sky-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m === 'login' ? '登录' : '注册'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs text-slate-500">昵称（选填）</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-[#1b2740] bg-[#0a1120] px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-sky-400/60"
                  placeholder="怎么称呼你"
                />
              </div>
            )}
            {mode === 'register' && (
              <div>
                <label className="mb-1.5 block text-xs text-slate-500">手机号（建议填写，订阅前需绑定）</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={11}
                  className="w-full rounded-lg border border-[#1b2740] bg-[#0a1120] px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-sky-400/60"
                  placeholder="11 位手机号"
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-xs text-slate-500">邮箱</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#1b2740] bg-[#0a1120] px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-sky-400/60"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-500">密码{mode === 'register' && '（至少 6 位）'}</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#1b2740] bg-[#0a1120] px-4 py-2.5 text-sm text-slate-200 outline-none focus:border-sky-400/60"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 px-4 py-2.5 text-sm text-orange-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition-all hover:bg-orange-400 disabled:opacity-50"
            >
              {busy ? '处理中…' : mode === 'login' ? '登录' : '创建账户'}
            </button>
          </form>

          {/* 第三方登录 */}
          <div className="mt-6">
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="h-px flex-1 bg-[#1b2740]" />其他登录方式<span className="h-px flex-1 bg-[#1b2740]" />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                onClick={() => setSocialHint('wechat')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#1b2740] bg-[#0a1120] py-2.5 text-sm text-slate-300 transition-all hover:border-emerald-400/50 hover:text-emerald-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-emerald-500 text-[10px] font-bold text-white">微</span>
                微信登录
              </button>
              <button
                onClick={() => setSocialHint('qq')}
                className="flex items-center justify-center gap-2 rounded-xl border border-[#1b2740] bg-[#0a1120] py-2.5 text-sm text-slate-300 transition-all hover:border-sky-400/50 hover:text-sky-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-sky-500 text-[10px] font-bold text-white">QQ</span>
                QQ 登录
              </button>
            </div>
          </div>

          <p className="mt-5 text-center text-xs leading-relaxed text-slate-600">
            演示环境：账户数据保存在本地服务器，注册即表示同意演示版用户协议与隐私政策。
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/" className="transition-colors hover:text-sky-300">← 返回首页</Link>
        </p>
      </div>

      {/* 第三方登录说明弹窗 */}
      {socialHint && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm" onClick={() => setSocialHint(null)}>
          <div className="card-line w-full max-w-sm rounded-2xl p-7" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-100">
              {socialHint === 'wechat' ? '微信登录' : 'QQ 登录'}（即将接入）
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              {socialHint === 'wechat'
                ? '微信扫码登录需要「微信开放平台」企业开发者资质与网站应用审核，目前正在申请流程中。'
                : 'QQ 登录需要「QQ 互联」开发者资质与网站应用审核，目前正在申请流程中。'}
            </p>
            <p className="mt-2 text-sm text-slate-500">当前请使用邮箱注册 / 登录，并绑定手机号。</p>
            <button
              onClick={() => setSocialHint(null)}
              className="mt-6 w-full rounded-xl bg-sky-500 py-2.5 text-sm font-semibold text-white hover:bg-sky-400"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
