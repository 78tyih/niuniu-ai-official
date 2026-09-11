import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Product from './pages/Product'
import Pricing from './pages/Pricing'
import LearnHub from './pages/learn/LearnHub'
import LearnTrack from './pages/learn/LearnTrack'
import LearnArticle from './pages/learn/LearnArticle'
import LearnSearch from './pages/learn/LearnSearch'
import LegacyCommunityRedirect from './pages/learn/LegacyCommunityRedirect'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthCallback from './pages/AuthCallback'
import AccountLayout from './pages/account/AccountLayout'
import Dashboard from './pages/account/Dashboard'
import Subscription from './pages/account/Subscription'
import Orders from './pages/account/Orders'
import Referral from './pages/account/Referral'
import PaymentResult from './pages/PaymentResult'
import Admin from './pages/Admin'

const TRACK_PATHS = [
  'getting-started',
  'analysis',
  'risk',
  'custom-ai',
  'review',
  'troubleshooting',
]

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/product" element={<Product />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* 学习中心 */}
      <Route path="/learn" element={<LearnHub />} />
      <Route path="/learn/search" element={<LearnSearch />} />
      {TRACK_PATHS.map((t) => (
        <Route key={t} path={`/learn/${t}`} element={<LearnTrack trackId={t} />} />
      ))}
      <Route path="/learn/:slug" element={<LearnArticle />} />

      {/* 旧社区地址兼容：全部 301 到学习中心，不产生 404 */}
      <Route path="/community" element={<LegacyCommunityRedirect />} />
      <Route path="/community/:category" element={<LegacyCommunityRedirect />} />
      <Route path="/community/:category/:slug" element={<LegacyCommunityRedirect />} />
      <Route path="/support" element={<Navigate to="/learn" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      {/* 邮件登录 / 重置密码落地页 */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="orders" element={<Orders />} />
        <Route path="credits" element={<Navigate to="/account/orders" replace />} />
        <Route path="referral" element={<Referral />} />
        <Route path="commissions" element={<Navigate to="/account/referral" replace />} />
        <Route path="settings" element={<Navigate to="/account" replace />} />
      </Route>
      <Route path="/payment/result" element={<PaymentResult />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
