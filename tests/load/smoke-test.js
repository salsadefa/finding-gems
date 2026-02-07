// Finding Gems - Quick Smoke Test
// Run: k6 run tests/load/smoke-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,          // 5 virtual users
  duration: '30s', // Run for 30 seconds
  thresholds: {
    http_req_duration: ['p(95)<300'],  // 95% requests < 300ms
    http_req_failed: ['rate<0.05'],     // Less than 5% failures
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:3001/api/v1';

export default function() {
  // Quick health check tests
  const endpoints = [
    '/websites?page=1&limit=5',
    '/categories',
    '/websites?category=ai-tools',
  ];
  
  for (const endpoint of endpoints) {
    const res = http.get(`${BASE_URL}${endpoint}`);
    
    check(res, {
      [`${endpoint} status is 200`]: (r) => r.status === 200,
      [`${endpoint} response < 300ms`]: (r) => r.timings.duration < 300,
    });
    
    sleep(0.5);
  }
}
