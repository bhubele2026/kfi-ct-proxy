const path = require('path');
const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PUBLIC_DIR = path.join(__dirname, 'public');

// The dashboard and proxy are now served from the same origin, so browser
// requests need no CORS. We still answer preflight/allow the X-API-KEY header
// for any non-browser or cross-origin caller that may exist during cutover.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

// ── Connecteam API proxy ──────────────────────────────────────────
// Forwards /proxy/* to https://api.connecteam.com/*, injecting the secret
// X-API-KEY server-side so it is never exposed to the browser.
app.all('/proxy/*', async (req, res) => {
  const upstreamPath = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.connecteam.com/${upstreamPath}${query ? '?' + query : ''}`;
  try {
    const response = await fetch(url, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.CT_API_KEY
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──────────────────────────────────────────────────
app.get('/healthz', (req, res) =>
  res.json({ status: 'ok', service: 'kfi-ct-proxy', keyConfigured: Boolean(process.env.CT_API_KEY) })
);

// ── UI ────────────────────────────────────────────────────────────
// Landing page (front door) at '/', Driver OT Dashboard at '/dashboard'.
app.get('/dashboard', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'dashboard.html')));
app.use(express.static(PUBLIC_DIR));
app.get('/', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`KFI CT Proxy + Dashboard running on port ${PORT}`));
