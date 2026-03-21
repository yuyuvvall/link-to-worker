import mongoose, { Types } from 'mongoose'
import Post from '../models/post_model'
import User from '../models/user_model'
import PostsSearchService from '../services/posts_search_service'
import { MongoQueryResponse } from '../types/search'

const service = new PostsSearchService()

const makeQuery = (
    filter: Record<string, unknown>,
    limit = 100
): MongoQueryResponse => ({
    collection: 'posts',
    filter,
    limit,
})

let authorId: Types.ObjectId

beforeAll(async () => {
    await mongoose.connect(process.env.DB_CONNECTION as string)
    await User.deleteMany({})
    await Post.deleteMany({})

    const author = await User.create({
        email: 'search-svc@example.com',
        password: 'hashedpass',
        username: 'searchsvcuser',
    })
    authorId = author._id

    await Post.insertMany([
        { authorId, title: 'Frontend Tips', content: 'Learn React and TypeScript' },
        { authorId, title: 'Backend Guide', content: 'Node.js and Express tutorial' },
        { authorId, title: 'Career Advice', content: 'How to land your first job in tech' },
        { authorId, title: 'Public Post', content: 'Open to everyone', isPublic: true },
        { authorId, title: 'Private Post', content: 'Not public', isPublic: false },
    ])
})

afterAll(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await mongoose.connection.close()
})

describe('PostsSearchService — searchDatabase', () => {
    test('empty filter returns all posts', async () => {
        const result = await service.searchDatabase(makeQuery({}))
        expect(result.length).toBe(5)
    })

    test('content regex filter returns matching posts', async () => {
        const result = await service.searchDatabase(
            makeQuery({ content: { $regex: 'react', $options: 'i' } })
        )
        expect(result.length).toBe(1)
        expect(result[0].content.toLowerCase()).toContain('react')
    })

    test('filter that matches nothing returns empty array', async () => {
        const result = await service.searchDatabase(
            makeQuery({ content: 'xyzabcnonexistent999' })
        )
        expect(result).toEqual([])
    })

    test('limit is respected', async () => {
        const result = await service.searchDatabase(makeQuery({}, 2))
        expect(result.length).toBe(2)
    })

    test('filter by isPublic: true returns only public posts', async () => {
        const result = await service.searchDatabase(makeQuery({ isPublic: true }))
        for (const post of result) {
            expect((post as any).isPublic).toBe(true)
        }
    })

    test('filter matching multiple posts returns all of them', async () => {
        const result = await service.searchDatabase(
            makeQuery({ content: { $regex: 'node|react', $options: 'i' } })
        )
        expect(result.length).toBeGreaterThanOrEqual(2)
    })

    test('non-existent field in filter returns empty array without error', async () => {
        const result = await service.searchDatabase(
            makeQuery({ nonExistentField: 'somevalue' })
        )
        expect(Array.isArray(result)).toBe(true)
        expect(result.length).toBe(0)
    })
})
