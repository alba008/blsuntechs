// api/index.js (CJS)
exports.config = { runtime: 'nodejs', maxDuration: 10 };

const serverless = require('serverless-http');
const express = require('express');

// import your ESM Express app dynamically
let cached;
async function getHandler() {
  if (!cached) {
    const mod = await import('../server/app.js'); // ESM import
    const app = mod.default;

    const gateway = express();
    gateway.use('/', app);

    cached = serverless(gateway);
  }
  return cached;
}

module.exports = async (req, res) => {
  try {
    const handler = await getHandler();
    return handler(req, res);
  } catch (e) {
    console.error('[api] handler crash:', e);
    res.status(500).json({ error: 'Internal error' });
  }
};
