import express from 'express'
import Message from '../controllers/message'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()
router.use(authMiddleware)

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Messaging API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Message unique identifier
 *           example: "64a1f2c3e4b0a1b2c3d4e5f8"
 *         senderId:
 *           type: string
 *           description: MongoDB ObjectId of the user who sent the message
 *           example: "64a1f2c3e4b0a1b2c3d4e5f7"
 *         receiverId:
 *           type: string
 *           description: MongoDB ObjectId of the user who received the message
 *           example: "64a1f2c3e4b0a1b2c3d4e5f9"
 *         content:
 *           type: string
 *           description: Text content of the message
 *           example: "Hey, how are you?"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the message was sent
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /message/{contactId}:
 *   get:
 *     summary: Get chat history with a contact
 *     description: >
 *       Returns all messages exchanged between the authenticated user and the specified contact,
 *       in both directions (sent and received). Results are sorted ascending by `createdAt`.
 *     tags: [Messages]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: contactId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the contact user
 *         example: "64a1f2c3e4b0a1b2c3d4e5f9"
 *     responses:
 *       200:
 *         description: List of messages sorted by creation time (ascending)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       401:
 *         description: Not authenticated (missing or invalid accessToken cookie)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Unauthorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to fetch messages"
 */

router.get('/:contactId', Message.getChatHistory)

export default router
