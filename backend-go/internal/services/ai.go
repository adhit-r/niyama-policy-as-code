package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"
)

type AIService struct {
	db  *database.Database
	cfg *config.Config
}

func NewAIService(db *database.Database, cfg *config.Config) *AIService {
	return &AIService{
		db:  db,
		cfg: cfg,
	}
}

// PolicyGenerationRequest represents the request for policy generation
type PolicyGenerationRequest struct {
	Description string `json:"description"`
	Framework   string `json:"framework"`
	Language    string `json:"language"`
}

// PolicyGenerationResponse represents the response from policy generation
type PolicyGenerationResponse struct {
	Policy      string `json:"policy"`
	Description string `json:"description"`
	Framework   string `json:"framework"`
	Language    string `json:"language"`
	Source      string `json:"source"` // "gemini"
}

// GeminiRequest represents the request to Gemini API
type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

// GeminiResponse represents the response from Gemini API
type GeminiResponse struct {
	Candidates []GeminiCandidate `json:"candidates"`
}

type GeminiCandidate struct {
	Content GeminiContent `json:"content"`
}

// GeneratePolicy generates a policy using Gemini API
func (s *AIService) GeneratePolicy(req PolicyGenerationRequest) (*PolicyGenerationResponse, error) {
	response, err := s.generateWithGemini(req)
	if err != nil {
		return nil, fmt.Errorf("Gemini API failed: %v", err)
	}

	response.Source = "gemini"
	return response, nil
}

// generateWithGemini generates policy using Gemini API
func (s *AIService) generateWithGemini(req PolicyGenerationRequest) (*PolicyGenerationResponse, error) {
	apiKey := s.cfg.AI.GeminiAPIKey
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key not configured")
	}

	prompt := s.buildPolicyPrompt(req)

	geminiReq := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(geminiReq)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal Gemini request: %v", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=%s", apiKey)

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini request: %v", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("failed to call Gemini API: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("Gemini API error %d: %s", resp.StatusCode, string(body))
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return nil, fmt.Errorf("failed to decode Gemini response: %v", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("empty response from Gemini")
	}

	policy := geminiResp.Candidates[0].Content.Parts[0].Text

	return &PolicyGenerationResponse{
		Policy:      policy,
		Description: req.Description,
		Framework:   req.Framework,
		Language:    req.Language,
	}, nil
}

// buildPolicyPrompt creates a prompt for policy generation
func (s *AIService) buildPolicyPrompt(req PolicyGenerationRequest) string {
	return fmt.Sprintf(`Generate a %s policy for the following requirement: "%s"

Framework: %s
Language: %s

Please generate a complete, production-ready policy that:
1. Addresses the specific requirement
2. Follows best practices for the framework
3. Is written in the specified language
4. Includes proper error handling and validation
5. Is well-documented with comments

Return only the policy code, no explanations or markdown formatting.`,
		req.Language, req.Description, req.Framework, req.Language)
}

// OptimizePolicy optimizes an existing policy using Gemini
func (s *AIService) OptimizePolicy(policyID string, policy string) (string, error) {
	return s.optimizeWithGemini(policy)
}

// optimizeWithGemini optimizes policy using Gemini
func (s *AIService) optimizeWithGemini(policy string) (string, error) {
	apiKey := s.cfg.AI.GeminiAPIKey
	if apiKey == "" {
		return "", fmt.Errorf("Gemini API key not configured")
	}

	prompt := fmt.Sprintf(`Optimize the following %s policy for better performance, security, and maintainability:

%s

Please provide an optimized version that:
1. Improves performance
2. Enhances security
3. Makes the code more maintainable
4. Follows best practices
5. Maintains the same functionality

Return only the optimized policy code.`, "Rego", policy)

	geminiReq := GeminiRequest{
		Contents: []GeminiContent{
			{
				Parts: []GeminiPart{
					{Text: prompt},
				},
			},
		},
	}

	jsonData, err := json.Marshal(geminiReq)
	if err != nil {
		return "", fmt.Errorf("failed to marshal Gemini request: %v", err)
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=%s", apiKey)

	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", fmt.Errorf("failed to create Gemini request: %v", err)
	}

	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", fmt.Errorf("failed to call Gemini API: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("Gemini API error %d: %s", resp.StatusCode, string(body))
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		return "", fmt.Errorf("failed to decode Gemini response: %v", err)
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("empty response from Gemini")
	}

	return geminiResp.Candidates[0].Content.Parts[0].Text, nil
}
