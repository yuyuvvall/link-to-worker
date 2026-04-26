export type CollectionName = "posts"

export interface MongoQuerySuccess {
    collection: CollectionName
    filter: Record<string, unknown>
    sort?: Record<string, 1 | -1>
    limit: number
}
export interface MongoQueryResponse {
    collection: "posts"
    filter: Record<string, unknown>
    sort?: Record<string, 1 | -1>
    limit: number
    error?: string
}

export interface QueryParsingOptions {
    maxKeywords?: number
    strictParsing?: boolean
    fallbackToKeywords?: boolean
}

export class QueryParsingError extends Error {
    constructor(message: string, public originalQuery?: string, public originalError?: Error) {
        super(message)
        this.name = 'QueryParsingError'
    }
}

export class QueryValidationError extends QueryParsingError {
    constructor(message: string, originalQuery?: string) {
        super(message, originalQuery)
        this.name = 'QueryValidationError'
    }
}
