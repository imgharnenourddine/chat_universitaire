import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ChatPage from './pages/ChatPage'

import AdminPage from './pages/AdminPage'
import HomePage from './pages/HomePage'    // ← ajoute ici

function ProtectedRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user?.role === 'ADMIN' ? children : <Navigate to="/chat" />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/home"     element={<HomePage/> } />
          <Route path="/chat"     element={
            <ProtectedRoute><ChatPage /></ProtectedRoute>
          } />
          
          <Route path="/admin"    element={
            <AdminRoute><AdminPage /></AdminRoute>
          } />
          <Route path="/"         element={<HomePage/>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}