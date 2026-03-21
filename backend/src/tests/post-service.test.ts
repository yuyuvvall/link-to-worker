import mongoose, { Types } from 'mongoose'
import User from '../models/user_model'
import Post from '../models/post_model'
import Like from '../models/like_model'
import PostService from '../services/post_service'

beforeAll(async () => {
    await mongoose.connect(process.env.DB_CONNECTION as string)
    await User.deleteMany({})
    await Post.deleteMany({})
    await Like.deleteMany({})
})

afterAll(async () => {
    await User.deleteMany({})
    await Post.deleteMany({})
    await Like.deleteMany({})
    await mongoose.connection.close()
})

const createUser = async (suffix: string) => {
    return User.create({
        email: `svc-user-${suffix}@example.com`,
        password: 'hashedpass',
        username: `svcuser${suffix}`,
    })
}

const createPost = async (authorId: Types.ObjectId, title: string) => {
    return Post.create({ authorId, title, content: `Content for ${title}` })
}

describe('PostService — getPostsAggregation', () => {
    test('returns empty array when no posts exist', async () => {
        await Post.deleteMany({})
        const userA = await createUser('empty')
        const result = await PostService.getPostsAggregation(userA._id.toString(), 0, 10)
        expect(result).toEqual([])
    })

    test('returns posts with likeCount: 0 when no likes', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const userA = await createUser('nolike')
        const post = await createPost(userA._id, 'No Like Post')

        const result = await PostService.getPostsAggregation(userA._id.toString(), 0, 10)
        const found = result.find((p: any) => p._id.toString() === post._id.toString())
        expect(found).toBeDefined()
        expect(found.likeCount).toBe(0)
    })

    test('returns likeCount: 1 after one like', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const userA = await createUser('onelike-author')
        const userB = await createUser('onelike-liker')
        const post = await createPost(userA._id, 'One Like Post')
        await Like.create({ postId: post._id, userId: userB._id })

        const result = await PostService.getPostsAggregation(userA._id.toString(), 0, 10)
        const found = result.find((p: any) => p._id.toString() === post._id.toString())
        expect(found.likeCount).toBe(1)
    })

    test('returns likeCount: 2 after two likes by different users', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('twolike-author')
        const likerA = await createUser('twolike-likera')
        const likerB = await createUser('twolike-likerb')
        const post = await createPost(author._id, 'Two Like Post')
        await Like.create({ postId: post._id, userId: likerA._id })
        await Like.create({ postId: post._id, userId: likerB._id })

        const result = await PostService.getPostsAggregation(author._id.toString(), 0, 10)
        const found = result.find((p: any) => p._id.toString() === post._id.toString())
        expect(found.likeCount).toBe(2)
    })

    test('isLikedByUser is true when querying userId has liked', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('isloved-author')
        const liker = await createUser('isloved-liker')
        const post = await createPost(author._id, 'Liked By Me Post')
        await Like.create({ postId: post._id, userId: liker._id })

        const result = await PostService.getPostsAggregation(liker._id.toString(), 0, 10)
        const found = result.find((p: any) => p._id.toString() === post._id.toString())
        expect(found.isLikedByUser).toBe(true)
    })

    test('isLikedByUser is false when querying userId has not liked', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('notloved-author')
        const liker = await createUser('notloved-liker')
        const nonLiker = await createUser('notloved-nonliker')
        const post = await createPost(author._id, 'Not Liked By Me Post')
        await Like.create({ postId: post._id, userId: liker._id })

        const result = await PostService.getPostsAggregation(nonLiker._id.toString(), 0, 10)
        const found = result.find((p: any) => p._id.toString() === post._id.toString())
        expect(found.isLikedByUser).toBe(false)
    })

    test('respects limit parameter', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('limit-author')
        for (let i = 0; i < 5; i++) {
            await createPost(author._id, `Limit Post ${i}`)
        }

        const result = await PostService.getPostsAggregation(author._id.toString(), 0, 2)
        expect(result.length).toBe(2)
    })

    test('respects skip parameter', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('skip-author')
        for (let i = 0; i < 3; i++) {
            await createPost(author._id, `Skip Post ${i}`)
        }

        const all = await PostService.getPostsAggregation(author._id.toString(), 0, 10)
        const skipped = await PostService.getPostsAggregation(author._id.toString(), 1, 10)
        expect(skipped.length).toBe(all.length - 1)
    })

    test('filters by authorId when provided', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const authorA = await createUser('filter-authora')
        const authorB = await createUser('filter-authorb')
        await createPost(authorA._id, 'Post by A')
        await createPost(authorB._id, 'Post by B')

        const result = await PostService.getPostsAggregation(
            authorA._id.toString(),
            0,
            10,
            authorA._id.toString()
        )
        for (const post of result) {
            expect(post.authorId.toString()).toBe(authorA._id.toString())
        }
    })

    test('returns posts from all authors when no authorId filter', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const authorA = await createUser('all-authora')
        const authorB = await createUser('all-authorb')
        await createPost(authorA._id, 'Post by A')
        await createPost(authorB._id, 'Post by B')

        const result = await PostService.getPostsAggregation(authorA._id.toString(), 0, 10)
        const authorIds = result.map((p: any) => p.authorId.toString())
        expect(authorIds).toContain(authorA._id.toString())
        expect(authorIds).toContain(authorB._id.toString())
    })

    test('posts are sorted by createdAt descending', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('sort-author')
        // Insert with slight delay to ensure different timestamps
        await createPost(author._id, 'Older Post')
        await new Promise((r) => setTimeout(r, 50))
        await createPost(author._id, 'Newer Post')

        const result = await PostService.getPostsAggregation(author._id.toString(), 0, 10)
        expect(result.length).toBeGreaterThanOrEqual(2)
        const first = new Date(result[0].createdAt).getTime()
        const second = new Date(result[1].createdAt).getTime()
        expect(first).toBeGreaterThanOrEqual(second)
    })

    test('response does not include likeCountData or userLike internal fields', async () => {
        await Post.deleteMany({})
        await Like.deleteMany({})
        const author = await createUser('clean-author')
        await createPost(author._id, 'Clean Post')

        const result = await PostService.getPostsAggregation(author._id.toString(), 0, 10)
        expect(result.length).toBeGreaterThan(0)
        expect(result[0].likeCountData).toBeUndefined()
        expect(result[0].userLike).toBeUndefined()
    })
})
