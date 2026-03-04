import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { uploadFile } from '../controllers/file'

const router = express.Router()
const uploadDir = path.resolve('public/uploads')
fs.mkdirSync(uploadDir, { recursive: true })

const ALLOWED_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase()
        const name = crypto.randomUUID()
        cb(null, `${name}${ext}`)
    }
})

const fileFilter: multer.Options['fileFilter'] = (_, file, cb) => {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
        return cb(new Error('Invalid file type'))
    }
    cb(null, true)
}

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_FILE_SIZE }
})

router.post('/', upload.single('file'), uploadFile)

export default router