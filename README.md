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
3) Deploy.

### Local .env

- Copy `.env.local.example` to `.env.local` and fill values.
- Restart `npm run dev` after changes.
