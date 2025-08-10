AreBet – Football Insights

Dev
- Copy .env.example to .env and set keys
- npm i
- npm run dev

Build
- Optional: set VITE_BASE for subpath hosting
- npm run build
- npm run preview

Deploy to Vercel
- Build command: npm run vercel-build
- Output directory: dist
- Env vars: VITE_API_FOOTBALL_KEY, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional VITE_BASE

SPA Routing
- vercel.json routes all requests to /index.html

SW
- Network-first cache for Api-Football
- Hard refresh to force update or call registration.update()

