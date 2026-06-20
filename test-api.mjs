/**
 * TripMate — comprehensive API endpoint test
 * Usage:  node test-api.mjs
 * Requires Node 18+ (built-in fetch).
 *
 * The script auto-logs-in with the credentials below and uses the
 * returned token for all subsequent tests.
 * Override with:  TRIPMATE_TOKEN=eyJ... node test-api.mjs
 */

const BASE      = 'https://dk7tnnm6-7265.uks1.devtunnels.ms';
const TEST_EMAIL = process.env.TRIPMATE_EMAIL    ?? 'yousef23@gmail.com';
const TEST_PASS  = process.env.TRIPMATE_PASSWORD ?? '1234567';
const HEADERS_BASE = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };

// ── Auto-login to get a fresh token ──────────────────────────────────────────
let TOKEN   = process.env.TRIPMATE_TOKEN ?? '';
let USER_ID = parseInt(process.env.TRIPMATE_USER_ID ?? '0', 10);

if (!TOKEN) {
  process.stdout.write('Auto-logging in… ');
  try {
    const res  = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: HEADERS_BASE,
      body: JSON.stringify({ email: TEST_EMAIL, password: TEST_PASS }),
    });
    const json = await res.json();
    // Login returns { data: { token, userId? } } or { token } at root
    TOKEN   = json?.data?.token   ?? json?.token   ?? '';
    USER_ID = json?.data?.userId  ?? json?.userId  ?? 10;
    if (!TOKEN && res.status !== 200) {
      // Try register instead
      const rres  = await fetch(`${BASE}/api/auth/register`, {
        method: 'POST', headers: HEADERS_BASE,
        body: JSON.stringify({ name: 'testuser', fullname: 'Test User', email: TEST_EMAIL, password: TEST_PASS, tel: '01000000000' }),
      });
      const rjson = await rres.json();
      TOKEN   = rjson?.token ?? '';
      USER_ID = rjson?.userId ?? 10;
    }
    console.log(TOKEN ? `\x1b[32m✔ got token (${TOKEN.slice(0,20)}…)\x1b[0m` : '\x1b[31m✘ no token\x1b[0m');
  } catch (e) {
    console.log(`\x1b[31m✘ login failed: ${e.message}\x1b[0m`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
// (HEADERS_BASE already defined above for auto-login)
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

let passed = 0, failed = 0, skipped = 0;
const results = [];

function pad(s, n = 55) {
  return String(s).padEnd(n, ' ');
}

async function hit(label, method, path, { body, auth = true, expect2xx = true } = {}) {
  const url     = BASE + path;
  const headers = { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' };
  if (auth && TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  let status, text, json, ms;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    ms     = Date.now() - start;
    status = res.status;
    text   = await res.text();
    try { json = JSON.parse(text); } catch { json = null; }

    const ok     = expect2xx ? status >= 200 && status < 300 : true;
    const symbol = ok ? `${GREEN}✔${RESET}` : `${RED}✘${RESET}`;
    const color  = ok ? GREEN : RED;

    if (ok) passed++; else failed++;

    const preview = json != null
      ? JSON.stringify(json).slice(0, 80)
      : text.slice(0, 80);

    results.push({ label, ok, status, ms, preview });
    console.log(`${symbol} ${pad(label)} ${color}${status}${RESET}  ${ms}ms  ${preview}`);
  } catch (err) {
    ms = Date.now() - start;
    failed++;
    results.push({ label, ok: false, status: 'ERR', ms, preview: err.message });
    console.log(`${RED}✘${RESET} ${pad(label)} ${RED}ERR${RESET}  ${err.message}`);
  }
}

function section(title) {
  console.log(`\n${BOLD}${CYAN}── ${title} ${'─'.repeat(Math.max(0, 60 - title.length))}${RESET}`);
}

// ─────────────────────────────────────────────────────────────────────────────
console.log(`\n${BOLD}TripMate API Test Suite${RESET}`);
console.log(`Base URL : ${BASE}`);
console.log(`User ID  : ${USER_ID}`);
console.log(`Auth     : ${TOKEN ? `Bearer ${TOKEN.slice(0, 20)}…` : `${RED}NO TOKEN — auth tests will return 401${RESET}`}`);
console.log('');

// ── Auth (public) ─────────────────────────────────────────────────────────────
section('Auth — public');
await hit('POST /auth/login  (valid creds)',   'POST', '/api/auth/login',
          { auth: false, body: { email: 'yousef22@gmail.com', password: '1234567' } });
await hit('POST /auth/login  (wrong creds)',   'POST', '/api/auth/login',
          { auth: false, body: { email: 'wrong@example.com', password: 'bad' }, expect2xx: false });
await hit('POST /auth/register (dupe check)', 'POST', '/api/auth/register',
          { auth: false, body: { name: 'test', fullname: 'Test User', email: 'yousef22@gmail.com', password: '1234567', tel: '01000000000' }, expect2xx: false });

// ── Auth (protected) ──────────────────────────────────────────────────────────
section('Auth — protected');
await hit('POST /auth/logout',         'POST',   '/api/auth/logout',
          { body: { refreshToken: process.env.TRIPMATE_REFRESH ?? '' } });

// ── Users ─────────────────────────────────────────────────────────────────────
section('Users');
await hit('GET  /users/profile',              'GET', '/api/users/profile');
await hit(`GET  /users/profile/${USER_ID}`,   'GET', `/api/users/profile/${USER_ID}`);
await hit(`GET  /users/recent/${USER_ID}`,    'GET', `/api/users/recent/${USER_ID}`);

// ── Destinations ──────────────────────────────────────────────────────────────
section('Destinations');
await hit('GET  /destinations?page=1&pageSize=5',   'GET', '/api/destinations?page=1&pageSize=5');
await hit('GET  /destinations/1',                   'GET', '/api/destinations/1');
await hit('GET  /destinations/search?query=paris',  'GET', '/api/destinations/search?query=paris');
await hit('GET  /destinations/filter?minPrice=100', 'GET', '/api/destinations/filter?minPrice=100&maxPrice=500');
await hit('GET  /destinations/smart-recommendations','GET', `/api/destinations/smart-recommendations?userId=${USER_ID}&budget=5000`);
await hit('GET  /destinations/smart-packages',      'GET', `/api/destinations/smart-packages?userId=${USER_ID}&budget=5000`);

// ── Packages ──────────────────────────────────────────────────────────────────
section('Packages');
await hit('GET  /packages',                  'GET', '/api/packages');
await hit('GET  /packages/1',               'GET', '/api/packages/1');
await hit('GET  /packages/smart',           'GET', `/api/packages/smart?userId=${USER_ID}&budget=5000`);
await hit('GET  /packages/external',        'GET', `/api/packages/external?userId=${USER_ID}&budget=5000`);

// ── Categories ────────────────────────────────────────────────────────────────
section('Categories');
await hit('GET  /Categories', 'GET', '/api/Categories');

// ── Hotels ────────────────────────────────────────────────────────────────────
section('Hotels');
await hit('GET  /hotels?city=italy',  'GET', '/api/hotels?city=italy');
await hit('GET  /hotels?city=paris',  'GET', '/api/hotels?city=paris');
await hit('GET  /hotels?city=london', 'GET', '/api/hotels?city=london');

// ── Flights ───────────────────────────────────────────────────────────────────
section('Flights');
await hit('GET  /flights?from=EGP&to=DXB', 'GET', '/api/flights?from=EGP&to=DXB');
await hit('GET  /flights (no params)',      'GET', '/api/flights');

// ── Favorites ─────────────────────────────────────────────────────────────────
section('Favorites');
await hit(`GET  /favorites/${USER_ID}`,                   'GET',    `/api/favorites/${USER_ID}`);
await hit('POST /favorites (destination)',                 'POST',   `/api/favorites?userId=${USER_ID}&itemId=1&itemType=destination`);
await hit('DELETE /favorites (destination)',               'DELETE', `/api/favorites?userId=${USER_ID}&itemId=1&itemType=destination`);
await hit('POST /favorites (package/packge)',              'POST',   `/api/favorites?userId=${USER_ID}&itemId=1&itemType=packge`);
await hit('DELETE /favorites (package/backge)',            'DELETE', `/api/favorites?userId=${USER_ID}&itemId=1&itemType=backge`);

// ── Ratings ───────────────────────────────────────────────────────────────────
section('Ratings');
await hit('GET  /ratings/average?itemId=1&itemType=destination', 'GET', '/api/ratings/average?itemId=1&itemType=destination');
await hit('GET  /ratings/count?itemId=1&itemType=destination',   'GET', '/api/ratings/count?itemId=1&itemType=destination');
await hit(`GET  /ratings/user?userId=${USER_ID}&itemId=1`,       'GET', `/api/ratings/user?userId=${USER_ID}&itemId=1&itemType=destination`);
await hit('POST /ratings (value=4)',                             'POST', `/api/ratings?userId=${USER_ID}&itemId=1&itemType=destination&value=4`);
await hit('DELETE /ratings',                                    'DELETE',`/api/ratings?userId=${USER_ID}&itemId=1&itemType=destination`);

// ── Posts ─────────────────────────────────────────────────────────────────────
section('Posts');
await hit('GET  /Posts',   'GET', '/api/Posts');
await hit('GET  /Posts/1', 'GET', '/api/Posts/1');
await hit('POST /Posts',   'POST', '/api/Posts', {
  body: { title: 'API Test Post', location: 'Test City', description: 'Created by test-api.mjs', imageUrl: '', rating: 5, userId: USER_ID }
});

// ── Bookings ──────────────────────────────────────────────────────────────────
section('Bookings');
await hit('GET  /Bookings',                   'GET', '/api/Bookings');
await hit(`GET  /Bookings/${USER_ID}`,        'GET', `/api/Bookings/${USER_ID}`);
await hit(`GET  /Bookings/details/${USER_ID}`,'GET', `/api/Bookings/details/${USER_ID}`, { expect2xx: false });

// ── Home ──────────────────────────────────────────────────────────────────────
section('Home');
await hit(`GET  /Home?userId=${USER_ID}`, 'GET', `/api/Home?userId=${USER_ID}`);

// ── Summary ───────────────────────────────────────────────────────────────────
const total = passed + failed;
console.log(`\n${BOLD}${'─'.repeat(70)}${RESET}`);
console.log(`${BOLD}Results: ${GREEN}${passed} passed${RESET}  ${RED}${failed} failed${RESET}  out of ${total} tests`);

if (failed > 0) {
  console.log(`\n${RED}${BOLD}Failed endpoints:${RESET}`);
  results.filter(r => !r.ok).forEach(r => {
    console.log(`  ${RED}✘${RESET} [${r.status}]  ${r.label}`);
    if (r.preview) console.log(`       ${YELLOW}${r.preview}${RESET}`);
  });
}
console.log('');
