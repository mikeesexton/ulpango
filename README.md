# Ulpango (Advanced Duolingo-Style Hebrew Trainer)

Browser-only vocabulary trainer focused on advanced, practical Hebrew.

## Included in v1

- Fixed 10-round lesson flow with mixed forward/backward translation
- Mobile + desktop responsive UI (no install required)
- Adaptive spaced repetition (local-only progress)
- Inline nikud toggle next to Hebrew prompt text (`Show Nikud` / `Hide Nikud`)
- Start-screen performance snapshot by vocabulary type (emoji ring + ✅/❌ counts since last reset)
- Unified vocabulary pool (no category or curriculum-size filtering)
- Seed vocabulary set (938 entries) including:
  - Duolingo Advanced Core
  - Cooking Utensils
  - Cooking Verbs
  - Health
  - Work & Business
  - Bureaucracy
  - Home & Everyday Life
  - Abstract Thinking & Philosophy
  - Emotional Nuance
  - Conversation Glue
  - Legal & Civic Concepts
  - Technology & AI
  - Finance & Investing
  - Social & Cultural Reality
  - Dating & Relationships
  - Meta-Language
  - Scientific & Analytical
- Expanded tracks for abstract discourse, legal systems, tech/AI, finance, science, culture, communication, advanced grammar, and high-level policy discourse
- Every entry has nikud rendering in-app (seeded forms plus fallback rendering where needed)
- Structured Hebrew verb-conjugation pipeline with authoritative vs generated forms
- Starter verb set with curated irregular verbs and generation-gated regular verbs
- Migration/report workflow for existing verb vocab (`migrate-hebrew-verbs.mjs`)
- Automated regression tests for conjugation routing and fake-form rejection

## Run

Option A (quick): double-click `index.html`.

Option B (recommended local server):

```bash
cd "/Users/mikesexton/Documents/Ulpango"
/usr/bin/python3 -m http.server 8080
```

Then open:

`http://localhost:8080`

If your shell has a different Python path, this also works:

```bash
python3 -m http.server 8080
```

If your environment blocks binding a local port, use Option A and open `index.html` directly.

If you still see the old non-working page, force refresh (`Cmd+Shift+R`) after reopening.

## Verify

Run the conjugation regression tests:

```bash
npm test
```

Generate the current Hebrew verb migration report and structured draft entries:

```bash
npm run migrate:verbs
```

That writes:

- `hebrew-verb-review-report.json`
- `hebrew-verb-review-report.md`
- `hebrew-verb-migrated.json`

## Publish To GitHub Pages

This app is a static browser game, so GitHub Pages is a good fit.

After you push this repo to GitHub:

1. Open the repository on GitHub.
2. Go to `Settings` -> `Pages`.
3. Set `Source` to `GitHub Actions`.
4. Pushes to `main` will deploy the site automatically using `.github/workflows/deploy-pages.yml`.

The `.nojekyll` file is included so GitHub Pages serves the app as a plain static site.
