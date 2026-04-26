import { PipelineStage } from 'mongoose'
import { MongoQueryResponse } from '../types/search'
import query_parser from './query_parser'
import Post from '../models/post_model'

class PostsSearchService {
    async search_posts_free_text(query: string) {
        const parsed = await query_parser.parseToMongoQuery(query)
        return this.searchDatabase(parsed)
    }

    async searchDatabase(parsedQuery: MongoQueryResponse) {
        if (parsedQuery.collection !== 'posts') {
            throw new Error(`Unsupported collection: ${parsedQuery.collection}`)
        }

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
                    from: 'comments',
                    let: { postId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$postId'] } } },
                        { $count: 'count' },
                    ],
                    as: 'commentCountData',
                },
            },
            {
                $addFields: {
                    likeCount: {
                        $ifNull: [{ $arrayElemAt: ['$likeCountData.count', 0] }, 0],
                    },
                    commentCount: {
                        $ifNull: [{ $arrayElemAt: ['$commentCountData.count', 0] }, 0],
                    },
                },
            },
            { $project: { likeCountData: 0, commentCountData: 0 } },
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
