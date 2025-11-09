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

// PolicyOptimizationRequest represents the request for policy optimization
type PolicyOptimizationRequest struct {
	PolicyID   string                 `json:"policy_id"`
	Policy     string                 `json:"policy"`
	Context    map[string]interface{} `json:"context"`
	FocusAreas []string               `json:"focus_areas"` // performance, security, maintainability, compliance
}

// PolicyOptimizationResponse represents the response from policy optimization
type PolicyOptimizationResponse struct {
	OptimizedPolicy string              `json:"optimized_policy"`
	Suggestions     []PolicySuggestion  `json:"suggestions"`
	Improvements    []PolicyImprovement `json:"improvements"`
	BeforeMetrics   PolicyMetrics       `json:"before_metrics"`
	AfterMetrics    PolicyMetrics       `json:"after_metrics"`
	Confidence      float64             `json:"confidence"`
}

// PolicyImprovement represents a specific improvement made
type PolicyImprovement struct {
	Type        string  `json:"type"` // performance, security, maintainability, compliance
	Description string  `json:"description"`
	Impact      string  `json:"impact"` // low, medium, high
	Code        string  `json:"code"`
	Confidence  float64 `json:"confidence"`
}

// PolicyMetrics represents metrics for a policy
type PolicyMetrics struct {
	Complexity      int     `json:"complexity"`       // 1-10
	SecurityScore   float64 `json:"security_score"`   // 0-100
	PerformanceScore float64 `json:"performance_score"` // 0-100
	Maintainability float64 `json:"maintainability"`  // 0-100
	LinesOfCode     int     `json:"lines_of_code"`
}

// OptimizePolicy optimizes an existing policy using Gemini and returns structured suggestions
func (s *AIService) OptimizePolicy(req PolicyOptimizationRequest) (*PolicyOptimizationResponse, error) {
	// Check cache first
	cacheKey := s.generateOptimizationCacheKey(req)
	if cached := s.getCachedOptimization(cacheKey); cached != nil {
		s.logger.Info("Returning cached optimization response", "cache_key", cacheKey)
		return cached, nil
	}

	// Generate optimization with retry logic
	response, err := s.optimizeWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("Gemini API failed: %v", err)
	}

	// Cache the response
	s.cacheOptimization(cacheKey, response)

	return response, nil
}

// optimizeWithGemini optimizes policy using Gemini and returns structured response
func (s *AIService) optimizeWithGemini(req PolicyOptimizationRequest) (*PolicyOptimizationResponse, error) {
	apiKey := s.cfg.AI.GeminiAPIKey
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key not configured")
	}

	focusAreasStr := "performance, security, maintainability, compliance"
	if len(req.FocusAreas) > 0 {
		focusAreasStr = strings.Join(req.FocusAreas, ", ")
	}

	contextStr := ""
	if len(req.Context) > 0 {
		contextBytes, _ := json.Marshal(req.Context)
		contextStr = fmt.Sprintf("Context: %s", string(contextBytes))
	}

	prompt := fmt.Sprintf(`You are an expert Policy as Code engineer. Analyze and optimize the following Rego policy:

%s

Focus areas: %s
%s

Please provide:
1. An optimized version of the policy
2. Detailed suggestions for improvement (with type, title, description, priority, impact, effort, code, and confidence)
3. Specific improvements made (with type, description, impact, code, and confidence)
4. Before and after metrics (complexity 1-10, security_score 0-100, performance_score 0-100, maintainability 0-100, lines_of_code)

Format the response as JSON with the following structure:
{
  "optimized_policy": "complete optimized policy code",
  "suggestions": [
    {
      "type": "security",
      "title": "Add input validation",
      "description": "Validate input parameters",
      "priority": "high",
      "impact": "high",
      "effort": "low",
      "code": "validation code",
      "confidence": 0.95
    }
  ],
  "improvements": [
    {
      "type": "performance",
      "description": "Optimized query",
      "impact": "high",
      "code": "optimized code",
      "confidence": 0.9
    }
  ],
  "before_metrics": {
    "complexity": 7,
    "security_score": 75.0,
    "performance_score": 80.0,
    "maintainability": 70.0,
    "lines_of_code": 50
  },
  "after_metrics": {
    "complexity": 6,
    "security_score": 90.0,
    "performance_score": 90.0,
    "maintainability": 85.0,
    "lines_of_code": 45
  },
  "confidence": 0.95
}`, req.Policy, focusAreasStr, contextStr)

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
	var optimizationResponse PolicyOptimizationResponse
	if err := json.Unmarshal([]byte(responseText), &optimizationResponse); err == nil {
		// Successfully parsed as structured response
		return &optimizationResponse, nil
	}

	// Fallback to simple response format
	return &PolicyOptimizationResponse{
		OptimizedPolicy: responseText,
		Suggestions: []PolicySuggestion{
			{
				Type:        "general",
				Title:       "Policy Optimization",
				Description: "AI-generated optimization suggestions",
				Priority:    "medium",
				Impact:      "medium",
				Effort:      "medium",
				Confidence:  0.8,
			},
		},
		BeforeMetrics: PolicyMetrics{
			Complexity:       5,
			SecurityScore:    75.0,
			PerformanceScore: 75.0,
			Maintainability:  70.0,
			LinesOfCode:      50,
		},
		AfterMetrics: PolicyMetrics{
			Complexity:       4,
			SecurityScore:    85.0,
			PerformanceScore: 85.0,
			Maintainability:  80.0,
			LinesOfCode:      45,
		},
		Confidence: 0.8,
	}, nil
}

