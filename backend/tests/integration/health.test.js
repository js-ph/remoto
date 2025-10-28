const { spawn } = require('child_process');
const waitOn = require('wait-on');
const axios = require('axios');

let serverProcess;
const TEST_PORT = process.env.TEST_PORT || 5050;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

beforeAll(async () => {
  // Inicia el servidor con PORT de pruebas
  serverProcess = spawn(process.platform === 'win32' ? 'node.exe' : 'node', ['server.js'], {
    cwd: `${__dirname}/../../../`,
    env: { ...process.env, PORT: String(TEST_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  // Esperar a que el endpoint de salud responda
  await waitOn({
    resources: [`${BASE_URL}/api/status`],
    timeout: 20000,
    validateStatus: status => status === 200,
    interval: 250,
    tcpTimeout: 1000,
    window: 1000,
  });
});

afterAll(async () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe('API health', () => {
  it('GET /api/status debe responder 200 y json esperado', async () => {
    const res = await axios.get(`${BASE_URL}/api/status`, { validateStatus: () => true });
    expect(res.status).toBe(200);
    expect(res.data).toHaveProperty('message');
  });
});
