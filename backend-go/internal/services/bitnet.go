package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

type BitNetService struct {
	client    *http.Client
	baseURL   string
	apiKey    string
}

type BitNetRequest struct {
	Model       string    `json:"model"`
	Messages    []Message `json:"messages"`
	MaxTokens   int       `json:"max_tokens,omitempty"`
	Temperature float64   `json:"temperature,omitempty"`
	Stream      bool      `json:"stream,omitempty"`
}

type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type BitNetResponse struct {
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

type Choice struct {
	Message      Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type PolicyGenerationRequest struct {
	Description string `json:"description"`
	Framework   string `json:"framework,omitempty"`
	Language    string `json:"language,omitempty"`
}

type PolicyAnalysisRequest struct {
	Policy     string `json:"policy"`
	AnalysisType string `json:"analysis_type"` // "explain", "validate", "optimize", "compliance"
}

type PolicyAnalysisResponse struct {
	Analysis   string `json:"analysis"`
	Suggestions []string `json:"suggestions,omitempty"`
	Compliance []string `json:"compliance,omitempty"`
	Issues     []string `json:"issues,omitempty"`
}

func NewBitNetService() *BitNetService {
	baseURL := os.Getenv("BITNET_API_URL")
	if baseURL == "" {
		baseURL = "http://localhost:8000/v1" // Default local BitNet server
	}

	apiKey := os.Getenv("BITNET_API_KEY")
	if apiKey == "" {
		apiKey = "dummy-key" // For local development
	}

	return &BitNetService{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
		baseURL: baseURL,
		apiKey:  apiKey,
	}
}

func (b *BitNetService) GeneratePolicy(req PolicyGenerationRequest) (string, error) {
	prompt := b.buildPolicyGenerationPrompt(req)
	
	response, err := b.callBitNet(prompt)
	if err != nil {
		return "", fmt.Errorf("failed to generate policy: %w", err)
	}

	return response, nil
}

func (b *BitNetService) AnalyzePolicy(req PolicyAnalysisRequest) (*PolicyAnalysisResponse, error) {
	prompt := b.buildAnalysisPrompt(req)
	
	response, err := b.callBitNet(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to analyze policy: %w", err)
	}

	return b.parseAnalysisResponse(response, req.AnalysisType)
}

func (b *BitNetService) ExplainPolicy(policy string) (string, error) {
	prompt := fmt.Sprintf(`Explain the following policy in simple terms:

%s

Provide a clear, non-technical explanation of what this policy does, who it affects, and what the expected outcomes are.`, policy)

	response, err := b.callBitNet(prompt)
	if err != nil {
		return "", fmt.Errorf("failed to explain policy: %w", err)
	}

	return response, nil
}

func (b *BitNetService) ValidatePolicy(policy string) (*PolicyAnalysisResponse, error) {
	prompt := fmt.Sprintf(`Analyze the following policy for potential issues, security concerns, and best practices:

%s

Identify any:
1. Syntax errors
2. Security vulnerabilities
3. Performance issues
4. Best practice violations
5. Logic errors

Provide specific suggestions for improvement.`, policy)

	response, err := b.callBitNet(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to validate policy: %w", err)
	}

	return b.parseAnalysisResponse(response, "validate")
}

func (b *BitNetService) OptimizePolicy(policy string) (*PolicyAnalysisResponse, error) {
	prompt := fmt.Sprintf(`Optimize the following policy for better performance and maintainability:

%s

Suggest specific optimizations for:
1. Performance improvements
2. Code simplification
3. Better readability
4. Reduced complexity
5. Enhanced security

Provide the optimized version if possible.`, policy)

	response, err := b.callBitNet(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to optimize policy: %w", err)
	}

	return b.parseAnalysisResponse(response, "optimize")
}

func (b *BitNetService) CheckCompliance(policy string, framework string) (*PolicyAnalysisResponse, error) {
	prompt := fmt.Sprintf(`Analyze the following policy for compliance with %s framework:

%s

Identify:
1. Compliance gaps
2. Missing controls
3. Non-compliant practices
4. Recommendations for compliance

Provide specific compliance mapping and suggestions.`, framework, policy)

	response, err := b.callBitNet(prompt)
	if err != nil {
		return nil, fmt.Errorf("failed to check compliance: %w", err)
	}

	return b.parseAnalysisResponse(response, "compliance")
}

func (b *BitNetService) callBitNet(prompt string) (string, error) {
	request := BitNetRequest{
		Model: "microsoft/bitnet-b1.58-2B-4T",
		Messages: []Message{
			{
				Role:    "system",
				Content: "You are an expert in policy-as-code, security, and compliance. Provide accurate, helpful, and actionable responses.",
			},
			{
				Role:    "user",
				Content: prompt,
			},
		},
		MaxTokens:   1000,
		Temperature: 0.7,
	}

	jsonData, err := json.Marshal(request)
	if err != nil {
		return "", fmt.Errorf("failed to marshal request: %w", err)
	}

	req, err := http.NewRequest("POST", b.baseURL+"/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+b.apiKey)

	resp, err := b.client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to make request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("API request failed with status %d: %s", resp.StatusCode, string(body))
	}

	var bitnetResp BitNetResponse
	if err := json.NewDecoder(resp.Body).Decode(&bitnetResp); err != nil {
		return "", fmt.Errorf("failed to decode response: %w", err)
	}

	if len(bitnetResp.Choices) == 0 {
		return "", fmt.Errorf("no response from BitNet")
	}

	return bitnetResp.Choices[0].Message.Content, nil
}

func (b *BitNetService) buildPolicyGenerationPrompt(req PolicyGenerationRequest) string {
	framework := req.Framework
	if framework == "" {
		framework = "general security"
	}

	language := req.Language
	if language == "" {
		language = "Rego"
	}

	return fmt.Sprintf(`Generate a %s policy for the following requirement:

%s

Framework: %s

Requirements:
1. Use %s syntax
2. Follow best practices
3. Include proper comments
4. Ensure security and compliance
5. Make it maintainable and readable

Provide only the policy code with appropriate comments.`, language, req.Description, framework, language)
}

func (b *BitNetService) buildAnalysisPrompt(req PolicyAnalysisRequest) string {
	switch req.AnalysisType {
	case "explain":
		return fmt.Sprintf("Explain the following policy in simple terms:\n\n%s", req.Policy)
	case "validate":
		return fmt.Sprintf("Validate the following policy for issues and security concerns:\n\n%s", req.Policy)
	case "optimize":
		return fmt.Sprintf("Optimize the following policy for better performance:\n\n%s", req.Policy)
	case "compliance":
		return fmt.Sprintf("Check the following policy for compliance issues:\n\n%s", req.Policy)
	default:
		return fmt.Sprintf("Analyze the following policy:\n\n%s", req.Policy)
	}
}

func (b *BitNetService) parseAnalysisResponse(response string, analysisType string) (*PolicyAnalysisResponse, error) {
	result := &PolicyAnalysisResponse{
		Analysis: response,
	}

	// Simple parsing logic - in a real implementation, you might want more sophisticated parsing
	lines := strings.Split(response, "\n")
	
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(line, "- ") || strings.HasPrefix(line, "* ") {
			result.Suggestions = append(result.Suggestions, strings.TrimPrefix(strings.TrimPrefix(line, "- "), "* "))
		}
	}

	return result, nil
}
