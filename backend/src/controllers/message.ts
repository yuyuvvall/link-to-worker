import { Response } from 'express'
import { Message } from '../models/message_model'
import { AuthenticatedRequest } from '../common/auth_middleware'

const sendError = (res: Response, status: number, message: string) => {
    return res.status(status).json({ message })
}

const getChatHistory = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const senderId = req.user?._id
        const { contactId } = req.params
        if (!senderId) return sendError(res, 401, 'Unauthorized')

        const messages = await Message.find({
            $or: [
                { senderId, receiverId: contactId },
                { senderId: contactId, receiverId: senderId }
            ]
        }).sort({ createdAt: 1 })

        res.status(200).json(messages)
    } catch (error: any) {
        sendError(res, 500, 'Failed to fetch messages')
    }
}

const saveMessage = async (senderId: string, receiverId: string, content: string, authenticatedUserId: string) => {
    if (senderId !== authenticatedUserId) throw new Error('Unauthorized sender')
    if (senderId === receiverId) throw new Error('Cannot send message to yourself')

    const message = new Message({ senderId, receiverId, content })
    await message.save()
    return message
}

export default { getChatHistory, saveMessage }