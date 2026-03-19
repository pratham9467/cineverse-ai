/**
 * CineVerse AI - Configuration & Types
 * 
 * Production-grade configuration with validation and type safety.
 * This module serves as the single source of truth for all AI-related config.
 */

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/** 
 * AI Service Configuration
 * All timeouts in milliseconds
 */
export const AI_CONFIG = {
  /** Ollama API endpoint */
  API_BASE_URL: 'https://ollama.com',
  
  /** Request timeout (30 seconds) */
  REQUEST_TIMEOUT: 30_000,
  
  /** Maximum retry attempts */
  MAX_RETRIES: 3,
  
  /** Initial retry delay (will be multiplied by attempt number) */
  RETRY_BASE_DELAY: 1_000,
  
  /** Maximum retry delay (exponential backoff cap) */
  RETRY_MAX_DELAY: 10_000,
  
  /** Circuit breaker: failures before opening */
  CIRCUIT_BREAKER_THRESHOLD: 5,
  
  /** Circuit breaker: time to wait before half-open (ms) */
  CIRCUIT_BREAKER_RESET_TIMEOUT: 60_000,
  
  /** Cache TTL in milliseconds (5 minutes) */
  CACHE_TTL: 5 * 60 * 1000,
  
  /** Maximum cache size */
  CACHE_MAX_SIZE: 100,
  
  /** Default AI model */
  DEFAULT_MODEL: 'llama3.1',
  
  /** Fallback model if primary fails */
  FALLBACK_MODEL: 'mistral',
  
  /** Maximum tokens in response */
  MAX_TOKENS: 1500,
  
  /** Temperature (creativity level) */
  TEMPERATURE: 0.7,
  
  /** Maximum query length */
  MAX_QUERY_LENGTH: 500,
  
  /** Maximum context movies to include in prompt */
  MAX_CONTEXT_MOVIES: 15,
} as const;

/** Available AI models with metadata */
export const AI_MODELS = {
  'llama3.1': {
    id: 'llama3.1',
    name: 'Llama 3.1',
    description: 'Fast and efficient. Best for movie recommendations.',
    recommended: true,
    maxTokens: 2000,
  },
  'llama3': {
    id: 'llama3',
    name: 'Llama 3',
    description: 'Stable and reliable.',
    recommended: false,
    maxTokens: 2000,
  },
  'mistral': {
    id: 'mistral',
    name: 'Mistral',
    description: 'General purpose, balanced performance.',
    recommended: false,
    maxTokens: 2000,
  },
  'gemma2': {
    id: 'gemma2',
    name: 'Gemma 2',
    description: 'Lightweight and fast.',
    recommended: false,
    maxTokens: 2000,
  },
} as const;

// ============================================================================
// CUSTOM ERROR TYPES
// ============================================================================

/**
 * Base AI Error class with structured error information
 * Allows proper error handling and logging
 */
export class AIError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly isRetryable: boolean;
  public readonly timestamp: Date;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: string,
    options: {
      statusCode?: number;
      isRetryable?: boolean;
      context?: Record<string, unknown>;
      cause?: Error;
    } = {}
  ) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.statusCode = options.statusCode;
    this.isRetryable = options.isRetryable ?? false;
    this.timestamp = new Date();
    this.context = options.context;
    
    if (options.cause) {
      this.cause = options.cause;
    }
    
    // Maintains proper stack trace in V8 environments
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      isRetryable: this.isRetryable,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
    };
  }
}

/** Specific error types for different failure scenarios */
export const AIErrorCodes = {
  /** API key not configured */
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR',
  /** Network failure or timeout */
  NETWORK_ERROR: 'NETWORK_ERROR',
  /** API returned 4xx/5xx */
  API_ERROR: 'API_ERROR',
  /** Rate limit exceeded */
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  /** Response parsing failed */
  PARSING_ERROR: 'PARSING_ERROR',
  /** Circuit breaker is open */
  CIRCUIT_OPEN: 'CIRCUIT_OPEN',
  /** Request timeout */
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  /** Invalid input */
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  /** All fallbacks exhausted */
  FALLBACK_EXHAUSTED: 'FALLBACK_EXHAUSTED',
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Message role in chat completion */
export type MessageRole = 'system' | 'user' | 'assistant';

/** Chat message interface */
export interface ChatMessage {
  role: MessageRole;
  content: string;
}

/** Request options for AI completion */
export interface AIRequestOptions {
  /** Override default model */
  model?: string;
  /** Override temperature */
  temperature?: number;
  /** Override max tokens */
  maxTokens?: number;
  /** Request timeout in ms */
  timeout?: number;
  /** Number of retries */
  retries?: number;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/** Response from AI API */
export interface AICompletionResponse {
  id: string;
  model: string;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  cached: boolean;
}

/** Cache entry structure */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

/** Circuit breaker state */
export type CircuitState = 'closed' | 'open' | 'half-open';

/** Circuit breaker status */
export interface CircuitStatus {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number | null;
  nextAttemptTime: number | null;
}

/** Analytics event */
export interface AIAnalyticsEvent {
  type: 'request' | 'success' | 'error' | 'cache_hit' | 'fallback';
  timestamp: number;
  model?: string;
  latencyMs?: number;
  errorCode?: string;
  cached?: boolean;
}

/** Retry configuration */
export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

/** Result wrapper for operations that can fail */
export type Result<T, E = AIError> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/** Create a success result */
export function success<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/** Create an error result */
export function failure<E extends AIError>(error: E): Result<never, E> {
  return { success: false, error };
}

/** Check if result is successful */
export function isSuccess<T>(result: Result<T>): result is { success: true; data: T } {
  return result.success;
}

/** Check if result is failure */
export function isFailure<T>(result: Result<T>): result is { success: false; error: AIError } {
  return !result.success;
}

/** Validate environment configuration */
export function validateConfig(): Result<void, AIError> {
  const apiKey = process.env.EXPO_PUBLIC_OLLAMA_API_KEY;
  
  if (!apiKey) {
    return failure(new AIError(
      'Ollama API key not configured. Add EXPO_PUBLIC_OLLAMA_API_KEY to your .env file.',
      AIErrorCodes.CONFIGURATION_ERROR,
      { isRetryable: false }
    ));
  }
  
  if (apiKey === 'your_api_key_here' || apiKey.length < 10) {
    return failure(new AIError(
      'Invalid API key. Please set a valid EXPO_PUBLIC_OLLAMA_API_KEY in your .env file.',
      AIErrorCodes.VALIDATION_ERROR,
      { isRetryable: false }
    ));
  }
  
  return success(undefined);
}

/** Create a cache key from request parameters */
export function createCacheKey(messages: ChatMessage[], model: string): string {
  const content = JSON.stringify({ messages, model });
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return `ai_${Math.abs(hash).toString(36)}`;
}
