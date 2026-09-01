import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { supabase, supabaseConfigured } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!supabaseConfigured) {
      setError('后端未配置，暂时无法发送重置邮件')
      return
    }
    setBusy(true)
    setError('')
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw new Error(error.message)
      setSent(true)
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
          <h1 className="text-center text-xl font-bold">重置密码</h1>
          {sent ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-xl text-emerald-500">✓</div>
              <p className="mt-4 text-sm leading-relaxed text-[#6b7280]">
                重置邮件已发送到 <span className="font-medium text-[#14171f]">{email}</span>。
                请点击邮件中的链接设置新密码。没收到的话检查一下垃圾邮件文件夹。
              </p>
              <Link to="/login" className="mt-6 inline-block text-sm text-[#ff6a1a] underline underline-offset-4">
                返回登录
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-1.5 text-center text-sm text-[#9aa0ad]">输入注册邮箱，我们会发送重置链接给你。</p>
              <form onSubmit={submit} className="mt-6 space-y-4">
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
                  {busy ? '发送中…' : '发送重置邮件'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          想起来了？<Link to="/login" className="text-[#ff6a1a] underline underline-offset-4">直接登录</Link>
        </p>
      </div>
    </div>
  )
}
