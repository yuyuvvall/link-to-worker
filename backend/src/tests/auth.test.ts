import request from 'supertest'
import { Express } from 'express'
import initApp from '../server'
import mongoose from 'mongoose'
import User from '../models/user_model'

let app: Express

const testUser = {
    email: 'test@test.com',
    password: 'testpassword',
}

let accessToken: string
let refreshToken: string

beforeAll(async () => {
    app = await initApp()
    await User.deleteMany({})
})

afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
})

describe('Auth Tests', () => {
    test('1. Unauthenticated access', async () => {
        const response = await request(app).get('/post')
        expect(response.status).not.toBe(200)
    })

    test('2. Register', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send(testUser)
        expect(response.status).toBe(200)
        expect(response.body.email).toBe(testUser.email)})

    test('3. Login', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send(testUser)
        expect(response.status).toBe(200)
        expect(response.body.accessToken).toBeDefined()
        expect(response.body.refreshToken).toBeDefined()
        expect(response.body.user.email).toBe(testUser.email)
        accessToken = response.body.accessToken
        refreshToken = response.body.refreshToken
    })

    test('4. Authorized access', async () => {
        const response = await request(app)
            .get('/post')
            .set('Authorization', `JWT ${accessToken}`)
        expect(response.status).toBe(200)
    })

    test('5. Unauthorized access (bad token)', async () => {
        const tamperedToken = accessToken.slice(0, -1) + 'X'
        const response = await request(app)
            .get('/post')
            .set('Authorization', `JWT ${tamperedToken}`)
        expect(response.status).not.toBe(200)
    })

    test('6. Token timeout', async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const response = await request(app)
            .get('/post')
            .set('Authorization', `JWT ${accessToken}`)
        expect(response.status).not.toBe(200)
    })

    test('7. Refresh token', async () => {
        const response = await request(app)
            .post('/auth/refreshToken')
            .set('Authorization', `JWT ${refreshToken}`)
        expect(response.status).toBe(200)
        expect(response.body.accessToken).toBeDefined()
        expect(response.body.refreshToken).toBeDefined()

        const oldRefreshToken = refreshToken
        accessToken = response.body.accessToken
        refreshToken = response.body.refreshToken

            // Store old refresh token for later test
            ; (global as any).oldRefreshToken = oldRefreshToken
    })

    test('8. Use new access token', async () => {
        const response = await request(app)
            .get('/post')
            .set('Authorization', `JWT ${accessToken}`)
        expect(response.status).toBe(200)
    })

    test('9. Reuse old refresh token', async () => {
        const oldRefreshToken = (global as any).oldRefreshToken
        const response = await request(app)
            .post('/auth/refreshToken')
            .set('Authorization', `JWT ${oldRefreshToken}`)
        expect(response.status).toBe(403)
    })

    test('10. Logout', async () => {
        // Re-login since test 9 cleared all tokens
        const loginRes = await request(app)
            .post('/auth/login')
            .send(testUser)
        expect(loginRes.status).toBe(200)
        refreshToken = loginRes.body.refreshToken

        const response = await request(app)
            .post('/auth/logout')
            .set('Authorization', `JWT ${refreshToken}`)
        expect(response.status).toBe(200)
    })
})
