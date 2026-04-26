import llmClient from './llm_client';
import {
    QueryParsingError,
    MongoQueryResponse,
    QueryValidationError,
    CollectionName,
    MongoQuerySuccess
} from '../types/search';
import { LLMServiceError, LLMParsingError } from '../types/llm';
import { z } from "zod";
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const SuccessSchema = z.object({
  collection: z.literal("posts"),
  filter: z.record(z.string(), z.unknown()),
  sort: z
    .record(z.string(), z.union([z.literal(1), z.literal(-1)]))
    .optional(),
  limit: z.number().min(1).max(100)
});

const ErrorSchema = z.object({
  error: z.string()
});

export const MongoQuerySchema = z.union([
  SuccessSchema,
  ErrorSchema
]);



class QueryParserService {
    private readonly systemPrompt = `You are a MongoDB query generator.

Convert a user's natural language request into a MongoDB query against the "posts" collection.

CRITICAL RULES:
- Only use the schema below.
- Never invent fields.
- Only use the allowed operators.
- If a field does not exist, return an error.
- If the request is ambiguous, return an error.
- Output ONLY valid JSON. No explanations. No markdown.

Allowed operators: $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin, $regex, $options, $and, $or

Default limit: 20. Maximum limit: 100.

Return EXACTLY one of:
{ "collection": "posts", "filter": {}, "sort": {}, "limit": <number> }
OR
{ "error": "<reason>" }

Schema:

Collection: posts
{
  _id:          ObjectId,
  authorId:     ObjectId,   // 24-hex string accepted
  title:        string,
  content:      string,
  photoUrl:     string,     // optional
  createdAt:    Date,
  likeCount:    number,     // computed: number of documents in \`likes\` with this post's _id
  commentCount: number      // computed: number of documents in \`comments\` with this post's _id
}

Examples:

User: posts with more than 50 likes
{"collection":"posts","filter":{"likeCount":{"$gt":50}},"sort":{},"limit":20}

User: posts with more than 100 likes and less than 10 comments
{"collection":"posts","filter":{"$and":[{"likeCount":{"$gt":100}},{"commentCount":{"$lt":10}}]},"sort":{},"limit":20}

User: posts containing the word mongo
{"collection":"posts","filter":{"content":{"$regex":"mongo","$options":"i"}},"sort":{},"limit":20}

User: newest posts
{"collection":"posts","filter":{},"sort":{"createdAt":-1},"limit":20}

User: posts with more than 10 shares
{"error":"Field 'shares' does not exist in collection 'posts'"}

Never generate operators outside the allowed list. Never generate aggregation pipelines. Only generate find()-style filter objects.

Ensure the JSON is strictly valid and parseable by JSON.parse().
`;

    async parseToMongoQuery(
        query: string,
    ): Promise<MongoQueryResponse> {
        try {
            this.validateQuery(query);

            const prompt = this.buildPrompt(query);

            const llmResponse = await llmClient.generateResponse(prompt, {
                temperature: 0.1, // Low temperature for consistent parsing
                format: 'json',
                num_predict: 500 // Limit response length
            });

            if (!llmResponse.done || !llmResponse.response) {
                throw new QueryParsingError(
                    'LLM service returned invalid response',
                    query
                );
            }

          const parsedResponse = this.parseLLMResponse(llmResponse.response);

          const validatedResponse = this.validateParsedQuery(parsedResponse);

          return validatedResponse;

        } catch (error) {
            // Handle different error types
            if (error instanceof QueryParsingError) {
                throw error;
            }

            // LLMParsingError (invalid JSON) should be wrapped as QueryParsingError
            if (error instanceof LLMParsingError) {
                throw new QueryParsingError(
                    error.message,
                    query,
                    error
                );
            }

            // Check for LLM service errors and other errors that should trigger fallback
            const shouldFallback = (
                error instanceof LLMServiceError ||
                (error instanceof Error && (
                    error.message.includes('LLM service unavailable') ||
                    error.message.includes('LLM service error')
                ))
            );

            if (shouldFallback) {
                console.warn('LLM parsing failed, falling back to keyword extraction:', error.message);
                return this.buildFallbackQuery(query);
            }

            if (error instanceof LLMServiceError) {
                throw new QueryParsingError(
                    `LLM service error: ${error.message}`,
                    query,
                    error
                );
            }

            throw new QueryParsingError(
                `Unexpected error during query parsing: ${error instanceof Error ? error.message : 'Unknown'}`,
                query,
                error instanceof Error ? error : undefined
            );
        }
    }

    /**
     * Validate parsed query structure and content
     */
    validateParsedQuery(llmoutput: any): MongoQueryResponse {
        const parsed = MongoQuerySchema.safeParse(llmoutput)
        if (!parsed.success) {
            throw new Error("Invalid structure")
        }
        if ("error" in parsed.data) {
            throw new QueryValidationError(`LLM returned error: ${parsed.data.error}`)
        }
        return parsed.data as MongoQueryResponse
    }


    private buildPrompt(query: string): string {
        return `${this.systemPrompt}

Parse this free text search query:
"${query.trim()}"

Respond with the allowed JSON format only:`;
    }

    /**
     * Validate input query
     */
    private validateQuery(query: string): void {
        if (!query || typeof query !== 'string') {
            throw new QueryValidationError('Query must be a non-empty string');
        }

        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) {
            throw new QueryValidationError('Query cannot be empty', query);
        }

        if (trimmedQuery.length > 500) {
            throw new QueryValidationError('Query too long (max 500 characters)', query);
        }
    }

    /**
     * Parse LLM JSON response
     */
    private parseLLMResponse(response: string) {
        try {
            const parsed = JSON.parse(response.trim());

            // Validate response structure
            if (!parsed || typeof parsed !== 'object') {
                throw new Error('Response is not a valid object');
            }

            return parsed;
        } catch (error) {
            throw new LLMParsingError(
                `Failed to parse LLM JSON response: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
                error instanceof Error ? error : undefined
            );
        }
    }


    /**
     * Fallback keyword parsing when LLM is unavailable
     */
    private  buildFallbackQuery(userInput: string): MongoQuerySuccess {
        const text = userInput.toLowerCase();
        const collection: CollectionName = "posts";

        const filter: Record<string, any> = {};
        const sort: Record<string, 1 | -1> = {};

        const numericPatterns = [
          { field: "likeCount", regex: /more than (\d+) likes?/ },
          { field: "likeCount", regex: /less than (\d+) likes?/ },
          { field: "commentCount", regex: /more than (\d+) comments?/ }
        ];

        for (const pattern of numericPatterns) {
          const match = text.match(pattern.regex);
          if (match) {
            const value = Number(match[1]);

            if (text.includes("less than")) {
              filter[pattern.field] = { $lt: value };
            } else {
              filter[pattern.field] = { $gt: value };
            }
          }
        }

        const containsMatch = text.match(/containing (.+)/);
        if (containsMatch && collection === "posts") {
          filter.content = {
            $regex: containsMatch[1].trim(),
            $options: "i"
          };
        }
      
        if (text.includes("newest")) {
          sort.createdAt = -1;
        }
      
        if (text.includes("oldest")) {
          sort.createdAt = 1;
        }
      
        if (text.includes("most liked")) {
          sort.likes = -1;
        }
      
        const limitMatch = text.match(/limit (\d+)/);
        let limit = DEFAULT_LIMIT;
      
        if (limitMatch) {
          limit = Math.min(Number(limitMatch[1]), MAX_LIMIT);
        }
      
        return {
          collection,
          filter,
          sort,
          limit
        };
      }
}

export default new QueryParserService();