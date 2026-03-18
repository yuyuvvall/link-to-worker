import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../common/auth_middleware'

import Post from "../models/post_model";
import Like from "../models/like_model";
import PostsSearchService from '../services/posts_search_service'
import { Types } from 'mongoose';

class PostController {
    ai_search: PostsSearchService;
    constructor() {
        this.ai_search = new PostsSearchService()
    }

    async freeSearchPosts(req: Request, res: Response) {
        const query = req.body.query
        return this.ai_search.search_posts_free_text(query)
    }

    async getPosts(req: AuthenticatedRequest, res: Response) {
        try {
            const authorId = req.params.authorId;
            if (!req.user || !req.user._id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
            const userId = req.user._id;
            if (authorId) {
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
                res.status(200).json(posts);
            } else {
                res.status(400).json({ message: "Author ID is required" });
            }
        } catch (err: any) {
            console.error("Failed to get posts", err);
            res.status(500).json({ message: "Failed to get posts" });
        }
    }

    async createPost(req: AuthenticatedRequest, res: Response) {
        try {
            const { title, content, photoUrl } = req.body
            const authorId = req.user?._id

            if (!title || !content) {
                res.status(400).json({ message: "Title and content are required" })
                return
            }

            const post = await Post.create({ title, content, photoUrl, authorId })
            res.status(201).json(post)
        } catch (err: any) {
            console.error("Failed to create post", err)
            res.status(500).json({ message: "Failed to create post" })
        }
    }
    async ToggleLike(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
        try {
            const postId = req.params.id;
            if (!req.user || !req.user._id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
            const userId = req.user._id;
            try {
                const existing = await Like.findOne({ userId, postId });

                if (existing) {
                    await Like.deleteOne({ _id: existing._id });
                    return res.json({ liked: false });
                }
                else {
                    await Like.create({ userId, postId });
                    return res.json({ liked: true });
                }

            } catch (err: any) {
                return res.status(500).json({ error: err.message });
            }
        } catch (err) {
            console.error((err as Error).message);
            res.status(500).send('Error in like proccess');
        }
    }
}
export default new PostController();
