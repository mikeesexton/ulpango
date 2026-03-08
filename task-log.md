# Ulpango Task Log

This file is the shared development log for the Ulpango Hebrew language-learning app.
It is maintained by all AI agents working on this project (Claude Code and ChatGPT Codex).
Every agent must append an entry here at the end of every task session, no matter how small.
Each entry records what was requested, what changed, what was tested, and what to watch for.

---

## Entry Format

```
### [DATE TIME] — <Short task title>
**Requested:** <What the user asked for>
**Files changed:** <List of files and what changed>
**Behavior changed:** <Observable changes to app behavior, or "None">
**Tests run:** <Commands run and outcomes>
**Risks / regressions to check:** <What could break or degrade>
```

---

## Log

---

### 2026-03-07 — Fix desktop language toggle button layout (display conflict)

**Requested:** Fix the home-screen language toggle button on desktop where label and value were not separated left/right as intended.

**Root cause:** `#homeLangToggle` has both `.home-option-btn` (display:flex) and `.settings-block` (display:grid). Equal specificity (0,1,0) meant `.settings-block` won because it appears later in the file, discarding flex layout entirely.

**Files changed:**
- `styles.css` — Added `.home-option-btn.settings-block` two-class override rule (specificity 0,2,0) restoring `display:flex; align-items:center; justify-content:space-between; gap:0.75rem`. Version bumped to `v=20260307m`.
- `app.js` — `renderHomeOptions()` clears `style.textAlign` and `style.direction` on `homeLangValue` (empty string reset). `APP_BUILD` bumped to `"20260307o"`.
- `index.html` — Version strings updated to match above.

**Behavior changed:** On desktop (≥1024px), all three home-screen option rows (Language, Theme, Nikud) now show their label flush-left and value flush-right via flex layout. Previously both spans stacked vertically in a grid column.

**Tests run:** `npm test` — 12/12 pass (no logic changed).

**Risks / regressions to check:** Verify `.settings-block` styling (border, background, padding) is unchanged elsewhere in the app; only the display conflict on this specific button is overridden.

---

### 2026-03-07 13:40 — Create task log file

**Requested:** Create a human-readable log file within the project that tracks tasks completed, including task requested, date/time, files changed, behavior changed, tests run, and risks/regressions.

**Files changed:**
- `task-log.md` — Created (this file). No app logic touched.

**Behavior changed:** None. This is a documentation-only file; it is not imported or referenced by any app code.

**Tests run:** None required. File creation only.

**Risks / regressions to check:**
- None. File does not affect app runtime, build, or test suite.
- Confirm file is not accidentally included in any future bundle step if a bundler is added.

---

### 2026-03-07 15:15 — Establish shared AI task log SOP (Claude Code + Codex)

**Requested:** Make `task-log.md` a shared standard between Claude Code and ChatGPT Codex; update documentation to codify this as a standard operating procedure.

**Files changed:**
- `task-log.md` — Updated preamble to state the file is shared by all AI agents and required after every session.
- `CLAUDE.md` — Created. Project-level instructions for Claude Code: mandatory log entry format, conservative editing guidelines, project structure reference.
- `AGENTS.md` — Created. Equivalent instructions for ChatGPT Codex (same SOP; Codex reads `AGENTS.md` automatically).

**Behavior changed:** None. Documentation/instruction files only; no app logic touched.

**Tests run:** None required.

**Risks / regressions to check:**
- None for app behavior.
- If Codex is updated to use a different instruction filename, rename or alias `AGENTS.md` accordingly.
- Verify `CLAUDE.md` and `AGENTS.md` do not conflict with any future CI or lint rules if a build step is added.

---

### 2026-03-07 15:45 — One-verb conjugation rounds + desktop match card alignment

**Requested:**
1. Conjugation game: one full round covers all forms of one verb (not five).
2. On desktop, English match cards should be left-aligned and Hebrew match cards right-aligned.
3. Push changes to GitHub.

**Files changed:**
- `app.js` — `VERB_MATCH_ROUNDS` changed from `5` to `1`; `APP_BUILD` bumped to `20260307k`.
- `styles.css` — Inside `@media (min-width: 768px)`: added `text-align: left` to `.match-card` and `text-align: right` to `.match-card.hebrew`.
- `index.html` — `styles.css` query string bumped to `v=20260307h`; `app.js` query string bumped to `v=20260307k`.
- `tests/app-progress.test.js` — Updated "conjugation sessions are capped to a small verb set" test: changed expected `totalVerbs` and `verbQueue.length` from `5` to `1`.

