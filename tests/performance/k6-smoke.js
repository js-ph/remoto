import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'], // <1% errores
    http_req_duration: ['p(95)<800'], // 95% < 800ms
  },
};

const BASE_URL = __ENV.K6_BASE_URL || 'http://127.0.0.1:4000';

export default function () {
  const res = http.get(`${BASE_URL}/api/status`);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'body has message': (r) => (r.json('message') || '').length > 0,
  });
  sleep(1);
}
