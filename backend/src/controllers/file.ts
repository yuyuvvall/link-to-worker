import { Request, Response } from 'express'
import path from 'path'
import fs from 'fs'

export const uploadFile = (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'fail', message: 'No file uploaded' })
        }

        const publicDir = path.resolve('public')
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true })
        }

        const filePath = req.file.path.replace(/\\/g, '/')

        const url = `http://${process.env.DOMAIN_BASE || 'localhost'}:${process.env.PORT || 5000}/${filePath}`

        return res.status(200).json({ status: 'success', url })
    } catch (err: any) {
        console.error('File upload error:', err)
        return res.status(500).json({ status: 'error', message: 'File upload failed' })
    }
}