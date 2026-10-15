import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Link } from 'react-router'

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // 线上无 sourcemap，先留一份可排查的现场
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
        <div className="mx-auto max-w-[640px] px-6 pb-24 pt-[140px] text-center">
          <h1 className="font-display text-[24px] font-bold">页面加载出错</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-[#6b7280]">
            页面渲染时出现了问题。刷新试试；如果反复出现，请联系客服并附上大致时间。
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => window.location.reload()}
              className="rounded-lg bg-[#111111] px-5 py-2.5 text-[14px] font-medium text-white"
            >
              刷新页面
            </button>
            <Link
              to="/learn"
              className="rounded-lg border border-[#eceae6] bg-white px-5 py-2.5 text-[14px] font-medium text-[#374151]"
            >
              返回学习中心
            </Link>
          </div>
        </div>
      </div>
    )
  }
}

export { ErrorBoundary }
