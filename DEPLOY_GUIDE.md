# 🚀 Deploy GasCheck to Vercel — Step by Step

## What You Need
- A **GitHub** account (free) — https://github.com/signup
- A **Vercel** account (free) — https://vercel.com/signup (sign up with GitHub)

---

## STEP 1 — Upload to GitHub (5 min)

### Option A: Using GitHub Website (easiest, no coding tools needed)

1. Go to https://github.com/new
2. Repository name: `gascheck-app`
3. Keep it **Private** (your Supabase key is in the code)
4. Click **Create repository**
5. On the next page, click **"uploading an existing file"**
6. Drag and drop ALL files from the `gascheck-app` folder:
   - `package.json`
   - `vite.config.js`
   - `tailwind.config.js`
   - `postcss.config.js`
   - `index.html`
   - `.gitignore`
   - `src/` folder (with `main.jsx`, `App.jsx`, `index.css`)
7. Click **Commit changes**

### Option B: Using Terminal (if you have Git installed)

```bash
cd gascheck-app
git init
git add .
git commit -m "GasCheck app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/gascheck-app.git
git push -u origin main
```

---

## STEP 2 — Deploy on Vercel (3 min)

1. Go to https://vercel.com
2. Click **Sign Up** → **Continue with GitHub**
3. Once logged in, click **"Add New..."** → **Project**
4. Find your `gascheck-app` repository and click **Import**
5. On the Configure screen:
   - **Framework Preset**: should auto-detect as `Vite` ✅
   - **Build Command**: `npm run build` (default) ✅
   - **Output Directory**: `dist` (default) ✅
6. Expand **Environment Variables** and add these two:

   | Key | Value |
   |-----|-------|
   | `VITE_SUPABASE_URL` | `https://ybyvhoyiifjfvxcuaeku.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `sb_publishable_CeGC_3Qv1Qz14XpYMPgGyA_h3lB67mP` |

7. Click **Deploy**
8. Wait ~60 seconds ⏳
9. 🎉 You'll get a live URL like: `https://gascheck-app.vercel.app`

---

## STEP 3 — Configure Supabase for Your Domain

After Vercel gives you the URL, you need to tell Supabase to allow requests from it:

1. Go to **Supabase Dashboard → Authentication → URL Configuration**
2. In **Site URL**, enter your Vercel URL: `https://gascheck-app.vercel.app`
3. In **Redirect URLs**, add: `https://gascheck-app.vercel.app/**`
4. Click **Save**

---

## STEP 4 — Test It! 🎉

1. Open your Vercel URL on your phone
2. Log in with your admin email + password
3. Try creating a job, viewing employee screens, running through the inspection workflow

---

## STEP 5 — Custom Domain (Optional)

If you want a custom domain like `gascheck.yourbusiness.com`:

1. In Vercel dashboard → your project → **Settings** → **Domains**
2. Add your domain
3. Update your DNS as Vercel instructs
4. Update the Supabase URL Configuration (Step 3) with your new domain

---

## STEP 6 — Share with Employees

Send them the URL via WhatsApp:
```
🔥 GasCheck App
Open this link on your phone:
https://gascheck-app.vercel.app

Login: [their email]
Password: [their password]
```

---

## Updating the App Later

Whenever you want to make changes:
1. Edit files and push to GitHub
2. Vercel automatically redeploys in ~30 seconds
3. Everyone sees the new version immediately

---

## Troubleshooting

**"Page not found" on refresh:**
This shouldn't happen with Vercel + Vite, but if it does, create a `vercel.json` file:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

**Login not working on the live site:**
→ Check Step 3 (Supabase URL Configuration)
→ Make sure environment variables are set in Vercel

**Changes not showing:**
→ Check that the GitHub push went through
→ Go to Vercel dashboard → Deployments → check for errors
