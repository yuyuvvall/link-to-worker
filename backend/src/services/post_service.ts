import { Types } from "mongoose";
import Post from "../models/post_model";

const getPostsAgregation =  async (authorId: string, userId: string) => {
        const authorObjectId = new Types.ObjectId(authorId);
        const userObjectId = new Types.ObjectId(userId);
        const posts = await Post.aggregate([
            // ✅ 1. FILTER
            {
                $match: {
                    authorId: authorObjectId
                }
            },

            // ✅ 2. LIKE COUNT
            {
                $lookup: {
                    from: "likes",
                    let: { postId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ["$postId", "$$postId"]
                                }
                            }
                        },
                        { $count: "count" }
                    ],
                    as: "likeCountData"
                }
            },

            // ✅ 3. DID USER LIKE
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
                                        { $eq: ["$userId", "$$userId"] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userLike"
                }
            },

            // ✅ 4. COMPUTED FIELDS
            {
                $addFields: {
                    likeCount: {
                        $ifNull: [{ $arrayElemAt: ["$likeCountData.count", 0] }, 0]
                    },
                    isLikedByUser: {
                        $gt: [{ $size: "$userLike" }, 0]
                    }
                }
            },

            // ✅ 5. CLEANUP
            {
                $project: {
                    likeCountData: 0,
                    userLike: 0
                }
            },

            // ✅ 6. SORT
            {
                $sort: { createdAt: -1 }
            }
        ]);
        return posts;
    }
export default { getPostsAgregation }