import queryParserService from '../services/query_parser'
import { QueryValidationError } from '../types/search'

// Access private methods via type casting
const buildFallback = (input: string) =>
    (queryParserService as any).buildFallbackQuery(input)

const validateQuery = (input: unknown) =>
    (queryParserService as any).validateQuery(input)

const validateParsed = (input: unknown) =>
    (queryParserService as any).validateParsedQuery(input)

describe('QueryParserService — buildFallbackQuery', () => {
    test('posts with more than 5 likes → posts, likes $gt 5', () => {
        const result = buildFallback('posts with more than 5 likes')
        expect(result.collection).toBe('posts')
        expect(result.filter.likeCount).toEqual({ $gt: 5 })
        expect(result.limit).toBe(20)
    })

    test('posts with less than 3 likes → posts, likes $lt 3', () => {
        const result = buildFallback('posts with less than 3 likes')
        expect(result.collection).toBe('posts')
        expect(result.filter.likeCount).toEqual({ $lt: 3 })
    })

    test('posts with more than 10 comments → posts, commentsCount $gt 10', () => {
        const result = buildFallback('posts with more than 10 comments')
        expect(result.collection).toBe('posts')
        expect(result.filter.commentCount).toEqual({ $gt: 10 })
    })

    test('posts containing frontend → posts, content regex frontend', () => {
        const result = buildFallback('posts containing frontend')
        expect(result.collection).toBe('posts')
        expect(result.filter.content).toEqual({ $regex: 'frontend', $options: 'i' })
    })

    test('newest posts → sort createdAt: -1', () => {
        const result = buildFallback('newest posts')
        expect(result.sort).toEqual({ createdAt: -1 })
    })

    test('oldest posts → sort createdAt: 1', () => {
        const result = buildFallback('oldest posts')
        expect(result.sort).toEqual({ createdAt: 1 })
    })

    test('most liked posts → sort likes: -1', () => {
        const result = buildFallback('most liked posts')
        expect(result.sort).toEqual({ likes: -1 })
    })

    test('limit 10 posts → limit: 10', () => {
        const result = buildFallback('limit 10 posts')
        expect(result.limit).toBe(10)
    })

    test('limit 200 posts → clamped to MAX_LIMIT (100)', () => {
        const result = buildFallback('limit 200 posts')
        expect(result.limit).toBe(100)
    })

    test('unrecognized query → posts, empty filter, default limit 20', () => {
        const result = buildFallback('show me something cool')
        expect(result.collection).toBe('posts')
        expect(result.filter).toEqual({})
        expect(result.limit).toBe(20)
    })

    test('combined: newest posts limit 5', () => {
        const result = buildFallback('newest posts limit 5')
        expect(result.collection).toBe('posts')
        expect(result.sort).toEqual({ createdAt: -1 })
        expect(result.limit).toBe(5)
    })

    test('query without user keyword defaults to posts collection', () => {
        const result = buildFallback('some search query')
        expect(result.collection).toBe('posts')
    })
})

describe('QueryParserService — validateParsedQuery', () => {
    test('valid success schema returns parsed data', () => {
        const input = { collection: 'posts', filter: {}, limit: 20 }
        const result = validateParsed(input)
        expect(result.collection).toBe('posts')
        expect(result.limit).toBe(20)
    })

    test('valid success schema with sort returns parsed data', () => {
        const input = { collection: 'posts', filter: {}, sort: { createdAt: -1 }, limit: 10 }
        const result = validateParsed(input)
        expect(result.collection).toBe('posts')
        expect(result.sort).toEqual({ createdAt: -1 })
    })

    test('LLM error response throws QueryValidationError', () => {
        const input = { error: 'Field does not exist' }
        expect(() => validateParsed(input)).toThrow(/error/i)
    })

    test('collection: "users" is rejected after narrowing', () => {
        const input = { collection: 'users', filter: {}, limit: 20 }
        expect(() => validateParsed(input)).toThrow('Invalid structure')
    })

    test('invalid collection name throws Error("Invalid structure")', () => {
        const input = { collection: 'orders', filter: {}, limit: 20 }
        expect(() => validateParsed(input)).toThrow('Invalid structure')
    })

    test('missing collection throws Error("Invalid structure")', () => {
        const input = { filter: {}, limit: 20 }
        expect(() => validateParsed(input)).toThrow('Invalid structure')
    })

    test('limit exceeding 100 throws Error("Invalid structure")', () => {
        const input = { collection: 'posts', filter: {}, limit: 101 }
        expect(() => validateParsed(input)).toThrow('Invalid structure')
    })

    test('limit of 0 throws Error("Invalid structure")', () => {
        const input = { collection: 'posts', filter: {}, limit: 0 }
        expect(() => validateParsed(input)).toThrow('Invalid structure')
    })

    test('completely wrong shape throws Error("Invalid structure")', () => {
        expect(() => validateParsed('not an object')).toThrow('Invalid structure')
        expect(() => validateParsed(null)).toThrow('Invalid structure')
        expect(() => validateParsed(42)).toThrow('Invalid structure')
    })
})

describe('QueryParserService — validateQuery (private)', () => {
    test('empty string throws QueryValidationError', () => {
        expect(() => validateQuery('')).toThrow(QueryValidationError)
    })

    test('whitespace-only string throws QueryValidationError', () => {
        expect(() => validateQuery('   ')).toThrow(QueryValidationError)
    })

    test('string over 500 chars throws QueryValidationError', () => {
        expect(() => validateQuery('a'.repeat(501))).toThrow(QueryValidationError)
    })

    test('string of exactly 500 chars does not throw', () => {
        expect(() => validateQuery('a'.repeat(500))).not.toThrow()
    })

    test('null throws QueryValidationError', () => {
        expect(() => validateQuery(null)).toThrow(QueryValidationError)
    })

    test('undefined throws QueryValidationError', () => {
        expect(() => validateQuery(undefined)).toThrow(QueryValidationError)
    })

    test('valid string does not throw', () => {
        expect(() => validateQuery('frontend developer posts')).not.toThrow()
    })
})
