import { Request, Response } from 'express'
import fs from 'fs'

export const uploadFile = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded' })
        }

        const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

        if (!ALLOWED_TYPES.includes(req.file.mimetype)) {
            fs.unlinkSync(req.file.path)
            return res.status(400).json({ status: 'fail', message: 'Invalid file type' })
        }

        const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`
        const fileUrl = `${baseUrl}/public/uploads/${req.file.filename}`

        return res.json({ status: 'success', url: fileUrl })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ status: 'error', message: 'File upload failed' })
    }
}