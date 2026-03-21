import request from 'supertest'
import { Server } from 'http'
import initApp from '../server'
import mongoose from 'mongoose'
import User from '../models/user_model'
import { Message } from '../models/message_model'
import messageController from '../controllers/message'
import { registerAndLogin } from './helpers/auth-helper'

let app: Server

const userAData = {
    email: 'msg-usera@example.com',
    password: 'password123',
    username: 'msgusera',
}

const userBData = {
    email: 'msg-userb@example.com',
    password: 'password123',
    username: 'msguserb',
}

let cookiesA: string[]
let cookiesB: string[]
let userAId: string
let userBId: string

beforeAll(async () => {
    app = await initApp()
    await User.deleteMany({})
    await Message.deleteMany({})

    const userA = await registerAndLogin(app, userAData)
    cookiesA = userA.cookies
    userAId = userA.userId

    const userB = await registerAndLogin(app, userBData)
    cookiesB = userB.cookies
    userBId = userB.userId
})

afterAll(async () => {
    await User.deleteMany({})
    await Message.deleteMany({})
    await mongoose.connection.close()
})

describe('Messages — Get Chat History (REST)', () => {
    test('get chat history without auth returns 401', async () => {
        const res = await request(app).get(`/message/${userBId}`)
        expect(res.status).toBe(401)
    })

    test('get chat history with no messages returns empty array', async () => {
        const res = await request(app)
            .get(`/message/${userBId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })

    test('returns messages sent from me to contact', async () => {
        await Message.create({
            senderId: userAId,
            receiverId: userBId,
            content: 'Hello from A',
        })

        const res = await request(app)
            .get(`/message/${userBId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.length).toBeGreaterThanOrEqual(1)
        expect(res.body.some((m: any) => m.content === 'Hello from A')).toBe(true)
    })

    test('returns messages sent from contact to me', async () => {
        await Message.create({
            senderId: userBId,
            receiverId: userAId,
            content: 'Hello from B',
        })

        const res = await request(app)
            .get(`/message/${userBId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.some((m: any) => m.content === 'Hello from B')).toBe(true)
    })

    test('messages are sorted ascending by createdAt', async () => {
        const res = await request(app)
            .get(`/message/${userBId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        const messages = res.body
        for (let i = 1; i < messages.length; i++) {
            const prev = new Date(messages[i - 1].createdAt).getTime()
            const curr = new Date(messages[i].createdAt).getTime()
            expect(prev).toBeLessThanOrEqual(curr)
        }
    })

    test('does not return messages between other users', async () => {
        // Create a third user and a message between B and C — userA should not see it
        const cRes = await request(app)
            .post('/auth/register')
            .send({ email: 'msg-userc@example.com', password: 'pass123', username: 'msguserc' })
        const userCId = cRes.body._id
        await Message.create({
            senderId: userBId,
            receiverId: userCId,
            content: 'B to C, private',
        })

        const res = await request(app)
            .get(`/message/${userBId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.some((m: any) => m.content === 'B to C, private')).toBe(false)
    })
})

describe('Messages — saveMessage (unit)', () => {
    beforeEach(async () => {
        await Message.deleteMany({})
    })

    test('saves valid message and returns it', async () => {
        const msg = await messageController.saveMessage(
            userAId,
            userBId,
            'Unit test message',
            userAId
        )
        expect(msg.content).toBe('Unit test message')
        expect(msg.senderId.toString()).toBe(userAId)
        expect(msg.receiverId.toString()).toBe(userBId)
    })

    test('saved message is persisted in the database', async () => {
        await messageController.saveMessage(userAId, userBId, 'Persisted message', userAId)
        const found = await Message.findOne({ senderId: userAId, receiverId: userBId })
        expect(found).not.toBeNull()
        expect(found?.content).toBe('Persisted message')
    })

    test('throws when sender does not match authenticated user', async () => {
        await expect(
            messageController.saveMessage(userAId, userBId, 'Sneaky message', userBId)
        ).rejects.toThrow('Unauthorized sender')
    })

    test('throws when sending message to yourself', async () => {
        await expect(
            messageController.saveMessage(userAId, userAId, 'Self message', userAId)
        ).rejects.toThrow('Cannot send message to yourself')
    })
})
