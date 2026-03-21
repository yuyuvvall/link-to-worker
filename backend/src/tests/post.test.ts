import request from 'supertest'
import { Server } from 'http'
import initApp from '../server'
import mongoose from 'mongoose'
import User from '../models/user_model'
import Post from '../models/post_model'
import Like from '../models/like_model'
import { registerAndLogin } from './helpers/auth-helper'

let app: Server

const userAData = {
    email: 'post-usera@example.com',
    password: 'password123',
    username: 'postusera',
}

const userBData = {
    email: 'post-userb@example.com',
    password: 'password123',
    username: 'postuserb',
}

let cookiesA: string[]
let cookiesB: string[]
let userAId: string
let createdPostId: string

beforeAll(async () => {
    app = await initApp()
    await User.deleteMany({})
    await Post.deleteMany({})
    await Like.deleteMany({})

    const a = await registerAndLogin(app, userAData)
    cookiesA = a.cookies
    userAId = a.userId

    const b = await registerAndLogin(app, userBData)
    cookiesB = b.cookies
})

afterAll(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await Like.deleteMany({})
    await mongoose.connection.close()
})

describe('Posts — Create', () => {
    test('create post without auth returns 401', async () => {
        const res = await request(app)
            .post('/post')
            .send({ title: 'Test', content: 'Content' })
        expect(res.status).toBe(401)
    })

    test('create post with valid data returns 201 with post object', async () => {
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookiesA)
            .send({ title: 'My First Post', content: 'About my resume journey' })
        expect(res.status).toBe(201)
        expect(res.body._id).toBeDefined()
        expect(res.body.title).toBe('My First Post')
        expect(res.body.content).toBe('About my resume journey')
        expect(res.body.authorId).toBe(userAId)
        createdPostId = res.body._id
    })

    test('create post with optional photoUrl includes it in response', async () => {
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookiesA)
            .send({ title: 'Post with photo', content: 'Has a photo', photoUrl: 'http://example.com/img.jpg' })
        expect(res.status).toBe(201)
        expect(res.body.photoUrl).toBe('http://example.com/img.jpg')
    })

    test('create post missing title returns 400', async () => {
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookiesA)
            .send({ content: 'No title here' })
        expect(res.status).toBe(400)
    })

    test('create post missing content returns 400', async () => {
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookiesA)
            .send({ title: 'No content here' })
        expect(res.status).toBe(400)
    })

    test('create post missing both title and content returns 400', async () => {
        const res = await request(app)
            .post('/post')
            .set('Cookie', cookiesA)
            .send({})
        expect(res.status).toBe(400)
    })
})

describe('Posts — Get All', () => {
    test('get posts without auth returns 401', async () => {
        const res = await request(app).get('/post')
        expect(res.status).toBe(401)
    })

    test('get posts with auth returns 200 with array', async () => {
        const res = await request(app).get('/post').set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(Array.isArray(res.body)).toBe(true)
    })

    test('each post has likeCount and isLikedByUser fields', async () => {
        const res = await request(app).get('/post').set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        for (const post of res.body) {
            expect(typeof post.likeCount).toBe('number')
            expect(typeof post.isLikedByUser).toBe('boolean')
        }
    })

    test('get posts default limit is 5', async () => {
        // Create extra posts to exceed default limit
        for (let i = 0; i < 5; i++) {
            await request(app)
                .post('/post')
                .set('Cookie', cookiesA)
                .send({ title: `Extra Post ${i}`, content: `Content ${i}` })
        }
        const res = await request(app).get('/post').set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.length).toBeLessThanOrEqual(5)
    })

    test('get posts with limit=2 returns max 2 posts', async () => {
        const res = await request(app).get('/post?limit=2').set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.length).toBeLessThanOrEqual(2)
    })

    test('get posts with limit=0 is clamped to 1', async () => {
        const res = await request(app).get('/post?limit=0').set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.length).toBeGreaterThanOrEqual(1)
    })

    test('posts are sorted newest first', async () => {
        const res = await request(app).get('/post?limit=10').set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        const posts = res.body
        if (posts.length >= 2) {
            const first = new Date(posts[0].createdAt).getTime()
            const second = new Date(posts[1].createdAt).getTime()
            expect(first).toBeGreaterThanOrEqual(second)
        }
    })

    test('page=2 with limit=2 returns next page', async () => {
        const page1 = await request(app)
            .get('/post?page=1&limit=2')
            .set('Cookie', cookiesA)
        const page2 = await request(app)
            .get('/post?page=2&limit=2')
            .set('Cookie', cookiesA)
        expect(page1.status).toBe(200)
        expect(page2.status).toBe(200)
        if (page1.body.length > 0 && page2.body.length > 0) {
            expect(page1.body[0]._id).not.toBe(page2.body[0]._id)
        }
    })
})

