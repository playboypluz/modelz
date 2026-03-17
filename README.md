# Model Archive

Glassmorphism model portfolio gallery backed by **Cloudinary** for persistent, cross-device image and metadata storage.

## Architecture

| Layer | Tech |
|---|---|
| Frontend | Single-file HTML / CSS / JS (no framework) |
| Image storage | Cloudinary (uploads direct from browser) |
| Metadata | Cloudinary asset context fields |
| Secret proxy | `/api/cloudinary.js` serverless function |
| Hosting | Vercel or Netlify |

---

## Setup

### 1. Cloudinary upload preset
- Dashboard → Settings → Upload → Add upload preset
- Name: `modelz`, Signing Mode: **Unsigned** → Save

### 2. Environment Variables

Set these three in your hosting dashboard:

| Variable | Value |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | `dvuscttoc` |
| `CLOUDINARY_API_KEY` | your API key |
| `CLOUDINARY_API_SECRET` | your secret ← never commit this |

---

## Deploy to Vercel (recommended)

1. Push repo to GitHub
2. vercel.com → New Project → import repo
3. Add the 3 env vars above before deploying
4. Framework preset: **Other**
5. Deploy — done

The `api/cloudinary.js` file is auto-detected as a serverless function.

## Deploy to Netlify

1. Push repo to GitHub
2. netlify.com → Add new site → Import from Git
3. Build command: *(empty)*, Publish directory: `.`
4. Add env vars in Site settings → Environment variables
5. Rename `api/cloudinary.js` → `netlify/functions/cloudinary.js`
6. Change `API_BASE` in `index.html` from `/api/cloudinary` to `/.netlify/functions/cloudinary`

## Local Dev

```bash
npm i -g vercel
cp .env.example .env.local
# add your CLOUDINARY_API_SECRET to .env.local
vercel dev
# open http://localhost:3000
```

---

## Security

- API Secret never touches the browser — serverless proxy only
- Upload preset is unsigned (safe for browser uploads by design)
- Regenerate your API Key if it was ever shared publicly
