import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { supabase } from '../lib/supabase'

/**
 * 邮件登录 / 重置密码落地页。
 * 后端用 admin.generateLink 生成官方 token 后自行投递，本页负责把 token 换成会话。
 */
export default function AuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<'pending' | 'ok' | 'error'>('pending')
  const [message, setMessage] = useState('')
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    done.current = true

    const tokenHash = params.get('token_hash') || ''
    const rawType = params.get('type') || 'magiclink'
    const type = rawType === 'recovery' ? 'recovery' : 'magiclink'

    if (!tokenHash) {
      setState('error')
      setMessage('链接不完整，请重新获取邮件。')
      return
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type })
      .then(({ error }) => {
        if (error) {
          setState('error')
          setMessage(error.message.includes('expired')
            ? '链接已过期或已被使用，请重新获取。'
            : `验证失败：${error.message}`)
          return
        }
        setState('ok')
        setMessage(type === 'recovery' ? '验证成功，正在前往设置新密码…' : '登录成功，正在前往账户中心…')
        setTimeout(() => navigate(type === 'recovery' ? '/reset-password' : '/account', { replace: true }), 800)
      })
      .catch((err: unknown) => {
        setState('error')
        setMessage(`验证失败：${(err as Error).message}`)
      })
  }, [params, navigate])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#faf9f6] px-5 py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <img src="/assets/logo.png" alt="牛牛AI" className="h-12 w-auto" />
          <span className="font-display text-xl font-bold text-[#14171f]">
            牛牛<span className="text-[#ff6a1a]">AI</span>
          </span>
        </Link>

        <div className="card-light rounded-2xl p-8 text-center shadow-[0_20px_60px_-30px_rgba(20,23,31,0.25)]">
          {state === 'pending' && (
            <p className="text-sm text-[#6b7280]">正在验证…</p>
          )}
          {state === 'ok' && (
            <>
              <h1 className="text-lg font-bold text-[#14171f]">验证成功</h1>
              <p className="mt-2 text-sm text-[#6b7280]">{message}</p>
            </>
          )}
          {state === 'error' && (
            <>
              <h1 className="text-lg font-bold text-[#14171f]">无法完成验证</h1>
              <p className="mt-2 text-sm text-[#6b7280]">{message}</p>
              <div className="mt-6 flex justify-center gap-4 text-sm">
                <Link to="/login" className="text-[#ff6a1a] underline underline-offset-4">重新获取登录链接</Link>
                <Link to="/" className="text-[#9aa0ad] hover:text-[#14171f]">返回首页</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
