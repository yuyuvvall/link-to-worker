import { Routes, Route, Navigate } from 'react-router-dom'
import RegistrationForm from './components/RegistrationForm'
import LoginForm from './components/LoginForm'
import Home from './components/Home'

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
