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
    async ToggleLike(req: AuthenticatedRequest, res: Response):Promise<Response| void>{
        try{
            const postId= req.params.id;
            if (!req.user || !req.user._id) {
                return res.status(401).json({ msg: 'Not authorized' });
              }
            const userId = req.user._id;
            const post = await Post.findById(postId);
            if (!post) {
                return res.status(404).json({ msg: 'Post not found' });
              }
            const hasLiked = post.likes.some((id) => id.toString() === userId);
            if (hasLiked) {
                post.likes = post.likes.filter((id) => id.toString() !== userId) as Types.ObjectId[];
            } else {
              post.likes.push(new Types.ObjectId(userId) as any); 
            }

            await post.save();
            res.json(post.likes);
        }catch (err) {
            console.error((err as Error).message);
            res.status(500).send('Error in like proccess');
          }
    }
}
export default new PostController();
