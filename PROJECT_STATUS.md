# AreBet Project Status

Last updated: 2026-02-28

## Current State

### Core Stack
- Next.js 16 (App Router), React 19, TypeScript 5
- Tailwind CSS 4
- Supabase client/server helpers in place
- Stripe SDK configured
- API-Football client scaffolded

### Implemented App Areas
- Public pages: Home, Football Hub (`/widgets`), Help
- Auth pages: Login, Signup
- Dashboard pages:
  - Main live dashboard with filters/sort/favorites
  - Live matches, Upcoming matches, Predictions, Odds comparison
  - Match detail page
  - Insights page
  - Teams, Standings, Favorites
- User area: `/user`, `/user/dashboard`
- Support pages: Subscription, Settings, Admin
- API route: `/api/health`

### Data State
- App currently runs on demo/fallback match data (`lib/services/matches.ts`)
- API-Football integration exists at client level but is not wired end-to-end
- Insights run on demo bet history (`lib/demo/bets.ts`)

### Cleanup Already Completed
- Removed unused/orphaned components and starter assets
- Added shared hooks/utilities to reduce duplicate logic:
  - `lib/hooks/use-match-feed.ts`
  - `lib/hooks/use-favorites.ts`
  - `lib/utils/time.ts`
- Lint is clean

## Development Waiting (Backlog)

### High Priority
- Wire real API-Football data into `listMatches()` and match detail flows
- Add loading/error retry UX for all async pages (not only dashboard)
- Replace demo insights inputs with real persisted user bet history
- Implement real subscription checkout flow (Stripe Checkout / Billing Portal)
- Add auth-based access control for Pro/Elite-only routes/features

### Medium Priority
- Persist favorites server-side (Supabase) for cross-device sync
- Build webhook handling for Stripe subscription lifecycle updates
- Add admin tools for user plans, feature flags, and basic moderation
- Add proper empty states and no-data handling for every dashboard sub-page
- Add test coverage (unit + integration) for hooks/services and critical pages

### Low Priority
- Improve README to reflect current route map and architecture
- Add observability (error logging + basic analytics)
- Refine mobile-first UX polish on dense dashboard screens

## Suggested Next Dev Sequence
1. Real match data integration (API-Football service layer + mapping).
2. Stripe checkout + webhook sync + plan enforcement.
3. Supabase persistence for favorites and insight inputs.
4. Testing and release hardening.

