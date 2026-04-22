import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRouter from './routes/auth_route'
import fileRouter from './routes/file_route'
import postRouter from './routes/post_routes'
import messageRouter from './routes/message_route'
import userRouter from './routes/user_route'
import { initSockets } from './sockets/socket'
import swaggerUi from 'swagger-ui-express'
import { specs } from './swagger'

dotenv.config()

const initApp = async (): Promise<http.Server | https.Server> => {
    const app = express()

    app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
    }))

    app.use(cookieParser())
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use('/public', express.static('public'))

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

    app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.status(500).json({ status: 'fail', message: err.message })
    })

    await mongoose.connect(process.env.DB_CONNECTION as string)

    let server: http.Server | https.Server

    if (process.env.NODE_ENV === 'production') {
        const options = {
            key: fs.readFileSync("../../certs/client-key.pem"),
            cert: fs.readFileSync("../../certs/client-cert.pem"),
        }

        server = https.createServer(options, app)
        console.log('Running in PRODUCTION (HTTPS)')
    } else {
        server = http.createServer(app)
        console.log('Running in DEVELOPMENT (HTTP)')
    }

    const io = new Server(server, {
        cors: {
            origin: 'http://localhost:5173',
            methods: ['GET', 'POST']
        },
    })

    initSockets(io)

    return server
}

export default initApp