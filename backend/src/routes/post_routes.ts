import express from 'express'
import PostController from '../controllers/post'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.post('/', authMiddleware, PostController.createPost.bind(PostController))
router.post('/aiSearch', PostController.freeSearchPosts.bind(PostController))
router.get('/',authMiddleware, PostController.getPosts.bind(PostController))
router.get('/:authorId',authMiddleware, PostController.getPosts.bind(PostController))
router.post('/comment/:id', authMiddleware, PostController.addComment.bind(PostController))
router.put('/like/:id',authMiddleware,PostController.ToggleLike.bind(PostController))
router.put('/:id', authMiddleware, PostController.updatePost.bind(PostController))
export default router
