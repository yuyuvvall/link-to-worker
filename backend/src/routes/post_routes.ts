import express from 'express'
import Post from '../controllers/post'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.get('/', authMiddleware, Post.getPosts)

export default router
