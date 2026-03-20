/**
 * CineVerse AI - Ollama Client
 * 
 * Production-grade API client with:
 * - Automatic retry with exponential backoff
 * - Request timeout handling
 * - Circuit breaker pattern
 * - Response caching
 * - Analytics/logging
 */

import {
  AI_CONFIG,
  AIError,
  AIErrorCodes,
  AICompletionResponse,
  AIRequestOptions,
  ChatMessage,
  CacheEntry,
  CircuitState,
  CircuitStatus,
  AIAnalyticsEvent,
  Result,
  success,
  failure,
  validateConfig,
  createCacheKey,
} from './config';

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

/**
 * Simple in-memory cache with TTL support
 * 
 * Production Note: For server-side, consider Redis
 * For client-side, this works well for session-level caching
 */
class ResponseCache {
  private cache: Map<string, CacheEntry<AICompletionResponse>> = new Map();
  private hits = 0;
  private misses = 0;

  get(key: string): CacheEntry<AICompletionResponse> | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.misses++;
      return null;
    }
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }
    
    this.hits++;
    return entry;
  }

  set(key: string, data: AICompletionResponse, ttl: number = AI_CONFIG.CACHE_TTL): void {
    // Evict oldest entries if at max size
    if (this.cache.size >= AI_CONFIG.CACHE_MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 
        ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) + '%'
        : '0%',
    };
  }
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

/**
 * Circuit Breaker implementation
 * 
 * Prevents cascading failures by stopping requests when the API is down.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: API failing, requests are blocked immediately
 * - HALF-OPEN: Testing if API recovered, allow one request through
 */
class CircuitBreaker {
  private state: CircuitState = 'closed';
  private failureCount = 0;
  private lastFailureTime: number | null = null;
  private nextAttemptTime: number | null = null;

  constructor(
    private readonly threshold: number = AI_CONFIG.CIRCUIT_BREAKER_THRESHOLD,
    private readonly resetTimeout: number = AI_CONFIG.CIRCUIT_BREAKER_RESET_TIMEOUT
  ) {}

  /** Check if request should be allowed */
  canExecute(): boolean {
    if (this.state === 'closed') {
      return true;
    }

    if (this.state === 'open') {
      // Check if enough time has passed to try again
      if (this.nextAttemptTime && Date.now() >= this.nextAttemptTime) {
        this.state = 'half-open';
        return true;
      }
      return false;
    }

    // half-open: allow one request through
    return true;
  }

  /** Record a successful request */
  onSuccess(): void {
    this.failureCount = 0;
    this.state = 'closed';
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }

  /** Record a failed request */
  onFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.threshold) {
      this.state = 'open';
      this.nextAttemptTime = Date.now() + this.resetTimeout;
    }
  }

  /** Get current circuit status */
  getStatus(): CircuitStatus {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
    };
  }

  /** Reset circuit breaker to closed state */
  reset(): void {
    this.state = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = null;
    this.nextAttemptTime = null;
  }
}

// ============================================================================
// ANALYTICS COLLECTOR
// ============================================================================

/**
 * Simple analytics collector for monitoring AI performance
 * 
 * Production Note: Replace with proper telemetry (Mixpanel, Amplitude, etc.)
 */
class AnalyticsCollector {
  private events: AIAnalyticsEvent[] = [];
  private readonly maxEvents = 1000;

  track(event: Omit<AIAnalyticsEvent, 'timestamp'>): void {
    const fullEvent: AIAnalyticsEvent = {
      ...event,
      timestamp: Date.now(),
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to console in development
    if (__DEV__) {
      console.log('[AI Analytics]', event.type, event);
    }
  }

  getEvents(): AIAnalyticsEvent[] {
    return [...this.events];
  }

  getStats() {
    const successEvents = this.events.filter(e => e.type === 'success');
    const errorEvents = this.events.filter(e => e.type === 'error');
    const cacheHits = this.events.filter(e => e.type === 'cache_hit');

    const avgLatency = successEvents.length > 0
      ? successEvents.reduce((sum, e) => sum + (e.latencyMs || 0), 0) / successEvents.length
      : 0;

    return {
      totalRequests: successEvents.length + errorEvents.length,
      successCount: successEvents.length,
      errorCount: errorEvents.length,
      cacheHitCount: cacheHits.length,
      avgLatencyMs: Math.round(avgLatency),
    };
  }

  clear(): void {
    this.events = [];
  }
}

// ============================================================================
// OLLAMA CLIENT CLASS
// ============================================================================

/**
 * Production-grade Ollama API client
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Request timeout with AbortController
 * - Circuit breaker for failure protection
 * - Response caching
 * - Analytics and monitoring
 */
export class OllamaClient {
  private readonly cache: ResponseCache;
  private readonly circuitBreaker: CircuitBreaker;
  private readonly analytics: AnalyticsCollector;
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    this.cache = new ResponseCache();
    this.circuitBreaker = new CircuitBreaker();
    this.analytics = new AnalyticsCollector();
    this.apiKey = apiKey || process.env.EXPO_PUBLIC_OLLAMA_API_KEY || '';
  }

