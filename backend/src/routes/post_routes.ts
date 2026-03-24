import express from 'express'
import PostController from '../controllers/post'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: Posts API
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
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Post unique identifier
 *           example: "64a1f2c3e4b0a1b2c3d4e5f6"
 *         title:
 *           type: string
 *           description: Post title
 *           example: "My first post"
 *         content:
 *           type: string
 *           description: Post content body
 *           example: "This is the content of my post."
 *         photoUrl:
 *           type: string
 *           description: Optional URL of an attached photo
 *           example: "https://example.com/photo.jpg"
 *         authorId:
 *           type: string
 *           description: ID of the user who created the post
 *           example: "64a1f2c3e4b0a1b2c3d4e5f7"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Human-readable error message
 *           example: "Not authorized"
 */

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post for the authenticated user. Title and content are required.
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "My first post"
 *               content:
 *                 type: string
 *                 example: "This is the content of my post."
 *               photoUrl:
 *                 type: string
 *                 example: "https://example.com/photo.jpg"
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing required fields (title or content)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Title and content are required"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Not authorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to create post"
 */

/**
 * @swagger
 * /post/aiSearch:
 *   post:
 *     summary: AI-powered free text search for posts
 *     description: Performs a semantic / free-text AI search over all posts. Does not require authentication.
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: Natural language search query
 *                 example: "posts about nodejs performance"
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Get all posts (paginated)
 *     description: Returns a paginated list of all posts with like status for the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (default = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Number of posts per page (min 1, max 50, default = 5)
 *     responses:
 *       200:
 *         description: Paginated list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               msg: "Not authorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to get posts"
 */

/**
 * @swagger
 * /post/{authorId}:
 *   get:
 *     summary: Get posts by author ID (paginated)
 *     description: Returns a paginated list of posts filtered by a specific author. Includes like status for the authenticated user.
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: authorId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the author
 *         example: "64a1f2c3e4b0a1b2c3d4e5f7"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (default = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 5
 *         description: Number of posts per page (min 1, max 50, default = 5)
 *     responses:
 *       200:
 *         description: Paginated list of posts by the specified author
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               msg: "Not authorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to get posts"
 */

/**
 * @swagger
 * /post/like/{id}:
 *   put:
 *     summary: Toggle like on a post
 *     description: Adds a like to the post if the user has not liked it yet, or removes it if they already have (toggle behavior).
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the post to like/unlike
 *         example: "64a1f2c3e4b0a1b2c3d4e5f6"
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 liked:
 *                   type: boolean
 *                   description: true if the post is now liked, false if the like was removed
 *                   example: true
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msg:
 *                   type: string
 *                   example: "Not authorized"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 */

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post
 *     description: Updates an existing post. Only the original author can update their own post.
 *     tags: [Posts]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the post to update
 *         example: "64a1f2c3e4b0a1b2c3d4e5f6"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated post title"
 *               content:
 *                 type: string
 *                 example: "Updated post content."
 *               photoUrl:
 *                 type: string
 *                 example: "https://example.com/new-photo.jpg"
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing required fields (title or content)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Title and content are required"
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Not authorized"
 *       403:
 *         description: Post not found or user is not the author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Post not found or not authorized to edit"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               message: "Failed to update post"
 */

router.post('/', authMiddleware, PostController.createPost.bind(PostController))
router.post('/aiSearch', PostController.freeSearchPosts.bind(PostController))
router.get('/',authMiddleware, PostController.getPosts.bind(PostController))
router.get('/:authorId',authMiddleware, PostController.getPosts.bind(PostController))
router.post('/comment/:id', authMiddleware, PostController.addComment.bind(PostController))
router.put('/like/:id',authMiddleware,PostController.ToggleLike.bind(PostController))
router.put('/:id', authMiddleware, PostController.updatePost.bind(PostController))
export default router
