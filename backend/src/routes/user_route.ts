import express from 'express'
import UserController from '../controllers/user'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.use(authMiddleware)

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Users API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: accessToken
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User unique identifier
 *           example: "64a1f2c3e4b0a1b2c3d4e5f7"
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *           example: "user@example.com"
 *         username:
 *           type: string
 *           description: Display name
 *           example: "johndoe"
 *         photo:
 *           type: string
 *           description: Profile photo URL
 *           example: "https://example.com/avatar.jpg"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get the currently authenticated user
 *     description: Returns the full profile of the logged-in user (password excluded).
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated (missing or invalid accessToken cookie)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /user:
 *   patch:
 *     summary: Update the current user's profile
 *     description: >
 *       Updates any fields on the authenticated user's document.
 *       The fields `email`, `password`, and `_id` are silently ignored even if sent.
 *       Returns the updated user (password excluded).
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Any user fields to update. email, password, and _id are ignored.
 *             additionalProperties: true
 *             properties:
 *               username:
 *                 type: string
 *                 example: "newUsername"
 *               photo:
 *                 type: string
 *                 example: "https://example.com/new-avatar.jpg"
 *             example:
 *               username: "newUsername"
 *               photo: "https://example.com/new-avatar.jpg"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authenticated
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
 *               message: "Internal server error"
 */

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID
 *     description: Returns a user's public profile by their MongoDB ObjectId (password excluded). Returns 404 for invalid ObjectId format as well.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the user
 *         example: "64a1f2c3e4b0a1b2c3d4e5f7"
 *     responses:
 *       200:
 *         description: User profile (password excluded)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found or invalid ObjectId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Internal server error"
 */

router.get('/me', UserController.getCurrentUser)
router.patch('/', UserController.updateUser)
router.get('/:id', UserController.getUserById)

export default router
