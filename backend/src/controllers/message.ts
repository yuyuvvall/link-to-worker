import { Request, Response } from 'express'
import { Message } from '../models/message_model'

const getChatHistory = async (req: Request, res: Response) => {
    try {
        const { userId, contactId } = req.params

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: contactId },
                { senderId: contactId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 })

        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json({ status: 'fail', message: 'Failed to fetch messages' })
    }
}

const saveMessage = async (
    senderId: string,
    receiverId: string,
    content: string
) => {
    const message = new Message({
        senderId,
        receiverId,
        content
    })

    await message.save()
    return message
}

export default {
    getChatHistory,
    saveMessage
}