import { PipelineStage, Types } from 'mongoose'
import { MongoQueryResponse } from '../types/search'
import query_parser from './query_parser'
import Post from '../models/post_model'

class PostsSearchService {
    async search_posts_free_text(query: string, userId: string) {
        const parsed = await query_parser.parseToMongoQuery(query)
        return this.searchDatabase(parsed, userId)
    }

    async searchDatabase(parsedQuery: MongoQueryResponse, userId: string) {
        if (parsedQuery.collection !== 'posts') {
            throw new Error(`Unsupported collection: ${parsedQuery.collection}`)
        }

        const userObjectId = new Types.ObjectId(userId)

        const pipeline: PipelineStage[] = [
            {
                $lookup: {
                    from: 'likes',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$postId'] } } },
                        { $count: 'count' },
                    ],
                    as: 'likeCountData',
                },
            },
            {
                $lookup: {
                    from: 'likes',
                    let: { postId: '$_id', userId: userObjectId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$postId', '$$postId'] },
                                        { $eq: ['$userId', '$$userId'] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: 'userLike',
                },
            },
            {
                $lookup: {
                    from: 'comments',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$postId'] } } },
                        { $sort: { createdAt: 1 } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'author',
                            },
                        },
                        {
                            $addFields: {
                                authorName: {
                                    $ifNull: [{ $arrayElemAt: ['$author.username', 0] }, 'Unknown'],
                                },
                            },
                        },
                        { $project: { userId: 1, content: 1, createdAt: 1, authorName: 1 } },
                    ],
                    as: 'comments',
                },
            },
            {
                $addFields: {
                    likeCount: {
                        $ifNull: [{ $arrayElemAt: ['$likeCountData.count', 0] }, 0],
                    },
                    isLikedByUser: { $gt: [{ $size: '$userLike' }, 0] },
                    commentCount: { $size: '$comments' },
                },
            },
            { $project: { likeCountData: 0, userLike: 0 } },
            { $match: parsedQuery.filter as Record<string, unknown> },
        ]

        if (parsedQuery.sort && Object.keys(parsedQuery.sort).length > 0) {
            pipeline.push({ $sort: parsedQuery.sort as Record<string, 1 | -1> })
        }
        pipeline.push({ $limit: parsedQuery.limit })

        return Post.aggregate(pipeline)
    }
}

export default PostsSearchService
