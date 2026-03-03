import express from 'express'
import Message from '../controllers/message'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.get('/:contactId', authMiddleware, Message.getChatHistory)

export default router