// Finding Gems - K6 Load Testing Script
// Run: k6 run tests/load/api-load-test.js

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiResponseTime = new Trend('api_response_time');
const successfulRequests = new Counter('successful_requests');

// Test configuration
export const options = {
  // Stages for ramping up/down virtual users
  stages: [
    { duration: '30s', target: 10 },   // Ramp up to 10 users
    { duration: '1m', target: 50 },    // Ramp up to 50 users
    { duration: '2m', target: 100 },   // Stay at 100 users for 2 min
    { duration: '30s', target: 50 },   // Ramp down to 50
    { duration: '30s', target: 0 },    // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests should be < 500ms
    errors: ['rate<0.1'],               // Error rate should be < 10%
    successful_requests: ['count>100'], // At least 100 successful requests
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

// Test data
const testUsers = {
  buyer: {
    email: 'buyer@example.com',
    password: 'NewPassword123!'
  },
  creator: {
    email: 'creator@example.com',
    password: 'CreatorPassword123!'
  },
  admin: {
    email: 'admin@findinggems.com',
    password: 'Admin123!'
  }
};

// Helper function to login and get token
function login(email, password) {
  const res = http.post(`${BASE_URL}/auth/login`, JSON.stringify({
    email: email,
    password: password
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (res.status === 200) {
    const body = JSON.parse(res.body);
    return body.data?.accessToken || null;
  }
  return null;
}

export default function() {
  // Group 1: Public Endpoints (No Auth Required)
  group('Public Endpoints', function() {
    
    // Test 1: List Websites
    group('GET /websites', function() {
      const start = new Date();
      const res = http.get(`${BASE_URL}/websites?page=1&limit=10`);
      apiResponseTime.add(new Date() - start);
      
      const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'has websites array': (r) => JSON.parse(r.body).data?.websites !== undefined,
        'response time < 500ms': (r) => r.timings.duration < 500,
      });
      
      if (success) successfulRequests.add(1);
      errorRate.add(!success);
    });
    
    // Test 2: Search Websites
    group('GET /websites?search=ai', function() {
      const res = http.get(`${BASE_URL}/websites?search=ai`);
      
      const success = check(res, {
        'status is 200': (r) => r.status === 200,
      });
      
      if (success) successfulRequests.add(1);
      errorRate.add(!success);
    });
    
    // Test 3: Filter by Category
    group('GET /websites?category=ai-tools', function() {
      const res = http.get(`${BASE_URL}/websites?category=ai-tools`);
      
      const success = check(res, {
        'status is 200': (r) => r.status === 200,
      });
      
      if (success) successfulRequests.add(1);
      errorRate.add(!success);
    });
    
    // Test 4: Get Categories
    group('GET /categories', function() {
      const res = http.get(`${BASE_URL}/categories`);
      
      const success = check(res, {
        'status is 200': (r) => r.status === 200,
        'has categories array': (r) => JSON.parse(r.body).data?.categories !== undefined,
      });
      
      if (success) successfulRequests.add(1);
      errorRate.add(!success);
    });
    
    // Test 5: Website Detail
    group('GET /websites/:slug', function() {
      const res = http.get(`${BASE_URL}/websites/teamsync-board`);
      
      const success = check(res, {
        'status is 200 or 404': (r) => r.status === 200 || r.status === 404,
      });
      
      if (success) successfulRequests.add(1);
      errorRate.add(!success);
    });
  });
  
  sleep(1); // Think time between requests
  
  // Group 2: Authenticated Endpoints
  group('Authenticated Endpoints', function() {
    const token = login(testUsers.buyer.email, testUsers.buyer.password);
    
    if (token) {
      const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Test 6: Get User Profile
      group('GET /users/me', function() {
        const res = http.get(`${BASE_URL}/users/me`, { headers: authHeaders });
        
        const success = check(res, {
          'status is 200': (r) => r.status === 200,
          'has user data': (r) => JSON.parse(r.body).data?.user !== undefined,
        });
        
        if (success) successfulRequests.add(1);
        errorRate.add(!success);
      });
      
      // Test 7: Get Bookmarks
      group('GET /bookmarks', function() {
        const res = http.get(`${BASE_URL}/bookmarks`, { headers: authHeaders });
        
        const success = check(res, {
          'status is 200': (r) => r.status === 200,
        });
        
        if (success) successfulRequests.add(1);
        errorRate.add(!success);
      });
    }
  });
  
  sleep(1);
  
  // Group 3: Admin Endpoints (Heavy Queries)
  group('Admin Endpoints', function() {
    const adminToken = login(testUsers.admin.email, testUsers.admin.password);
    
    if (adminToken) {
      const authHeaders = {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      };
      
      // Test 8: Admin Dashboard
      group('GET /admin/dashboard', function() {
        const start = new Date();
        const res = http.get(`${BASE_URL}/admin/dashboard`, { headers: authHeaders });
        apiResponseTime.add(new Date() - start);
        
        const success = check(res, {
          'status is 200': (r) => r.status === 200,
          'response time < 1000ms': (r) => r.timings.duration < 1000,
        });
        
        if (success) successfulRequests.add(1);
        errorRate.add(!success);
      });
      
      // Test 9: Admin User Analytics
      group('GET /admin/analytics/users', function() {
        const res = http.get(`${BASE_URL}/admin/analytics/users`, { headers: authHeaders });
        
        const success = check(res, {
          'status is 200': (r) => r.status === 200,
        });
        
        if (success) successfulRequests.add(1);
        errorRate.add(!success);
      });
    }
  });
  
  sleep(1);
}

// Setup function - runs once before all VUs
export function setup() {
  console.log(`Testing API at: ${BASE_URL}`);
  
  // Verify API is reachable
  const res = http.get(`${BASE_URL}/websites`);
  if (res.status !== 200) {
    throw new Error(`API not reachable. Status: ${res.status}`);
  }
  
  return { startTime: new Date().toISOString() };
}

// Teardown function - runs once after all VUs complete
export function teardown(data) {
  console.log(`Test started at: ${data.startTime}`);
  console.log(`Test completed at: ${new Date().toISOString()}`);
}
