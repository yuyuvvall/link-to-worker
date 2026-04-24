import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import authRouter from './routes/auth_route'
import fileRouter from './routes/file_route'
import postRouter from './routes/post_routes'
import messageRouter from './routes/message_route'
import userRouter from './routes/user_route'

import { initSockets } from './sockets/socket'

import swaggerUi from 'swagger-ui-express'
import { specs } from './swagger'

dotenv.config()

const initApp = async (): Promise<http.Server> => {
    const app = express()

    app.use(cors({
        origin: true,
        credentials: true
    }))

    app.use((req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups")
        res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none")
        next()
    })

    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))

    app.use('/public', express.static(path.join(__dirname, 'public')))

    app.use(express.static(path.join(__dirname, 'public')))

    app.use('/auth', authRouter)
    app.use('/file', fileRouter)
    app.use('/post', postRouter)
    app.use('/message', messageRouter)
    app.use('/user', userRouter)

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
        swaggerOptions: {
            withCredentials: true
        }
    }))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'))
    })

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(500).json({ status: 'fail', message: err.message })
    })

    await mongoose.connect(process.env.DB_CONNECTION as string)

    const server = http.createServer(app)

    const io = new Server(server, {
        cors: {
            origin: true,
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    initSockets(io)

    return server
}

export default initApp