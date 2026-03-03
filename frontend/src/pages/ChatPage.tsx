import { useEffect, useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import Chat from '../components/Chat/Chat'
import userService from '../services/user-service'
import type { UserResponse } from '../types/user'

const ChatPage = () => {
    const { receiverId } = useParams<{ receiverId: string }>()
    const [currentUser, setCurrentUser] = useState<UserResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [receiverExists, setReceiverExists] = useState(true)

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const user = await userService.getCurrentUser()
                setCurrentUser(user)
            } catch (err) {
                console.error('Failed to fetch current user', err)
            }
        }

        const checkReceiver = async () => {
            if (!receiverId) {
                setReceiverExists(false)
                return
            }
            try {
                await userService.getUserProfile(receiverId)
                setReceiverExists(true)
            } catch (err) {
                console.warn('Receiver user not found:', err)
                setReceiverExists(false)
            }
        }

        const initialize = async () => {
            await fetchCurrentUser()
            await checkReceiver()
            setLoading(false)
        }

        initialize()
    }, [receiverId])

    if (loading) return <div>Loading...</div>

    if (!receiverId || !receiverExists || !currentUser || receiverId === currentUser._id) {
        return <Navigate to="/home" replace />
    }

    return (
        <div className="chat-wrapper">
            <Chat
                currentUserId={currentUser._id}
                targetUserId={receiverId}
            />
        </div>
    )
}

export default ChatPage