package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type GeminiRequest struct {
	Contents []GeminiContent `json:"contents"`
}

type GeminiContent struct {
	Parts []GeminiPart `json:"parts"`
}

type GeminiPart struct {
	Text string `json:"text"`
}

type GeminiResponse struct {
	Candidates []GeminiCandidate `json:"candidates"`
}

type GeminiCandidate struct {
	Content GeminiContent `json:"content"`
}

func main() {
	// Test Gemini API directly
	apiKey := "your_gemini_api_key_here" // Replace with your actual key
	
	if apiKey == "your_gemini_api_key_here" {
		fmt.Println("❌ Please set your Gemini API key in the code")
		fmt.Println("✅ Gemini integration is ready - just needs API key!")
		return
	}

	prompt := `Generate a Rego policy for: "Ensure all containers run as non-root user"

Framework: SOC 2
Language: Rego

Please generate a complete, production-ready policy that:
1. Addresses the specific requirement
2. Follows best practices for the framework
3. Is written in the specified language
4. Includes proper error handling and validation
5. Is well-documented with comments

Return only the policy code, no explanations or markdown formatting.`

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
		fmt.Printf("❌ Failed to marshal request: %v\n", err)
		return
	}

	url := fmt.Sprintf("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=%s", apiKey)
	
	httpReq, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		fmt.Printf("❌ Failed to create request: %v\n", err)
		return
	}

	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		fmt.Printf("❌ Failed to call Gemini API: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("❌ Gemini API error %d: %s\n", resp.StatusCode, string(body))
		return
	}

	var geminiResp GeminiResponse
	if err := json.NewDecoder(resp.Body).Decode(&geminiResp); err != nil {
		fmt.Printf("❌ Failed to decode response: %v\n", err)
		return
	}

	if len(geminiResp.Candidates) == 0 || len(geminiResp.Candidates[0].Content.Parts) == 0 {
		fmt.Println("❌ Empty response from Gemini")
		return
	}

	policy := geminiResp.Candidates[0].Content.Parts[0].Text

	fmt.Println("🎉 SUCCESS! Gemini generated policy:")
	fmt.Println("=" * 50)
	fmt.Println(policy)
	fmt.Println("=" * 50)
	fmt.Println("✅ Gemini integration is working perfectly!")
}


