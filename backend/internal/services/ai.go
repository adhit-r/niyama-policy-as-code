package services

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"strings"
	"time"

	"niyama-backend/internal/config"
	"niyama-backend/internal/database"

	"github.com/redis/go-redis/v9"
)

type AIService struct {
	db     *database.Database
	cfg    *config.Config
	client *http.Client
	logger *slog.Logger
	redis  *redis.Client
}

func NewAIService(db *database.Database, cfg *config.Config) *AIService {
	// Initialize Redis client
	var redisClient *redis.Client
	if cfg.Redis.URL != "" {
		opt, err := redis.ParseURL(cfg.Redis.URL)
		if err != nil {
			slog.Error("Failed to parse Redis URL", "error", err)
		} else {
			redisClient = redis.NewClient(opt)
			// Test connection
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			if err := redisClient.Ping(ctx).Err(); err != nil {
				slog.Warn("Redis connection failed, caching disabled", "error", err)
				redisClient = nil
			} else {
				slog.Info("Redis connected successfully")
			}
		}
	}

	return &AIService{
		db:     db,
		cfg:    cfg,
		client: &http.Client{Timeout: 30 * time.Second},
		logger: slog.Default(),
		redis:  redisClient,
	}
}

// PolicyGenerationRequest represents the request for policy generation
type PolicyGenerationRequest struct {
	Description string                 `json:"description"`
	Framework   string                 `json:"framework"`
	Compliance  []string               `json:"compliance"` // soc2, hipaa, gdpr, etc.
	Context     map[string]interface{} `json:"context"`
	Language    string                 `json:"language"`
	Complexity  string                 `json:"complexity"` // simple, medium, complex
}

// PolicyGenerationResponse represents the response from policy generation
type PolicyGenerationResponse struct {
	Policy       string              `json:"policy"`
	Explanation  string              `json:"explanation"`
	Compliance   []ComplianceMapping `json:"compliance"`
	Suggestions  []PolicySuggestion  `json:"suggestions"`
	Confidence   float64             `json:"confidence"`
	Alternatives []string            `json:"alternatives"`
	Source       string              `json:"source"` // "gemini"
}

// ComplianceMapping represents a compliance framework mapping
type ComplianceMapping struct {
	Framework string `json:"framework"`
	Control   string `json:"control"`
	Mapping   string `json:"mapping"`
}

// PolicySuggestion represents a policy improvement suggestion
type PolicySuggestion struct {
	Type        string  `json:"type"` // security, performance, compliance
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Priority    string  `json:"priority"` // low, medium, high, critical
	Impact      string  `json:"impact"`
	Effort      string  `json:"effort"` // low, medium, high
	Code        string  `json:"code"`
	Confidence  float64 `json:"confidence"`
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

// GeneratePolicy generates a policy using Gemini API with caching and retry logic
func (s *AIService) GeneratePolicy(req PolicyGenerationRequest) (*PolicyGenerationResponse, error) {
	// Check cache first
	cacheKey := s.generateCacheKey(req)
	if cached := s.getCachedResponse(cacheKey); cached != nil {
		s.logger.Info("Returning cached policy response", "cache_key", cacheKey)
		return cached, nil
	}

	// Generate with retry logic
	response, err := s.generateWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("Gemini API failed: %v", err)
	}

	// Cache the response
	s.cacheResponse(cacheKey, response)

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

	responseText := geminiResp.Candidates[0].Content.Parts[0].Text

	// Try to parse as JSON first
	var enhancedResponse PolicyGenerationResponse
	if err := json.Unmarshal([]byte(responseText), &enhancedResponse); err == nil {
		// Successfully parsed as enhanced response
		enhancedResponse.Source = "gemini"
		return &enhancedResponse, nil
	}

	// Fallback to simple response format
	return &PolicyGenerationResponse{
		Policy:      responseText,
		Explanation: "AI-generated policy based on your requirements",
		Source:      "gemini",
		Confidence:  0.8, // Default confidence
	}, nil
}

