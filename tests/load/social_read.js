import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 },
    { duration: '1m', target: 500 },
    { duration: '1m', target: 1000 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://127.0.0.1:3000/api/v1';
const token = __ENV.ACCESS_TOKEN;

export default function () {
  const headers = { Authorization: `Bearer ${token}` };
  const feed = http.get(`${baseUrl}/posts?limit=20`, { headers });
  check(feed, {
    'feed succeeds or sheds load': (response) => [200, 429, 503].includes(response.status),
  });

  if (__ITER % 5 === 0) {
    const suggestions = http.get(`${baseUrl}/network/suggestions`, { headers });
    check(suggestions, {
      'suggestions succeed or shed load': (response) => [200, 429, 503].includes(response.status),
    });
  }

  if (__ITER % 10 === 0) {
    const conversations = http.get(`${baseUrl}/messages/conversations`, { headers });
    check(conversations, {
      'conversations succeed or shed load': (response) => [200, 429, 503].includes(response.status),
    });
  }

  sleep(1);
}
