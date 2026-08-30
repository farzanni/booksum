# خلاصه‌کتاب (BookSum)

A small, clean Persian book-summary site — the foundation for a bigger, monetizable
platform later. Currently shows 10 classic books: cover + title grid, click a book to
read its Persian summary.

## Stack
- **Next.js 15 (App Router) + React 19 + TypeScript** — chosen so it scales into a real product.
- Covers from **Open Library** (auto-fetched), with an SVG fallback if a cover is missing.
- Persian text is **RTL**, uses the **Vazirmatn** webfont (falls back to Tahoma).

## Run it
```bash
cd ~/dev/booksum
bun install      # already done
bun run dev      # http://localhost:3000
```
Other scripts: `bun run build` (production build), `bun run start` (serve build).

## Where things live
- `app/page.tsx` — home grid of 10 books.
- `app/books/[slug]/page.tsx` — book detail (Persian summary).
- `app/layout.tsx` — RTL + Persian font + header.
- `data/books.ts` — the 10 books (title, author, cover URL, full Persian text). **Generated**, not hand-edited.
- `scripts/gen-data.mjs` — regenerates `data/books.ts` from `~/dev/blinkist-books/persian/*.fa.txt`
  and fetches covers. Re-run after adding books:
  ```bash
  node scripts/gen-data.mjs
  ```

## To grow this later (monetization path)
- Add a DB (Postgres/SQLite) + an admin to manage books instead of `data/books.ts`.
- Add categories, search, and "read more" tiers → **subscription** (Zibal/Enamad, already owned).
- Add Persian **TTS audio** per summary (you already have voices tested) → audio tier.
- SEO + Persian text = organic Google traffic from Iran; monetize with ads or premium.
- Deploy to Vercel or your VPS (nginx + `bun run build && bun run start`).