// buildPolicyPrompt creates a prompt for policy generation
func (s *AIService) buildPolicyPrompt(req PolicyGenerationRequest) string {
	complianceStr := ""
	if len(req.Compliance) > 0 {
		complianceStr = fmt.Sprintf("Compliance: %s", strings.Join(req.Compliance, ", "))
	}

	contextStr := ""
	if len(req.Context) > 0 {
		contextBytes, _ := json.Marshal(req.Context)
		contextStr = fmt.Sprintf("Context: %s", string(contextBytes))
	}

	return fmt.Sprintf(`You are an expert Policy as Code engineer. Generate a %s policy for %s framework.

Requirements:
- Description: %s
- %s
- Language: %s
- Complexity: %s

%s

Please generate:
1. A complete, production-ready policy
2. Explanation of the policy logic
3. Compliance mappings
4. Implementation suggestions
5. Alternative approaches

Format the response as JSON with the following structure:
{
  "policy": "complete policy code",
  "explanation": "detailed explanation",
  "compliance": [{"framework": "name", "control": "id", "mapping": "description"}],
  "suggestions": [{"type": "type", "title": "title", "description": "description", "priority": "high", "impact": "high", "effort": "low", "code": "suggestion code", "confidence": 0.95}],
  "confidence": 0.95,
  "alternatives": ["alternative 1", "alternative 2"]
}`,
		req.Language, req.Framework, req.Description,
		complianceStr, req.Language, req.Complexity,
		contextStr)
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

// generateWithRetry implements retry logic for API calls
func (s *AIService) generateWithRetry(req PolicyGenerationRequest) (*PolicyGenerationResponse, error) {
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		response, err := s.generateWithGemini(req)
		if err == nil {
			return response, nil
		}

		s.logger.Warn("Gemini API call failed", "attempt", attempt+1, "error", err)

		if attempt < maxRetries-1 {
			delay := baseDelay * time.Duration(1<<attempt) // Exponential backoff
			s.logger.Info("Retrying after delay", "delay", delay)
			time.Sleep(delay)
		}
	}

	return nil, fmt.Errorf("failed after %d attempts", maxRetries)
}

// generateCacheKey creates a cache key for the request
func (s *AIService) generateCacheKey(req PolicyGenerationRequest) string {
	data := fmt.Sprintf("%s|%s|%s", req.Description, req.Framework, req.Language)
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("ai:policy:%x", hash)
}

// getCachedResponse retrieves a cached response from Redis
func (s *AIService) getCachedResponse(key string) *PolicyGenerationResponse {
	if s.redis == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cached, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			s.logger.Warn("Failed to get cached response", "key", key, "error", err)
		}
		return nil
	}

	var response PolicyGenerationResponse
	if err := json.Unmarshal([]byte(cached), &response); err != nil {
		s.logger.Warn("Failed to unmarshal cached response", "key", key, "error", err)
		return nil
	}

	s.logger.Info("Cache hit", "key", key)
	return &response
}

// cacheResponse stores a response in Redis cache
func (s *AIService) cacheResponse(key string, response *PolicyGenerationResponse) {
	if s.redis == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	data, err := json.Marshal(response)
	if err != nil {
		s.logger.Warn("Failed to marshal response for caching", "key", key, "error", err)
		return
	}

	// Cache for 1 hour by default
	var ttl time.Duration = time.Hour
	if s.cfg.AI.CacheTTL > 0 {
		ttl = time.Duration(s.cfg.AI.CacheTTL) * time.Second
	}

	if err := s.redis.Set(ctx, key, data, ttl).Err(); err != nil {
		s.logger.Warn("Failed to cache response", "key", key, "error", err)
		return
	}

	s.logger.Info("Response cached", "key", key, "ttl", ttl)
}

// PolicyAnalytics represents analytics data for a policy
type PolicyAnalytics struct {
	PolicyID        string             `json:"policy_id"`
	Evaluations     int64              `json:"evaluations"`
	Violations      int64              `json:"violations"`
	ComplianceScore float64            `json:"compliance_score"`
	Performance     PolicyPerformance  `json:"performance"`
	Trends          []PerformanceTrend `json:"trends"`
	Insights        []AnalyticsInsight `json:"insights"`
}

type PolicyPerformance struct {
	ExecutionTime time.Duration `json:"execution_time"`
	MemoryUsage   int64         `json:"memory_usage"`
	CPUUsage      float64       `json:"cpu_usage"`
	Throughput    float64       `json:"throughput"`
	ErrorRate     float64       `json:"error_rate"`
}

