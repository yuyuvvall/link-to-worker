import request from 'supertest'
import { Express } from 'express'
import initApp from '../server'
import mongoose from 'mongoose'
import path from 'path'

let app: Express

beforeAll(async () => {
    app = await initApp()
})

afterAll(async () => {
    await mongoose.connection.close()
})

describe('File Upload Tests', () => {
    test('upload file', async () => {
        const imagePath = path.join(__dirname, 'avatar.jpeg')

        const response = await request(app)
            .post('/file')
            .attach('file', imagePath)

        expect(response.status).toBe(200)
        expect(response.body.url).toBeDefined()

        // Extract the path from the URL (remove http://localhost:3000/)
        const url = response.body.url
        const urlPath = url.replace(`http://${process.env.DOMAIN_BASE}:${process.env.PORT}/`, '')

        // Try to access the uploaded file
        const fileResponse = await request(app).get(`/${urlPath}`)
        expect(fileResponse.status).toBe(200)
    })
})
