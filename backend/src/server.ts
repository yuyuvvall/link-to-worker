import express, { Express, Request, Response, NextFunction } from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth_route'
import fileRouter from './routes/file_route'
import postRouter from './routes/post_routes'

// Load environment variables
if (process.env.NODE_ENV === 'test') {
    dotenv.config({ path: './.testenv' })
} else {
    dotenv.config()
}

const initApp = async (): Promise<Express> => {
    const app = express()

    // Middleware
    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }))
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use('/public', express.static('public'))

    // Routes
    app.use('/auth', authRouter)
    app.use('/file', fileRouter)
    app.use('/post', postRouter)

    // Global error handler
    app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack)
        res.status(500).send({ status: 'fail', message: err.message })
    })

    // Connect to MongoDB
    await mongoose.connect(process.env.DB_CONNECTION as string)
    console.log('Connected to MongoDB')

    return app
}

export default initApp
