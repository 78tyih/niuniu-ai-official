import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Account from './pages/Account'
import PaymentResult from './pages/PaymentResult'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/account" element={<Account />} />
      <Route path="/payment/result" element={<PaymentResult />} />
    </Routes>
  )
}
