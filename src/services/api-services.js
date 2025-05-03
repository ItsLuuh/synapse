// API Service Modules for different LLM providers

/**
 * Base API Service class that all provider-specific services will extend
 */
class BaseApiService {
  constructor(apiKey, model, temperature, endpoint = null) {
    this.apiKey = apiKey;
    this.model = model;
    this.temperature = temperature;
    this.endpoint = endpoint;
  }

  async generateResponse(prompt) {
    throw new Error('Method not implemented. Each provider must implement this method.');
  }
}

/**
 * OpenAI API Service
 */
class OpenAIService extends BaseApiService {
  constructor(apiKey, model = 'gpt-3.5-turbo', temperature = 0.7, endpoint = 'https://api.openai.com/v1/chat/completions') {
    super(apiKey, model, temperature, endpoint);
  }

  async generateResponse(prompt) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}

/**
 * DeepSeek API Service
 */
class DeepSeekService extends BaseApiService {
  constructor(apiKey, model = 'deepseek-chat', temperature = 0.7, endpoint = 'https://api.deepseek.com/v1/chat/completions') {
    super(apiKey, model, temperature, endpoint);
  }

  async generateResponse(prompt) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.temperature
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('DeepSeek API Error:', error);
      throw error;
    }
  }
}

/**
 * Anthropic API Service
 */
class AnthropicService extends BaseApiService {
  constructor(apiKey, model = 'claude-3-opus-20240229', temperature = 0.7, endpoint = 'https://api.anthropic.com/v1/messages') {
    super(apiKey, model, temperature, endpoint);
  }

  async generateResponse(prompt) {
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: this.temperature,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Anthropic API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return data.content[0].text;
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create the appropriate API service based on provider name
 */
function createApiService(provider) {
  if (!provider) return null;
  
  switch(provider.name.toLowerCase()) {
    case 'openai':
      return new OpenAIService(provider.apiKey, provider.model, provider.temperature, provider.endpoint);
    case 'deepseek':
      return new DeepSeekService(provider.apiKey, provider.model, provider.temperature, provider.endpoint);
    case 'anthropic':
      return new AnthropicService(provider.apiKey, provider.model, provider.temperature, provider.endpoint);
    default:
      console.error(`Unknown provider: ${provider.name}`);
      return null;
  }
}

module.exports = {
  createApiService,
  OpenAIService,
  DeepSeekService,
  AnthropicService
};