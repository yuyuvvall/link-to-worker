import express from 'express'
import PostController from '../controllers/post'

const router = express.Router()

router.post('/aiSearch', PostController.freeSearchPosts.bind(PostController))

export default router
