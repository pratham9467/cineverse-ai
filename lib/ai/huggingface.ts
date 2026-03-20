/**
 * CineVerse AI - Hugging Face Client
 * 
 * Free inference API for open-source models.
 * Get free API key at: https://huggingface.co/settings/tokens
 */

import { AI_CONFIG, AIError, AIErrorCodes, ChatMessage, Result, success, failure, validateConfig } from './config';

// ============================================================================
// HUGGING FACE CONFIGURATION
// ============================================================================

const HF_API_URL = 'https://router.huggingface.co/hf-inference/models';
const HF_API_KEY = process.env.EXPO_PUBLIC_HF_API_KEY || '';

/** Free models available on Hugging Face Inference API */
export const HF_MODELS = {
  /** Mistral 7B - Great for recommendations */
  MISTRAL_7B: 'mistralai/Mistral-7B-Instruct-v0.3',
  /** Google Gemma 2B - Fast and lightweight */
  GEMMA_2B: 'google/gemma-2-2b-it',
  /** Zephyr 7B - Chat optimized */
  ZEPHYR_7B: 'HuggingFaceH4/zephyr-7b-beta',
  /** Llama 3.2 3B - Meta's latest */
  LLAMA_3_2: 'meta-llama/Llama-3.2-3B-Instruct',
  /** Phi 3 Mini - Microsoft's small model */
  PHI_3_MINI: 'microsoft/Phi-3-mini-4k-instruct',
} as const;

export type HFModel = typeof HF_MODELS[keyof typeof HF_MODELS];

// ============================================================================
// TYPES
// ============================================================================

interface HFRequest {
  inputs: string;
  parameters?: {
    max_new_tokens?: number;
    temperature?: number;
    return_full_text?: boolean;
    do_sample?: boolean;
  };
}

interface HFResponse {
  generated_text?: string;
  error?: string;
  estimated_time?: number;
}

// ============================================================================
// HUGGING FACE CLIENT
// ============================================================================

export class HuggingFaceClient {
  private readonly apiKey: string;
  private readonly defaultModel: HFModel;

  constructor(apiKey?: string, model?: HFModel) {
    this.apiKey = apiKey || HF_API_KEY;
    this.defaultModel = model || HF_MODELS.MISTRAL_7B;
  }

  /**
   * Generate text using Hugging Face Inference API
   */
  async generate(
    messages: ChatMessage[],
    model?: HFModel
  ): Promise<Result<string>> {
    const selectedModel = model || this.defaultModel;

    // Validate API key
    if (!this.apiKey || this.apiKey === 'your_api_key_here') {
      return failure(new AIError(
        'Hugging Face API key not configured. Add EXPO_PUBLIC_HF_API_KEY to your .env file. Get free key at: https://huggingface.co/settings/tokens',
        AIErrorCodes.CONFIGURATION_ERROR,
        { isRetryable: false }
      ));
    }

    // Convert messages to prompt format
    const prompt = this.messagesToPrompt(messages);

    try {
      const response = await fetch(`${HF_API_URL}/${selectedModel}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 800,
            temperature: 0.7,
            return_full_text: false,
            do_sample: true,
          },
        } as HFRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        // Handle model loading (cold start)
        if (response.status === 503) {
          return failure(new AIError(
            'Model is loading. Please try again in a few seconds.',
            AIErrorCodes.API_ERROR,
            { statusCode: response.status, isRetryable: true }
          ));
        }

        // Handle permission errors
        if (response.status === 403) {
          return failure(new AIError(
            'Hugging Face token lacks permissions. Create a "Read" token at https://huggingface.co/settings/tokens',
            AIErrorCodes.API_ERROR,
            { statusCode: response.status, isRetryable: false }
          ));
        }

        return failure(new AIError(
          `Hugging Face API error: ${response.status} - ${errorText}`,
          AIErrorCodes.API_ERROR,
          { statusCode: response.status, isRetryable: response.status >= 500 }
        ));
      }

      const data = await response.json() as HFResponse[];

      if (data[0]?.error) {
        return failure(new AIError(
          `Hugging Face error: ${data[0].error}`,
          AIErrorCodes.API_ERROR,
          { isRetryable: true }
        ));
      }

      const generatedText = data[0]?.generated_text || '';
      
      if (!generatedText) {
        return failure(new AIError(
          'Empty response from Hugging Face',
          AIErrorCodes.PARSING_ERROR,
          { isRetryable: true }
        ));
      }

      return success(generatedText);

    } catch (error) {
      return failure(new AIError(
        'Network error connecting to Hugging Face',
        AIErrorCodes.NETWORK_ERROR,
        { isRetryable: true, cause: error as Error }
      ));
    }
  }

  /**
   * Convert chat messages to a single prompt string
   * Hugging Face models use different chat templates
   */
  private messagesToPrompt(messages: ChatMessage[]): string {
    let prompt = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        prompt += `<|system|>\n${message.content}</s>\n`;
      } else if (message.role === 'user') {
        prompt += `<|user|>\n${message.content}</s>\n`;
      } else if (message.role === 'assistant') {
        prompt += `<|assistant|>\n${message.content}</s>\n`;
      }
    }
    
    // Add assistant prompt at the end
    prompt += '<|assistant|>\n';
    
    return prompt;
  }

  /**
   * Check if Hugging Face is configured
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_api_key_here';
  }

  /**
   * Get available models
   */
  static getAvailableModels() {
    return [
      { id: HF_MODELS.MISTRAL_7B, name: 'Mistral 7B', description: 'Best for recommendations' },
      { id: HF_MODELS.GEMMA_2B, name: 'Gemma 2B', description: 'Fast and lightweight' },
      { id: HF_MODELS.ZEPHYR_7B, name: 'Zephyr 7B', description: 'Chat optimized' },
      { id: HF_MODELS.LLAMA_3_2, name: 'Llama 3.2 3B', description: 'Meta latest' },
      { id: HF_MODELS.PHI_3_MINI, name: 'Phi 3 Mini', description: 'Microsoft small model' },
    ];
  }
}

// ============================================================================
// SINGLETON
// ============================================================================

let hfClientInstance: HuggingFaceClient | null = null;

export function getHuggingFaceClient(): HuggingFaceClient {
  if (!hfClientInstance) {
    hfClientInstance = new HuggingFaceClient();
  }
  return hfClientInstance;
}

export function resetHuggingFaceClient(): void {
  hfClientInstance = null;
}
