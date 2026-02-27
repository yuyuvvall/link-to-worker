import { MongoQueryResponse } from "../types/search"
import query_parser from "./query_parser"
class PostsSearchService{
    async search_posts_free_text(query: string){
        try {
            const parsed_query:MongoQueryResponse = await query_parser.parseToMongoQuery(query)   
            const posts = await this.searchDatabase(parsed_query);
            return posts
        } catch(error) {
            console.error("Failed using ai search",error);
            throw error;
        }
    
    }
    async searchDatabase(parsedQuery: MongoQueryResponse) {
        throw new Error("Method not implemented.");
    }
}
export default PostsSearchService
