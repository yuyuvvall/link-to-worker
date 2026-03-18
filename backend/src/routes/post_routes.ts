import express from 'express'
import PostController from '../controllers/post'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.post('/', authMiddleware, PostController.createPost.bind(PostController))
router.post('/aiSearch', PostController.freeSearchPosts.bind(PostController))
router.get('/:authorId',authMiddleware, PostController.getPosts.bind(PostController))
router.put('/like/:id',authMiddleware,PostController.ToggleLike.bind(PostController))
export default router