  /**
   * Generate a chat completion
   * 
   * @param messages - Array of chat messages
   * @param options - Request options
   * @returns Result with response or error
   */
  async chat(
    messages: ChatMessage[],
    options: AIRequestOptions = {}
  ): Promise<Result<AICompletionResponse>> {
    const startTime = Date.now();
    const model = options.model || AI_CONFIG.DEFAULT_MODEL;

    // Validate configuration first
    const configValidation = validateConfig();
    if (!configValidation.success) {
      return configValidation;
    }

    // Check circuit breaker
    if (!this.circuitBreaker.canExecute()) {
      this.analytics.track({ type: 'error', model, errorCode: AIErrorCodes.CIRCUIT_OPEN });
      return failure(new AIError(
        'AI service temporarily unavailable (circuit breaker open)',
        AIErrorCodes.CIRCUIT_OPEN,
        { isRetryable: true, context: { circuitStatus: this.circuitBreaker.getStatus() } }
      ));
    }

    // Check cache first
    const cacheKey = createCacheKey(messages, model);
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      this.analytics.track({ type: 'cache_hit', model, cached: true });
      return success({
        ...cached.data,
        cached: true,
      });
    }

    // Execute with retry
    const result = await this.executeWithRetry(messages, options, model);
    
    const latencyMs = Date.now() - startTime;

    if (result.success) {
      this.circuitBreaker.onSuccess();
      this.cache.set(cacheKey, result.data);
      this.analytics.track({ 
        type: 'success', 
        model, 
        latencyMs,
        cached: false,
      });
    } else {
      this.circuitBreaker.onFailure();
      this.analytics.track({ 
        type: 'error', 
        model, 
        latencyMs,
        errorCode: result.error.code,
      });
    }

