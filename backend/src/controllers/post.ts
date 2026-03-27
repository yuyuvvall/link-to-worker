import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../common/auth_middleware'
import PostService from '../services/post_service'

import Post from "../models/post_model";
import Like from "../models/like_model";
import Comment from "../models/comment_model";
import PostsSearchService from '../services/posts_search_service'
import { Types } from 'mongoose';

class PostController {
    ai_search: PostsSearchService;
    constructor() {
        this.ai_search = new PostsSearchService()
    }

    async freeSearchPosts(req: Request, res: Response) {
        const query = req.body.query
        const postsResult =  await this.ai_search.search_posts_free_text(query)
        res.status(200).json(postsResult);
    }

    async getPosts(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user || !req.user._id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
            const userId = req.user._id;
            const authorId = req.params.authorId;
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 5));
            const skip = (page - 1) * limit;

            const posts = await PostService.getPostsAggregation(userId, skip, limit, authorId);
            res.status(200).json(posts);
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
    async updatePost(req: AuthenticatedRequest, res: Response) {
        try {
            const postId = req.params.id
            const userId = req.user?._id

            if (!userId) {
                res.status(401).json({ message: "Not authorized" })
                return
            }

            const { title, content, photoUrl } = req.body

            if (!title || !content) {
                res.status(400).json({ message: "Title and content are required" })
                return
            }

            const post = await Post.findOneAndUpdate(
                { _id: postId, authorId: userId },
                { title, content, photoUrl },
                { new: true },
            )

            if (!post) {
                res.status(403).json({ message: "Post not found or not authorized to edit" })
                return
            }

            res.status(200).json(post)
        } catch (err: unknown) {
            console.error("Failed to update post", err)
            res.status(500).json({ message: "Failed to update post" })
        }
    }

    async deletePost(req: AuthenticatedRequest, res: Response) {
        try {
            const postId = req.params.id
            const userId = req.user?._id

            if (!userId) {
                res.status(401).json({ message: "Not authorized" })
                return
            }

            const post = await Post.findOneAndDelete({ _id: postId, authorId: userId })

            if (!post) {
                res.status(403).json({ message: "Post not found or not authorized to delete" })
                return
            }

            await Like.deleteMany({ postId })
            await Comment.deleteMany({ postId })

            res.status(200).json({ message: "Post deleted" })
        } catch (err: unknown) {
            console.error("Failed to delete post", err)
            res.status(500).json({ message: "Failed to delete post" })
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

    async addComment(req: AuthenticatedRequest, res: Response): Promise<Response | void> {
        try {
            const postId = req.params.id;
            if (!req.user || !req.user._id) {
                return res.status(401).json({ msg: 'Not authorized' });
            }
            const userId = req.user._id;
            const { content } = req.body;

            if (!content) {
                return res.status(400).json({ message: 'Content is required' });
            }

            const comment = await Comment.create({ userId, postId, content });
            return res.status(201).json(comment);
        } catch (err: any) {
            console.error(err.message);
            res.status(500).send('Error adding comment');
        }
    }
}
export default new PostController();
