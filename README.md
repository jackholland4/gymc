# gymc

A Monte Carlo simulation tool for artistic gymnastics competition. Model team and individual results for WAG and MAG disciplines using real competition data scraped from the 2026 season.

## What it does

- **Simulate** a full World Championship cycle — qualifications, team final, apparatus finals, and all-around final — with randomized score draws from each gymnast's historical distribution
- **Batch simulate** thousands of trials to produce medal probability and podium percentage estimates
- **Optimize** team selection and lineup assignments using marginal value analysis across candidate rosters
- **Filter** score data by meet type — exclude domestic competitions or restrict to FIG-sanctioned meets only to adjust each gymnast's modeled performance baseline
- **Browse** gymnast scoring history by competition, with apparatus breakdowns and all-around totals

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Framer Motion |
| API | FastAPI (Python), served on port 8001 |
| Simulation | NumPy-based Monte Carlo, custom scoring pipeline |
| Data | SQLite (`gymc.db`), scraped from The Gymternet; supplemented by FIG result CSVs |

## Setup

```bash
# Frontend
npm install
npm run dev          # localhost:3000

# API (separate repo / directory)
cd ~/api
pip install -r requirements.txt
uvicorn main:app --port 8001 --reload
```

Set `NEXT_PUBLIC_API_URL=http://localhost:8001` or update `lib/api.ts`.

## Data pipeline

Competition results are scraped from The Gymternet's results pages and stored in `gymc.db`. Each score row carries two binary flags:

- `is_fig` — meet is FIG-sanctioned (World Cups, continental championships, etc.)
- `is_domestic` — meet is a national domestic competition

These flags power the score filter toggles in the UI.