    return result;
  }

  /**
   * Execute request with retry logic
   */
  private async executeWithRetry(
    messages: ChatMessage[],
    options: AIRequestOptions,
    model: string
  ): Promise<Result<AICompletionResponse>> {
    const maxRetries = options.retries ?? AI_CONFIG.MAX_RETRIES;
    let lastError: AIError | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.executeRequest(messages, options, model);
        
        if (result.success) {
          return result;
        }
        
        lastError = result.error;

        // Don't retry non-retryable errors
        if (!result.error.isRetryable) {
          return result;
        }

        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Exponential backoff delay
        const delay = Math.min(
          AI_CONFIG.RETRY_BASE_DELAY * Math.pow(2, attempt),
          AI_CONFIG.RETRY_MAX_DELAY
        );
        
        console.log(`[AI] Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
        await this.sleep(delay);

      } catch (error) {
        lastError = error instanceof AIError 
          ? error 
          : new AIError(
              'Unexpected error during AI request',
              AIErrorCodes.API_ERROR,
              { isRetryable: true, cause: error as Error }
            );
        
        if (attempt === maxRetries) break;
        
        const delay = Math.min(
          AI_CONFIG.RETRY_BASE_DELAY * Math.pow(2, attempt),
          AI_CONFIG.RETRY_MAX_DELAY
        );
        await this.sleep(delay);
      }
    }

    return failure(
      lastError || new AIError(
        'All retry attempts exhausted',
        AIErrorCodes.FALLBACK_EXHAUSTED,
        { isRetryable: false }
      )
    );
  }

  /**
   * Execute a single API request
   */
  private async executeRequest(
    messages: ChatMessage[],
    options: AIRequestOptions,
    model: string
  ): Promise<Result<AICompletionResponse>> {
    const timeout = options.timeout || AI_CONFIG.REQUEST_TIMEOUT;
    const abortController = new AbortController();

    // Set up timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    // Combine external signal with our timeout
    const signal = options.signal 
      ? this.combineSignals([options.signal, abortController.signal])
      : abortController.signal;

    try {
      // OpenAI-compatible format for Ollama Cloud
      const requestBody = {
        model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        stream: false,
        temperature: options.temperature ?? AI_CONFIG.TEMPERATURE,
        max_tokens: options.maxTokens ?? AI_CONFIG.MAX_TOKENS,
      };

      const response = await fetch(`${AI_CONFIG.API_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          return failure(new AIError(
            'Rate limit exceeded. Please try again later.',
            AIErrorCodes.RATE_LIMIT_ERROR,
            { 
              statusCode: response.status, 
              isRetryable: true,
              context: { retryAfter: response.headers.get('Retry-After') }
            }
          ));
        }

        return failure(new AIError(
          `API request failed: ${response.status} ${response.statusText}`,
          AIErrorCodes.API_ERROR,
          { 
            statusCode: response.status, 
            isRetryable: response.status >= 500,
            context: { errorBody }
          }
        ));
      }

      const data = await response.json();

      // Validate response structure - OpenAI format
      if (!data.choices || !data.choices[0]?.message?.content) {
        return failure(new AIError(
          'Invalid API response: missing message content',
          AIErrorCodes.PARSING_ERROR,
          { isRetryable: false, context: { response: data } }
        ));
      }

      const completion: AICompletionResponse = {
        id: data.id || this.generateRequestId(),
        model: data.model || model,
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        latencyMs: 0, // Will be set by caller
        cached: false,
      };

      return success(completion);

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof AIError) {
        return failure(error);
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return failure(new AIError(
            `Request timeout after ${timeout}ms`,
            AIErrorCodes.TIMEOUT_ERROR,
            { isRetryable: true }
          ));
        }

        if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          return failure(new AIError(
            'Network error. Please check your connection.',
            AIErrorCodes.NETWORK_ERROR,
            { isRetryable: true, cause: error }
          ));
        }
      }

      return failure(new AIError(
        'Unexpected error during API request',
        AIErrorCodes.API_ERROR,
        { isRetryable: true, cause: error as Error }
      ));
    }
  }

  /**
   * Simple text generation (convenience method)
   */
  async generateText(
    messages: ChatMessage[],
    options?: AIRequestOptions
  ): Promise<Result<string>> {
    const result = await this.chat(messages, options);
    
    if (result.success) {
      return success(result.data.content);
    }
    
    return result;
  }

  /**
   * Check API connectivity
   */
  async healthCheck(): Promise<Result<{ latencyMs: number }>> {
    const startTime = Date.now();
    
    const result = await this.chat(
      [{ role: 'user', content: 'Hi' }],
      { 
        model: AI_CONFIG.DEFAULT_MODEL,
        timeout: 10_000,
        retries: 0,
      }
    );

    if (result.success) {
      return success({ latencyMs: Date.now() - startTime });
    }

    return result;
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Get circuit breaker status
   */
  getCircuitStatus(): CircuitStatus {
    return this.circuitBreaker.getStatus();
  }

  /**
   * Get analytics statistics
   */
  getAnalyticsStats() {
    return this.analytics.getStats();
  }

  /**
   * Reset circuit breaker (manual recovery)
   */
  resetCircuit(): void {
    this.circuitBreaker.reset();
  }

  /**
   * Clear response cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  // Private utility methods

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateRequestId(): string {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private combineSignals(signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      signal.addEventListener('abort', () => controller.abort(), { once: true });
    }
    
    return controller.signal;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/** Singleton instance for app-wide use */
let clientInstance: OllamaClient | null = null;

/**
 * Get or create the Ollama client singleton
 */
export function getOllamaClient(): OllamaClient {
  if (!clientInstance) {
    clientInstance = new OllamaClient();
  }
  return clientInstance;
}

/**
 * Reset the singleton (useful for testing)
 */
export function resetOllamaClient(): void {
  clientInstance = null;
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Quick text generation using singleton client
 */
export async function generateText(
  messages: ChatMessage[],
  options?: AIRequestOptions
): Promise<Result<string>> {
  return getOllamaClient().generateText(messages, options);
}

/**
 * Quick chat completion using singleton client
 */
export async function chat(
  messages: ChatMessage[],
  options?: AIRequestOptions
): Promise<Result<AICompletionResponse>> {
  return getOllamaClient().chat(messages, options);
}