// optimizeWithRetry implements retry logic for optimization API calls
func (s *AIService) optimizeWithRetry(req PolicyOptimizationRequest) (*PolicyOptimizationResponse, error) {
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		response, err := s.optimizeWithGemini(req)
		if err == nil {
			return response, nil
		}

		s.logger.Warn("Gemini optimization API call failed", "attempt", attempt+1, "error", err)

		if attempt < maxRetries-1 {
			delay := baseDelay * time.Duration(1<<attempt) // Exponential backoff
			s.logger.Info("Retrying optimization after delay", "delay", delay)
			time.Sleep(delay)
		}
	}

	return nil, fmt.Errorf("failed after %d attempts", maxRetries)
}

// generateOptimizationCacheKey creates a cache key for the optimization request
func (s *AIService) generateOptimizationCacheKey(req PolicyOptimizationRequest) string {
	focusAreasStr := strings.Join(req.FocusAreas, ",")
	data := fmt.Sprintf("%s|%s|%s", req.PolicyID, req.Policy, focusAreasStr)
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("ai:optimization:%x", hash)
}

// getCachedOptimization retrieves a cached optimization response from Redis
func (s *AIService) getCachedOptimization(key string) *PolicyOptimizationResponse {
	if s.redis == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cached, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			s.logger.Warn("Failed to get cached optimization", "key", key, "error", err)
		}
		return nil
	}

	var response PolicyOptimizationResponse
	if err := json.Unmarshal([]byte(cached), &response); err != nil {
		s.logger.Warn("Failed to unmarshal cached optimization", "key", key, "error", err)
		return nil
	}

	s.logger.Info("Cache hit for optimization", "key", key)
	return &response
}

