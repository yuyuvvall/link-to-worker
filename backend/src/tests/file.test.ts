import request from 'supertest'
import { Server } from 'http'
import initApp from '../server'
import mongoose from 'mongoose'
import path from 'path'
import fs from 'fs'

let app: Server

// Minimal 1x1 JPEG (same as create-test-image.js)
const MINIMAL_JPEG_B64 =
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8U' +
    'HRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgN' +
    'DRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy' +
    'MjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAA' +
    'AAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAA' +
    'AAAAP/aAAwDAQACEQMRAD8AJQAB/9k='

const MINIMAL_PNG_B64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

const testJpegPath = path.join(__dirname, 'test-upload.jpg')
const testPngPath = path.join(__dirname, 'test-upload.png')
const testPdfPath = path.join(__dirname, 'test-upload.pdf')

beforeAll(async () => {
    app = await initApp()

    // Create minimal test files
    fs.writeFileSync(testJpegPath, Buffer.from(MINIMAL_JPEG_B64, 'base64'))
    fs.writeFileSync(testPngPath, Buffer.from(MINIMAL_PNG_B64, 'base64'))
    // Minimal PDF content
    fs.writeFileSync(testPdfPath, Buffer.from('%PDF-1.4 fake pdf content'))
})

afterAll(async () => {
    // Clean up test files
    for (const p of [testJpegPath, testPngPath, testPdfPath]) {
        if (fs.existsSync(p)) fs.unlinkSync(p)
    }
    await mongoose.connection.close()
})

describe('File Upload', () => {
    test('upload valid JPEG returns 200 with url', async () => {
        const res = await request(app)
            .post('/file')
            .attach('file', testJpegPath)
        expect(res.status).toBe(200)
        expect(res.body.url).toBeDefined()
        expect(typeof res.body.url).toBe('string')
    })

    test('returned URL contains /public/uploads/', async () => {
        const res = await request(app)
            .post('/file')
            .attach('file', testJpegPath)
        expect(res.status).toBe(200)
        expect(res.body.url).toContain('/public/uploads/')
    })

    test('uploaded file is accessible via GET on returned URL path', async () => {
        const uploadRes = await request(app)
            .post('/file')
            .attach('file', testJpegPath)
        expect(uploadRes.status).toBe(200)

        const url: string = uploadRes.body.url
        // Extract the path after the host, e.g. /public/uploads/abc.jpg
        const urlObj = new URL(url)
        const filePath = urlObj.pathname

        const fileRes = await request(app).get(filePath)
        expect(fileRes.status).toBe(200)
    })

    test('upload valid PNG returns 200 with url', async () => {
        const res = await request(app)
            .post('/file')
            .attach('file', testPngPath)
        expect(res.status).toBe(200)
        expect(res.body.url).toBeDefined()
    })

    test('upload with no file returns 400', async () => {
        const res = await request(app).post('/file')
        expect(res.status).toBe(400)
    })

    test('upload invalid file type (PDF) is rejected by the server', async () => {
        // multer's fileFilter calls cb(new Error(...)) which may cause ECONNRESET
        // OR the global error handler returns 500 — either way the upload is rejected
        let rejected = false
        try {
            const res = await request(app)
                .post('/file')
                .attach('file', testPdfPath)
            rejected = res.status !== 200
        } catch {
            rejected = true // ECONNRESET = server rejected the upload
        }
        expect(rejected).toBe(true)
    })

    test('existing avatar.jpeg uploads successfully', async () => {
        const avatarPath = path.join(__dirname, 'avatar.jpeg')
        if (!fs.existsSync(avatarPath)) return // skip if not present

        const res = await request(app)
            .post('/file')
            .attach('file', avatarPath)
        expect(res.status).toBe(200)
        expect(res.body.url).toBeDefined()
    })
})
