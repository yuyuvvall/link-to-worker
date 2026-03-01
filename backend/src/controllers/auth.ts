import { Request, Response } from 'express'
import User from '../models/user_model'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

type TokenInfo = { _id: string }

const sendError = (res: Response, status: number, message: string) => {
    return res.status(status).json({ message })
}

const accessCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 15 * 60 * 1000
}

const refreshCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000
}

const generateAccessToken = (userId: string) => {
    return jwt.sign(
        { _id: userId },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: process.env.JWT_TOKEN_EXPIRATION || '15m' } as SignOptions
    )
}

const generateRefreshToken = (userId: string) => {
    return jwt.sign(
        { _id: userId },
        process.env.REFRESH_TOKEN_SECRET as string,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d' } as SignOptions
    )
}

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, photo } = req.body

        if (!email || !password) {
            return sendError(res, 400, 'Email and password are required')
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return sendError(res, 409, 'User already exists')
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            email,
            password: hashedPassword,
            photo
        })

        return res.status(201).json({
            _id: user._id,
            email: user.email,
            photo: user.photo
        })
    } catch {
        return sendError(res, 500, 'Something went wrong')
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return sendError(res, 400, 'Invalid email or password')
        }

        const user = await User.findOne({ email }).select('+password +tokens')
        if (!user) {
            return sendError(res, 401, 'Invalid email or password')
        }

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) {
            return sendError(res, 401, 'Invalid email or password')
        }

        const accessToken = generateAccessToken(user._id.toString())
        const refreshToken = generateRefreshToken(user._id.toString())

        user.tokens.push(refreshToken)
        await user.save()

        res.cookie('accessToken', accessToken, accessCookieOptions)
        res.cookie('refreshToken', refreshToken, refreshCookieOptions)

        return res.status(200).json({
            user: { _id: user._id, email: user.email }
        })
    } catch {
        return sendError(res, 500, 'Something went wrong')
    }
}

const refreshToken = async (req: Request, res: Response) => {
    try {
        const oldToken = req.cookies.refreshToken
        if (!oldToken) return res.sendStatus(401)

        const decoded = jwt.verify(
            oldToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as TokenInfo

        const user = await User.findById(decoded._id).select('+tokens')
        if (!user) return res.sendStatus(403)

        if (!user.tokens.includes(oldToken)) {
            user.tokens = []
            await user.save()
            return res.sendStatus(403)
        }

        const newAccessToken = generateAccessToken(user._id.toString())
        const newRefreshToken = generateRefreshToken(user._id.toString())

        user.tokens = user.tokens.filter(t => t !== oldToken)
        user.tokens.push(newRefreshToken)
        await user.save()

        res.cookie('accessToken', newAccessToken, accessCookieOptions)
        res.cookie('refreshToken', newRefreshToken, refreshCookieOptions)

        return res.sendStatus(200)
    } catch {
        return res.sendStatus(403)
    }
}

const logout = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken
        if (!token) {
            res.clearCookie('accessToken')
            res.clearCookie('refreshToken')
            return res.sendStatus(200)
        }

        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as TokenInfo

        const user = await User.findById(decoded._id).select('+tokens')
        if (user) {
            user.tokens = user.tokens.filter(t => t !== token)
            await user.save()
        }

        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')

        return res.sendStatus(200)
    } catch {
        res.clearCookie('accessToken')
        res.clearCookie('refreshToken')
        return res.sendStatus(200)
    }
}

const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body
        if (!credential) return sendError(res, 400, 'Credential is required')

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        if (!payload?.email) {
            return sendError(res, 401, 'Invalid Google token')
        }

        let user = await User.findOne({ email: payload.email }).select('+tokens')

        if (!user) {
            const randomPassword = await bcrypt.hash(
                Math.random().toString(36).slice(-8),
                10
            )

            user = await User.create({
                email: payload.email,
                password: randomPassword,
                photo: payload.picture
            })
        }

        const accessToken = generateAccessToken(user._id.toString())
        const refreshToken = generateRefreshToken(user._id.toString())

        user.tokens.push(refreshToken)
        await user.save()

        res.cookie('accessToken', accessToken, accessCookieOptions)
        res.cookie('refreshToken', refreshToken, refreshCookieOptions)

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                photo: user.photo
            }
        })
    } catch {
        return sendError(res, 500, 'Something went wrong')
    }
}

const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.accessToken
        if (!token) return res.sendStatus(401)

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { _id: string }
        const user = await User.findById(decoded._id)
        if (!user) return res.sendStatus(404)

        return res.json({
            _id: user._id,
            email: user.email,
            photo: user.photo
        })
    } catch (err) {
        return res.sendStatus(403)
    }
}


export default {
    register,
    login,
    refreshToken,
    logout,
    googleLogin,
    getCurrentUser
}