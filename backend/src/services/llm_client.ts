import {
    LLMRequest,
    LLMResponse,
    ModelsResponse,
    LLMOptions,
    LLMServiceError,
    LLMConnectionError,
    LLMAuthenticationError,
    LLMTimeoutError,
    LLMParsingError
} from '../types/llm';

interface LLMClientConfig {
    baseUrl: string;
    username: string;
    password: string;
    defaultModel: string;
    timeout: number;
    maxRetries: number;
}

class LLMClient {
    private config: LLMClientConfig;
    private authHeader: string;

    constructor() {
        this.config = {
            baseUrl: process.env.LLM_BASE_URL || 'http://10.10.248.41',
            username: process.env.LLM_USERNAME || 'student1',
            password: process.env.LLM_PASSWORD || 'pass123',
            defaultModel: process.env.LLM_MODEL || 'llama3.1:8b',
            timeout: parseInt(process.env.LLM_TIMEOUT || '30000'),
            maxRetries: parseInt(process.env.LLM_MAX_RETRIES || '3')
        };

        const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
        this.authHeader = `Basic ${credentials}`;
    }

    /**
     * Generate response from LLM
     */
    async generateResponse(prompt: string, options?: LLMOptions): Promise<LLMResponse> {
        const request: LLMRequest = {
            model: this.config.defaultModel,
            prompt: prompt.trim(),
            stream: false,
            format: options?.format || 'json',
            options: {
                temperature: options?.temperature || 0.7,
                top_p: options?.top_p || 0.9,
                num_predict: options?.num_predict || 1000,
                ...options
            }
        };

        return this.makeRequest('/api/generate', 'POST', request);
    }

    /**
     * List available models
     */
    async listAvailableModels(): Promise<ModelsResponse> {
        return this.makeRequest('/api/tags', 'GET');
    }

    /**
     * Health check for the LLM service
     */
    async isHealthy(): Promise<boolean> {
        try {
            const response = await this.makeRequest('/api/tags', 'GET');
            return response && typeof response === 'object';
        } catch (error) {
            console.error('LLM health check failed:', error);
            return false;
        }
    }

    /**
     * Test connection with a simple prompt
     */
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await this.generateResponse('Hello', {
                temperature: 0.1,
                num_predict: 50
            });

            if (response.success && response.response) {
                return {
                    success: true,
                    message: 'Connection successful'
                };
            } else {
                return {
                    success: false,
                    message: 'Invalid response format'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }


    private async makeRequest(endpoint: string, method: 'GET' | 'POST', body?: any): Promise<any> {
        const url = `${this.config.baseUrl.replace(/\/$/, '')}${endpoint}`;

        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

                const requestInit: RequestInit = {
                    method,
                    headers: {
                        'Authorization': this.authHeader,
                        'Content-Type': 'application/json',
                    },
                    signal: controller.signal,
                };

                if (method === 'POST' && body) {
                    requestInit.body = JSON.stringify(body);
                }

                const response = await fetch(url, requestInit);
                clearTimeout(timeoutId);


                if (!response.ok) {
                    await this.handleErrorResponse(response, attempt);
                }

                // Parse JSON response
                try {
                    return await response.json();
                } catch (parseError) {
                    throw new LLMParsingError(
                        'Failed to parse JSON response',
                        parseError instanceof Error ? parseError : undefined
                    );
                }

            } catch (error) {
                if (attempt < this.config.maxRetries) {
                    console.log(`got error, attempt ${attempt} - got error ${error}`,);
                    await this.delay(Math.pow(2, attempt) * 1000);
                    continue;
                } else {
                    // Handle network/timeout errors
                    if (error instanceof DOMException && error.name === 'AbortError') {
                        throw new LLMTimeoutError(`Request timeout after ${this.config.timeout}ms`);
                    }

                    if (error instanceof TypeError && error.message.includes('fetch')) {
                        throw new LLMConnectionError('Failed to connect to LLM service', error);
                    }

                    // Re-throw LLM-specific errors
                    if (error instanceof LLMServiceError) {
                        throw error;

                    }
                    throw new LLMServiceError(
                        `Unexpected error: ${error instanceof Error ? error.message : 'Unknown'}`,
                        undefined,
                        error instanceof Error ? error : undefined
                    );
                }
            }
        }

        throw new LLMServiceError('Max retries exceeded');
    }
    private async handleErrorResponse(response: Response, attempt: number) {
        const errorText = await response.text().catch(() => 'No error details');

        if (response.status === 401) {
            throw new LLMAuthenticationError('Authentication failed. Check credentials.');
        }

        if (response.status >= 500 && attempt < this.config.maxRetries) {
            await this.delay(Math.pow(2, attempt) * 1000);
        }

        throw new LLMServiceError(
            `HTTP ${response.status}: ${errorText}`,
            response.status
        );
    }

    /**
     * Delay utility for retry backoff
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current configuration (for debugging)
     */
    getConfig(): Partial<LLMClientConfig> {
        return {
            baseUrl: this.config.baseUrl,
            username: this.config.username,
            defaultModel: this.config.defaultModel,
            timeout: this.config.timeout,
            maxRetries: this.config.maxRetries
            // Exclude password for security
        };
    }
}

export default new LLMClient();