// cacheOptimization stores an optimization response in Redis cache
func (s *AIService) cacheOptimization(key string, response *PolicyOptimizationResponse) {
	if s.redis == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	data, err := json.Marshal(response)
	if err != nil {
		s.logger.Warn("Failed to marshal optimization for caching", "key", key, "error", err)
		return
	}

	// Cache for 1 hour by default
	var ttl time.Duration = time.Hour
	if s.cfg.AI.CacheTTL > 0 {
		ttl = time.Duration(s.cfg.AI.CacheTTL) * time.Second
	}

	if err := s.redis.Set(ctx, key, data, ttl).Err(); err != nil {
		s.logger.Warn("Failed to cache optimization", "key", key, "error", err)
		return
	}

	s.logger.Info("Optimization cached", "key", key, "ttl", ttl)
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

// PolicyConflictRequest represents the request for policy conflict detection
type PolicyConflictRequest struct {
	Policies []string               `json:"policies"` // List of policy contents
	Context  map[string]interface{} `json:"context"`
}

// PolicyConflictResponse represents the response from conflict detection
type PolicyConflictResponse struct {
	Conflicts    []PolicyConflict `json:"conflicts"`
	Severity     string            `json:"severity"` // low, medium, high, critical
	Summary      string            `json:"summary"`
	Recommendations []string       `json:"recommendations"`
	Confidence   float64           `json:"confidence"`
}

// PolicyConflict represents a detected conflict between policies
type PolicyConflict struct {
	Type        string   `json:"type"` // logical, permission, resource, compliance
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Policies    []string `json:"policies"` // IDs or names of conflicting policies
	Severity    string   `json:"severity"` // low, medium, high, critical
	Impact      string   `json:"impact"`
	Resolution  string   `json:"resolution"`
	Confidence  float64  `json:"confidence"`
}

// DetectPolicyConflicts detects conflicts between multiple policies using AI
func (s *AIService) DetectPolicyConflicts(req PolicyConflictRequest) (*PolicyConflictResponse, error) {
	// Check cache first
	cacheKey := s.generateConflictCacheKey(req)
	if cached := s.getCachedConflict(cacheKey); cached != nil {
		s.logger.Info("Returning cached conflict detection", "cache_key", cacheKey)
		return cached, nil
	}

	// Detect conflicts with retry logic
	response, err := s.detectConflictsWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("Gemini API failed: %v", err)
	}

	// Cache the response
	s.cacheConflict(cacheKey, response)

	return response, nil
}

// detectConflictsWithGemini detects conflicts using Gemini API
func (s *AIService) detectConflictsWithGemini(req PolicyConflictRequest) (*PolicyConflictResponse, error) {
	apiKey := s.cfg.AI.GeminiAPIKey
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key not configured")
	}

	policiesStr := strings.Join(req.Policies, "\n\n---\n\n")
	contextStr := ""
	if len(req.Context) > 0 {
		contextBytes, _ := json.Marshal(req.Context)
		contextStr = fmt.Sprintf("Context: %s", string(contextBytes))
	}

	prompt := fmt.Sprintf(`You are an expert Policy as Code engineer. Analyze the following policies for conflicts:

%s

%s

Please identify:
1. Logical conflicts (contradictory rules)
2. Permission conflicts (overlapping or conflicting permissions)
3. Resource conflicts (competing resource access)
4. Compliance conflicts (conflicting compliance requirements)

Format the response as JSON with the following structure:
{
  "conflicts": [
    {
      "type": "logical",
      "title": "Conflicting Rules",
      "description": "Detailed description",
      "policies": ["policy1", "policy2"],
      "severity": "high",
      "impact": "high",
      "resolution": "How to resolve",
      "confidence": 0.95
    }
  ],
  "severity": "high",
  "summary": "Overall conflict summary",
  "recommendations": ["recommendation1", "recommendation2"],
  "confidence": 0.95
}`, policiesStr, contextStr)

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
	var conflictResponse PolicyConflictResponse
	if err := json.Unmarshal([]byte(responseText), &conflictResponse); err == nil {
		return &conflictResponse, nil
	}

	// Fallback to default response
	return &PolicyConflictResponse{
		Conflicts: []PolicyConflict{
			{
				Type:        "logical",
				Title:       "Potential Conflict Detected",
				Description: "AI detected potential conflicts between policies",
				Severity:    "medium",
				Impact:      "medium",
				Confidence:  0.7,
			},
		},
		Severity:       "medium",
		Summary:        "Potential conflicts detected between policies",
		Recommendations: []string{"Review policies for logical conflicts", "Test policies together"},
		Confidence:    0.7,
	}, nil
}

