import express from 'express'
import UserController from '../controllers/user'
import authMiddleware from '../common/auth_middleware'

const router = express.Router()

router.use(authMiddleware)

router.get('/:id', UserController.getUserById)
router.patch('/', UserController.updateUser)

export default router