describe('Posts — Get by Author', () => {
    test('get posts by author without auth returns 401', async () => {
        const res = await request(app).get(`/post/${userAId}`)
        expect(res.status).toBe(401)
    })

    test('get posts by valid authorId returns only that author posts', async () => {
        const res = await request(app)
            .get(`/post/${userAId}`)
            .set('Cookie', cookiesB)
        expect(res.status).toBe(200)
        for (const post of res.body) {
            expect(post.authorId.toString()).toBe(userAId)
        }
    })

    test('get posts by non-existent authorId returns empty array', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString()
        const res = await request(app)
            .get(`/post/${fakeId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body).toEqual([])
    })
})

describe('Posts — Update', () => {
    test('update post without auth returns 401', async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .send({ title: 'Updated', content: 'Updated content' })
        expect(res.status).toBe(401)
    })

    test('owner can update their own post', async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set('Cookie', cookiesA)
            .send({ title: 'Updated Title', content: 'Updated content' })
        expect(res.status).toBe(200)
        expect(res.body.title).toBe('Updated Title')
        expect(res.body.content).toBe('Updated content')
    })

    test('non-owner cannot update post and gets 403', async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set('Cookie', cookiesB)
            .send({ title: 'Hacked', content: 'Hacked content' })
        expect(res.status).toBe(403)
    })

    test('update missing title returns 400', async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set('Cookie', cookiesA)
            .send({ content: 'Only content' })
        expect(res.status).toBe(400)
    })

    test('update missing content returns 400', async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set('Cookie', cookiesA)
            .send({ title: 'Only title' })
        expect(res.status).toBe(400)
    })

    test('update with photoUrl includes it in response', async () => {
        const res = await request(app)
            .put(`/post/${createdPostId}`)
            .set('Cookie', cookiesA)
            .send({ title: 'With Photo', content: 'Updated', photoUrl: 'http://new.com/img.jpg' })
        expect(res.status).toBe(200)
        expect(res.body.photoUrl).toBe('http://new.com/img.jpg')
    })

    test('update non-existent post returns 403', async () => {
        const fakeId = new mongoose.Types.ObjectId().toString()
        const res = await request(app)
            .put(`/post/${fakeId}`)
            .set('Cookie', cookiesA)
            .send({ title: 'Ghost', content: 'Ghost content' })
        expect(res.status).toBe(403)
    })
})

describe('Posts — Toggle Like', () => {
    test('toggle like without auth returns 401', async () => {
        const res = await request(app).put(`/post/like/${createdPostId}`)
        expect(res.status).toBe(401)
    })

    test('first like returns liked: true', async () => {
        const res = await request(app)
            .put(`/post/like/${createdPostId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.liked).toBe(true)
    })

    test('second like on same post toggles off and returns liked: false', async () => {
        const res = await request(app)
            .put(`/post/like/${createdPostId}`)
            .set('Cookie', cookiesA)
        expect(res.status).toBe(200)
        expect(res.body.liked).toBe(false)
    })

    test('likeCount is 0 when post has no likes', async () => {
        const res = await request(app).get('/post?limit=50').set('Cookie', cookiesA)
        const post = res.body.find((p: any) => p._id === createdPostId)
        expect(post).toBeDefined()
        expect(post.likeCount).toBe(0)
    })

    test('likeCount is 1 after userA likes, and isLikedByUser is true for userA', async () => {
        // userA likes the post
        await request(app)
            .put(`/post/like/${createdPostId}`)
            .set('Cookie', cookiesA)

        const resA = await request(app).get('/post?limit=50').set('Cookie', cookiesA)
        const postForA = resA.body.find((p: any) => p._id === createdPostId)
        expect(postForA.likeCount).toBe(1)
        expect(postForA.isLikedByUser).toBe(true)
    })

    test('isLikedByUser is false for userB when only userA liked', async () => {
        const resB = await request(app).get('/post?limit=50').set('Cookie', cookiesB)
        const postForB = resB.body.find((p: any) => p._id === createdPostId)
        expect(postForB.likeCount).toBe(1)
        expect(postForB.isLikedByUser).toBe(false)
    })

    test('likeCount is 2 when both users like the post', async () => {
        // userB also likes the post
        await request(app)
            .put(`/post/like/${createdPostId}`)
            .set('Cookie', cookiesB)

        const res = await request(app).get('/post?limit=50').set('Cookie', cookiesA)
        const post = res.body.find((p: any) => p._id === createdPostId)
        expect(post.likeCount).toBe(2)
    })

    test('likeCount returns to 0 after both users unlike', async () => {
        // userA unlikes
        await request(app)
            .put(`/post/like/${createdPostId}`)
            .set('Cookie', cookiesA)
        // userB unlikes
        await request(app)
            .put(`/post/like/${createdPostId}`)
            .set('Cookie', cookiesB)

        const res = await request(app).get('/post?limit=50').set('Cookie', cookiesA)
        const post = res.body.find((p: any) => p._id === createdPostId)
        expect(post.likeCount).toBe(0)
        expect(post.isLikedByUser).toBe(false)
    })
})
