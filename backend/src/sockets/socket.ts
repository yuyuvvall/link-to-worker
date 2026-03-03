import { Server, Socket } from 'socket.io'
import Messages from '../controllers/message'

export const initSockets = (io: Server) => {
    io.on('connection', (socket: Socket) => {
        const userId = socket.handshake.query.userId as string

        if (userId) {
            socket.join(userId)
        }

        /* ============================
           SEND MESSAGE
        ============================ */
        socket.on('send_message', async (data) => {
            try {
                const { senderId, receiverId, content } = data

                if (!senderId || !receiverId || !content) return

                const newMessage = await Messages.saveMessage(
                    senderId,
                    receiverId,
                    content
                )

                io.to(senderId)
                    .to(receiverId)
                    .emit('receive_message', newMessage)

            } catch (error) {
                console.error('Socket send_message error:', error)
            }
        })

        socket.on('disconnect', () => {
            if (userId) socket.leave(userId)
        })
    })
}