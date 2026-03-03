import { useState, useEffect, useRef, useCallback } from 'react'
import { io, type Socket } from 'socket.io-client'
import messageService from '../../services/message-service'
import userService from '../../services/user-service'
import type { IMessage, ChatProps } from '../../types/chat'
import './Chat.css'

const SOCKET_URL = import.meta.env.VITE_API_URL

const Chat = ({ currentUserId, targetUserId }: ChatProps) => {
    const [messages, setMessages] = useState<IMessage[]>([])
    const [inputValue, setInputValue] = useState('')
    const [targetUserName, setTargetUserName] = useState<string>('')
    const socketRef = useRef<Socket | null>(null)
    const scrollRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!targetUserId) return
        const fetchUser = async () => {
            try {
                const user = await userService.getUserProfile(targetUserId)
                setTargetUserName(user.username || user.email)
            } catch (err) {
                console.error('Failed to fetch target user info:', err)
            }
        }
        fetchUser()
    }, [targetUserId])

    useEffect(() => {
        if (!targetUserId) return
        const { request, cancel } = messageService.getChatHistory(targetUserId)
        request
            .then(res => setMessages(res.data))
            .catch(err => {
                if (err.name !== 'CanceledError') console.error(err)
            })
        return cancel
    }, [targetUserId])

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'], withCredentials: true })
        socketRef.current = socket

        const handleReceiveMessage = (message: IMessage) => {
            const isRelevant =
                (message.senderId === currentUserId && message.receiverId === targetUserId) ||
                (message.senderId === targetUserId && message.receiverId === currentUserId)
            if (!isRelevant) return

            setMessages(prev => {
                if (message._id && prev.some(m => m._id === message._id)) return prev
                return [...prev, message]
            })
        }

        socket.on('receive_message', handleReceiveMessage)
        return () => {
            socket.off('receive_message', handleReceiveMessage)
            socket.disconnect()
        }
    }, [currentUserId, targetUserId])

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }, [messages])

    const sendMessage = useCallback(
        (e: React.SyntheticEvent<HTMLFormElement>) => {
            e.preventDefault()
            const content = inputValue.trim()
            if (!content || !socketRef.current) return
            socketRef.current.emit('send_message', { receiverId: targetUserId, content })
            setInputValue('')
        },
        [inputValue, targetUserId]
    )

    const groupedMessages = messages.reduce<Record<string, IMessage[]>>((acc, msg) => {
        const day = msg.createdAt ? new Date(msg.createdAt).toDateString() : 'Unknown'
        if (!acc[day]) acc[day] = []
        acc[day].push(msg)
        return acc
    }, {})

    const sortedDays = Object.keys(groupedMessages).sort(
        (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )

    return (
        <div className="chat-page">
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-user">
                        <div className="avatar">{targetUserName?.charAt(0).toUpperCase()}</div>
                        <div className="username">{targetUserName}</div>
                    </div>
                </div>

                <div className="messages-container" ref={scrollRef}>
                    {sortedDays.map(day => (
                        <div key={day}>
                            <div className="chat-date">{day}</div>
                            {groupedMessages[day].map(msg => {
                                const isSent = msg.senderId === currentUserId
                                const time = msg.createdAt
                                    ? new Date(msg.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : ''
                                return (
                                    <div key={msg._id} className={`message-row ${isSent ? 'sent' : 'received'}`}>
                                        <div className="message-bubble">
                                            <div className="message-content">{msg.content}</div>
                                            <div className="message-time">{time}</div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>

                <form className="chat-footer" onSubmit={sendMessage}>
                    <input
                        className="chat-input"
                        value={inputValue}
                        onChange={e => setInputValue(e.currentTarget.value)}
                        placeholder="Type a message..."
                    />
                    <button type="submit" className="send-button" disabled={!inputValue.trim()}>
                        Send
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Chat