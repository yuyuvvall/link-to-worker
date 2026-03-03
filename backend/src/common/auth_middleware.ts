import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
    user?: { _id: string }
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const token = req.cookies?.accessToken

    if (!token) {
        return res.sendStatus(401)
    }

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as { _id: string }
        req.user = decoded
        console.log(decoded);
        next()
    } catch (err: any) {
        return res.status(403).send(err.message)
    }
}

export default authMiddleware