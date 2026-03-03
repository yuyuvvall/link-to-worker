import { Routes, Route, Navigate, useParams } from 'react-router-dom'
import RegistrationForm from './components/registration-form'
import LoginForm from './components/login-form'
import HomePage from './components/home-page'
import ProfilePage from './components/profile-page'
import Chat from './components/Chat/Chat'

const ChatPageRoute = () => {
  const { senderId, receiverId } = useParams<{ senderId: string; receiverId: string }>();

  if (!senderId || !receiverId) return <Navigate to="/home" />;

  return (
    <div className="chat-wrapper">
      <Chat
        currentUserId={senderId}
        targetUserId={receiverId}
        targetUserName="User"
      />
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegistrationForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile/:userId" element={<ProfilePage />} />
      <Route path="/chat/:senderId/:receiverId" element={<ChatPageRoute />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App