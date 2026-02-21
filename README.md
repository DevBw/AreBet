# AreBet

**Smart Betting. Simple Insights.**

Football betting intelligence platform with real-time data, predictions, and odds comparison.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL + Auth + Storage)
- **APIs**: API-Football
- **Payments**: Stripe
- **Deployment**: Vercel

## Color System

Strict pitch green theme:

- **Pitch Green**: `#22c55e` (primary)
- **Black**: `#000000` (background)
- **White**: `#ffffff` (text)
- **Soft Black**: `#111111` (cards/panels)

## Features

### Free Tier
- Basic live scores
- Match information
- League standings

### Pro Tier ($7.99/mo)
- AI predictions
- Odds comparison
- Deep match statistics
- Favorites system
- Live match events
- Ad-free experience

### Elite Tier ($12.99/mo)
- Everything in Pro
- Advanced prediction engine
- AI insights
- Bet builder assistant
- Push notifications
- Priority support

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- API-Football API key
- Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd arebet-new
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your API keys in `.env.local`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
arebet-new/
|-- app/                    # Next.js App Router pages
|   |-- (auth)/             # Authentication pages
|   |-- (dashboard)/        # Dashboard pages
|   |-- admin/              # Admin panel
|   |-- api/                # API routes
|   |-- globals.css         # Global styles
|   |-- layout.tsx          # Root layout
|   `-- page.tsx            # Home page
|-- components/             # React components
|   |-- ui/                 # UI components
|   |-- layout/             # Layout components
|   `-- features/           # Feature components
|-- lib/                    # Utilities and configurations
|   |-- supabase/           # Supabase client
|   |-- api-football/       # API-Football client
|   |-- stripe/             # Stripe configuration
|   `-- utils/              # Helper functions
|-- types/                  # TypeScript type definitions
`-- public/                 # Static assets
```
## Development

### Code Style

- TypeScript strict mode enabled
- ESLint for code linting
- Tailwind CSS for styling (pitch green theme only)

### Environment Variables

See `.env.example` for required environment variables.

## Deployment

### Vercel

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy

### Environment Setup

- Add all environment variables from `.env.example`
- Set up Supabase database
- Configure Stripe webhooks
- Enable API-Football API

## License

Proprietary - All rights reserved

## Support

For support, email support@arebet.com

---

Built with Next.js 16 and ⚽ by the AreBet team
