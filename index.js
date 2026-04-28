const express = require('express');
const fetch = require('node-fetch');
const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, X-API-KEY');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());

app.all('/proxy/*', async (req, res) => {
  const path = req.params[0];
  const query = new URLSearchParams(req.query).toString();
  const url = `https://api.connecteam.com/${path}${query ? '?' + query : ''}`;
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
    res.json(data);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'KFI CT Proxy running' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
