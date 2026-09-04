import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Product from './pages/Product'
import Pricing from './pages/Pricing'
import CommunityHub from './pages/community/CommunityHub'
import CommunityCategory from './pages/community/CommunityCategory'
import CommunityArticle from './pages/community/CommunityArticle'
import Login from './pages/Login'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AccountLayout from './pages/account/AccountLayout'
import Dashboard from './pages/account/Dashboard'
import Subscription from './pages/account/Subscription'
import Orders from './pages/account/Orders'
import Credits from './pages/account/Credits'
import Referral from './pages/account/Referral'
import Commissions from './pages/account/Commissions'
import Settings from './pages/account/Settings'
import PaymentResult from './pages/PaymentResult'
import Admin from './pages/Admin'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/product" element={<Product />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/community" element={<CommunityHub />} />
      <Route path="/community/:category" element={<CommunityCategory />} />
      <Route path="/community/:category/:slug" element={<CommunityArticle />} />
      <Route path="/support" element={<Navigate to="/community" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/account" element={<AccountLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="subscription" element={<Subscription />} />
        <Route path="orders" element={<Orders />} />
        <Route path="credits" element={<Credits />} />
        <Route path="referral" element={<Referral />} />
        <Route path="commissions" element={<Commissions />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/payment/result" element={<PaymentResult />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
