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

/**
 * @swagger
 * tags:
 *   name: Files
 *   description: File upload API
 */

/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload an image file
 *     description: >
 *       Accepts a single image upload via `multipart/form-data`.
 *       Allowed types: JPEG, PNG, WEBP, GIF. Maximum size: 5 MB.
 *       Returns the public URL of the uploaded file.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload (JPEG, PNG, WEBP, or GIF — max 5 MB)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 url:
 *                   type: string
 *                   description: Public URL of the uploaded file
 *                   example: "https://example.com/public/uploads/uuid.jpg"
 *       400:
 *         description: No file provided or unsupported file type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "fail"
 *                 message:
 *                   type: string
 *             examples:
 *               noFile:
 *                 summary: No file uploaded
 *                 value:
 *                   status: "fail"
 *                   message: "No file uploaded"
 *               invalidType:
 *                 summary: Invalid file type
 *                 value:
 *                   status: "fail"
 *                   message: "Invalid file type"
 *       500:
 *         description: File upload failed due to a server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "error"
 *                 message:
 *                   type: string
 *                   example: "File upload failed"
 */

router.post('/', upload.single('file'), uploadFile)

export default router
