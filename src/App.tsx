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
import Account from './pages/Account'
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
      <Route path="/account" element={<Account />} />
      <Route path="/payment/result" element={<PaymentResult />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}