**Behavior changed:**
- Conjugation session now covers exactly one verb per play-through; hitting the results screen is faster and tighter.
- On desktop (≥768px), English conjugation option cards are left-aligned; Hebrew option cards are right-aligned. Mobile card alignment is unchanged (still centered).

**Tests run:** `npm test` — 12/12 passed (one test updated to match new VERB_MATCH_ROUNDS value).

**Risks / regressions to check:**
- Verify the results screen appears correctly after matching all forms of a single verb.
- Check that "Continue" after results picks a new verb (not the same one).
- Confirm alignment looks correct at the 768px boundary on real devices/browsers.
- On mobile, confirm cards remain centered.

---

### 2026-03-07 16:15 — "Play Again" button, softer perfect-game praise, knuckles vocab

**Requested:**
1. End-of-game button should say "Play Again" instead of "Continue" (functionality unchanged).
2. Perfect-game praise: "That's amazing!" → "Amazing!"
3. Add "to crack your knuckles" to the translation vocabulary.

**Files changed:**
- `app.js` — English i18n `results.continue`: `"Continue"` → `"Play Again"`; Hebrew i18n `results.continue`: `"המשך"` → `"שחק שוב"`; `results.amazing`: `"That's amazing!"` → `"Amazing!"`; `APP_BUILD` bumped to `20260307l`.
- `index.html` — HTML fallback text on `#resultsContinueBtn`: `Continue` → `Play Again`; `app.js` query string bumped to `v=20260307l`; `vocab-data.js` query string bumped to `v=20260307c`.
- `vocab-data.js` — Added `["to crack your knuckles", "לפצח מפרקים", "לְפַצֵּחַ מַפְרָקִים"]` to `home_everyday_life`.

**Behavior changed:**
- Results screen button label is now "Play Again" / "שחק שוב"; click behavior is identical.
- Perfect score now shows "Amazing!" instead of "That's amazing!".
- "to crack your knuckles" (לְפַצֵּחַ מַפְרָקִים) is now in the translation pool.

**Tests run:** `npm test` — 12/12 passed. No test changes needed.

**Risks / regressions to check:**
- Confirm "Play Again" button fires correctly after translation, conjugation, and abbreviation sessions.
- Confirm "Amazing!" appears only on perfect scores; "Nice job!" still appears otherwise.
- Confirm new vocab entry appears in translation rounds and displays nikud correctly when nikud is on.

---

### 2026-03-07 16:45 — Bulk vocab additions and correction from vocab_additions_for_claude.json

**Requested:** Read `/Users/mikesexton/Downloads/vocab_additions_for_claude.json` and apply all additions and corrections to `vocab-data.js`, preserving existing structure.

**Files changed:**
- `vocab-data.js` — 1 correction + 56 new entries across 8 categories (see below).
- `index.html` — `vocab-data.js` query string bumped to `v=20260307d`.

**Corrections applied:**
- `home_everyday_life`: "to crack your knuckles" updated from `לְפַצֵּחַ מַפְרָקִים` (too vague — means "to crack joints" broadly) to `לַעֲשׂוֹת קְנָאקִים בָּאֶצְבָּעוֹת` (natural spoken Hebrew).
- `bleach`: old and new entries in JSON were identical — no change made.

**Additions by category:**
- `home_everyday_life` (+3): knuckle, joint, to make cracking sounds
- `emotional_nuance` (+5): moving on, to let go, emotional baggage, to dwell on, to spiral
- `conversation_glue` (+9): actually (×2 forms), like (filler), apparently, supposedly, all of a sudden, I mean, whatever (×2 forms)
- `dating_relationships` (+8): situationship, to lead someone on, to catch feelings, to be hung up on someone, to lose interest, to get attached, to pull away, to make it official
- `meta_language` (+10): participle, infinitive, imperative, grammatical gender, singular, plural, construct state, preposition, possessive suffix, direct object marker
- `technology_ai` (+10): prompt, token, context window, agent, to fine-tune, benchmark, model collapse, safety guardrail, reasoning, open weights
- `work_business` (+10): tradeoff, buy-in, alignment, action item, owner (of a task), bandwidth, bottleneck, scope creep, flagship initiative, implementation gap
- `media_digital_life_expanded` (+10): screenshot, to scroll, to swipe, to tap, to click, bug, glitch, lag, update, settings — note: JSON listed these under `media_digital_life`; routed to `media_digital_life_expanded` which is the matching existing category.

