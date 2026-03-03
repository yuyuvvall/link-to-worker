import express from 'express'
import Message from '../controllers/message'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()
router.use(authMiddleware)

router.get('/:contactId', Message.getChatHistory)

export default router