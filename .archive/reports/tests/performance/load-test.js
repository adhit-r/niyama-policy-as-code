import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 }, // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'], // Error rate must be below 10%
  },
};

const BASE_URL = 'http://localhost:8000';

export default function() {
  // Test health endpoint
  let healthResponse = http.get(`${BASE_URL}/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 100ms': (r) => r.timings.duration < 100,
  });

  // Test metrics endpoint
  let metricsResponse = http.get(`${BASE_URL}/api/v1/monitoring/metrics`);
  check(metricsResponse, {
    'metrics status is 200': (r) => r.status === 200,
    'metrics response time < 200ms': (r) => r.timings.duration < 200,
  });

  // Test policies endpoint
  let policiesResponse = http.get(`${BASE_URL}/api/v1/policies`);
  check(policiesResponse, {
    'policies status is 200': (r) => r.status === 200,
    'policies response time < 300ms': (r) => r.timings.duration < 300,
  });

  // Test policy evaluation
  let evaluationResponse = http.post(`${BASE_URL}/api/v1/policies/1/evaluate`, 
    JSON.stringify({
      user: { role: "admin" },
      resource: { type: "document" }
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(evaluationResponse, {
    'evaluation status is 200': (r) => r.status === 200,
    'evaluation response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}

export function setup() {
  // Setup function - runs once before the test
  console.log('Setting up performance test...');
  
  // Verify backend is running
  let healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error('Backend is not running or not healthy');
  }
  
  console.log('Backend is healthy, starting performance test...');
}

export function teardown(data) {
  // Teardown function - runs once after the test
  console.log('Performance test completed');
}
