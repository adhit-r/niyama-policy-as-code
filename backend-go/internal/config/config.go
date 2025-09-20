package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	Environment string
	Port        string
	Database    DatabaseConfig
	Redis       RedisConfig
	JWT         JWTConfig
	OPA         OPAConfig
	AI          AIConfig
	Monitoring  MonitoringConfig
}

type DatabaseConfig struct {
	URL string
}

type RedisConfig struct {
	URL string
}

type JWTConfig struct {
	Secret            string
	AccessExpiration  time.Duration
	RefreshExpiration time.Duration
}

type OPAConfig struct {
	URL string
}

type AIConfig struct {
	GeminiAPIKey string
	Model        string
}

type MonitoringConfig struct {
	InfluxDBURL    string
	ElasticsearchURL string
}

func Load() *Config {
	return &Config{
		Environment: getEnv("NODE_ENV", "development"),
		Port:        getEnv("PORT", "8000"),
		Database: DatabaseConfig{
			URL: getEnv("DATABASE_URL", "postgresql://niyama:password@localhost:5432/niyama"),
		},
		Redis: RedisConfig{
			URL: getEnv("REDIS_URL", "redis://localhost:6379"),
		},
		JWT: JWTConfig{
			Secret:            getEnv("JWT_SECRET", "your_super_secret_jwt_key_here"),
			AccessExpiration:  getDurationEnv("JWT_EXPIRES_IN", "7d"),
			RefreshExpiration: getDurationEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
		},
		OPA: OPAConfig{
			URL: getEnv("OPA_URL", "http://localhost:8181"),
		},
		AI: AIConfig{
			GeminiAPIKey: getEnv("GEMINI_API_KEY", ""),
			Model:        getEnv("GEMINI_MODEL", "gemini-1.5-pro"),
		},
		Monitoring: MonitoringConfig{
			InfluxDBURL:      getEnv("INFLUXDB_URL", "http://localhost:8086"),
			ElasticsearchURL: getEnv("ELASTICSEARCH_URL", "http://localhost:9200"),
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getDurationEnv(key, defaultValue string) time.Duration {
	value := getEnv(key, defaultValue)
	
	// Parse duration (e.g., "7d", "24h", "30m")
	if duration, err := time.ParseDuration(value); err == nil {
		return duration
	}
	
	// Handle day format
	if len(value) > 1 && value[len(value)-1] == 'd' {
		if days, err := strconv.Atoi(value[:len(value)-1]); err == nil {
			return time.Duration(days) * 24 * time.Hour
		}
	}
	
	// Default to 7 days
	return 7 * 24 * time.Hour
}
