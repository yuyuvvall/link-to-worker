import request from 'supertest'
import { Server } from 'http'

export interface TestUser {
    email: string
    password: string
    username: string
}

export const loginAndGetCookies = async (
    app: Server,
    email: string,
    password: string
): Promise<string[]> => {
    const res = await request(app)
        .post('/auth/login')
        .send({ email, password })
    return res.headers['set-cookie'] as unknown as string[]
}

export const registerAndLogin = async (
    app: Server,
    user: TestUser
): Promise<{ cookies: string[]; userId: string }> => {
    const registerRes = await request(app)
        .post('/auth/register')
        .send(user)
    const userId = registerRes.body._id as string

    const cookies = await loginAndGetCookies(app, user.email, user.password)
    return { cookies, userId }
}
