import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Chat from '../components/Chat/Chat'
import userService from '../services/user-service'
import type { UserResponse } from '../types/user'

const ChatPage = () => {
    const { userId } = useParams<{ userId: string }>()
    const navigate = useNavigate()
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const initialize = async () => {
            if (!userId) {
                navigate('/home', { replace: true })
                return
            }

            let user: UserResponse
            try {
                user = await userService.getCurrentUser()
            } catch {
                navigate('/login', { replace: true })
                return
            }

            if (user._id === userId) {
                navigate('/profile', { replace: true })
                return
            }

            try {
                await userService.getUserProfile(userId)
            } catch {
                navigate('/home', { replace: true })
                return
            }

            setCurrentUser(user)
            setLoading(false)
        }

        initialize()
    }, [userId, navigate])

    if (loading || !currentUser) return <div>Loading...</div>

    return (
        <div className="chat-wrapper">
            <Chat
                currentUserId={currentUser._id}
                targetUserId={userId!}
            />
        </div>
    )
}

export default ChatPage