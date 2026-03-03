import express from 'express'
import PostController from '../controllers/post'

const router = express.Router()

router.post('/aiSearch', PostController.freeSearchPosts.bind(PostController))
router.get('/:authorId', PostController.getPosts.bind(PostController))

export default router
