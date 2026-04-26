import mongoose, { Types } from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'
import Like from '../models/like_model'
import Comment from '../models/comment_model'
import PostsSearchService from '../services/posts_search_service'
import { MongoQueryResponse } from '../types/search'

const service = new PostsSearchService()
const makeQuery = (
    filter: Record<string, unknown>,
    extras: Partial<MongoQueryResponse> = {}
): MongoQueryResponse => ({ collection: 'posts', filter, limit: 100, ...extras })

let popular: any
let quiet: any

beforeAll(async () => {
    await mongoose.connect(process.env.DB_CONNECTION as string)
    await User.deleteMany({})
    await Post.deleteMany({})
    await Like.deleteMany({})
    await Comment.deleteMany({})

    const author = await User.create({
        email: 'search-svc@example.com',
        password: 'hashedpass',
        username: 'searchsvcuser',
    })

    popular = await Post.create({
        authorId: author._id,
        title: 'Popular',
        content: 'Learn React and TypeScript',
    })
    quiet = await Post.create({
        authorId: author._id,
        title: 'Quiet',
        content: 'Node.js and Express tutorial',
    })

    for (let i = 0; i < 3; i++) {
        const u = await User.create({
            email: `liker${i}@example.com`,
            password: 'p',
            username: `liker${i}`,
        })
        await Like.create({ postId: popular._id, userId: u._id })
    }
    for (let i = 0; i < 2; i++) {
        await Comment.create({
            postId: popular._id,
            userId: author._id,
            content: `c${i}`,
        })
    }
})

afterAll(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await Like.deleteMany({})
    await Comment.deleteMany({})
    await mongoose.connection.close()
})

describe('PostsSearchService — searchDatabase (aggregation)', () => {
    test('empty filter projects likeCount and commentCount on every post', async () => {
        const result = await service.searchDatabase(makeQuery({}))
        const p = result.find((x: any) => x._id.toString() === popular._id.toString())
        const q = result.find((x: any) => x._id.toString() === quiet._id.toString())
        expect(p.likeCount).toBe(3)
        expect(p.commentCount).toBe(2)
        expect(q.likeCount).toBe(0)
        expect(q.commentCount).toBe(0)
    })

    test('filter likeCount $gt 2 returns only popular post', async () => {
        const result = await service.searchDatabase(makeQuery({ likeCount: { $gt: 2 } }))
        expect(result.length).toBe(1)
        expect(result[0]._id.toString()).toBe(popular._id.toString())
    })

    test('filter commentCount $gte 1 returns only popular post', async () => {
        const result = await service.searchDatabase(makeQuery({ commentCount: { $gte: 1 } }))
        expect(result.length).toBe(1)
        expect(result[0]._id.toString()).toBe(popular._id.toString())
    })

    test('content $regex still works', async () => {
        const result = await service.searchDatabase(
            makeQuery({ content: { $regex: 'react', $options: 'i' } })
        )
        expect(result.length).toBe(1)
        expect(result[0].content.toLowerCase()).toContain('react')
    })

    test('sort by likeCount desc returns popular first', async () => {
        const result = await service.searchDatabase(
            makeQuery({}, { sort: { likeCount: -1 } })
        )
        expect(result[0]._id.toString()).toBe(popular._id.toString())
    })

    test('limit is respected', async () => {
        const result = await service.searchDatabase(makeQuery({}, { limit: 1 }))
        expect(result.length).toBe(1)
    })

    test('unsupported collection is rejected', async () => {
        const bogus = { collection: 'users' as any, filter: {}, limit: 10 }
        await expect(service.searchDatabase(bogus)).rejects.toThrow()
    })
})
