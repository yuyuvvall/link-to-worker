import { useParams, Navigate } from 'react-router-dom'
import ProfilePage from '../components/profile-page'

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>()
  if (!userId) return <Navigate to="/home" replace />
  return <ProfilePage userId={userId} />
}

export default UserProfilePage