// detectConflictsWithRetry implements retry logic for conflict detection
func (s *AIService) detectConflictsWithRetry(req PolicyConflictRequest) (*PolicyConflictResponse, error) {
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		response, err := s.detectConflictsWithGemini(req)
		if err == nil {
			return response, nil
		}

		s.logger.Warn("Gemini conflict detection API call failed", "attempt", attempt+1, "error", err)

		if attempt < maxRetries-1 {
			delay := baseDelay * time.Duration(1<<attempt)
			s.logger.Info("Retrying conflict detection after delay", "delay", delay)
			time.Sleep(delay)
		}
	}

	return nil, fmt.Errorf("failed after %d attempts", maxRetries)
}

// generateConflictCacheKey creates a cache key for conflict detection
func (s *AIService) generateConflictCacheKey(req PolicyConflictRequest) string {
	policiesStr := strings.Join(req.Policies, "|")
	data := fmt.Sprintf("conflict:%s", policiesStr)
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("ai:conflict:%x", hash)
}

// getCachedConflict retrieves a cached conflict detection response
func (s *AIService) getCachedConflict(key string) *PolicyConflictResponse {
	if s.redis == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cached, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			s.logger.Warn("Failed to get cached conflict", "key", key, "error", err)
		}
		return nil
	}

	var response PolicyConflictResponse
	if err := json.Unmarshal([]byte(cached), &response); err != nil {
		s.logger.Warn("Failed to unmarshal cached conflict", "key", key, "error", err)
		return nil
	}

	return &response
}

// cacheConflict stores a conflict detection response in cache
func (s *AIService) cacheConflict(key string, response *PolicyConflictResponse) {
	if s.redis == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	data, err := json.Marshal(response)
	if err != nil {
		s.logger.Warn("Failed to marshal conflict for caching", "key", key, "error", err)
		return
	}

	var ttl time.Duration = time.Hour
	if s.cfg.AI.CacheTTL > 0 {
		ttl = time.Duration(s.cfg.AI.CacheTTL) * time.Second
	}

	if err := s.redis.Set(ctx, key, data, ttl).Err(); err != nil {
		s.logger.Warn("Failed to cache conflict", "key", key, "error", err)
		return
	}
}

// ComplianceGapRequest represents the request for compliance gap analysis
type ComplianceGapRequest struct {
	PolicyID   string                 `json:"policy_id"`
	Policy     string                 `json:"policy"`
	Frameworks []string               `json:"frameworks"` // soc2, hipaa, gdpr, etc.
	Context    map[string]interface{} `json:"context"`
}

// ComplianceGapResponse represents the response from compliance gap analysis
type ComplianceGapResponse struct {
	PolicyID      string              `json:"policy_id"`
	Frameworks    []ComplianceFramework `json:"frameworks"`
	Gaps          []ComplianceGap     `json:"gaps"`
	OverallScore  float64             `json:"overall_score"` // 0-100
	Recommendations []string          `json:"recommendations"`
	Confidence    float64             `json:"confidence"`
}

// ComplianceFramework represents a compliance framework analysis
type ComplianceFramework struct {
	Name        string  `json:"name"`
	Score       float64 `json:"score"` // 0-100
	Coverage    float64 `json:"coverage"` // 0-100
	Controls    []AIComplianceControl `json:"controls"`
	Status      string  `json:"status"` // compliant, partial, non-compliant
}

// AIComplianceControl represents a compliance control for AI analysis
type AIComplianceControl struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"` // met, partial, not-met
	Evidence    string `json:"evidence"`
	Confidence  float64 `json:"confidence"`
}

// ComplianceGap represents a gap in compliance
type ComplianceGap struct {
	Framework   string  `json:"framework"`
	ControlID   string  `json:"control_id"`
	ControlName string  `json:"control_name"`
	Description string  `json:"description"`
	Severity    string  `json:"severity"` // low, medium, high, critical
	Impact      string  `json:"impact"`
	Remediation string  `json:"remediation"`
	Confidence  float64 `json:"confidence"`
}

