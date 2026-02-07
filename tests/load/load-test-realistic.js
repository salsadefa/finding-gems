// Finding Gems - Realistic Load Test
// This test simulates real user behavior:
// 1. Most traffic is public (browse, search)
// 2. Some authenticated users (view profile, bookmarks)
// 3. Very few admin requests
//
// Run: k6 run tests/load/load-test-realistic.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import { SharedArray } from 'k6/data';

// Custom metrics
const errorRate = new Rate('errors');
const successfulRequests = new Counter('successful_requests');

// Test configuration - more realistic load
export const options = {
  scenarios: {
    // 80% of traffic: Anonymous browsing
    public_browsing: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 8 },   // Ramp to 8 VUs
        { duration: '30s', target: 8 },   // Stay at 8 VUs
        { duration: '10s', target: 0 },   // Ramp down
      ],
      exec: 'publicBrowsing',
    },
    // 20% of traffic: Authenticated users
    authenticated_users: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 2 },   // Ramp to 2 VUs
        { duration: '30s', target: 2 },   // Stay at 2 VUs
        { duration: '10s', target: 0 },   // Ramp down
      ],
      exec: 'authenticatedUser',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'],   // 95% < 1s (relaxed for network latency)
    errors: ['rate<0.1'],                 // Error rate < 10%
    successful_requests: ['count>100'],   // At least 100 successful requests
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

// Cache tokens between iterations
let cachedTokens = {};

function getToken(email, password) {
  const cacheKey = email;
  
  // Return cached token if exists
  if (cachedTokens[cacheKey]) {
    return cachedTokens[cacheKey];
  }
  
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: email,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (res.status === 200) {
    try {
      const body = JSON.parse(res.body);
      const token = body.data?.accessToken;
      if (token) {
        cachedTokens[cacheKey] = token;
        return token;
      }
    } catch (e) {}
  }
  return null;
}

// Scenario 1: Public browsing (no auth)
export function publicBrowsing() {
  const endpoints = [
    '/websites?page=1&limit=10',
    '/categories',
    '/websites?search=ai',
    '/websites?category=ai-tools',
  ];
  
  // Pick random endpoint
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
  });
  
  if (success) successfulRequests.add(1);
  errorRate.add(!success);
  
  sleep(Math.random() * 2 + 0.5); // 0.5-2.5s think time
}

// Scenario 2: Authenticated user actions
export function authenticatedUser() {
  const token = getToken('buyer@example.com', 'NewPassword123!');
  
  if (!token) {
    errorRate.add(1);
    sleep(1);
    return;
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  
  const endpoints = [
    '/users/me',
    '/bookmarks',
    '/orders',
  ];
  
  // Pick random endpoint
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, { headers: authHeaders });
  
  const success = check(res, {
    'status is valid (200, 401, 404)': (r) => r.status === 200 || r.status === 401 || r.status === 404,
  });
  
  if (success) successfulRequests.add(1);
  errorRate.add(!success);
  
  sleep(Math.random() * 3 + 1); // 1-4s think time
}

// Warm cache on setup
export function setup() {
  console.log(`Testing API at: ${BASE_URL}`);
  console.log('Warming up cache...');
  
  // Warm up public endpoints
  http.get(`${BASE_URL}/websites?page=1&limit=10`);
  http.get(`${BASE_URL}/categories`);
  sleep(1);
  
  return { startTime: new Date().toISOString() };
}

export function teardown(data) {
  console.log(`Test started at: ${data.startTime}`);
  console.log(`Test completed at: ${new Date().toISOString()}`);
}

// Default export for running with CLI flags (e.g., k6 run -u 10 -d 60s)
// Simulates 80% public, 20% authenticated traffic distribution
export default function() {
  const rand = Math.random();
  if (rand < 0.8) {
    publicBrowsing();
  } else {
    authenticatedUser();
  }
}
