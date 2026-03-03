import express from 'express'
import Message from '../controllers/message'

const router = express.Router()

router.get('/:userId/:contactId', Message.getChatHistory)

export default router