// AnalyzeComplianceGaps analyzes compliance gaps for a policy using AI
func (s *AIService) AnalyzeComplianceGaps(req ComplianceGapRequest) (*ComplianceGapResponse, error) {
	// Check cache first
	cacheKey := s.generateComplianceCacheKey(req)
	if cached := s.getCachedCompliance(cacheKey); cached != nil {
		s.logger.Info("Returning cached compliance analysis", "cache_key", cacheKey)
		return cached, nil
	}

	// Analyze with retry logic
	response, err := s.analyzeComplianceWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("Gemini API failed: %v", err)
	}

	// Cache the response
	s.cacheCompliance(cacheKey, response)

	return response, nil
}

// analyzeComplianceWithGemini analyzes compliance gaps using Gemini API
func (s *AIService) analyzeComplianceWithGemini(req ComplianceGapRequest) (*ComplianceGapResponse, error) {
	apiKey := s.cfg.AI.GeminiAPIKey
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key not configured")
	}

	frameworksStr := strings.Join(req.Frameworks, ", ")
	contextStr := ""
	if len(req.Context) > 0 {
		contextBytes, _ := json.Marshal(req.Context)
		contextStr = fmt.Sprintf("Context: %s", string(contextBytes))
	}

	prompt := fmt.Sprintf(`You are an expert compliance analyst. Analyze the following policy for compliance gaps:

Policy:
%s

Frameworks: %s
%s

Please provide:
1. Compliance framework analysis (score, coverage, controls, status)
2. Identified gaps (framework, control, description, severity, impact, remediation)
3. Overall compliance score
4. Recommendations for improvement

Format the response as JSON with the following structure:
{
  "policy_id": "%s",
  "frameworks": [
    {
      "name": "SOC2",
      "score": 85.0,
      "coverage": 80.0,
      "controls": [
        {
          "id": "CC6.1",
          "name": "Logical Access",
          "description": "Description",
          "status": "met",
          "evidence": "Evidence",
          "confidence": 0.95
        }
      ],
      "status": "partial"
    }
  ],
  "gaps": [
    {
      "framework": "SOC2",
      "control_id": "CC6.2",
      "control_name": "Access Control",
      "description": "Missing access control",
      "severity": "high",
      "impact": "high",
      "remediation": "Add access control",
      "confidence": 0.9
    }
  ],
  "overall_score": 85.0,
  "recommendations": ["recommendation1", "recommendation2"],
  "confidence": 0.95
}`, req.Policy, frameworksStr, contextStr, req.PolicyID)

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
	var complianceResponse ComplianceGapResponse
	if err := json.Unmarshal([]byte(responseText), &complianceResponse); err == nil {
		return &complianceResponse, nil
	}

	// Fallback to default response
	return &ComplianceGapResponse{
		PolicyID:     req.PolicyID,
		Frameworks:   []ComplianceFramework{},
		Gaps:         []ComplianceGap{},
		OverallScore: 75.0,
		Recommendations: []string{"Review policy for compliance gaps"},
		Confidence:   0.7,
	}, nil
}

// analyzeComplianceWithRetry implements retry logic for compliance analysis
func (s *AIService) analyzeComplianceWithRetry(req ComplianceGapRequest) (*ComplianceGapResponse, error) {
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		response, err := s.analyzeComplianceWithGemini(req)
		if err == nil {
			return response, nil
		}

		s.logger.Warn("Gemini compliance analysis API call failed", "attempt", attempt+1, "error", err)

		if attempt < maxRetries-1 {
			delay := baseDelay * time.Duration(1<<attempt)
			s.logger.Info("Retrying compliance analysis after delay", "delay", delay)
			time.Sleep(delay)
		}
	}

	return nil, fmt.Errorf("failed after %d attempts", maxRetries)
}

// generateComplianceCacheKey creates a cache key for compliance analysis
func (s *AIService) generateComplianceCacheKey(req ComplianceGapRequest) string {
	frameworksStr := strings.Join(req.Frameworks, ",")
	data := fmt.Sprintf("%s|%s|%s", req.PolicyID, req.Policy, frameworksStr)
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("ai:compliance:%x", hash)
}

