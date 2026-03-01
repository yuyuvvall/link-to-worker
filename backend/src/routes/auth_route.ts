import express from 'express'
import Auth from '../controllers/auth'

const router = express.Router()

router.post('/register', Auth.register)
router.post('/login', Auth.login)
router.post('/logout', Auth.logout)
router.post('/refreshToken', Auth.refreshToken)
router.post('/google', Auth.googleLogin)
router.get('/me', Auth.getCurrentUser)

export default router
