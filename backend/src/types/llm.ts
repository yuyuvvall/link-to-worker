export interface LLMOptions {
    temperature?: number;
    top_p?: number;
    num_predict?: number;
    format?: 'json' | 'text';
}

export interface LLMRequest {
    model: string;
    prompt: string;
    stream?: boolean;
    format?: 'json' | 'text';
    options?: LLMOptions;
}

export interface LLMResponse {
    success: boolean;
    response: string;
    model: string;
    created_at: string;
    done: boolean;
}

export interface ModelInfo {
    name: string;
    modified_at: string;
    size: number;
    digest: string;
    details: {
        format: string;
        family: string;
    };
}

export interface ModelsResponse {
    models: ModelInfo[];
}

// Error Types
export class LLMServiceError extends Error {
    constructor(message: string, public statusCode?: number, public originalError?: Error) {
        super(message);
        this.name = 'LLMServiceError';
    }
}

export class LLMConnectionError extends LLMServiceError {
    constructor(message: string, originalError?: Error) {
        super(message, undefined, originalError);
        this.name = 'LLMConnectionError';
    }
}

export class LLMAuthenticationError extends LLMServiceError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'LLMAuthenticationError';
    }
}

export class LLMTimeoutError extends LLMServiceError {
    constructor(message: string) {
        super(message, 408);
        this.name = 'LLMTimeoutError';
    }
}

export class LLMParsingError extends LLMServiceError {
    constructor(message: string, originalError?: Error) {
        super(message, undefined, originalError);
        this.name = 'LLMParsingError';
    }
}