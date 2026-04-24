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
    // httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    // sameSite: 'lax' as const,
    maxAge: 15 * 60 * 1000
}

const refreshCookieOptions = {
    // httpOnly: true,
    // secure: process.env.NODE_ENV === 'production',
    // sameSite: 'lax' as const,
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

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const register = async (req: Request, res: Response) => {
    try {
        const { email, password, username, photo } = req.body

        if (!email || !password || !username) return sendError(res, 400, 'Email, username and password are required')
        if (!emailRegex.test(email)) return sendError(res, 400, 'Invalid email format')

        const existingUser = await User.findOne({ email });
        if (existingUser) return sendError(res, 409, 'Email already exists');

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({ email, password: hashedPassword, username, photo: photo })

        return res.status(201).json({ _id: user._id, email: user.email, username: user.username, photo: user.photo })
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

        if (!emailRegex.test(email)) {
            return sendError(res, 400, 'Invalid email format')
        }

        const user = await User.findOne({ email }).select('+password')
        if (!user) return sendError(res, 401, 'Invalid email or password')

        const isValid = await bcrypt.compare(password, user.password)
        if (!isValid) return sendError(res, 401, 'Invalid email or password')

        const accessToken = generateAccessToken(user._id.toString())
        const refreshToken = generateRefreshToken(user._id.toString())

        res.cookie('accessToken', accessToken, accessCookieOptions)
        res.cookie('refreshToken', refreshToken, refreshCookieOptions)

        return res.status(200).json({
            user: { _id: user._id, email: user.email, username: user.username }
        })
    } catch {
        return sendError(res, 500, 'Something went wrong')
    }
}

const refreshToken = async (req: Request, res: Response) => {
    try {
        const token = req.cookies.refreshToken
        if (!token) return res.sendStatus(401)

        const decoded = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as TokenInfo

        const user = await User.findById(decoded._id)
        if (!user) return res.sendStatus(403)

        const newAccessToken = generateAccessToken(user._id.toString())
        const newRefreshToken = generateRefreshToken(user._id.toString())

        res.cookie('accessToken', newAccessToken, accessCookieOptions)
        res.cookie('refreshToken', newRefreshToken, refreshCookieOptions)

        return res.sendStatus(200)
    } catch {
        return res.sendStatus(403)
    }
}

const logout = async (_req: Request, res: Response) => {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    return res.sendStatus(200)
}

const googleLogin = async (req: Request, res: Response) => {
    try {
        const { credential } = req.body;
        if (!credential) return sendError(res, 400, 'Credential is required');

        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload?.email) return sendError(res, 401, 'Invalid Google token');

        let user = await User.findOne({ email: payload.email });

        if (!user) {
            const randomPassword = await bcrypt.hash(
                Math.random().toString(36).slice(-8),
                10
            );

            user = await User.create({
                email: payload.email,
                password: randomPassword,
                username: payload.name,
                photo: payload.picture
            });
        }

        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        res.cookie('accessToken', accessToken, accessCookieOptions);
        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        return res.status(200).json({
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                photo: user.photo
            }
        });
    } catch {
        return sendError(res, 500, 'Something went wrong');
    }
};

export default {
    register,
    login,
    refreshToken,
    logout,
    googleLogin,
}