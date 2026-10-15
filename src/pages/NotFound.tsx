import { Link } from 'react-router'
import Nav from '../sections/Nav'
import Footer from '../sections/Footer'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#111111]">
      <Nav />
      <section className="mx-auto max-w-[820px] px-6 pb-24 pt-[140px] text-center">
        <h1 className="font-display text-[24px] font-bold">页面不存在</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#6b7280]">
          你访问的地址可能已更新或输入有误。可以回到学习中心重新查找，或直接联系客服。
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/learn"
            className="rounded-lg bg-[#111111] px-5 py-2.5 text-[14px] font-medium text-white"
          >
            返回学习中心
          </Link>
          <Link
            to="/"
            className="rounded-lg border border-[#eceae6] bg-white px-5 py-2.5 text-[14px] font-medium text-[#374151]"
          >
            回到首页
          </Link>
          <Link
            to="/learn#contact"
            className="rounded-lg border border-[#eceae6] bg-white px-5 py-2.5 text-[14px] font-medium text-[#374151]"
          >
            联系客服
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
