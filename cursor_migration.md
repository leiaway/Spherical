# Spherical (FREQUENCY) — Cursor Migration Guide

This document gives you a clear overview of the codebase and step-by-step instructions to disconnect Lovable.dev dependencies and run the app in a local development environment.

---

## 1. Codebase Overview

### What This App Is

**Spherical** (branded as **FREQUENCY** in the UI) is a global music discovery app. Users can:

- Pick or auto-detect a region (geolocation)
- Browse region-based discovery and emerging artists
- Manage playlists and share them
- Add friends and see their activity
- Sign in via Supabase Auth

### Tech Stack

| Layer | Technology |
|-------|------------|
| Build | Vite 5 |
| UI | React 18, TypeScript |
| Styling | Tailwind CSS, shadcn/ui (Radix) |
| Data & Auth | Supabase (PostgreSQL, Auth, Realtime) |
| State | TanStack Query (React Query) |
| Routing | React Router v6 |
| Maps | Mapbox GL |
| Forms | React Hook Form, Zod |

### Project Structure

```
src/
├── App.tsx                 # Root: QueryClient, Router, Toaster, routes
├── main.tsx                # React entry point
├── index.css               # Global styles, Tailwind
├── components/             # Feature & UI components
│   ├── LocationPrompt.tsx  # Ask for location
│   ├── DiscoverySection.tsx
│   ├── RegionPicker.tsx, RegionCard.tsx, RegionSelector.tsx
│   ├── UserMap.tsx         # Mapbox map
│   ├── PlaylistManager.tsx, CreatePlaylistDialog.tsx, SharePlaylistDialog.tsx
│   ├── FriendsList.tsx, AddFriend.tsx
│   ├── TrackCard.tsx, ArtistCard.tsx, EmergingArtistsRecommendations.tsx
│   └── ui/                 # shadcn/ui primitives
├── hooks/
│   ├── useGeolocation.ts   # Browser geolocation + nearest region
│   ├── useRegions.ts       # Regions from Supabase
│   ├── usePlaylists.ts
│   ├── useFriends.ts
│   └── use-mobile.tsx, use-toast.ts
├── integrations/supabase/
│   ├── client.ts           # Supabase client (uses VITE_SUPABASE_* env)
│   └── types.ts            # Generated DB types
├── pages/
│   ├── Index.tsx           # Main discovery page
│   ├── Auth.tsx            # Sign in / sign up
│   └── NotFound.tsx
├── data/regions.ts         # Static region metadata
└── lib/utils.ts            # Helpers (e.g. cn)
```

### Key External Services

- **Supabase**: Auth and database. The app expects:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` (anon key)
  - Optional: `VITE_SUPABASE_PROJECT_ID` (used in some Lovable/Supabase setups)
- **Mapbox**: Used in `UserMap.tsx` for the map. If you use Mapbox, you’ll need a Mapbox token (check the component for `mapboxgl.accessToken` or env usage).

### Routes

- `/` — Main discovery (Index)
- `/auth` — Sign in / sign up
- `*` — NotFound

---

## 2. Lovable Dependencies Found

Review showed **no Lovable-specific code inside `src/`**. All Lovable usage is in config and meta:

| Location | What |
|----------|------|
| `package.json` | `lovable-tagger` in **devDependencies** (Vite plugin for Lovable’s component tagging). |
| `vite.config.ts` | Imports and uses `componentTagger()` from `lovable-tagger` in development. |
| `index.html` | Meta tags: `og:image` and `twitter:image` point to Lovable CDN; `twitter:site` is `@lovable_dev`. |
| `README.md` | Lovable project URL, “Use Lovable”, and deploy/custom-domain instructions. |
| `package-lock.json` | Lockfile entries for `lovable-tagger` (will be pruned when you remove the dep). |

Removing the package and the Vite plugin is enough to run and build the app locally without Lovable.

---

## 3. Step-by-Step: Disconnect Lovable & Run Locally

**Note:** The following code changes have already been applied in this repo: Lovable plugin removed from `vite.config.ts`, `lovable-tagger` removed from `package.json`, and Lovable meta tags in `index.html` replaced. You only need to run **Step 4** (env) and **Step 5** (install + dev) to run locally. Steps 1–3 are documented for reference.

### Step 1: Remove the Lovable Vite plugin (already done)

- Open **`vite.config.ts`**.
- Delete the line that imports `componentTagger` from `"lovable-tagger"`.
- Remove `componentTagger()` from the `plugins` array (keep `react()`).
- Save.

Result: Vite no longer depends on Lovable at build or dev time.

### Step 2: Remove the `lovable-tagger` package

- Open **`package.json`**.
- In **devDependencies**, remove the line:  
  `"lovable-tagger": "^1.1.11",`
- Save.
- From the project root run:

```bash
npm install
```

This updates the lockfile and removes `lovable-tagger` from `node_modules`.

### Step 3: Optional — Update meta tags in `index.html`

To avoid Lovable branding in Open Graph and Twitter cards:

- In **`index.html`**, replace the Lovable `og:image` and `twitter:image` URLs with your own image URL or a relative path (e.g. `/placeholder.svg` or a path under `public/`).
- Change `twitter:site` from `@lovable_dev` to your handle or remove it if you prefer.

No code in `src/` depends on these; this is cosmetic.

### Step 4: Ensure environment variables are set

The app reads Supabase config from Vite env (see `src/integrations/supabase/client.ts`):

- **`VITE_SUPABASE_URL`** — Your Supabase project URL (e.g. `https://<project-ref>.supabase.co`).
- **`VITE_SUPABASE_PUBLISHABLE_KEY`** — Your Supabase anon (public) key.

Create or edit **`.env`** in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

You can keep using the same Supabase project you used in Lovable, or point to a new project and run the migrations under `supabase/migrations/` if needed.

**Security:** Do not commit real keys to the repo. Add `.env` to `.gitignore` if it isn’t already.

### Step 5: Install dependencies and run the app

From the project root:

```bash
npm install
npm run dev
```

Vite will start the dev server (e.g. `http://localhost:8080` or the port in `vite.config.ts`). Open that URL in a browser.

### Step 6: Optional — Update README

- In **`README.md`**, replace Lovable-specific instructions with your own (e.g. “Clone, copy `.env.example` to `.env`, fill in Supabase keys, then `npm install && npm run dev`”).
- Remove or replace the Lovable project URL and “Use Lovable” / “Share -> Publish” sections so the README reflects local and your own deployment flow.

---

## 4. Quick Reference: Local Development

| Task | Command |
|------|--------|
| Install deps | `npm install` |
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |

**Required env (in `.env`):**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### Troubleshooting

- **Dev server fails with `uv_interface_addresses` or "Unknown system error"**: The config uses `host: "::"`. If that fails on your machine, in `vite.config.ts` change `host: "::"` to `host: true` or `host: "localhost"`.
- **Supabase errors**: Ensure `.env` has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for your project.

After completing Steps 1–5, the app is disconnected from Lovable and runnable in a local development environment. Use this file as the single source of truth for the migration and codebase overview.
