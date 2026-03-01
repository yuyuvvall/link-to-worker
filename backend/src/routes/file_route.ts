import express from 'express'
import multer from 'multer'
import path from 'path'
import { uploadFile } from '../controllers/file'

const router = express.Router()

// Configure Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

// Generic file upload route
router.post('/', upload.single('file'), uploadFile)

export default router