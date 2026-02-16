import express, { Request, Response } from 'express'
import multer from 'multer'
import path from 'path'

const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/')
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage })

router.post('/', upload.single('file'), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send({ status: 'fail', message: 'No file uploaded' })
    }

    // Fix Windows backslash issue
    const filePath = req.file.path.replace(/\\/g, '/')
    const url = `http://${process.env.DOMAIN_BASE}:${process.env.PORT}/${filePath}`

    return res.status(200).send({ url })
})

export default router
