import { Request, Response } from 'express'
import { AuthenticatedRequest } from '../common/auth_middleware'

import Post from "../models/post_model";
import PostsSearchService from '../services/posts_search_service'
import { Types } from 'mongoose';

class PostController {
    ai_search :PostsSearchService;
    constructor (){
        this.ai_search  = new PostsSearchService()
    }

    async freeSearchPosts(req: Request, res: Response) {
        const query = req.body.query
        return this.ai_search.search_posts_free_text(query)
    }

    async getPosts(req: Request<{ authorId: string }>, res: Response) {
        try {
          const authorId = req.params.authorId;

          if (authorId) {
            const authorObjectId = new Types.ObjectId(authorId);
            const posts = await Post.find({ authorId: authorObjectId });
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
}
export default new PostController();
