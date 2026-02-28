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

### End-User Visual Appearance (Current)
- Overall look:
  - Dark, football-themed UI with pitch-green accents (`#22c55e`) on black/charcoal backgrounds.
  - Card-based layout with clear sections, compact spacing, and high-contrast text.
  - Desktop-first dashboard feel, but usable on mobile with stacked sections.
- Navigation and shell:
  - Top navigation with Home, Football Hub, Help, and auth-aware links (Dashboard/User when logged in).
  - AreBet logo appears in core entry/auth screens and branding touchpoints.
- Home (`/`):
  - Presents a “live board” summary style with KPI strip (live/upcoming/top confidence) and top picks.
  - Uses quick action links to move users into core betting workflows quickly.
- Dashboard (`/dashboard`):
  - Dense control panel style: search, status filters, sort controls, KPI strip, and match cards.
  - Match cards show score, status badge, confidence, advice, and favorite toggle.
  - Designed for frequent scanning and quick decision support.
- Football Hub (`/widgets`):
  - 3-column “widget” visual layout (leagues, matches, standings/detail).
  - Feels like a control-center panel with sticky sections and rapid switching.
- Insights (`/dashboard/insights`):
  - Analytics-heavy presentation with charts and stat cards.
  - Reads as a performance/edge analysis dashboard for advanced users.
- Match detail (`/dashboard/match/[matchId]`):
  - Focused breakdown page with prediction, market snapshot, form context, odds comparison, and timeline.
- Auth pages:
  - Clean centered auth card layout with logo, simple form, and inline validation messaging.
- Subscription page:
  - Plan cards (Free/Pro/Elite) with pricing/features and CTA buttons.
  - Checkout flow UI exists visually, but backend billing flow is still pending.

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
