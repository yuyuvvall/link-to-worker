import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import authMiddleware, { AuthenticatedRequest } from '../common/auth_middleware'

const SECRET = 'test-middleware-secret'

beforeAll(() => {
    process.env.ACCESS_TOKEN_SECRET = SECRET
})

const makeReq = (cookieValue?: string): AuthenticatedRequest => {
    return {
        cookies: cookieValue ? { accessToken: cookieValue } : {},
    } as AuthenticatedRequest
}

const makeRes = () => {
    const res = {
        sendStatus: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
        send: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    } as unknown as Response
    return res
}

const makeNext = () => jest.fn() as NextFunction

describe('authMiddleware — Unit Tests', () => {
    test('no accessToken cookie returns 401 and does not call next', () => {
        const req = makeReq()
        const res = makeRes()
        const next = makeNext()

        authMiddleware(req, res, next)

        expect((res.sendStatus as jest.Mock).mock.calls[0][0]).toBe(401)
        expect(next).not.toHaveBeenCalled()
    })

    test('valid token calls next and sets req.user._id', () => {
        const token = jwt.sign({ _id: 'user123' }, SECRET, { expiresIn: '1h' })
        const req = makeReq(token)
        const res = makeRes()
        const next = makeNext()

        authMiddleware(req, res, next)

        expect(next).toHaveBeenCalled()
        expect(req.user?._id).toBe('user123')
    })

    test('tampered token returns 403 and does not call next', () => {
        const token = jwt.sign({ _id: 'user123' }, SECRET, { expiresIn: '1h' })
        const tampered = token.slice(0, -1) + 'X'
        const req = makeReq(tampered)
        const res = makeRes()
        const next = makeNext()

        authMiddleware(req, res, next)

        expect((res.status as jest.Mock).mock.calls[0][0]).toBe(403)
        expect(next).not.toHaveBeenCalled()
    })

    test('token signed with wrong secret returns 403', () => {
        const token = jwt.sign({ _id: 'user123' }, 'wrong-secret', { expiresIn: '1h' })
        const req = makeReq(token)
        const res = makeRes()
        const next = makeNext()

        authMiddleware(req, res, next)

        expect((res.status as jest.Mock).mock.calls[0][0]).toBe(403)
        expect(next).not.toHaveBeenCalled()
    })

    test('expired token returns 403', async () => {
        const token = jwt.sign({ _id: 'user123' }, SECRET, { expiresIn: '1ms' })
        await new Promise((r) => setTimeout(r, 10))

        const req = makeReq(token)
        const res = makeRes()
        const next = makeNext()

        authMiddleware(req, res, next)

        expect((res.status as jest.Mock).mock.calls[0][0]).toBe(403)
        expect(next).not.toHaveBeenCalled()
    })

    test('req.user._id is set correctly from token payload', () => {
        const expectedId = 'abc123xyz'
        const token = jwt.sign({ _id: expectedId }, SECRET, { expiresIn: '1h' })
        const req = makeReq(token)
        const res = makeRes()
        const next = makeNext()

        authMiddleware(req, res, next)

        expect(req.user?._id).toBe(expectedId)
    })
})
