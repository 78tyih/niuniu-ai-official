import { Navigate, useLocation, useParams } from 'react-router'

/** 旧站 id → 新学习中心 slug */
const LEGACY_MAP: Record<string, string> = {
  'connect-mt5': 'how-to-connect-mt5',
  'mt5-connection-guide': 'how-to-connect-mt5',
  'mt5-instance-management': 'how-to-connect-mt5',
  'mt5-connection-failed': 'how-to-fix-mt5-connection',
  'smart-kline': 'how-to-auto-draw-levels',
  'ai-analysis': 'how-to-choose-among-plans',
  'risk-review': 'why-ai-rejects-trade',
  'ai-analysis-no-output': 'why-ai-rejects-trade',
  'position-diagnosis': 'how-to-monitor-positions',
  'risk-control-setup': 'how-to-set-daily-loss-limit',
  'risk-basics': 'how-to-set-daily-loss-limit',
  'risk-params-guide': 'how-to-set-daily-loss-limit',
  'stop-loss-strategy': 'how-to-set-daily-loss-limit',
  'filter-settings': 'how-to-set-daily-loss-limit',
  'custom-prompt': 'how-to-train-ai-with-your-style',
  'prompt-not-working': 'how-to-train-ai-with-your-style',
  'multi-timeframe-template': 'how-to-train-ai-with-your-style',
  'clone-analyst-guide': 'how-to-clone-analysis-style',
  'trade-replay': 'how-to-review-trades',
  'ai-log': 'how-to-review-trades',
  'history-order-analysis': 'how-to-review-trades',
  'multi-symbol': 'how-to-analyze-screenshot',
  'one-click-layout': 'how-to-use-one-click-layout',
  'nq-credit-issue': 'what-is-niuqi-credit',
  'what-is-nq-credit': 'what-is-niuqi-credit',
  'how-to-recharge': 'what-is-niuqi-credit',
}

/**
 * /community 及其子路径的兼容跳转。
 * 能按 slug 映射到新文章就跳对应文章，否则回到学习中心首页，绝不产生 404。
 */
export default function LegacyCommunityRedirect() {
  const { category, slug } = useParams()
  const { hash } = useLocation()

  const mapped = slug ? LEGACY_MAP[slug] : undefined
  if (mapped) return <Navigate to={`/learn/${mapped}`} replace />

  if (category === 'troubleshooting' && slug) return <Navigate to="/learn/troubleshooting" replace />
  if (category === 'faq') return <Navigate to="/learn/troubleshooting" replace />

  return <Navigate to={`/learn${hash || ''}`} replace />
}
