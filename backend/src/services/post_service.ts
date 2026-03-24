import { Types, PipelineStage } from "mongoose";
import Post from "../models/post_model";

const getPostsAggregation = async (
    userId: string,
    skip: number = 0,
    limit: number = 5,
    authorId?: string,
) => {
    const userObjectId = new Types.ObjectId(userId);

    const pipeline: PipelineStage[] = [];

    if (authorId) {
        pipeline.push({
            $match: {
                authorId: new Types.ObjectId(authorId),
            },
        });
    }

    pipeline.push(
        {
            $lookup: {
                from: "likes",
                let: { postId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$postId", "$$postId"],
                            },
                        },
                    },
                    { $count: "count" },
                ],
                as: "likeCountData",
            },
        },
        {
            $lookup: {
                from: "likes",
                let: { postId: "$_id", userId: userObjectId },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$postId", "$$postId"] },
                                    { $eq: ["$userId", "$$userId"] },
                                ],
                            },
                        },
                    },
                ],
                as: "userLike",
            },
        },
        {
            $lookup: {
                from: "comments",
                let: { postId: "$_id" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$postId", "$$postId"] } } },
                    { $sort: { createdAt: 1 } },
                    { $project: { userId: 1, content: 1, createdAt: 1 } },
                ],
                as: "comments",
            },
        },
        {
            $addFields: {
                likeCount: {
                    $ifNull: [{ $arrayElemAt: ["$likeCountData.count", 0] }, 0],
                },
                isLikedByUser: {
                    $gt: [{ $size: "$userLike" }, 0],
                },
                commentCount: { $size: "$comments" },
            },
        },
        {
            $project: {
                likeCountData: 0,
                userLike: 0,
            },
        },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
    );

    const posts = await Post.aggregate(pipeline);
    return posts;
};

export default { getPostsAggregation }