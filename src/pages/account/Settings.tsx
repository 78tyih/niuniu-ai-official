import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'

interface ProfileData {
  profile: {
    id: string
    email: string
    name?: string
    nickname?: string
    phone?: string
    avatar_url?: string
    country?: string
    locale?: string
  }
}

export default function AccountSettings() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<ProfileData['profile'] | null>(null)
  const [nickname, setNickname] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    if (!user) return
    setLoading(true)
    api<ProfileData>('/account/settings', { auth: true })
      .then(d => {
        setProfile(d.profile)
        setNickname(d.profile.nickname || '')
        setPhone(d.profile.phone || '')
        setCountry(d.profile.country || '')
      })
      .catch(e => setErr((e as Error).message))
      .finally(() => setLoading(false))
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    setErr('')
    setSuccessMsg('')
    try {
      await api('/account/settings', {
        method: 'PATCH',
        auth: true,
        body: { nickname, phone, country },
      })
      setSuccessMsg('保存成功')
    } catch (e) {
      setErr((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[200px] items-center justify-center text-[#6b7280]">加载中…</div>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold">账户设置</h2>
      </div>

      {err && <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{err}</div>}
      {successMsg && <div className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{successMsg}</div>}

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#374151]">邮箱</label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="mt-1 block w-full rounded-lg border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-[#6b7280] focus:border-[#146eff] focus:outline-none focus:ring-1 focus:ring-[#146eff]"
            />
            <p className="mt-1 text-xs text-[#8b96a8]">邮箱由登录方式决定，不可修改</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">昵称</label>
            <input
              type="text"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              placeholder="请输入昵称"
              className="mt-1 block w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#111111] focus:border-[#146eff] focus:outline-none focus:ring-1 focus:ring-[#146eff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="请输入手机号"
              className="mt-1 block w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#111111] focus:border-[#146eff] focus:outline-none focus:ring-1 focus:ring-[#146eff]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151]">国家/地区</label>
            <input
              type="text"
              value={country}
              onChange={e => setCountry(e.target.value)}
              placeholder="例如：中国"
              className="mt-1 block w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-[#111111] focus:border-[#146eff] focus:outline-none focus:ring-1 focus:ring-[#146eff]"
            />
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-lg bg-[#146eff] py-2.5 text-sm font-semibold text-white hover:bg-[#0d5fe0] disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存修改'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6">
        <h3 className="mb-2 text-lg font-semibold text-red-700">危险区域</h3>
        <p className="mb-4 text-sm text-red-600">
          删除账户会永久删除你的所有数据，包括订阅信息、订单记录、牛气值和佣金记录。此操作不可撤销。
        </p>
        <button
          disabled
          className="rounded-lg border border-red-300 bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          删除账户（请联系客服）
        </button>
      </div>
    </div>
  )
}
