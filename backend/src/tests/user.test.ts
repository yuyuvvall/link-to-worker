import request from 'supertest'
import { Server } from 'http'
import initApp from '../server'
import mongoose from 'mongoose'
import User from '../models/user_model'
import { registerAndLogin } from './helpers/auth-helper'

let app: Server

const testUser = {
    email: 'user-test@example.com',
    password: 'password123',
    username: 'usertestuser',
}

let cookies: string[]
let userId: string

beforeAll(async () => {
    app = await initApp()
    await User.deleteMany({})
    const result = await registerAndLogin(app, testUser)
    cookies = result.cookies
    userId = result.userId
})

afterAll(async () => {
    await User.deleteMany({})
    await mongoose.connection.close()
})

describe('Users — Get Current User', () => {
    test('get own profile without auth returns 401', async () => {
        const res = await request(app).get('/user/me')
        expect(res.status).toBe(401)
    })

    test('get own profile with auth returns 200 with user data', async () => {
        const res = await request(app).get('/user/me').set('Cookie', cookies)
        expect(res.status).toBe(200)
        expect(res.body.email).toBe(testUser.email)
        expect(res.body.username).toBe(testUser.username)
        expect(res.body._id).toBeDefined()
    })

    test('response does not contain password field', async () => {
        const res = await request(app).get('/user/me').set('Cookie', cookies)
        expect(res.status).toBe(200)
        expect(res.body.password).toBeUndefined()
    })
})

describe('Users — Get by ID', () => {
    test('get user by ID without auth returns 401', async () => {
        const res = await request(app).get(`/user/${userId}`)
        expect(res.status).toBe(401)
    })

    test('get user by valid ID returns 200 with user data', async () => {
        const res = await request(app)
            .get(`/user/${userId}`)
            .set('Cookie', cookies)
        expect(res.status).toBe(200)
        expect(res.body._id).toBe(userId)
        expect(res.body.email).toBe(testUser.email)
        expect(res.body.username).toBe(testUser.username)
    })

    test('get user by valid ID does not expose password', async () => {
        const res = await request(app)
            .get(`/user/${userId}`)
            .set('Cookie', cookies)
        expect(res.body.password).toBeUndefined()
    })

    test('get user by invalid ObjectId returns 404', async () => {
        const res = await request(app)
            .get('/user/not-an-objectid')
            .set('Cookie', cookies)
        expect(res.status).toBe(404)
    })

    test('get user by non-existent valid ObjectId returns 404', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString()
        const res = await request(app)
            .get(`/user/${fakeId}`)
            .set('Cookie', cookies)
        expect(res.status).toBe(404)
    })
})

describe('Users — Update', () => {
    test('update user without auth returns 401', async () => {
        const res = await request(app)
            .patch('/user')
            .send({ username: 'newname' })
        expect(res.status).toBe(401)
    })

    test('update username returns 200 with updated data', async () => {
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ username: 'updatedusername' })
        expect(res.status).toBe(200)
        expect(res.body.username).toBe('updatedusername')
    })

    test('update photo returns 200 with updated photo', async () => {
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ photo: 'http://example.com/new-photo.jpg' })
        expect(res.status).toBe(200)
        expect(res.body.photo).toBe('http://example.com/new-photo.jpg')
    })

    test('update location returns 200 with updated location', async () => {
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ location: 'Tel Aviv' })
        expect(res.status).toBe(200)
        expect(res.body.location).toBe('Tel Aviv')
    })

    test('attempt to update email is silently ignored', async () => {
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ email: 'hacker@evil.com', username: 'safename' })
        expect(res.status).toBe(200)
        expect(res.body.email).toBe(testUser.email)
    })

    test('attempt to update password is silently ignored', async () => {
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ password: 'hacked123', username: 'safename' })
        expect(res.status).toBe(200)
        // Should still be able to log in with original password
        const loginRes = await request(app)
            .post('/auth/login')
            .send({ email: testUser.email, password: testUser.password })
        expect(loginRes.status).toBe(200)
    })

    test('attempt to update _id is silently ignored', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString()
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ _id: fakeId, username: 'safename' })
        expect(res.status).toBe(200)
        expect(res.body._id).toBe(userId)
    })

    test('update response never contains password', async () => {
        const res = await request(app)
            .patch('/user')
            .set('Cookie', cookies)
            .send({ username: 'anothername' })
        expect(res.body.password).toBeUndefined()
    })
})
