
# Synir Starter (Next.js + Tailwind)

A minimal, production-ready landing page you can deploy to Vercel today. Add API features later (remove.bg, Stability, Replicate).

## Quickstart

```bash
# 1) Install deps
npm install

# 2) Run locally
npm run dev

# 3) Deploy (Vercel)
# - Push to GitHub
# - In Vercel: New Project → Import your repo → Deploy
```

## Where to add features next
- Create routes under `app/api/*` for proxying calls to remove.bg, Stability, etc.
- Add an upload component under `app/components/` and wire to your API routes.
- Store processed images in Cloudinary or Firebase Storage.
