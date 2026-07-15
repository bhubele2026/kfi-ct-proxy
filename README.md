# kfi-ct-proxy

KFI's Connecteam (CT) tools, one app. An Express server that:

1. **Proxies the Connecteam API** — `ALL /proxy/*` forwards to `https://api.connecteam.com/*`,
   injecting the secret `X-API-KEY` (env `CT_API_KEY`) **server-side** so it never reaches the browser.
2. **Serves the UI** — a branded landing page at `/` and the **Driver OT Dashboard** at `/dashboard`,
   which pull Connecteam users and time-clock punches to compute driver overtime.

Because the UI and proxy are same-origin, the browser needs no CORS and the API key stays hidden.

## Routes
| Route            | Purpose                                                   |
| ---------------- | --------------------------------------------------------- |
| `GET /`          | Landing page (front door)                                 |
| `GET /dashboard` | Driver OT Dashboard                                       |
| `ALL /proxy/*`   | Connecteam API proxy (adds `X-API-KEY`)                   |
| `GET /healthz`   | Health check `{ status, keyConfigured }`                  |

## Environment
| Var          | Required | Notes                                                   |
| ------------ | -------- | ------------------------------------------------------- |
| `CT_API_KEY` | yes      | Connecteam API key. Set as a Container App **secret**.  |
| `PORT`       | no       | Listen port (defaults 3000 local, 8080 in container).   |

## Run locally
```bash
npm install
CT_API_KEY=xxxxx npm start
# open http://localhost:3000
```

## Deploy
Azure Container Apps (ACR image build), Entra-gated / invite-only. `CT_API_KEY` is stored as a
Container App secret. See the project plan for the full deploy runbook.