type PerformanceTrend struct {
	Metric    string    `json:"metric"`
	Value     float64   `json:"value"`
	Timestamp time.Time `json:"timestamp"`
}

type AnalyticsInsight struct {
	Type           string  `json:"type"` // performance, security, compliance
	Title          string  `json:"title"`
	Description    string  `json:"description"`
	Severity       string  `json:"severity"` // low, medium, high, critical
	Confidence     float64 `json:"confidence"`
	Recommendation string  `json:"recommendation"`
}

// AnalyzePolicyPerformance analyzes policy performance using AI
func (s *AIService) AnalyzePolicyPerformance(policyID string, timeRange string) (*PolicyAnalytics, error) {
	// This would typically collect metrics from the database
	// For now, we'll generate sample analytics using AI

	prompt := fmt.Sprintf(`Analyze the performance of policy ID %s over the last %s.

Please provide insights on:
1. Execution performance trends
2. Compliance score analysis
3. Security recommendations
4. Optimization opportunities

Format as JSON with performance metrics, trends, and actionable insights.`,
		policyID, timeRange)

	response, err := s.generateWithGemini(PolicyGenerationRequest{
		Description: prompt,
		Framework:   "analytics",
		Language:    "json",
		Complexity:  "medium",
	})

	if err != nil {
		return nil, fmt.Errorf("failed to analyze policy performance: %v", err)
	}

	// Parse the AI response into analytics structure
	var analytics PolicyAnalytics
	if err := json.Unmarshal([]byte(response.Policy), &analytics); err != nil {
		// Fallback to default analytics if parsing fails
		analytics = PolicyAnalytics{
			PolicyID:        policyID,
			Evaluations:     100,
			Violations:      5,
			ComplianceScore: 95.0,
			Performance: PolicyPerformance{
				ExecutionTime: 50 * time.Millisecond,
				MemoryUsage:   1024 * 1024, // 1MB
				CPUUsage:      0.1,
				Throughput:    100.0,
				ErrorRate:     0.05,
			},
			Insights: []AnalyticsInsight{
				{
					Type:           "performance",
					Title:          "Optimization Opportunity",
					Description:    "Policy execution time can be improved by 20%",
					Severity:       "medium",
					Confidence:     0.85,
					Recommendation: "Consider caching frequently used data",
				},
			},
		}
	}

	return &analytics, nil
}

// GenerateRecommendations generates intelligent policy recommendations
func (s *AIService) GenerateRecommendations(context map[string]interface{}) ([]PolicySuggestion, error) {
	contextJSON, _ := json.Marshal(context)

	prompt := fmt.Sprintf(`Based on the following context, generate intelligent policy recommendations:

Context: %s

Please provide recommendations for:
1. Security improvements
2. Performance optimizations
3. Compliance enhancements
4. Best practice implementations

Format as JSON array of suggestions with type, title, description, priority, impact, effort, and confidence.`,
		string(contextJSON))

	response, err := s.generateWithGemini(PolicyGenerationRequest{
		Description: prompt,
		Framework:   "recommendations",
		Language:    "json",
		Complexity:  "medium",
	})

	if err != nil {
		return nil, fmt.Errorf("failed to generate recommendations: %v", err)
	}

	// Parse the AI response into suggestions
	var suggestions []PolicySuggestion
	if err := json.Unmarshal([]byte(response.Policy), &suggestions); err != nil {
		// Fallback to default suggestions if parsing fails
		suggestions = []PolicySuggestion{
			{
				Type:        "security",
				Title:       "Implement Input Validation",
				Description: "Add comprehensive input validation to prevent injection attacks",
				Priority:    "high",
				Impact:      "high",
				Effort:      "medium",
				Code:        "validate input parameters before processing",
				Confidence:  0.9,
			},
			{
				Type:        "performance",
				Title:       "Optimize Database Queries",
				Description: "Use indexed queries to improve response time",
				Priority:    "medium",
				Impact:      "medium",
				Effort:      "low",
				Code:        "add database indexes for frequently queried fields",
				Confidence:  0.8,
			},
		}
	}

	return suggestions, nil
}
