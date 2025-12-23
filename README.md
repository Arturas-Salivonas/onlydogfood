# OnlyDogFood.com

A modern, high-performance dog food comparison platform built with Next.js, TypeScript, and Supabase.

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **API**: GraphQL (Apollo Server)
- **State Management**: Apollo Client, TanStack Query
- **Testing**: Jest, Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase credentials

4. Set up database:
   - Create a Supabase project
   - Run the migration in `supabase/migrations/001_initial_schema.sql`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── ui/             # UI components
│   ├── layout/         # Layout components
│   └── features/       # Feature-specific components
├── lib/                # Utilities and helpers
│   ├── api/           # API utilities
│   ├── graphql/       # GraphQL schema and resolvers
│   ├── queries/       # TanStack Query hooks
│   └── utils/         # Helper functions
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── scraper/            # Web scraping scripts
├── scoring/            # Scoring algorithm
├── scripts/            # Utility scripts
└── tests/              # Test files
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run scrape:brands` - Scrape brand data
- `npm run scrape:products` - Scrape product data

## Features

- 🐕 Dog food product database
- 📊 Nutritional scoring algorithm
- 🏆 Brand leaderboard
- ⚖️ Product comparison tool
- 💰 Daily cost calculator
- 🔍 Advanced filtering and search
- 📱 Fully responsive design
- ⚡ Optimized for performance (Lighthouse 95+)
- 🔐 Admin dashboard for content management

## License

MIT
