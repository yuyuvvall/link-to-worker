import express from 'express'
import http from 'http'
import https from 'https'
import fs from 'fs'
import { Server } from 'socket.io'
import dotenv from 'dotenv'
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
import path from 'path'

dotenv.config()

const initApp = async (): Promise<http.Server> => {
    const app = express()

    const allowedOrigins = [
        'http://node04.cs.colman.ac.il'
    ];

    app.use(cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error('CORS Error'));
            }
        },
        credentials: true
    }))

    app.use((req, res, next) => {
        res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none")
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
            origin: allowedOrigins,
            methods: ['GET', 'POST'],
            credentials: true
        }
    })

    initSockets(io)

    return server
}

export default initApp