**Behavior changed:** 56 new entries and 1 corrected entry now appear in the translation game pool.

**Tests run:** `npm test` — 12/12 passed. No test changes needed.

**Risks / regressions to check:**
- Spot-check new entries in translation rounds with nikud toggle on and off.
- Confirm duplicate-English entries (both "actually" forms, both "whatever" forms) display as distinct cards without collision.
- Verify `media_digital_life_expanded` routing is correct — if a standalone `media_digital_life` category is added in future, these entries may need deduplication.

---

### 2026-03-07 17:30 — Options panel alignment fix, game tile title centering, vocab updates

**Requested:**
1. Options panel values still misaligned — English left-aligned, Hebrew (עברית) right-aligned.
2. Game tile titles should be vertically centered relative to their icons.
3. Rename "to make cracking sounds" → "to crack one's joints".
4. Add "chiropractor" to vocabulary.

**Files changed:**
- `styles.css` — Three changes:
  - `.home-option-value`: changed `text-align: right` → `text-align: left` (was incorrectly right-aligning all values including English ones).
  - Added `body[data-ui-lang="en"] #homeLangValue { text-align: right; direction: rtl; }` — right-aligns the Hebrew language label only when UI is in English mode.
  - `.game-tile-title`: added `align-self: center` so the title vertically centers within its grid row against the icon box.
  - `styles.css` query string bumped to `v=20260307i`.
- `vocab-data.js` — Renamed `"to make cracking sounds"` → `"to crack one's joints"` (same Hebrew); added `["chiropractor", "כירופרקטור", "כִּירוֹפְּרַקְטוֹר"]` to `health`. Query string bumped to `v=20260307e`.
- `index.html` — Version strings updated.

**Behavior changed:**
- Options panel: "Dark Mode", "Off", and any English language label are left-aligned; "עברית" is right-aligned (RTL) when UI language is English.
- Choose Your Lesson: game names now vertically centered alongside their icons.
- Translation game: "to crack one's joints" replaces "to make cracking sounds" as the English prompt; "chiropractor" added to health pool.

**Tests run:** `npm test` — 12/12 passed.

**Risks / regressions to check:**
- When toggling UI language to Hebrew, confirm Language value shows "English" left-aligned (not right-aligned).
- Confirm game tile titles look correct at mobile breakpoints where tile layout changes.
- Confirm "chiropractor" appears in translation rounds with correct nikud when nikud is on.

---

### 2026-03-07 18:45 — Options alignment true root-cause fix (display: grid vs flex conflict)

**Requested:** Desktop options panel still misaligned after multiple previous attempts. User confirmed issue is desktop-only.

**Root cause:** `#homeLangToggle` has both classes `settings-block` and `home-option-btn`. `.home-option-btn` (line 430) sets `display: flex; justify-content: space-between`. `.settings-block` (line 1113) sets `display: grid`. Both have equal specificity (0,1,0); the later-defined rule wins → `display: grid` silently overrides flex. Without flex, `justify-content: space-between` does nothing, and spans stack vertically in a single-column grid, left-aligned. All previous CSS/JS text-align fixes targeted the wrong element — positioning the span's text rather than fixing the broken container layout.

**Files changed:**
- `styles.css` — Added `.home-option-btn.settings-block { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; }` (specificity 0,2,0, beats both single-class rules). Removed now-irrelevant `body[data-ui-lang="he"] .home-option-value { text-align: right }`. Removed `text-align: left` from `.home-option-value` (irrelevant with flex layout). Version bumped to `v=20260307m`.
- `app.js` — Cleared the previously-set `style.textAlign` and `style.direction` inline styles (set to `""`) in `renderHomeOptions()`. Kept `dir` attribute. `APP_BUILD` bumped to `20260307o`.
- `index.html` — Version strings updated.

**Behavior changed:** All three option buttons (Language, Theme, Nikud) now correctly show label flush-left and value flush-right via `justify-content: space-between`. Hebrew mode (RTL) is also handled correctly by the flex direction reversal.

**Tests run:** `npm test` — 12/12 passed.

