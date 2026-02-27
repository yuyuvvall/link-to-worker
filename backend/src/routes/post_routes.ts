import express from 'express'
import PostController from '../controllers/post'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.post('/aiSearch', PostController.freeSearchPosts.bind(PostController))

export default router
