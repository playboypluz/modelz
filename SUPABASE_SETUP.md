# Supabase Auth Setup Guide

Complete guide for setting up email authentication with confirmation emails.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Name it `model-archive`, choose a region close to you
3. Set a strong database password → **Create project** (takes ~2 minutes)

---

## 2. Get Your Project Credentials

In your Supabase dashboard:

1. Click **Project Settings** (gear icon, bottom left)
2. Click **API**
3. Copy two values:
   - **Project URL** — looks like `https://xyzxyz.supabase.co`
   - **anon / public key** — long JWT string starting with `eyJ...`

---

## 3. Add Credentials to index.html

Open `index.html`, find these two lines near the bottom:

```js
const SUPABASE_URL = 'PASTE_YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'PASTE_YOUR_SUPABASE_ANON_KEY';
```

Replace the placeholder strings with your actual values:

```js
const SUPABASE_URL = 'https://xyzxyz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

Commit and push → Vercel will redeploy automatically.

---

## 4. Configure the Confirmation Email Link

This is the most important step — without it, the confirmation link in emails will redirect to `localhost` instead of your live site.

### In Supabase Dashboard:

1. Go to **Authentication** (left sidebar)
2. Click **URL Configuration**
3. Set **Site URL** to your live Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
4. Under **Redirect URLs**, click **Add URL** and add:
   ```
   https://your-app-name.vercel.app
   ```
5. Click **Save**

### Why this matters:
When a user signs up, Supabase sends a confirmation email with a magic link. That link uses your Site URL as the redirect destination. If Site URL is still `localhost:3000`, the link in production emails will be broken.

---

## 5. Customize the Confirmation Email (optional)

1. Go to **Authentication → Email Templates**
2. Click **Confirm signup**
3. You can edit the subject and body — the `{{ .ConfirmationURL }}` variable is the magic link
4. Example subject: `Confirm your Model Archive account`

---

## 6. Enable / Disable Email Confirmation

By default Supabase **requires** email confirmation before a user can sign in.

To change this:
1. **Authentication → Providers → Email**
2. Toggle **Confirm email** on or off

Recommended: **keep it ON** to prevent fake signups.

---

## 7. Test the Full Flow

1. Go to your live Vercel URL
2. Click **SIGN UP**, enter an email + password
3. Check your inbox — click the confirmation link
4. You'll be redirected back to your app and automatically signed in
5. Refresh the page — you should stay signed in (session persists)
6. Click **Sign Out** — you'll return to the auth screen
7. Sign back in with **SIGN IN** — works immediately

---

## 8. Password Reset Flow

The app already has a **"Forgot password?"** link on the sign-in screen.
When clicked, Supabase sends a reset email. The reset link also uses your Site URL setting from step 4 — make sure it's set correctly.

---

## Supabase Free Tier Limits

| Resource | Free allowance |
|---|---|
| Monthly Active Users | 50,000 |
| Database | 500 MB |
| Auth emails | Unlimited |
| Projects | 2 |

Well within limits for a portfolio gallery.
