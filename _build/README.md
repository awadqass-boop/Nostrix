# Nostrix website: source notes

This `_build` folder holds the source that generates the pages. GitHub Pages does not publish folders that start with `_`, so nothing here appears on nostrix.ae.

## Preview on this Mac

```bash
cd /Users/mac/Documents/GitHub/Nostrix && python3 -m http.server 8093 --bind 127.0.0.1
```

Open http://localhost:8093/. Pages use root paths, so open them through the server, not as files.

## Edit and rebuild

Change the text or prices, then run:

```bash
cd /Users/mac/Documents/GitHub/Nostrix && python3 _build/build.py
```

- Home page text: `_build/pages.py`
- Pricing, portfolio, review, legal pages: `_build/pages_more.py`
- Packages and prices: `_build/data/pricing.json`
- Portfolio items: `_build/data/portfolio.json`
- Arabic text: `_build/ar_new.py` (the build lists any text with no Arabic)

Styles and scripts in `assets/` are edited directly; they are not generated.

## Google services

All of these are set in `site-config.js`, with the same values the previous site used.

| Service | Used for |
| --- | --- |
| Reviews Google Sheet (Apps Script) | Home page shows approved reviews; `/review/` submits new ones |
| Leads Google Sheet (Apps Script) | "Submit brief" on the home page |
| Google Analytics 4 | Runs only after a visitor accepts; off on localhost |
| Google Drive | Video previews in the portfolio viewer |
| Google Maps | Office address link |

## Instagram and TikTok

The "Latest posts" section uses the official profile embeds. Handles are in `site-config.js` under `NOSTRIX_SOCIAL`. The accounts must stay public.

## Backup of the previous website

The site as it was before this rebuild is kept in three places:

- Git tag `original-site-2026-11-10` and branch `backup/original-site-2026-11-10` (commit `115f4a0`).
- `/Users/mac/Documents/GitHub/Nostrix-backups/nostrix-original-live-site-2026-11-10.zip`
- The repo history itself: every earlier commit is still there.

To put the previous website back:

```bash
cd /Users/mac/Documents/GitHub/Nostrix && git revert --no-edit HEAD
```

Then push. That adds a new commit that restores the old files; nothing is lost either way.
