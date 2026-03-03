import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Chat from '../components/Chat/Chat'
import authService, { type UserResponse } from '../services/auth-service'

const ChatPage = () => {
    const { receiverId } = useParams<{ receiverId: string }>()
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser()
                setCurrentUser(user)
            } catch (err) {
                console.error('Failed to fetch current user', err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    if (loading) return <div>Loading...</div>

    // TODO: check if receiverId is exist... if not - navigate to home
    if (!receiverId || !currentUser || receiverId === currentUser._id) {
        return <Navigate to="/home" replace />
    }

    return (
        <div className="chat-wrapper">
            <Chat
                currentUserId={currentUser._id}
                targetUserId={receiverId}
                targetUserName="User"
            />
        </div>
    )
}

export default ChatPage