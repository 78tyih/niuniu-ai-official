import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase, supabaseConfigured } from '../lib/supabase'

interface User {
  id: string
  email: string
  name: string
  phone?: string | null
}

interface AuthCtx {
  user: User | null
  loading: boolean
  backendReady: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx>(null as never)

async function loadProfile(uid: string, email: string): Promise<User> {
  const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle()
  if (!data) {
    // 首次登录（如邮箱验证后）自动建档
    await supabase.from('profiles').insert({ id: uid }).then(() => {})
    return { id: uid, email, name: '' }
  }
  return { id: uid, email, name: data.name || '', phone: data.phone }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabaseConfigured) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session?.user) {
        setUser(await loadProfile(data.session.user.id, data.session.user.email || ''))
      }
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ? await loadProfile(session.user.id, session.user.email || '') : null)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message === 'Invalid login credentials' ? '邮箱或密码不正确' : error.message)
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string, phone?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: name || '' } },
    })
    if (error) throw new Error(error.message)
    if (!data.session) {
      // 项目开启了邮箱验证
      throw new Error('验证邮件已发送，请先到邮箱完成验证再登录')
    }
    if (data.user) {
      await supabase.from('profiles').upsert({ id: data.user.id, name: name || '', phone: phone || null })
    }
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut()
  }, [])

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getSession()
    if (data.session?.user) {
      setUser(await loadProfile(data.session.user.id, data.session.user.email || ''))
    }
  }, [])

  return (
    <Ctx.Provider value={{ user, loading, backendReady: supabaseConfigured, login, register, logout, refreshUser }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  return useContext(Ctx)
}
