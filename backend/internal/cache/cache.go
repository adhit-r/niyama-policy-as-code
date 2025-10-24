package cache

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/redis/go-redis/v9"
)

type Cache interface {
	Get(ctx context.Context, key string) (string, error)
	Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error
	Delete(ctx context.Context, key string) error
	Exists(ctx context.Context, key string) (bool, error)
	Close() error
}

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(addr, password string, db int) *RedisCache {
	client := redis.NewClient(&redis.Options{
		Addr:     addr,
		Password: password,
		DB:       db,
	})
	return &RedisCache{client: client}
}

func (r *RedisCache) Get(ctx context.Context, key string) (string, error) {
	return r.client.Get(ctx, key).Result()
}

func (r *RedisCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return r.client.Set(ctx, key, data, expiration).Err()
}

func (r *RedisCache) Delete(ctx context.Context, key string) error {
	return r.client.Del(ctx, key).Err()
}

func (r *RedisCache) Exists(ctx context.Context, key string) (bool, error) {
	result, err := r.client.Exists(ctx, key).Result()
	return result > 0, err
}

func (r *RedisCache) Close() error {
	return r.client.Close()
}

// In-memory cache implementation
type InMemoryCache struct {
	data map[string]cacheItem
	mu   sync.RWMutex
}

type cacheItem struct {
	value     string
	expiresAt time.Time
}

func NewInMemoryCache() *InMemoryCache {
	cache := &InMemoryCache{
		data: make(map[string]cacheItem),
	}

	// Start cleanup goroutine
	go cache.cleanup()

	return cache
}

func (m *InMemoryCache) Get(ctx context.Context, key string) (string, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	item, exists := m.data[key]
	if !exists {
		return "", fmt.Errorf("key not found")
	}

	if time.Now().After(item.expiresAt) {
		// Item expired, delete it
		delete(m.data, key)
		return "", fmt.Errorf("key expired")
	}

	return item.value, nil
}

func (m *InMemoryCache) Set(ctx context.Context, key string, value interface{}, expiration time.Duration) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	m.mu.Lock()
	defer m.mu.Unlock()

	m.data[key] = cacheItem{
		value:     string(data),
		expiresAt: time.Now().Add(expiration),
	}

	return nil
}

func (m *InMemoryCache) Delete(ctx context.Context, key string) error {
	m.mu.Lock()
	defer m.mu.Unlock()

	delete(m.data, key)
	return nil
}

func (m *InMemoryCache) Exists(ctx context.Context, key string) (bool, error) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	item, exists := m.data[key]
	if !exists {
		return false, nil
	}

	if time.Now().After(item.expiresAt) {
		// Item expired
		return false, nil
	}

	return true, nil
}

func (m *InMemoryCache) Close() error {
	// No-op for in-memory cache
	return nil
}

func (m *InMemoryCache) cleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for range ticker.C {
		m.mu.Lock()
		now := time.Now()
		for key, item := range m.data {
			if now.After(item.expiresAt) {
				delete(m.data, key)
			}
		}
		m.mu.Unlock()
	}
}

// Cache factory with fallback
func NewCache(redisURL string) (Cache, error) {
	if redisURL == "" {
		log.Println("⚠️  Redis URL not provided, using in-memory cache")
		return NewInMemoryCache(), nil
	}

	// Try to connect to Redis
	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Printf("⚠️  Failed to parse Redis URL: %v, using in-memory cache", err)
		return NewInMemoryCache(), nil
	}

	client := redis.NewClient(opt)

	// Test connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := client.Ping(ctx).Err(); err != nil {
		log.Printf("⚠️  Redis connection failed: %v, using in-memory cache", err)
		client.Close()
		return NewInMemoryCache(), nil
	}

	log.Println("✅ Redis cache connected successfully")
	return &RedisCache{client: client}, nil
}
