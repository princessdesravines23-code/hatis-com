# Hatis

Support platform for Haitian creators — musicians, comedians, artists, developers, streamers.
Non-custodial: creators list their own payment handles (MonCash, NatCash, PayPal, etc.); Hatis
never touches the money.

## Stack

React + TypeScript + Vite, Tailwind CSS, React Router. Supabase (auth + database) planned next —
`src/data/creators.ts` currently holds mock data shaped like the future `creators` table joined
with `payment_methods`, `social_links`, and `membership_tiers`.

## Local dev

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel: **Add New Project** → import the repo.
3. Framework preset: **Vite** (auto-detected). No env vars needed yet.
4. Deploy — you'll get a `*.vercel.app` URL. Attach a custom domain from Project Settings once ready.

## Structure

```
src/
  components/   CategoryChips, CreatorCard, Nav
  pages/        Catalogue (/), Profile (/:slug)
  data/         mock creators — swap for Supabase queries later
  types/        shared Creator/Tier types
```

## Next up

- Wire `src/data/creators.ts` to Supabase (`creators`, `payment_methods`, `social_links`,
  `membership_tiers` tables)
- Lightweight creator verification flow (social handle confirmation code)
- Creator signup/profile-edit form
