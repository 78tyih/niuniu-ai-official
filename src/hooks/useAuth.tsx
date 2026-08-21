import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, getToken, setToken } from '../lib/api'

interface User {
  id: number
  email: string
  name: string
  phone?: string | null
}

interface AuthCtx {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name?: string, phone?: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const Ctx = createContext<AuthCtx>(null as never)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }
    api<{ user: User }>('/me', { auth: true })
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const d = await api<{ token: string; user: User }>('/auth/login', { body: { email, password } })
    setToken(d.token)
    setUser(d.user)
  }, [])

  const register = useCallback(async (email: string, password: string, name?: string, phone?: string) => {
    const d = await api<{ token: string; user: User }>('/auth/register', { body: { email, password, name, phone } })
    setToken(d.token)
    setUser(d.user)
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const d = await api<{ user: User }>('/me', { auth: true })
    setUser(d.user)
  }, [])

  return <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
