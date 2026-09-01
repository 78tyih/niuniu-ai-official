import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { supabase, supabaseConfigured } from '../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!supabaseConfigured) return
    // 邮件链接带回的 recovery token 由 supabase-js 自动解析并建立恢复会话
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
      else setError('链接无效或已过期，请重新发起重置')
    })
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('密码至少 6 位')
      return
    }
    if (password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }
    setBusy(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw new Error(error.message)
      setDone(true)
      setTimeout(() => navigate('/account'), 1500)
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
          <h1 className="text-center text-xl font-bold">设置新密码</h1>
          {done ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-500">✓</div>
              <p className="mt-4 text-sm text-[#6b7280]">密码已更新，正在进入你的账户…</p>
            </div>
          ) : ready ? (
            <form onSubmit={submit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs text-[#9aa0ad]">新密码（至少 6 位）</label>
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
              <div>
                <label className="mb-1.5 block text-xs text-[#9aa0ad]">再输入一次</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full rounded-lg border border-[#e0ddd6] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#ff6a1a]"
                  placeholder="••••••••"
                />
              </div>
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
                {busy ? '提交中…' : '确认修改'}
              </button>
            </form>
          ) : (
            <div className="mt-6 text-center">
              {error ? (
                <>
                  <p className="text-sm text-[#d4530f]">{error}</p>
                  <Link to="/forgot-password" className="mt-4 inline-block text-sm text-[#ff6a1a] underline underline-offset-4">
                    重新发送重置邮件
                  </Link>
                </>
              ) : (
                <p className="text-sm text-[#9aa0ad]">正在验证链接…</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
