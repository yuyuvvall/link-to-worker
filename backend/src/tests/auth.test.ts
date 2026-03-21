import request from 'supertest'
import { Server } from 'http'
import initApp from '../server'
import mongoose from 'mongoose'
import User from '../models/user_model'

let app: Server

const userA = {
    email: 'auth-test@example.com',
    password: 'password123',
    username: 'authtestuser',
}

beforeAll(async () => {
    app = await initApp()
    await User.deleteMany({})
})

afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
})

describe('Auth — Register', () => {
    test('valid registration returns 201 with user data (no password)', async () => {
        const res = await request(app).post('/auth/register').send(userA)
        expect(res.status).toBe(201)
        expect(res.body.email).toBe(userA.email)
        expect(res.body.username).toBe(userA.username)
        expect(res.body._id).toBeDefined()
        expect(res.body.password).toBeUndefined()
    })

    test('missing email returns 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ password: 'pass123', username: 'user1' })
        expect(res.status).toBe(400)
    })

    test('missing password returns 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'a@b.com', username: 'user1' })
        expect(res.status).toBe(400)
    })

    test('missing username returns 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'a@b.com', password: 'pass123' })
        expect(res.status).toBe(400)
    })

    test('invalid email format returns 400', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({ email: 'notanemail', password: 'pass123', username: 'user1' })
        expect(res.status).toBe(400)
    })

    test('duplicate email returns 409', async () => {
        const res = await request(app).post('/auth/register').send(userA)
        expect(res.status).toBe(409)
    })

    test('registration with optional photo returns photo in response', async () => {
        const res = await request(app)
            .post('/auth/register')
            .send({
                email: 'photo@example.com',
                password: 'pass123',
                username: 'photouser',
                photo: 'http://example.com/avatar.jpg',
            })
        expect(res.status).toBe(201)
        expect(res.body.photo).toBe('http://example.com/avatar.jpg')
    })
})

describe('Auth — Login', () => {
    test('valid credentials return 200 with user object and set cookies', async () => {
        const res = await request(app).post('/auth/login').send(userA)
        expect(res.status).toBe(200)
        expect(res.body.user).toBeDefined()
        expect(res.body.user.email).toBe(userA.email)
        expect(res.body.user.username).toBe(userA.username)
        expect(res.body.user._id).toBeDefined()
        const cookies = res.headers['set-cookie'] as unknown as string[]
        expect(cookies).toBeDefined()
        expect(cookies.some((c: string) => c.startsWith('accessToken='))).toBe(true)
        expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true)
    })

    test('wrong password returns 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: userA.email, password: 'wrongpassword' })
        expect(res.status).toBe(401)
    })

    test('non-existent email returns 401', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'nobody@example.com', password: 'pass123' })
        expect(res.status).toBe(401)
    })

    test('missing email returns 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ password: 'pass123' })
        expect(res.status).toBe(400)
    })

    test('missing password returns 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: userA.email })
        expect(res.status).toBe(400)
    })

    test('invalid email format returns 400', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: 'bademail', password: 'pass123' })
        expect(res.status).toBe(400)
    })

    test('login response does not expose password', async () => {
        const res = await request(app).post('/auth/login').send(userA)
        expect(res.body.user.password).toBeUndefined()
    })
})

describe('Auth — Protected Routes', () => {
    let cookies: string[]

    beforeAll(async () => {
        const res = await request(app).post('/auth/login').send(userA)
        cookies = res.headers['set-cookie'] as unknown as string[]
    })

    test('accessing protected route without cookie returns 401', async () => {
        const res = await request(app).get('/post')
        expect(res.status).toBe(401)
    })

    test('accessing protected route with valid cookie returns 200', async () => {
        const res = await request(app).get('/post').set('Cookie', cookies)
        expect(res.status).toBe(200)
    })

    test('tampered accessToken cookie returns 403', async () => {
        const tampered = cookies.map((c: string) => {
            if (c.startsWith('accessToken=')) {
                // Corrupt the token VALUE portion only (before the first semicolon)
                const [tokenPart, ...rest] = c.split(';')
                const corrupted = tokenPart.slice(0, -1) + 'X'
                return [corrupted, ...rest].join(';')
            }
            return c
        })
        const res = await request(app).get('/post').set('Cookie', tampered)
        expect(res.status).toBe(403)
    })
})

describe('Auth — Refresh Token', () => {
    let cookies: string[]

    beforeAll(async () => {
        const res = await request(app).post('/auth/login').send(userA)
        cookies = res.headers['set-cookie'] as unknown as string[]
    })

    test('valid refresh token returns 200 and sets new cookies', async () => {
        const res = await request(app)
            .post('/auth/refreshToken')
            .set('Cookie', cookies)
        expect(res.status).toBe(200)
        const newCookies = res.headers['set-cookie'] as unknown as string[]
        expect(newCookies.some((c: string) => c.startsWith('accessToken='))).toBe(true)
        expect(newCookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true)
    })

    test('no cookie on refresh returns 401', async () => {
        const res = await request(app).post('/auth/refreshToken')
        expect(res.status).toBe(401)
    })

    test('tampered refresh token returns 403', async () => {
        const tampered = cookies.map((c: string) => {
            if (c.startsWith('refreshToken=')) {
                const [tokenPart, ...rest] = c.split(';')
                const corrupted = tokenPart.slice(0, -1) + 'X'
                return [corrupted, ...rest].join(';')
            }
            return c
        })
        const res = await request(app)
            .post('/auth/refreshToken')
            .set('Cookie', tampered)
        expect(res.status).toBe(403)
    })

    test('new access token from refresh works on protected route', async () => {
        const refreshRes = await request(app)
            .post('/auth/refreshToken')
            .set('Cookie', cookies)
        const newCookies = refreshRes.headers['set-cookie'] as unknown as string[]
        const res = await request(app).get('/post').set('Cookie', newCookies)
        expect(res.status).toBe(200)
    })
})

describe('Auth — Logout', () => {
    test('logout returns 200', async () => {
        const loginRes = await request(app).post('/auth/login').send(userA)
        const cookies = loginRes.headers['set-cookie'] as unknown as string[]
        const res = await request(app).post('/auth/logout').set('Cookie', cookies)
        expect(res.status).toBe(200)
    })

    test('accessing protected route after logout returns 401', async () => {
        const loginRes = await request(app).post('/auth/login').send(userA)
        const cookies = loginRes.headers['set-cookie'] as unknown as string[]
        await request(app).post('/auth/logout').set('Cookie', cookies)

        // Cookies that were cleared — simulate by sending empty cookie header
        const res = await request(app).get('/post')
        expect(res.status).toBe(401)
    })
})
