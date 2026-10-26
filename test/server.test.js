import http from 'http';
import assert from 'assert';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.join(__dirname, '..');

console.log('🚀 Starting Server integration test...');

// Spawn node server/index.js on custom port 3999
const serverProcess = spawn('node', ['server/index.js'], {
  cwd: ROOT,
  env: { ...process.env, PORT: '3999' },
  stdio: 'pipe'
});

serverProcess.stdout.on('data', (d) => {
  // console.log(`[SERVER]: ${d}`);
});

serverProcess.stderr.on('data', (d) => {
  console.error(`[SERVER ERR]: ${d}`);
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body ? JSON.parse(body) : null,
          rawBody: body
        });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function run() {
  try {
    await wait(1500); // wait for server to start

    // 1. Check GET /api/monsters
    const res1 = await request({
      hostname: '127.0.0.1',
      port: 3999,
      path: '/api/monsters',
      method: 'GET'
    });
    assert.strictEqual(res1.statusCode, 200);
    assert.strictEqual(res1.body.success, true);
    assert.strictEqual(res1.body.monsters.length, 10);
    console.log('✅ GET /api/monsters returns 10 monsters.');

    // 2. Post vote 5555 for monster 6
    const res2 = await request(
      {
        hostname: '127.0.0.1',
        port: 3999,
        path: '/api/vote',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      },
      {
        monsterNumber: 6,
        membership: '5555',
        deviceId: 'Test-Phone'
      }
    );
    assert.strictEqual(res2.statusCode, 200);
    assert.strictEqual(res2.body.vote.membership, '5555');
    assert.strictEqual(res2.body.vote.monsterNumber, 6);
    console.log('✅ POST /api/vote correctly recorded vote for monster 6.');

    // 3. Verify JSON file persistence
    const jsonPath = path.join(ROOT, 'data', 'monsters.json');
    assert.ok(fs.existsSync(jsonPath), 'data/monsters.json must exist');
    const diskData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const m6 = diskData.find((m) => m.number === 6);
    assert.ok(m6.memberships.includes('5555'), '5555 must be stored on disk in data/monsters.json');
    console.log('✅ Verified data persistence directly in data/monsters.json.');

    // 4. Verify static file serving (client/dist/index.html)
    const res3 = await new Promise((resolve, reject) => {
      http.get('http://127.0.0.1:3999/', (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => resolve({ statusCode: res.statusCode, body }));
      }).on('error', reject);
    });
    assert.strictEqual(res3.statusCode, 200);
    assert.ok(res3.body.includes('Carrera de Monstruos'));
    console.log('✅ Static frontend served correctly by Express.');

    // 5. Clean up test data by resetting
    await request({
      hostname: '127.0.0.1',
      port: 3999,
      path: '/api/reset',
      method: 'POST'
    });
    console.log('✅ Cleaned up test data.');

    console.log('🎉 All Server Integration tests passed!');
  } finally {
    serverProcess.kill();
  }
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Server test failed:', err);
    serverProcess.kill();
    process.exit(1);
  });
