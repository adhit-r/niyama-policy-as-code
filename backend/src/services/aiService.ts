import axios from 'axios';
import { logger } from '../utils/logger';
import { 
  AIPolicyGenerationRequest, 
  AIPolicyGenerationResponse,
  AIPolicyOptimizationRequest,
  AIPolicyOptimizationResponse,
  PolicyCategory,
  PolicyLanguage
} from '../types';

class AIService {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

    if (!this.apiKey) {
      logger.warn('Gemini API key not provided. AI features will be disabled.');
    }
  }

  private async makeRequest(prompt: string, context?: any): Promise<string> {
    if (!this.apiKey) {
      throw new Error('AI service not configured. Please provide GEMINI_API_KEY.');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/models/${this.model}:generateContent`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: this.apiKey
          },
          timeout: 30000
        }
      );

      return response.data.candidates[0].content.parts[0].text;
    } catch (error: any) {
      logger.error('Gemini API request failed:', error.response?.data || error.message);
      throw new Error(`AI service error: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  async generatePolicy(request: AIPolicyGenerationRequest): Promise<AIPolicyGenerationResponse> {
    const prompt = this.buildPolicyGenerationPrompt(request);
    
    try {
      const response = await this.makeRequest(prompt, request.context);
      return this.parsePolicyGenerationResponse(response, request);
    } catch (error) {
      logger.error('Policy generation failed:', error);
      throw error;
    }
  }

  async optimizePolicy(request: AIPolicyOptimizationRequest): Promise<AIPolicyOptimizationResponse> {
    const prompt = this.buildPolicyOptimizationPrompt(request);
    
    try {
      const response = await this.makeRequest(prompt, request.context);
      return this.parsePolicyOptimizationResponse(response, request);
    } catch (error) {
      logger.error('Policy optimization failed:', error);
      throw error;
    }
  }

  async explainPolicy(policyContent: string, language: PolicyLanguage): Promise<string> {
    const prompt = this.buildPolicyExplanationPrompt(policyContent, language);
    
    try {
      const response = await this.makeRequest(prompt);
      return response;
    } catch (error) {
      logger.error('Policy explanation failed:', error);
      throw error;
    }
  }

  async suggestImprovements(policyContent: string, language: PolicyLanguage): Promise<string[]> {
    const prompt = this.buildImprovementSuggestionPrompt(policyContent, language);
    
    try {
      const response = await this.makeRequest(prompt);
      return this.parseImprovementSuggestions(response);
    } catch (error) {
      logger.error('Improvement suggestions failed:', error);
      throw error;
    }
  }

  private buildPolicyGenerationPrompt(request: AIPolicyGenerationRequest): string {
    const { description, category, language, framework } = request;
    
    let prompt = `You are an expert Policy as Code engineer. Generate a ${language.toUpperCase()} policy for the following requirement:

**Description:** ${description}
**Category:** ${category}
**Language:** ${language.toUpperCase()}`;

    if (framework) {
      prompt += `\n**Compliance Framework:** ${framework}`;
    }

    prompt += `\n\nPlease provide:
1. A well-structured policy that follows best practices
2. Clear comments explaining the policy logic
3. Proper error handling and validation
4. Compliance with the specified framework (if applicable)

The policy should be production-ready and follow security best practices.`;

    if (language === PolicyLanguage.REGO) {
      prompt += `\n\nFor Rego policies, use the standard OPA format with proper package declarations and import statements.`;
    } else if (language === PolicyLanguage.YAML) {
      prompt += `\n\nFor YAML policies, use proper YAML syntax with clear structure and comments.`;
    } else if (language === PolicyLanguage.JSON) {
      prompt += `\n\nFor JSON policies, use proper JSON syntax with clear structure.`;
    }

    return prompt;
  }

  private buildPolicyOptimizationPrompt(request: AIPolicyOptimizationRequest): string {
    const { optimizationType } = request;
    
    return `You are an expert Policy as Code engineer. Analyze and optimize the following policy for ${optimizationType}:

**Policy Content:**
${request.policyId} // This would be the actual policy content

**Optimization Focus:** ${optimizationType}

Please provide:
1. The optimized policy code
2. A detailed explanation of the improvements made
3. Performance impact analysis
4. Security considerations
5. Best practices applied

Focus on making the policy more efficient, secure, and maintainable while preserving its original functionality.`;
  }

  private buildPolicyExplanationPrompt(policyContent: string, language: PolicyLanguage): string {
    return `You are an expert Policy as Code engineer. Explain the following ${language.toUpperCase()} policy in simple terms:

**Policy Content:**
${policyContent}

Please provide:
1. A clear explanation of what this policy does
2. The main rules and conditions
3. When this policy would be triggered
4. What actions it would take
5. Any potential security or compliance implications

Make the explanation accessible to both technical and non-technical stakeholders.`;
  }

  private buildImprovementSuggestionPrompt(policyContent: string, language: PolicyLanguage): string {
    return `You are an expert Policy as Code engineer. Analyze the following ${language.toUpperCase()} policy and suggest improvements:

**Policy Content:**
${policyContent}

Please provide specific, actionable suggestions for:
1. Security enhancements
2. Performance optimizations
3. Code readability improvements
4. Best practice compliance
5. Error handling improvements

Format each suggestion as a clear, actionable item with explanation.`;
  }

  private parsePolicyGenerationResponse(response: string, request: AIPolicyGenerationRequest): AIPolicyGenerationResponse {
    // Parse the AI response to extract policy, explanation, and suggestions
    const lines = response.split('\n');
    let policy = '';
    let explanation = '';
    let suggestions: string[] = [];
    let confidence = 0.8; // Default confidence

    // Simple parsing logic - in production, this would be more sophisticated
    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('```') && currentSection === '') {
        currentSection = 'policy';
        continue;
      } else if (line.includes('```') && currentSection === 'policy') {
        currentSection = 'explanation';
        continue;
      }

      if (currentSection === 'policy') {
        policy += line + '\n';
      } else if (currentSection === 'explanation') {
        explanation += line + '\n';
      }
    }

    // Extract suggestions from explanation
    if (explanation.includes('Suggestions:')) {
      const suggestionLines = explanation.split('Suggestions:')[1]?.split('\n') || [];
      suggestions = suggestionLines
        .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
        .map(line => line.replace(/^[-•]\s*/, '').trim())
        .filter(line => line.length > 0);
    }

    return {
      policy: policy.trim(),
      explanation: explanation.trim(),
      confidence,
      suggestions,
      complianceMappings: [] // Would be populated based on framework analysis
    };
  }

  private parsePolicyOptimizationResponse(response: string, request: AIPolicyOptimizationRequest): AIPolicyOptimizationResponse {
    // Parse optimization response
    const lines = response.split('\n');
    let originalPolicy = '';
    let optimizedPolicy = '';
    let improvements: any[] = [];
    let confidence = 0.8;

    // Simple parsing - in production, this would be more sophisticated
    let currentSection = '';
    
    for (const line of lines) {
      if (line.includes('Original Policy:') || line.includes('```original')) {
        currentSection = 'original';
        continue;
      } else if (line.includes('Optimized Policy:') || line.includes('```optimized')) {
        currentSection = 'optimized';
        continue;
      } else if (line.includes('Improvements:')) {
        currentSection = 'improvements';
        continue;
      }

      if (currentSection === 'original') {
        originalPolicy += line + '\n';
      } else if (currentSection === 'optimized') {
        optimizedPolicy += line + '\n';
      } else if (currentSection === 'improvements') {
        if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
          improvements.push({
            type: 'optimization',
            description: line.replace(/^[-•]\s*/, '').trim(),
            impact: 'positive',
            code: ''
          });
        }
      }
    }

    return {
      originalPolicy: originalPolicy.trim(),
      optimizedPolicy: optimizedPolicy.trim(),
      improvements,
      confidence
    };
  }

  private parseImprovementSuggestions(response: string): string[] {
    const lines = response.split('\n');
    return lines
      .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().startsWith('1.'))
      .map(line => line.replace(/^[-•1-9.]\s*/, '').trim())
      .filter(line => line.length > 0);
  }

  // Health check for AI service
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.apiKey) {
        return false;
      }

      const response = await axios.get(
        `${this.baseUrl}/models/${this.model}`,
        {
          params: { key: this.apiKey },
          timeout: 5000
        }
      );

      return response.status === 200;
    } catch (error) {
      logger.error('AI service health check failed:', error);
      return false;
    }
  }
}

export const aiService = new AIService();