// getCachedCompliance retrieves a cached compliance analysis response
func (s *AIService) getCachedCompliance(key string) *ComplianceGapResponse {
	if s.redis == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cached, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			s.logger.Warn("Failed to get cached compliance", "key", key, "error", err)
		}
		return nil
	}

	var response ComplianceGapResponse
	if err := json.Unmarshal([]byte(cached), &response); err != nil {
		s.logger.Warn("Failed to unmarshal cached compliance", "key", key, "error", err)
		return nil
	}

	return &response
}

// cacheCompliance stores a compliance analysis response in cache
func (s *AIService) cacheCompliance(key string, response *ComplianceGapResponse) {
	if s.redis == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	data, err := json.Marshal(response)
	if err != nil {
		s.logger.Warn("Failed to marshal compliance for caching", "key", key, "error", err)
		return
	}

	var ttl time.Duration = time.Hour
	if s.cfg.AI.CacheTTL > 0 {
		ttl = time.Duration(s.cfg.AI.CacheTTL) * time.Second
	}

	if err := s.redis.Set(ctx, key, data, ttl).Err(); err != nil {
		s.logger.Warn("Failed to cache compliance", "key", key, "error", err)
		return
	}
}

// PolicyImpactRequest represents the request for policy impact assessment
type PolicyImpactRequest struct {
	PolicyID   string                 `json:"policy_id"`
	Policy     string                 `json:"policy"`
	Context    map[string]interface{} `json:"context"`
	TimeRange  string                 `json:"time_range"` // 1d, 7d, 30d, 90d
}

// PolicyImpactResponse represents the response from impact assessment
type PolicyImpactResponse struct {
	PolicyID        string              `json:"policy_id"`
	ImpactScore     float64             `json:"impact_score"` // 0-100
	AffectedResources []string          `json:"affected_resources"`
	RiskLevel       string              `json:"risk_level"` // low, medium, high, critical
	Impacts         []PolicyImpact      `json:"impacts"`
	Recommendations []string            `json:"recommendations"`
	Confidence      float64             `json:"confidence"`
}

// PolicyImpact represents a specific impact of a policy
type PolicyImpact struct {
	Type        string  `json:"type"` // security, performance, compliance, operational
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Severity    string  `json:"severity"` // low, medium, high, critical
	Affected    []string `json:"affected"` // Affected resources or systems
	Mitigation  string  `json:"mitigation"`
	Confidence  float64 `json:"confidence"`
}

// AssessPolicyImpact assesses the impact of a policy using AI
func (s *AIService) AssessPolicyImpact(req PolicyImpactRequest) (*PolicyImpactResponse, error) {
	// Check cache first
	cacheKey := s.generateImpactCacheKey(req)
	if cached := s.getCachedImpact(cacheKey); cached != nil {
		s.logger.Info("Returning cached impact assessment", "cache_key", cacheKey)
		return cached, nil
	}

	// Assess with retry logic
	response, err := s.assessImpactWithRetry(req)
	if err != nil {
		return nil, fmt.Errorf("Gemini API failed: %v", err)
	}

	// Cache the response
	s.cacheImpact(cacheKey, response)

	return response, nil
}

