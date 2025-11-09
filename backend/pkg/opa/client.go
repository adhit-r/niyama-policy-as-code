package opa

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
}

type EvaluationRequest struct {
	Input interface{} `json:"input"`
}

type EvaluationResponse struct {
	Result     interface{} `json:"result"`
	DecisionID string      `json:"decision_id"`
}

func NewClient(baseURL string) *Client {
	return &Client{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

// EvaluatePolicy sends policy + input to OPA and gets decision
func (c *Client) EvaluatePolicy(policyContent string, packageName string, input interface{}) (*EvaluationResponse, error) {
	// Step 1: Upload policy to OPA
	policyID := fmt.Sprintf("policy_%d", time.Now().Unix())
	err := c.uploadPolicy(policyID, policyContent)
	if err != nil {
		return nil, fmt.Errorf("failed to upload policy: %w", err)
	}

	// Step 2: Evaluate input against policy
	evalURL := fmt.Sprintf("%s/v1/data/%s", c.baseURL, packageName)
	reqBody, _ := json.Marshal(EvaluationRequest{Input: input})

	resp, err := c.httpClient.Post(evalURL, "application/json", bytes.NewBuffer(reqBody))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	var evalResp EvaluationResponse
	if err := json.Unmarshal(body, &evalResp); err != nil {
		return nil, err
	}

	return &evalResp, nil
}

func (c *Client) uploadPolicy(policyID, content string) error {
	url := fmt.Sprintf("%s/v1/policies/%s", c.baseURL, policyID)
	req, _ := http.NewRequest("PUT", url, bytes.NewBufferString(content))
	req.Header.Set("Content-Type", "text/plain")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("OPA returned %d: %s", resp.StatusCode, body)
	}

	return nil
}

// Health checks if OPA is reachable
func (c *Client) Health() error {
	resp, err := c.httpClient.Get(fmt.Sprintf("%s/health", c.baseURL))
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("OPA health check failed: %d", resp.StatusCode)
	}
	return nil
}
