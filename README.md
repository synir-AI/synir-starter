# Synir Starter (Next.js + Tailwind)

A minimal, production‑ready landing + image tools you can deploy to Vercel today. Includes API routes that proxy to Clipdrop for background removal, replacement, outpainting (extend), upscaling, and text‑to‑image.

## Quickstart

```bash
# 1) Install deps
npm install

# 2) Run locally
npm run dev

# 3) Deploy (Vercel)
# - Push to GitHub
# - In Vercel: New Project -> Import your repo -> Deploy
```

## Environment Variables

Create `.env.local` in the project root (not committed). See `.env.local.example`.

- `CLIPDROP_API_KEY`: required for `/api/clipdrop/*` routes
- Contact form (optional):
  - `RESEND_API_KEY`: to send contact form emails via Resend
  - `CONTACT_TO`: recipient email address (e.g., you@domain.com)
  - `CONTACT_FROM`: sender address (e.g., noreply@yourdomain.com)
  - `ALLOWED_ORIGIN`: optional strict origin (e.g., https://yourdomain.com)
  - `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`: optional Cloudflare Turnstile spam protection
- Optional providers (not required by default UI):
  - `REMOVE_BG_API_KEY`
  - `OPENAI_API_KEY`
  - `SLAZZER_API_KEY`
  - `CUTOUTPRO_API_KEY`
  - `REPLICATE_API_TOKEN`

## Available Scripts

- `npm run dev`: run Next.js locally at http://localhost:3000
- `npm run build`: production build
- `npm start`: start production server

## Project Structure

- `app/` — Next.js App Router pages
  - `page.jsx` — landing page
  - `tools/*` — UI for image tools
  - `api/clipdrop/*` — proxy routes to Clipdrop
- `components/` — shared UI components
- `styles/` — Tailwind CSS

## Notes

- The Extend tool uses Clipdrop Uncrop and intentionally sends a minimal payload for broad key compatibility.
- You can deploy to Vercel and add `CLIPDROP_API_KEY` in the Vercel Project -> Settings -> Environment Variables.

## Deploy

### Vercel

1) Push to GitHub (done) and import the repo in Vercel.
2) In Vercel, set Environment Variables (Project -> Settings -> Environment Variables):
   - `CLIPDROP_API_KEY` = your key (Required)
   - Optional keys (only if you wire up those providers): `REMOVE_BG_API_KEY`, `OPENAI_API_KEY`, `SLAZZER_API_KEY`, `CUTOUTPRO_API_KEY`, `REPLICATE_API_TOKEN`.
   - Contact form optional: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM`, `ALLOWED_ORIGIN`.
3) Deploy.

### Local .env

- Copy `.env.local.example` to `.env.local` and fill values.
- Restart `npm run dev` after changes.

## Hardening & Ops

- Rate limiting: basic in-memory limiter on `/api/contact` to reduce spam (use a store like Redis for production persistence).
- Honeypot + origin checks: contact API requires `X-Requested-With` and enforces origin/host match or `ALLOWED_ORIGIN`.
- Security headers: set in `next.config.mjs` (CSP, X-Frame-Options, etc.). Adjust CSP if you add external scripts.
- Health check: `/api/health` returns `{ ok: true }` for monitoring.
### Subscriptions (Stripe)

- Set: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_ANNUAL`, `NEXT_PUBLIC_SITE_URL`.
- Optional: `STRIPE_WEBHOOK_SECRET` (recommended). Point a Stripe webhook to `/api/stripe/webhook`.
- UI buttons on `/pricing` call `/api/billing/checkout` to create sessions. After success, `/account` marks this browser as "pro" (temporary until auth is added) and shows a link to open the Billing Portal.
- For production: add real authentication (e.g., Auth.js/Clerk) and persist customer/subscription state in your DB.

### Rate Limiting (Upstash)

- Set: `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- API routes under `/api/clipdrop/*` apply daily quotas: Free vs Pro.
- Without Upstash env, routes still work; limiter is skipped.
