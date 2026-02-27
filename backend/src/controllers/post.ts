import { Request, Response } from 'express'
import PostsSearchService from '../services/posts_search_service'

class PostController{
    ai_search :PostsSearchService;
    constructor (){
        this.ai_search  = new PostsSearchService()
    }

    async freeSearchPosts(req: Request, res: Response) {
        const query = req.body.query
        return this.ai_search.search_posts_free_text(query)
    }
}
export default new PostController()
