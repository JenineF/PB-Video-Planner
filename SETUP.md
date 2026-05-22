# 🎯 Personal Branding Video Content Planner — Setup Guide

A step-by-step guide to get your app running and deployed to Vercel.
**Estimated time: 20–30 minutes**

---

## What You'll Need

- A free [Supabase](https://supabase.com) account (database)
- A paid [OpenAI](https://platform.openai.com) account (for GPT-4o access)
- A free [Vercel](https://vercel.com) account (for deployment)
- A free [GitHub](https://github.com) account (to connect to Vercel)
- [Node.js](https://nodejs.org) installed on your computer (version 18 or higher)

---

## STEP 1 — Set Up Your Supabase Database

1. Go to [https://supabase.com](https://supabase.com) and sign up for a free account
2. Click **"New Project"** — give it any name (e.g., `pb-video-planner`) and set a database password
3. Wait for the project to finish creating (takes about 1 minute)
4. In the left sidebar, click the **SQL Editor** icon (looks like a database)
5. Click **"New Query"** and paste this SQL code, then click **Run**:

```sql
CREATE TABLE topics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  trend_basis TEXT,
  engagement_score INTEGER CHECK (engagement_score BETWEEN 1 AND 10),
  reach_score INTEGER CHECK (reach_score BETWEEN 1 AND 10),
  relevance_score INTEGER CHECK (relevance_score BETWEEN 1 AND 10),
  overall_score INTEGER CHECK (overall_score BETWEEN 1 AND 10),
  month TEXT NOT NULL,  -- format: "YYYY-MM" e.g. "2026-05"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Allow the app to read and write topics
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations" ON topics
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

6. You should see **"Success. No rows returned."** — that means the table was created ✅
7. Now go to **Project Settings** (gear icon in sidebar) → **API**
8. Copy and save these three values — you'll need them in Step 3:
   - **Project URL** (looks like: `https://abcxyz.supabase.co`)
   - **anon / public key** (a long string starting with `eyJ...`)
   - **service_role key** (another long string — keep this secret!)

---

## STEP 2 — Get Your OpenAI API Key

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click **"Create new secret key"** — give it a name like `pb-video-planner`
4. Copy the key immediately — it won't be shown again! (Starts with `sk-...`)
5. Make sure you have **billing enabled** on your OpenAI account — GPT-4o requires credits

> 💡 Each topic generation request costs roughly $0.02–$0.05 USD using GPT-4o.

---

## STEP 3 — Configure Your Environment Variables

1. In the `pb-video-planner` folder, find the file named `.env.local.example`
2. Make a copy of it and rename the copy to `.env.local` (remove the `.example` part)
3. Open `.env.local` in any text editor and fill in your values:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key...
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key...
OPENAI_API_KEY=sk-...your-openai-key...
```

> ⚠️ **IMPORTANT**: Never share your `.env.local` file or upload it to GitHub. It contains secret keys!

---

## STEP 4 — Run the App Locally (Optional but Recommended)

Test that everything works on your computer before deploying:

1. Open a terminal (Command Prompt or PowerShell on Windows)
2. Navigate to the `pb-video-planner` folder:
   ```
   cd "C:\Users\Lenovo\PBVideoPlanner2.0\Persona Branding Video Planner 2.0\pb-video-planner"
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and go to [http://localhost:3000](http://localhost:3000)
6. You should see the app! Click **"Generate 10 Topics"** to test it.

---

## STEP 5 — Deploy to Vercel

### 5a. Push Your Code to GitHub

1. Go to [https://github.com](https://github.com) and create a new repository
   - Name it `pb-video-planner`
   - Set it to **Private** (recommended to protect your code)
   - Do NOT initialize with a README
2. Follow the instructions GitHub shows to push your code (the `pb-video-planner` folder)

> 💡 If you haven't used GitHub before, [GitHub Desktop](https://desktop.github.com) is the easiest way — it has a visual interface instead of command-line.

### 5b. Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up (use your GitHub account)
2. Click **"Add New Project"**
3. Find and select your `pb-video-planner` GitHub repository
4. **Before clicking Deploy**, you need to add your environment variables:
   - Scroll down to **"Environment Variables"**
   - Add each of the 4 variables from your `.env.local` file:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
5. Click **"Deploy"**
6. Vercel will build and deploy your app — takes about 1–2 minutes
7. You'll get a live URL like `https://pb-video-planner.vercel.app` 🎉

---

## STEP 6 — Using the App

- **Generate topics**: Navigate to the current month and click "✨ Generate 10 Topics"
- **Browse history**: Use the ← Prev / Next → buttons to navigate to past months and see previously generated topics
- **No repeats**: The app automatically tracks all past topics and tells GPT-4o to avoid repeating them

---

## Troubleshooting

| Problem | Solution |
|--------|----------|
| "Failed to load topics" | Check that your Supabase URL and keys are correct in `.env.local` |
| "Generation failed" | Check that your OpenAI API key is valid and you have billing enabled |
| "Topics already generated" | That month already has topics — navigate to a different month |
| Blank page on Vercel | Make sure you added all 4 environment variables in Vercel dashboard |

---

## App File Structure (for reference)

```
pb-video-planner/
├── app/
│   ├── layout.js          → App wrapper (font, metadata)
│   ├── page.js            → Main dashboard (month navigator, topic grid)
│   ├── globals.css        → Tailwind base styles
│   └── api/
│       ├── generate/
│       │   └── route.js   → POST: calls OpenAI, saves to Supabase
│       └── topics/
│           └── route.js   → GET: fetches topics from Supabase
├── components/
│   ├── Header.jsx         → Top navigation bar
│   └── TopicCard.jsx      → Individual topic card with scores
├── lib/
│   └── supabase.js        → Supabase client setup
├── .env.local             → Your secret API keys (never share this!)
├── .env.local.example     → Template for the above
├── package.json           → Project dependencies
└── SETUP.md               → This file
```