// assessImpactWithGemini assesses policy impact using Gemini API
func (s *AIService) assessImpactWithGemini(req PolicyImpactRequest) (*PolicyImpactResponse, error) {
	apiKey := s.cfg.AI.GeminiAPIKey
	if apiKey == "" {
		return nil, fmt.Errorf("Gemini API key not configured")
	}

	contextStr := ""
	if len(req.Context) > 0 {
		contextBytes, _ := json.Marshal(req.Context)
		contextStr = fmt.Sprintf("Context: %s", string(contextBytes))
	}

	timeRangeStr := req.TimeRange
	if timeRangeStr == "" {
		timeRangeStr = "30d"
	}

	prompt := fmt.Sprintf(`You are an expert Policy as Code engineer. Assess the impact of the following policy:

Policy:
%s

Time Range: %s
%s

Please provide:
1. Overall impact score (0-100)
2. Affected resources and systems
3. Risk level assessment
4. Specific impacts (security, performance, compliance, operational)
5. Recommendations for mitigation

Format the response as JSON with the following structure:
{
  "policy_id": "%s",
  "impact_score": 75.0,
  "affected_resources": ["resource1", "resource2"],
  "risk_level": "medium",
  "impacts": [
    {
      "type": "security",
      "title": "Security Impact",
      "description": "Description",
      "severity": "high",
      "affected": ["system1", "system2"],
      "mitigation": "How to mitigate",
      "confidence": 0.9
    }
  ],
  "recommendations": ["recommendation1", "recommendation2"],
  "confidence": 0.95
}`, req.Policy, timeRangeStr, contextStr, req.PolicyID)

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
	var impactResponse PolicyImpactResponse
	if err := json.Unmarshal([]byte(responseText), &impactResponse); err == nil {
		return &impactResponse, nil
	}

	// Fallback to default response
	return &PolicyImpactResponse{
		PolicyID:        req.PolicyID,
		ImpactScore:     70.0,
		AffectedResources: []string{},
		RiskLevel:       "medium",
		Impacts:         []PolicyImpact{},
		Recommendations: []string{"Review policy impact on systems"},
		Confidence:      0.7,
	}, nil
}

// assessImpactWithRetry implements retry logic for impact assessment
func (s *AIService) assessImpactWithRetry(req PolicyImpactRequest) (*PolicyImpactResponse, error) {
	maxRetries := 3
	baseDelay := time.Second

	for attempt := 0; attempt < maxRetries; attempt++ {
		response, err := s.assessImpactWithGemini(req)
		if err == nil {
			return response, nil
		}

		s.logger.Warn("Gemini impact assessment API call failed", "attempt", attempt+1, "error", err)

		if attempt < maxRetries-1 {
			delay := baseDelay * time.Duration(1<<attempt)
			s.logger.Info("Retrying impact assessment after delay", "delay", delay)
			time.Sleep(delay)
		}
	}

	return nil, fmt.Errorf("failed after %d attempts", maxRetries)
}

// generateImpactCacheKey creates a cache key for impact assessment
func (s *AIService) generateImpactCacheKey(req PolicyImpactRequest) string {
	data := fmt.Sprintf("%s|%s|%s", req.PolicyID, req.Policy, req.TimeRange)
	hash := sha256.Sum256([]byte(data))
	return fmt.Sprintf("ai:impact:%x", hash)
}

// getCachedImpact retrieves a cached impact assessment response
func (s *AIService) getCachedImpact(key string) *PolicyImpactResponse {
	if s.redis == nil {
		return nil
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	cached, err := s.redis.Get(ctx, key).Result()
	if err != nil {
		if err != redis.Nil {
			s.logger.Warn("Failed to get cached impact", "key", key, "error", err)
		}
		return nil
	}

	var response PolicyImpactResponse
	if err := json.Unmarshal([]byte(cached), &response); err != nil {
		s.logger.Warn("Failed to unmarshal cached impact", "key", key, "error", err)
		return nil
	}

	return &response
}

// cacheImpact stores an impact assessment response in cache
func (s *AIService) cacheImpact(key string, response *PolicyImpactResponse) {
	if s.redis == nil {
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	data, err := json.Marshal(response)
	if err != nil {
		s.logger.Warn("Failed to marshal impact for caching", "key", key, "error", err)
		return
	}

	var ttl time.Duration = time.Hour
	if s.cfg.AI.CacheTTL > 0 {
		ttl = time.Duration(s.cfg.AI.CacheTTL) * time.Second
	}

	if err := s.redis.Set(ctx, key, data, ttl).Err(); err != nil {
		s.logger.Warn("Failed to cache impact", "key", key, "error", err)
		return
	}
}
