import { Request, Response } from 'express'
import User from '../models/user_model'
import bcrypt from 'bcrypt'
import jwt, { SignOptions } from 'jsonwebtoken'
import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

type TokenInfo = { _id: string }

const sendError = (res: Response, msg?: string) => {
    return res.status(400).send({ status: 'fail', message: msg })
}

const getTokenFromRequest = (req: Request): string | null => {
    const authHeader = req.headers['authorization']
    if (!authHeader) return null
    return authHeader.split(' ')[1] || null
}

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, photo } = req.body

        if (!email || !password) {
            return sendError(res, 'Email and password are required')
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return sendError(res, 'User already exists')
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const user = await User.create({
            email,
            password: hashedPassword,
            photo
        })

        return res.status(200).send(user)
    } catch (err) {
        return sendError(res, (err as Error).message)
    }
}

const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        const user = await User.findOne({ email }).select('+password +tokens')
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' })
        }

        if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
            return res.status(500).json({ message: 'Server configuration error' })
        }

        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn: process.env.JWT_TOKEN_EXPIRATION || '15m'
            } as SignOptions
        )

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '7d'
            } as SignOptions
        )

        user.tokens.push(refreshToken)
        await user.save()

        return res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                _id: user._id,
                email: user.email
            }
        })
    } catch {
        return res.status(500).json({ message: 'Something went wrong' })
    }
}

const refreshToken = async (req: Request, res: Response) => {
    try {
        const oldRefreshToken = getTokenFromRequest(req)

        if (!oldRefreshToken) {
            return res.sendStatus(401)
        }

        jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err, decoded) => {
            if (err) {
                return res.status(403).send(err.message)
            }

            const tokenInfo = decoded as TokenInfo
            const user = await User.findById(tokenInfo._id)

            if (!user) {
                return res.status(403).send('User not found')
            }

            if (!user.tokens.includes(oldRefreshToken)) {
                user.tokens = []
                await user.save()
                return res.status(403).send('Invalid refresh token')
            }

            const accessToken = jwt.sign(
                { _id: user._id },
                process.env.ACCESS_TOKEN_SECRET as string,
                { expiresIn: process.env.JWT_TOKEN_EXPIRATION } as SignOptions
            )

            const newRefreshToken = jwt.sign(
                { _id: user._id },
                process.env.REFRESH_TOKEN_SECRET as string
            )

            const tokenIndex = user.tokens.indexOf(oldRefreshToken)
            user.tokens[tokenIndex] = newRefreshToken
            await user.save()

            return res.status(200).send({ accessToken, refreshToken: newRefreshToken })
        })
    } catch (err) {
        return sendError(res, (err as Error).message)
    }
}

const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = getTokenFromRequest(req)

        if (!refreshToken) {
            return res.sendStatus(401)
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string, async (err, decoded) => {
            if (err) {
                return res.status(403).send(err.message)
            }

            const tokenInfo = decoded as TokenInfo
            const user = await User.findById(tokenInfo._id)

            if (!user) {
                return res.status(403).send('User not found')
            }

            if (!user.tokens.includes(refreshToken)) {
                user.tokens = []
                await user.save()
                return res.status(403).send('Invalid refresh token')
            }

            const tokenIndex = user.tokens.indexOf(refreshToken)
            user.tokens.splice(tokenIndex, 1)
            await user.save()

            return res.status(200).send('Logged out successfully')
        })
    } catch (err) {
        return sendError(res, (err as Error).message)
    }
}

const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body

        if (!credential) {
            return sendError(res, 'Credential is required')
        }

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        if (!payload || !payload.email) {
            return sendError(res, 'Invalid Google token')
        }

        const email = payload.email
        const name = payload.name || email
        const picture = payload.picture

        let user = await User.findOne({ email })

        if (!user) {
            const randomPassword = Math.random().toString(36).slice(-8)
            const salt = await bcrypt.genSalt(10)
            const hashedPassword = await bcrypt.hash(randomPassword, salt)

            user = await User.create({
                email,
                password: hashedPassword,
                photo: picture
            })
        }

        const accessToken = jwt.sign(
            { _id: user._id },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: process.env.JWT_TOKEN_EXPIRATION } as SignOptions
        )

        const refreshToken = jwt.sign(
            { _id: user._id },
            process.env.REFRESH_TOKEN_SECRET as string
        )

        user.tokens.push(refreshToken)
        await user.save()

        return res.status(200).send({ accessToken, refreshToken })
    } catch (err) {
        return sendError(res, (err as Error).message)
    }
}

export default {
    register,
    login,
    refreshToken,
    logout,
    googleLogin
}