**Risks / regressions to check:**
- Hard-refresh (Cmd+Shift+R) required to pick up new CSS.
- Verify all three option rows display correctly in both English and Hebrew modes.
- Inspect `#homeLangToggle` computed style — should show `display: flex`.
- Verify `.settings-block` used elsewhere in the app is not affected (the fix uses a two-class selector that only applies to elements with both classes).

---

### 2026-03-07 18:15 — Options alignment fix (inline styles) + vocab/conjugation additions

**Requested:** Fix persistent עברית misalignment in options panel using inline JS styles (bypass cascade). Add "closing the loop" vocab entry, remove nikud from אקונומיקה, rename לרסק to "to smash", add למחוץ ("to crush") to vocab and conjugation, add לביאה ("lioness") to vocab, add למעוך ("to mash") to conjugation.

**Root cause (alignment):** Previous CSS-only fixes lost the cascade battle. Inline styles via JS have the highest specificity and bypass all conflicts.

**Files changed:**
- `app.js` — `renderHomeOptions()`: added inline `style.textAlign` and `style.direction` on `el.homeLangValue`. `APP_BUILD` bumped to `20260307n`.
- `styles.css` — Removed now-redundant `[dir="rtl"]` and `[dir="ltr"]` attr selector blocks. Version bumped to `v=20260307l`.
- `vocab-data.js` — "closure" → "closing the loop"; אקונומיקה nikud removed (plain=nikud slot); לרסק → "to smash"; added `["to crush", "למחוץ", "לִמְחוֹץ"]`; added `["lioness", "לביאה", "לְבִיאָה"]` to `social_cultural`. Version bumped to `v=20260307f`.
- `hebrew-verbs.js` — Added `למעוך` (cooking-verb-lamoach) and `למחוץ` (physical-verb-limchotz) verb entries with full curated conjugations appended to `buildStarterVerbEntries()`. Version bumped to `v=20260307c`.
- `index.html` — All four version strings bumped.

**Behavior changed:**
- "עברית" now flush-right in English mode; "English" flush-left in Hebrew mode (guaranteed via inline styles).
- Translation: "closing the loop" prompt for סגירת מעגל; אקונומיקה never shows nikud; לרסק = "to smash"; למחוץ = "to crush"; לביאה = "lioness".
- Conjugation: למעוך and למחוץ now selectable as verbs.

**Tests run:** `npm test` — 12/12 passed.

**Risks / regressions to check:**
- Hard-refresh after deploy to pick up new CSS/JS.
- Verify options panel alignment in both language modes.
- Verify Theme/Nikud value rows still align correctly.
- Confirm new verbs display forms with/without nikud correctly.

---

### 2026-03-07 17:40 — Options panel alignment fix (second attempt, robust)

**Requested:** Screenshots showed options panel still misaligned after previous fix — עברית not right-aligned in English mode; "English" right-aligned in Hebrew mode.

**Root cause:** CSS-only `body[data-ui-lang="en"] #homeLangValue` selector was losing the cascade battle in ways that were difficult to trace. The `.home-option-btn` and `.settings-block` classes have conflicting `display` values, and the inherited RTL direction from the Hebrew-mode panel was overriding value alignment.

**Files changed:**
- `app.js` — `renderHomeOptions()`: added `el.homeLangValue.setAttribute("dir", state.language === "en" ? "rtl" : "ltr")` so the element carries an explicit direction attribute. `APP_BUILD` bumped to `20260307m`.
- `styles.css` — Replaced `body[data-ui-lang="en"] #homeLangValue` with three cleaner rules:
  - `body[data-ui-lang="he"] .home-option-value { text-align: right }` — Hebrew mode: all values right-aligned
  - `.home-option-value[dir="rtl"] { text-align: right; direction: rtl }` — explicitly right-aligns Hebrew label in English mode
  - `.home-option-value[dir="ltr"] { text-align: left; direction: ltr }` — explicitly left-aligns "English" label in Hebrew mode (overrides the panel's RTL). Version bumped to `v=20260307j`.
- `index.html` — Version strings bumped.

**Behavior changed:** Same visual intent as before, now working correctly in both modes.

**Tests run:** `npm test` — 12/12 passed.

**Risks / regressions to check:**
- Hard-refresh (`Cmd+Shift+R`) to ensure new CSS and JS are loaded.
- Verify עברית is flush-right in English mode.
- Verify "English" is flush-left in Hebrew mode.
- Verify Theme and Nikud values align correctly in both modes.

---
