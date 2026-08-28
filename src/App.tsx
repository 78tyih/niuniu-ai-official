import { Routes, Route, Navigate } from 'react-router'
import Home from './pages/Home'
import Demo from './pages/Demo'
import Product from './pages/Product'
import Pricing from './pages/Pricing'
import Community from './pages/Community'
import Login from './pages/Login'
import Account from './pages/Account'
import PaymentResult from './pages/PaymentResult'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/demo" element={<Demo />} />
      <Route path="/product" element={<Product />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/community" element={<Community />} />
      <Route path="/support" element={<Navigate to="/community" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<Account />} />
      <Route path="/payment/result" element={<PaymentResult />} />
    </Routes>
  )
}
