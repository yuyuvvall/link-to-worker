// src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import RegistrationForm from './components/registration-form'
import LoginForm from './components/login-form'
import HomePage from './components/home-page'
import ProfilePage from './components/profile-page'
import ChatPage from './pages/ChatPage'

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/chat/:receiverId" element={<ChatPage />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App