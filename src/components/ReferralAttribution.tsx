import { useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const REF_KEY = 'nn_ref_pending'

/**
 * 推荐归因。
 *
 * 规则：**注册（首次登录）时冻结推荐人**，而不是付款时看最后一个链接。
 * 否则会出现"A 教育客户半个月、B 用优惠券在付款前抢走佣金"的扯皮。
 *
 * 流程：
 *   带 ?ref=CODE 访问 → 存进 localStorage
 *   → 登录成功后首次调用 /account/referral/bind
 *   → referrals 表写入（referred_user_id 上有 unique，只会成功一次）
 *   → 清掉 localStorage
 */
export default function ReferralAttribution() {
  const { user } = useAuth()
  const tried = useRef(false)

  // 1. 落地页带 ?ref= 就先记下来（未登录也能记）
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get('ref')
    if (code && code.trim()) {
      try {
        localStorage.setItem(REF_KEY, code.trim())
      } catch {
        /* 隐私模式下 localStorage 不可用，忽略 */
      }
    }
  }, [])

  // 2. 登录后再绑定（此时后端才知道是谁）
  useEffect(() => {
    if (!user || tried.current) return
    tried.current = true

    let code = null
    try {
      code = localStorage.getItem(REF_KEY)
    } catch {
      return
    }
    if (!code) return

    api('/account/referral/bind', { body: { code } })
      .then(() => {
        try {
          localStorage.removeItem(REF_KEY)
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        // 绑定失败**保留** code，下次进页面自动重试。
        // 这里原来也把 code 删了：一次网络抖动或接口报错，这个用户就永久失去归因，
        // 推广人白干（referred_user_id 有唯一约束，绑定不可逆）。宁可多留几次重试。
        tried.current = false
      })
  }, [user])

  return null
}
