import express from 'express'
import Auth from '../controllers/auth'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthUser:
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
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account. Email must be unique and valid. Returns the created user (without password).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - username
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               photo:
 *                 type: string
 *                 description: Optional profile photo URL
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUser'
 *       400:
 *         description: Missing required fields or invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "Email, username and password are required"
 *               invalidEmail:
 *                 summary: Invalid email format
 *                 value:
 *                   message: "Invalid email format"
 *       409:
 *         description: Email is already registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Email already exists"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Something went wrong"
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email and password
 *     description: >
 *       Authenticates the user and sets two HttpOnly cookies:
 *       `accessToken` (15 min) and `refreshToken` (7 days).
 *       Use these cookies for all subsequent authenticated requests.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful. `accessToken` and `refreshToken` HttpOnly cookies are set.
 *         headers:
 *           Set-Cookie:
 *             description: Sets `accessToken` (15 min) and `refreshToken` (7 days) as HttpOnly cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "64a1f2c3e4b0a1b2c3d4e5f7"
 *                     email:
 *                       type: string
 *                       example: "user@example.com"
 *                     username:
 *                       type: string
 *                       example: "johndoe"
 *       400:
 *         description: Missing credentials or invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid email or password"
 *       401:
 *         description: Incorrect email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid email or password"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Something went wrong"
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out the current user
 *     description: Clears both `accessToken` and `refreshToken` cookies. No request body needed.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully. Both auth cookies are cleared.
 */

/**
 * @swagger
 * /auth/refreshToken:
 *   post:
 *     summary: Refresh the access token
 *     description: >
 *       Reads the `refreshToken` HttpOnly cookie and issues a new rotated pair of
 *       `accessToken` and `refreshToken` cookies. Call this endpoint when the access token expires (401).
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Tokens rotated successfully. New `accessToken` and `refreshToken` cookies are set.
 *         headers:
 *           Set-Cookie:
 *             description: New `accessToken` and `refreshToken` HttpOnly cookies
 *             schema:
 *               type: string
 *       401:
 *         description: No refresh token cookie present
 *       403:
 *         description: Refresh token is invalid, expired, or the associated user no longer exists
 */

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Sign in or register with Google
 *     description: >
 *       Verifies a Google ID token obtained from the Google Sign-In SDK.
 *       If the email is not yet registered a new account is created automatically.
 *       Sets `accessToken` and `refreshToken` HttpOnly cookies on success.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - credential
 *             properties:
 *               credential:
 *                 type: string
 *                 description: Google ID token from the Google Sign-In SDK
 *                 example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *     responses:
 *       200:
 *         description: Google authentication successful. Auth cookies are set.
 *         headers:
 *           Set-Cookie:
 *             description: Sets `accessToken` and `refreshToken` as HttpOnly cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/AuthUser'
 *       400:
 *         description: Missing credential field
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Credential is required"
 *       401:
 *         description: Invalid or unverifiable Google token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Invalid Google token"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Something went wrong"
 */

router.post('/register', Auth.register)
router.post('/login', Auth.login)
router.post('/logout', Auth.logout)
router.post('/refreshToken', Auth.refreshToken)
router.post('/google', Auth.googleLogin)

export default router
