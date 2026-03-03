import { Server, Socket } from 'socket.io'
import * as cookie from 'cookie'
import jwt from 'jsonwebtoken'
import Messages from '../controllers/message'

export const initSockets = (io: Server) => {
    io.use((socket: Socket, next) => {
        const cookieHeader = socket.handshake.headers.cookie
        if (!cookieHeader) return next(new Error('Unauthorized'))

        const cookies = cookie.parse(cookieHeader)
        const token = cookies.accessToken
        if (!token) return next(new Error('Unauthorized'))

        try {
            const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { _id: string }
            socket.data.userId = user._id
            next()
        } catch {
            next(new Error('Unauthorized'))
        }
    })

    io.on('connection', socket => {
        const userId = socket.data.userId as string
        socket.join(userId)

        socket.on('send_message', async data => {
            const { receiverId, content } = data
            if (!receiverId || !content) return

            try {
                const message = await Messages.saveMessage(userId, receiverId, content, userId)
                io.to(userId).to(receiverId).emit('receive_message', message)
            } catch (err: any) {
                console.error('Socket error:', err.message)
            }
        })

        socket.on('disconnect', () => {
            socket.leave(userId)
        })
    })
}
