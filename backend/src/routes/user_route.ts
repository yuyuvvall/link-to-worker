import express from 'express'
import UserController from '../controllers/user'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.use(authMiddleware)

router.get('/me', UserController.getCurrentUser)
router.patch('/', UserController.updateUser)
router.get('/:id', UserController.getUserById)

export default router