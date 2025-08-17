# Baby Registry – React + Supabase (PWA)

Public users: mogu da rezervišu / označe kao kupljeno (ime obavezno, komentar opciono).
Admin: login preko email OTP (Supabase Auth), može da dodaje i briše stavke.

## Setup
1) Supabase: nalepi SQL iz `supabase.sql` u SQL editor i izvrši.
2) `.env` – postavi `VITE_SUPABASE_URL` i `VITE_SUPABASE_ANON_KEY`.
3) `npm i && npm run dev`

## Rute
- `/` – lista (public)
- `/admin` – admin panel (OTP login, add/delete)

## Deploy
`npm run build` i hostuj `/dist` (GitHub Pages / Netlify / Vercel).