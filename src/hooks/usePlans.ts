import { useEffect, useState } from 'react'
import { api, type Plan } from '../lib/api'
import { FALLBACK_PLANS, FALLBACK_NOTICE } from '../content/plans'

/**
 * 拉取套餐列表。
 *
 * 关键点：初始值与失败时都用 FALLBACK_PLANS，保证价格区块**永远不会是空的**。
 * 之前直接用 `plans = []` 起步，接口一慢或一挂，页面上就只剩标题，看起来像被折叠了。
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [degraded, setDegraded] = useState(false)

  useEffect(() => {
    let alive = true

    const load = async (attempt: number) => {
      try {
        const d = await api<{ plans: Plan[]; notice: string }>('/plans')
        if (!alive) return
        if (Array.isArray(d.plans) && d.plans.length > 0) {
          setPlans(d.plans)
          setNotice(d.notice || '')
          setDegraded(false)
        } else {
          // 接口通了但没数据 —— 同样按降级处理，别让页面空着
          setDegraded(true)
          setNotice(FALLBACK_NOTICE)
        }
      } catch {
        if (!alive) return
        if (attempt < 1) {
          // 失败重试一次，多数情况是瞬时抖动
          setTimeout(() => alive && load(attempt + 1), 1200)
          return
        }
        setDegraded(true)
        setNotice(FALLBACK_NOTICE)
      } finally {
        if (alive) setLoading(false)
      }
    }

    load(0)
    return () => {
      alive = false
    }
  }, [])

  return { plans, notice, loading, degraded }
}
