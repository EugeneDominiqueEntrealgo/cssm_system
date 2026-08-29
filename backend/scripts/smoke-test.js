// Simple smoke test script for API flows: register -> login -> change password
// Usage: node backend/scripts/smoke-test.js

const axios = require('axios');
const API_BASE = process.env.API_URL || 'http://localhost:5000/api';

(async () => {
  try {
    console.log('Starting smoke tests against', API_BASE);

    // 1) Register a temp client
    const email = `smoketest_${Date.now()}@example.com`;
    const password = 'Test1234';
    const registerResp = await axios.post(`${API_BASE}/auth/register/client`, {
      name: 'Smoke Tester',
      email,
      password,
    });
    console.log('Register:', registerResp.data.message || 'OK');

    // 2) Login with identifier (email)
    const loginResp = await axios.post(`${API_BASE}/auth/login`, { identifier: email, password });
    const token = loginResp.data.token;
    console.log('Login: OK, token received');

    // 3) Change password
    const newPassword = 'NewPass1234';
    const changeResp = await axios.post(`${API_BASE}/auth/change-password`, { currentPassword: password, newPassword }, { headers: { Authorization: `Bearer ${token}` } });
    console.log('Change password:', changeResp.data.message || 'OK');

    // 4) Login with new password
    const reloginResp = await axios.post(`${API_BASE}/auth/login`, { identifier: email, password: newPassword });
    console.log('Re-login with new password: OK');

    console.log('Smoke tests passed');
  } catch (err) {
    console.error('Smoke test failed:', err.response?.data || err.message);
    process.exit(1);
  }
})();
