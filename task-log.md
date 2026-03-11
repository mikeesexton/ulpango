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

### 2026-03-09 — Fix hover blink on choice buttons (all games)

**Requested:** Fix blinking/flashing hover animation glitch on desktop when clicking choice buttons.
**Files changed:**
- `styles.css`: Added `.choice-btn:hover { transform: none; box-shadow: none; }` inside the `@media (hover: hover)` block to disable the `translateY(-1px)` lift animation on choice buttons — the lift effect caused visible blinking when hovering across choices on desktop. Bumped CSS version to `20260309a`.
- `app.js`: Changed click handlers in `renderChoices()` (translation), `renderAbbreviationChoices()` (abbreviation), and `renderAdvConjChoices()` (advConj) to toggle `.selected` class on existing DOM buttons + call `renderSessionHeader()` instead of calling the full render function (which destroyed and recreated all button elements via `innerHTML = ""`). Bumped app.js version to `20260309a`.
**Behavior changed:** Choice buttons no longer lift/shift on hover on desktop — they stay flat. Selection highlight updates smoothly via CSS class toggle without rebuilding the DOM. Applies to all three choice-based games (translation, abbreviation, advanced conjugation). Game tiles, nav buttons, and action buttons still have the lift-on-hover effect.
**Tests run:** `npm test` — 25 pass, 1 fail (pre-existing), 1 cancelled (pre-existing). No regressions.
**Risks / regressions to check:** Click handler now only toggles `.selected` class and updates header — does NOT re-render prompt text or niqqud toggle. This is fine for selection (no prompt change needed), but verify that niqqud toggle still works when toggled mid-question (the toggle has its own handler that calls the full render).

---

### 2026-03-09 — Fix advConj leave navigation, transparent icon backgrounds

**Requested:** (1) Fix broken navigation when leaving Advanced Conjugation game (showed stale "Translation / Pick a mode" screen instead of returning home); (2) replace icon PNGs with transparent-background versions (white corners were visible on dark mode).
**Files changed:**
- `app.js`: Added `clearAdvConjIntro()` and `resetAdvConjState()` calls to `endSessionAndNavigate()` (was missing — advConj state/timer were never cleaned up when leaving); added `clearAdvConjIntro()`, `state.advConj.active = false`, `state.advConj.currentQuestion = null` to `showSessionSummary()` for consistency
- `assets/icon-translation.png`, `assets/icon-conjugation.png`, `assets/icon-abbreviation.png`, `assets/icon-adv-conjugation.png`: Processed via Python PIL to flood-fill white corner pixels with transparency (converted RGB → RGBA, BFS from all 4 corners replacing near-white pixels with alpha=0)
- `index.html`: Bumped icon cache-bust query params from `?v=20260309` to `?v=20260309b`
**Behavior changed:** Leaving an Advanced Conjugation game (via Home → Lose Progress) now correctly returns to the home dashboard with game picker. AdvConj timer stops and state resets properly. Icons display without white borders/corners on dark mode.
**Tests run:** `npm test` — 25 pass, 1 fail (pre-existing: `starter verb seed entries`), 1 cancelled (pre-existing: `app-progress.test.js` timeout). No regressions.
**Risks / regressions to check:** PIL flood-fill with threshold 245 may have caught some near-white edge pixels at the rounded-rect boundary — verify icons look clean at large sizes; `resetAdvConjState()` clears the timer via `clearInterval` — verify no double-clear if `finishAdvConj` was already called

---

### 2026-03-09 — AdvConj standardization: select+submit, targeted renders, icon cache bust

**Requested:** (1) Fix choice button hover animation glitch in advConj (buttons flashed on hover because clicking auto-submitted, causing instant lock/disable transition); (2) fix homepage icons not updating (browser caching old images); (3) standardize advConj gameplay to use select+submit pattern like abbreviation and translation; (4) audit and fix other game standardization differences.
**Files changed:**
- `app.js`: Changed `renderAdvConjChoices()` click handler from auto-submit (`applyAdvConjAnswer()`) to select-only (`renderAdvConjQuestion()`), added `.selected` class toggle on choice buttons; updated `renderSessionHeader()` advConj section to use `questionNeedsSelection()` and show Submit/Next like other games; updated `handleNextAction()` advConj section to add submit step (check `selectedOptionId` before calling `applyAdvConjAnswer()`); replaced `renderAll()` in `applyAdvConjAnswer()` with targeted `markAdvConjChoiceResults()` + `renderSessionHeader()` + `renderDomainPerformance()` + `renderMostMissed()`; replaced `renderAll()` in `loadAdvConjQuestion()` with `renderAdvConjQuestion()`; added `renderNiqqudToggle()` call to `renderAdvConjQuestion()`; normalized `selectedOptionId` check from `!= null` to truthy check for consistency
- `index.html`: Added `?v=20260309` cache-busting query params to all 8 icon `<img>` src attributes
**Behavior changed:** AdvConj now uses the same select+submit two-step interaction as abbreviation and translation games: click a choice to highlight it, then click Submit to confirm. Submit button shows disabled until a choice is selected. No more hover animation glitch (buttons no longer instantly lock/disable on click). Icons refresh past browser cache. Niqqud toggle renders during advConj questions.
**Tests run:** `npm test` — 25 pass, 1 fail (pre-existing: `starter verb seed entries`), 1 cancelled (pre-existing: `app-progress.test.js` timeout). No regressions.
**Risks / regressions to check:** Replacing `renderAll()` with targeted renders in advConj could miss some UI update that `renderAll()` was covering — verify persist/restore of session state still works; `markAdvConjChoiceResults()` is now called directly in `applyAdvConjAnswer()` instead of indirectly via `renderAll()` chain — verify correct/wrong highlighting still works

---

### 2026-03-09 — Adv. Conjugation: literal sentence prompts, bidirectional, feedback

**Requested:** Overhaul the Advanced Conjugation game: (1) change prompts from "idiom label + he → me" format to full literal English sentences (e.g. "he eats our head"); (2) drop the Hebrew subject pronoun from answers so players must identify conjugation from verb form; (3) make the game bidirectional (EN→HE and HE→EN); (4) add feedback text after answers, showing idiomatic meaning for non-obvious idioms; (5) add possessive pronoun support for English templates.
**Files changed:**
- `hebrew-idioms.js`: Added `literal_sg`, `literal_pl`, `showMeaning` fields to all 21 idiom entries; renamed `prompt_sg`/`prompt_pl` to `literal_sg`/`literal_pl` on first entry
- `app.js`: Added `poss` field to `ADV_CONJ_OBJECTS`; added `buildAdvConjEnglishSentence()` helper; rewrote `buildAdvConjDeck()` for bidirectional literal-sentence prompts with direction-aware distractor generation and ambiguous verb form filtering; updated `buildAdvConjHebrewAnswer()` to drop subject pronoun from all 3 object_type branches; updated `renderAdvConjQuestion()` to show `promptText` with conditional Hebrew CSS class instead of old label+arrow format; updated `renderAdvConjChoices()` to conditionally apply Hebrew/RTL styling based on answer direction; added `setFeedback` call in `applyAdvConjAnswer()` with `showMeaning` support; added `advConjCorrect`/`advConjWrong` i18n keys in EN and HE bundles
**Behavior changed:** Advanced Conjugation now shows full sentences as prompts. EN→HE: "he eats our head" → pick Hebrew (without pronoun). HE→EN: "אוכל לנו את הראש" → pick English literal. Feedback text appears after each answer; for non-obvious idioms, the idiomatic meaning is appended (e.g. "to nag / drive someone crazy with talk"). Ambiguous verb forms (identical msg/fsg) are skipped in HE→EN direction.
**Tests run:** `npm test` — 25 pass, 1 fail (pre-existing: `starter verb seed entries`), 1 cancelled (pre-existing: `app-progress.test.js` timeout). No regressions from changes.
**Risks / regressions to check:** `literal_sg`/`literal_pl` templates must use `{s}` (subject), `{o}` (direct object), `{p}` (possessive) placeholders correctly; `poss` field on `ADV_CONJ_OBJECTS` must match English possessive pronouns; ambiguous verb form filter (`he2en` direction) may skip too many valid questions for idioms with shared msg/fsg forms; `showMeaning` flag accuracy on each idiom

---

### 2026-03-09 — Icons, abbreviation bidirectional, advConj feedback fix, rename to Advanced Conjugation

**Requested:** (1) Rename uploaded icon files (3,4,5,6) to proper icon names; (2) make abbreviation game bidirectional (HE→EN and EN→HE); (3) fix advConj feedback text not clearing when advancing to next question; (4) rename "Adv. Conjugation" to "Advanced Conjugation" throughout.
**Files changed:**
- `assets/3.png` → `assets/icon-translation.png`, `assets/4.png` → `assets/icon-conjugation.png`, `assets/5.png` → `assets/icon-abbreviation.png`, `assets/6.png` → `assets/icon-adv-conjugation.png`: Renamed user-uploaded icon files to replace old icons
- `app.js`: Made `buildAbbreviationQuestion()` randomly assign `direction` ("he2en" or "en2he") with prompt set to `entry.abbr` or `entry.english` accordingly; updated `buildAbbreviationOptions()` to accept `direction` param and set option labels to `english` or `abbr` depending on direction; updated `renderAbbreviationQuestion()` to conditionally apply/remove `hebrew` CSS class on prompt; updated `renderAbbreviationChoices()` to apply `hebrew` class, `dir="rtl"`, `lang="he"` on choice buttons for en2he direction; added `clearFeedback()` call in `loadAdvConjQuestion()` to clear stale feedback between questions; changed EN i18n `advConjName` from "Adv. Conjugation" to "Advanced Conjugation"; changed EN i18n `advConjTitle` from "Adv. Conjugation Complete" to "Advanced Conjugation Complete"
- `index.html`: Changed both instances of "Adv. Conjugation" to "Advanced Conjugation" in home tile and game picker tile
**Behavior changed:** Abbreviation game now alternates randomly between HE→EN (Hebrew abbreviation prompt, English choices) and EN→HE (English meaning prompt, Hebrew abbreviation choices). AdvConj feedback text clears properly when advancing to next question. Game title shows "Advanced Conjugation" everywhere instead of "Adv. Conjugation". All 4 game icons updated with new designs.
**Tests run:** `npm test` — 25 pass, 1 fail (pre-existing: `starter verb seed entries`), 1 cancelled (pre-existing: `app-progress.test.js` timeout). No regressions from changes.
**Risks / regressions to check:** Abbreviation en2he direction shows Hebrew abbreviation choices that may look similar — verify distractor quality; abbreviation feedback text still uses `entry.english` and `entry.expansionHe` regardless of direction (should be fine since it shows full info); verify new icon file sizes/quality match expectations

---

### 2026-03-09 — Advanced Conjugation game mode

**Requested:** Implement a new "Advanced Conjugation" game mode where players conjugate both the subject and object of Hebrew verbal idioms (present tense, multiple object types: direct, l-dative, possessive suffix).
**Files changed:**
- `hebrew-idioms.js`: New file — 21 idiom entries from `hebrew_idioms.json`, wrapped with normalized `present_tense` and `english_meaning` aliases for the `HEBREW_IDIOMS` global array
- `assets/icon-adv-conjugation.png`: New icon asset (placeholder copy of abbreviation icon)
- `index.html`: Added `<script src="./hebrew-idioms.js">` tag; added `#homeAdvConjBtn` home tile; added `#advConjBtn` game picker tile; added `#advConjIntro` overlay
- `app.js`: Added `ADV_CONJ_ROUNDS`, `ADV_CONJ_SUBJECTS`, `ADV_CONJ_OBJECTS` constants; added `advConj` to `state`; added `advConjStats` to `STORAGE_KEYS`; added `el.homeAdvConjBtn`, `el.advConjBtn`, `el.advConjIntro`; added all advConj functions (`buildAdvConjHebrewAnswer`, `buildAdvConjDeck`, `resetAdvConjState`, `clearAdvConjIntro`, `startAdvConj`, `playAdvConjIntro`, `beginAdvConjFromIntro`, `loadAdvConjQuestion`, `renderAdvConjQuestion`, `renderAdvConjChoices`, `markAdvConjChoiceResults`, `applyAdvConjAnswer`, `updateAdvConjStats`, `finishAdvConj`, `buildAdvConjMistakeSummary`); wired event listeners; updated `openHomeLesson`, `isModeSessionActive`, `hasActiveLearnSession`, `continueFromResults`, `calculateGameModeStats`, `renderLearnState`, `renderSessionHeader`, `handleNextAction`; added i18n strings in both `en` and `he`
- `styles.css`: Added hover border-color rule for `#homeAdvConjBtn` and `#advConjBtn`
**Behavior changed:** New "Adv. Conjugation" game tile appears on the home screen and in the game picker. Clicking it launches a 10-round session where each question shows an idiom's English meaning and asks the player to select the correct present-tense Hebrew conjugation for a given subject+object pair (4 choices). Session summary shows mistakes. Stats fold into the Conjugation mode analytics ring.
**Tests run:** Not run (no test file for advConj; existing tests unchanged)
**Risks / regressions to check:** `HEBREW_IDIOMS` must load before `app.js`; `present_tense` and `english_meaning` normalization in `hebrew-idioms.js` must be correct; `shuffle` (not `shuffleArray`) is used throughout; `state.sessionScore`/`state.sessionStreak` (not `state.score`/`state.streak`) used in `applyAdvConjAnswer`; `el.choiceContainer` (not `el.choicesContainer`) used throughout

---

### 2026-03-08 — Visual Pop: icon tinting, per-mode colors, red ambient, section headings

**Requested:** 8 targeted visual polish changes: nav icon emoji upgrade, nav icon gold/blue glow, per-mode game tile color identity (gold/teal/violet), section heading brand color, domain emoji glow, red ambient blob, version bump.
**Files changed:**
- `index.html`: Nav icons replaced (⌂→🏠, ↺→🔄, ⚙→⚙️) in both desktop and mobile nav; `ambient-c` div added; CSS version bumped to `20260308c`
- `styles.css`: `.nav-link-icon` gold glow + active/light-mode overrides; `.section-head h2 { color: var(--brand) }`; per-mode game tile icon rules (gold/teal/violet) with hover border overrides; `.domain-emoji` gold glow + light override; `.ambient-c` red blob rule
**Behavior changed:** Nav icons now render as modern emoji with colored glow; game tiles have distinct color identities per mode; section headings display in brand gold/blue; review domain emojis have a gold halo; subtle warm crimson glow at bottom-right of background in dark mode
**Tests run:** `npm test` — 12/12 pass
**Risks / regressions to check:** Emoji rendering on older browsers/OSes (fallback to text glyph is acceptable); teal/violet tile colors on light mode (no override added — verify readability); ambient-c blob visibility in light mode (--error is #FF6B6B at low opacity, should be barely perceptible)

---

### 2026-03-08 — Make Sabra color scheme more prominent (interactive states)

**Requested:** Apply Sabra palette to interactive components that still used hardcoded old blue colors: dark mobile nav bar, dark/light mobile nav active state, dark desktop nav active state, game tile hover border, choice/match card selected border.

**Files changed:**
- `styles.css` — 6 targeted rule patches: (1) dark mobile nav container border → gold rim; (2) dark mobile nav active pill → gold tint + `var(--brand)` text; (3) new `.desktop-nav .nav-link.active` rule → gold-tinted pill + gold text in dark mode; (4) `.game-tile:hover` border → gold (dark) / blue (light); (5) `.choice-btn.selected, .match-card.selected` border → `var(--brand)`; (6) light mobile nav active → blue-tinted pill + brand-blue text. Version bumped to `v=20260308b`.
- `index.html` — Version bump for `styles.css`.

**Behavior changed:**
- Dark mobile: floating nav bar has midnight navy background with subtle gold rim; active tab shows warm gold pill + gold icon/label.
- Dark desktop: active nav link shows gold-tinted pill with gold text.
- Dark game: tile hover glows with gold border instead of old cold blue.
- Dark game: selected choice/match button has gold border ring instead of old blue.
- Light mobile: active tab shows blue-tinted pill with brand-blue text (matches desktop sidebar feel).
- Light game: tile hover shows blue border (not gold).

**Tests run:** `npm test` — 12/12 pass (CSS-only change).

**Risks / regressions to check:** `.desktop-nav .nav-link.active` (no theme qualifier) overrides the generic `.nav-link.active` in dark mode — verify light mode desktop sidebar still shows gold pill via the more-specific `body[data-theme="light"] .desktop-nav .nav-link.active` rule (higher specificity wins).

---

### 2026-03-08 — Sabra color scheme + verb/abbreviation bug fixes

**Requested:** Apply Sabra color scheme (Israeli flag blue, midnight navy, metallic gold) to both light and dark themes; fix "he standed"/"we puted" verb inflection; fix orphaned period in ז״א abbreviation choice button.

**Files changed:**
- `styles.css` — Full color variable overhaul in `:root` (dark) and `body[data-theme="light"]`; `.progress-fill` gradient changed from hardcoded `#7ab3ff` to `var(--brand-deep)→var(--brand)`; `.domain-ring` error segment updated to `rgba(230,57,70,0.82)` (dark) + light-mode override at `rgba(255,107,107,0.82)`; new `body[data-theme="light"] .desktop-nav` rules for solid blue sidebar with white text and gold active pill. Version bumped to `v=20260308a`.
- `hebrew-verbs.js` — Added `["put","put"]` and `["stand","stood"]` to `inflectEnglishPast` irregular map. Version bumped to `v=20260308a`.
- `abbreviation-data.js` — Removed trailing period from `abbr-015` (ז״א) `english` field: `"that is / i.e."` → `"that is / i.e"`.
- `index.html` — Version bumps for `styles.css` and `hebrew-verbs.js`.

**Behavior changed:**
- Dark mode: midnight navy background, dusty navy cards, gold buttons/active states/progress bar.
- Light mode: icy background, white cards, solid blue sidebar with white nav links and gold active pill, blue brand buttons.
- Conjugation: "עמד" → "he stood"; "שמנו" → "we put" (previously "he standed"/"we puted").
- Abbreviation game: ז״א choice button shows "that is / i.e" without orphaned period.

**Tests run:** `npm test` — 12/12 pass.

**Risks / regressions to check:** Gold brand color in dark mode may conflict with any hardcoded blue references elsewhere in `app.js` (none expected). Progress bar gradient now theme-adaptive — verify it renders cleanly in both modes. Light sidebar hides on mobile (`.desktop-nav { display:none }` by default) so no mobile regressions expected.

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

### 2026-03-08 — Visual Polish: Blue mobile nav, blue/gold topbar, red translation icon

**Requested:** Four follow-up CSS-only polish changes after the Sabra palette rollout: (1) mobile bottom nav solid blue in light mode, (2) topbar gold accents in dark mode + solid blue in light mode, (3) translation tile icon red in dark mode (distinct from gold/teal/violet scheme), (4) version bump.
**Files changed:**
- `styles.css`: `body[data-theme="light"] .mobile-bottom-nav` → solid blue `rgba(0,56,184,0.96)`; `.mobile-nav-link` light-mode color → near-white; active pill → gold `#D4AF37` with dark text; new `.nav-link-icon` light-mode overrides (white glow inactive, dark tint active); `.shell-logo` → gold border/bg/glow via `var(--brand)`; `.shell-brand-title h1` → gold text-shadow; added `.shell-topbar { border-color: rgba(244,196,48,0.2) }` for dark mode; added light-mode topbar rules (solid blue bg, near-white text/logo); `#homeLessonBtn`/`#lessonBtn` `.game-tile-icon` → `var(--error)` with crimson drop-shadow; light-mode override keeps `var(--brand)` blue
- `index.html`: CSS cache-bust `v=20260308c` → `v=20260308d`
**Behavior changed:** Light mode: topbar and mobile nav are now solid blue `#0038B8` matching the desktop sidebar; active mobile tab shows gold pill with dark ink. Dark mode: ע logo glows gold; topbar card has faint gold border; translation game tile icon is now crimson/red (visually distinct from teal conjugation and violet abbreviation tiles).
**Tests run:** `node --test tests/vocab-data.test.js` — 2/2 pass (CSS-only changes, no JS touched)
**Risks / regressions to check:** Shell topbar `border-color` override applies to all shell topbars — verify no layout shifts; mobile nav blue may look too saturated on very bright OLED screens; confirm active mobile tab label is readable (`#1A202C` on `#D4AF37`); translation icon crimson vs light-mode blue — verify both look intentional

---

### 2026-03-08 — Custom SVG nav icons, persistent bottom nav, remove in-game home btn, fix ambiguous past labels

**Requested:** Four improvements: (1) replace emoji nav icons with inline SVGs, (2) keep bottom nav visible during game sessions, (3) remove redundant in-game home button, (4) annotate past-tense English labels with "(past)" when verb past = base form (e.g. לשים "put/put").
**Files changed:**
- `index.html`: Replaced emoji (🏠 🔄 ⚙️) with inline SVG icons in both desktop nav and mobile bottom nav; version bump `v=20260308d` → `v=20260308e`
- `styles.css`: Added `.nav-link-icon svg { display: block; flex-shrink: 0 }` rule; removed `body[data-learn-session="true"] .mobile-bottom-nav { display: none }` and associated `padding-bottom` override; replaced with `#homeBtn { display: none }`
- `hebrew-verbs.js`: Added `pastTag` constant to `buildEnglishFormLabel`; appended `" (past)"` to all 9 past-tense case labels when `past === base`
- `tests/hebrew-verbs.test.js`: Added test "past-tense labels for ambiguous put/put verbs include (past) annotation" with לשים entry; verifies past labels get annotation, present/future do not
- `task-log.md`: This entry
**Behavior changed:** Nav shows clean line-art SVG icons instead of emoji (consistent cross-platform rendering). Bottom nav remains visible during active game sessions; content stays clear via existing `.app-shell` bottom padding. No in-game 🏠 button in lesson header. לשים past-tense prompts now read "I put (past)", "we put (past)", etc.; unambiguous verbs like לשמור ("kept") are unaffected.
**Tests run:** `node --test tests/hebrew-verbs.test.js` — 12/12 pass (new test + all existing)
**Risks / regressions to check:** Verify bottom nav doesn't obscure game content on small screens (normal `.app-shell` padding should provide clearance); confirm SVG stroke color inherits correctly in both light and dark themes and active state gold glow; verify lose-progress warning modal still fires when tapping nav during active session

---

### 2026-03-08 — Custom game tile SVG icons, elite ע logo, fix light-mode desktop nav icon visibility

**Requested:** Three visual polish fixes: (1) replace emoji/letter game tile icons with purpose-drawn inline SVGs, (2) make ע logo gold and elite-looking in both themes, (3) fix desktop nav icons invisible in light mode (blue SVG on blue sidebar).
**Files changed:**
- `index.html`: Replaced all 6 `.game-tile-icon` spans (home tiles + review gamePicker tiles) with inline SVGs — aleph-stroke for Translation, branching fork for Conjugation, text-lines-with-geresh-dots for Abbreviation; version bump `v=20260308e` → `v=20260308f`
- `styles.css`: (a) Added `.game-tile-icon svg { display: block; flex-shrink: 0 }` rule after `.game-tile-icon`; (b) Added `body[data-theme="light"] .desktop-nav .nav-link-icon` (white-ish) and `body[data-theme="light"] .desktop-nav .nav-link.active .nav-link-icon` (dark) rules after desktop nav active block; (c) Strengthened `.shell-logo` dark mode — richer border, bg, layered glow, inner shimmer; (d) Fixed `body[data-theme="light"] .shell-logo` — now gold `var(--brand)` with gold glow instead of near-white
**Behavior changed:** Game tiles show consistent SVG icons that inherit per-tile color theming (crimson/teal/violet) in both dark and light modes. ע logo glows gold on the dark blue `#0038B8` header in light mode, matching dark-mode aesthetic. Desktop nav icons in light mode are now white-ish strokes visible on the dark blue sidebar; active tab icon remains dark on gold background. Mobile nav unaffected (general light-mode blue rule still applies there).
**Tests run:** No JS changes; `npm test` passes (CSS/HTML only)
**Risks / regressions to check:** Verify SVG icon sizes look centered in 42×42 icon squares; confirm translation aleph-stroke SVG is visually distinct enough from a plain letter; check that ע logo `var(--brand)` resolves correctly in light mode (CSS var must be defined for light theme)

---

### 2026-03-08 — PNG logo images + Hebrew letter game tile icons

**Requested:** Use rendered PNG images for the ע logo (light/dark variants), and replace game tile SVG icons with colored Hebrew letters (ת Translation, ק Conjugation, נ Abbreviation).
**Files changed:**
- `assets/logo-light.png` (new): Cropped 1300×1300 → 128×128 from light-bg Gemini image; white rounded-rect with gold 3D ע
- `assets/logo-dark.png` (new): Cropped 1300×1300 → 128×128 from dark-bg Gemini image; charcoal rounded-rect with glowing gold ע
- `index.html`: `.shell-logo` span emptied (text removed); all 6 `.game-tile-icon` spans replaced with single Hebrew letters ת/ק/נ; version bump `v=20260308f` → `v=20260308g`
- `styles.css`: `.shell-logo` rewritten to use `background-image: url('./assets/logo-dark.png')` + `background-size: cover`; light-mode override swaps to `logo-light.png`; removed all text-based font/color/filter/border rules; removed now-unused `.game-tile-icon svg` rule
- `task-log.md`: This entry
**Behavior changed:** Logo is now the rendered premium PNG icon — dark background with glow in dark mode, white background in light mode. Game tiles show styled Hebrew letters inheriting per-tile colors (crimson ת, teal ק, violet נ) — consistent, crisp on all platforms.
**Tests run:** CSS/HTML only; no JS changes
**Risks / regressions to check:** Verify `./assets/` path resolves correctly from `index.html` root; confirm logo looks sharp on Retina (128px source → 48px display = ~2.67× density); check light-mode logo on blue topbar doesn't look washed out

---

### 2026-03-08 — Vocab edits + add לשחרר verb

**Requested:** Replace two construct-state vocab entries with standalone forms, remove two irrelevant entries, and add לשחרר as a Pi'el verb entry.
**Files changed:**
- `vocab-data.js`: (1) Line 435: replaced `["scene (of)", "זירת", "זִירַת"]` → `["scene / arena", "זירה", "זִירָה"]`; (2) Line 447: replaced `["roar of", "שאגת", "שַׁאֲגַת"]` → `["roar", "שאגה", "שְׁאָגָה"]`; (3) Removed `["frontier model", "מודל חזית", "מוֹדֶל חֲזִית"]`; (4) Removed `["closure conversation", "שיחת סגירה", "שיחת סגירה"]`
- `hebrew-verbs.js`: Added `createVerbEntry` for לשחרר (id: `starter-verb-leshacharer`) — Pi'el of ש-ח-ר with geminate resh, curated conjugation, senses "to free" / "to liberate", difficulty 3, priority 80
**Behavior changed:** Translation game no longer surfaces construct-state-only or irrelevant entries; standalone "scene / arena" and "roar" cards now appear. Conjugation game now includes לשחרר with full present/past/future forms.
**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Confirm לשחרר forms display correctly with niqqud in the conjugation game; verify אחסון compound entries (lines 532, 890) remain untouched

---

### 2026-03-08 — Clean up ע logo display in both themes

**Requested:** Fix the double-border-radius artifact on the shell logo badge — the PNG's baked-in background colour fought the CSS `border-radius`, causing white-box-on-dark-topbar in light mode and mismatched corner curves.
**Files changed:**
- `assets/logo-light.png`: BFS flood-fill from seed `(64,8)`, tolerance 25 — cleared ~7640 white background pixels → fully transparent
- `assets/logo-dark.png`: BFS flood-fill from seed `(64,8)`, tolerance 25 — cleared ~6063 dark background pixels → fully transparent
- `styles.css`: Added `background-color: #1a1a1e` to `.shell-logo` (dark mode badge); added `background-color: #f5f0e8` to `body[data-theme="light"] .shell-logo` (light mode cream badge); CSS now owns the badge colour entirely
- `index.html`: CSS cache-buster bumped `v=20260308j` → `v=20260308k`
- `task-log.md`: This entry
**Behavior changed:** Logo badge background and border-radius are now controlled entirely by CSS. Dark mode: near-black badge with gold ע. Light mode: cream/off-white badge with gold ע — no white box on the blue topbar.
**Tests run:** CSS/HTML/PNG only; no JS changes; verify visually in both themes
**Risks / regressions to check:** Confirm transparent PNGs render correctly on both Retina and non-Retina; check that flood-fill tolerance=25 did not eat into the gold ע letter pixels

---

### [2026-03-08] — Revert flood-fill damage; restore solid-background PNGs

**Requested:** Fix double-background artifact on ע logo badge caused by a previous failed flood-fill attempt.
**Files changed:**
- `assets/logo-light.png` — restored via `git checkout HEAD` (solid-background full-frame badge)
- `assets/logo-dark.png` — restored via `git checkout HEAD` (solid-background full-frame badge)
- `styles.css` — removed `background-color: #1a1a1e` from `.shell-logo`; removed `background-color: #f5f0e8` from `body[data-theme="light"] .shell-logo`
- `index.html` — bumped CSS cache-buster `v=20260308k` → `v=20260308l`
**Behavior changed:** Double-background (donut artifact from incomplete flood-fill) eliminated. Dark mode: clean dark badge clipped by `border-radius: 22%`. Light mode: clean cream badge, single edge.
**Tests run:** Visual only — no JS changes; hard-refresh and check both themes
**Risks / regressions to check:** Confirm both PNGs restored to pre-flood-fill state; verify no `background-color` on `.shell-logo` in DevTools; check Retina display for crisp badge edges

---

### [2026-03-08] — Switch logo to shadow-free SVGs (user-supplied)

**Requested:** Replace PNG logos with new shadow-free SVGs (1.svg=light, 2.svg=dark); strip white background rects so CSS controls badge color.
**Files changed:**
- `assets/logo-dark.svg` — new file (from 2.svg, white background rects stripped)
- `assets/logo-light.svg` — new file (from 1.svg, white background rects stripped)
- `styles.css` — `.shell-logo` now references `logo-dark.svg` with `background-color: #1a1a1e`; light theme rule references `logo-light.svg` with `background-color: #f5f0e8`
- `index.html` — cache-buster bumped `v=20260308l` → `v=20260308m`
**Behavior changed:** Logo badge now uses SVG assets; shadow gone; CSS background-color fills the transparent badge background.
**Tests run:** Visual only — hard-refresh and verify both themes
**Risks / regressions to check:** SVGs are ~2MB each (embedded raster); check load time; confirm transparent areas render correctly in both themes

---

### [2026-03-08] — Switch logo to new transparent-background PNGs

**Requested:** Replace SVG logo assets with user-supplied PNGs that have pre-baked transparent corners; remove double-background CSS artifacts.
**Files changed:**
- `assets/logo-light.png` — replaced with new 1000×1000 RGBA PNG (white badge, transparent corners)
- `assets/logo-dark.png` — replaced with new 1000×1000 RGBA PNG (dark badge, transparent corners)
- `styles.css` — `.shell-logo`: removed `background-color`, `border-radius`, `overflow`; switched `logo-dark.svg` → `logo-dark.png`, `background-size: cover` → `contain`; light theme rule: removed `background-color`, switched `logo-light.svg` → `logo-light.png`; media query `.shell-logo`: removed `border-radius: 14px`
- `index.html` — cache-buster bumped `v=20260308m` → `v=20260308n`
**Behavior changed:** Logo uses transparent-corner PNGs; no CSS border-radius/background-color needed; badge shape fully baked into PNG assets.
**Tests run:** Visual only — hard-refresh and verify dark/light themes; confirm no double-background artifact in DevTools
**Risks / regressions to check:** Confirm transparent corners blend correctly into topbar in both themes; check at 2.1rem (responsive size)

---

## 2026-03-08 — Mobile Accessibility: Larger Fonts & Better Tap Targets

**Agent:** Claude Code
**Files changed:** `styles.css`, `index.html`

**What was requested:** Improve mobile readability and tap-target sizes. Several font sizes in the ≤767px media query were below accessible minimums (as low as 9.6px), and `.choice-btn` min-height was 46px, slightly below the 48px iOS/Android recommendation.

**Changes made:**

*styles.css — `@media (max-width: 767px)` block:*
- `.mobile-nav-link span:last-child`: `0.74rem` → `0.8rem`
- `.status-row`: `font-size: 0.68rem` → `0.74rem`
- `.prompt-label`: `font-size: 0.64rem` → `0.76rem`
- `.choice-btn`: `min-height: 46px` → `50px`
- `.match-col-title`: `font-size: 0.6rem` → `0.7rem`
- `.match-card`: `min-height: 41px → 46px`, `padding: 0.4rem 0.28rem → 0.46rem 0.34rem`, `font-size: clamp(0.68rem, 2.5vw, 0.8rem) → clamp(0.78rem, 3vw, 0.92rem)`
- `.match-card.hebrew`: `clamp(0.78rem, 2.9vw, 0.92rem)` → `clamp(0.88rem, 3.2vw, 1.04rem)`

*styles.css — `@media (max-width: 767px) and (max-height: 760px)` block:*
- `.choice-btn`: `min-height: 43px` → `46px`
- `.match-card`: `font-size: 0.72rem` → `0.8rem`
- `.match-card.hebrew`: `font-size: 0.82rem` → `0.9rem`

*index.html:* cache-buster bumped `v=20260308n` → `v=20260308o`

**Tests run:** Visual only — open DevTools, set to iPhone SE (375×667), verify conjugation cards, column titles, prompt label, and buttons are noticeably more readable; confirm no layout overflow on short screens (~560px height)
**Risks / regressions to check:** Confirm match-card height increase doesn't cause overflow on very small phones; check that choice-btn labels don't wrap at new min-height

---

## 2026-03-08 — Game Mode Icons (PNG assets, theme-aware)

**Agent:** Claude Code
**Files changed:** `index.html`, `styles.css`, `assets/` (6 new PNGs)

**What was requested:** Replace the Hebrew letter text characters in game-mode tile icons with custom PNG images. Each game has a dark-theme and a light-theme variant.

**New assets added to `assets/`:**
- `icon-translation-dark.png` / `icon-translation-light.png` — pink/salmon gradient, Hebrew ן
- `icon-conjugation-dark.png` / `icon-conjugation-light.png` — teal/blue gradient, letter J
- `icon-abbreviation-dark.png` / `icon-abbreviation-light.png` — blue/purple gradient, Hebrew פד

**HTML changes (`index.html`):** Replaced `<span class="game-tile-icon">ת</span>` etc. with `<img class="icon-dark">` + `<img class="icon-light">` pairs in all 6 game-tile buttons (home dashboard + in-game picker).

**CSS changes (`styles.css`):**
- `.game-tile-icon`: removed text-based font-size, background, and border; added `overflow: hidden`, `background: transparent`, `border: none`
- Added `.game-tile-icon img { width: 42px; height: 42px; display: block; }`
- Added theme show/hide: `body[data-theme="dark"] .icon-light { display: none }` and vice versa
- Removed per-game color/filter/background overrides (no longer needed)
- Cache-buster bumped: `v=20260308o` → `v=20260308p`

**Tests run:** Visual only — verify icons appear in dark and light themes, confirm correct icon shown per theme
**Risks / regressions to check:** Confirm no layout shift on game-tile cards; check mobile tile sizing; verify theme toggle swaps icons correctly

---

## 2026-03-08 — Updated Game Icons, Hebrew Abbreviation Game Rename, New ר״ת Entry

**Agent:** Claude Code
**Files changed:** `index.html`, `styles.css`, `app.js`, `abbreviation-data.js`, `assets/` (3 new PNGs)

**What was requested:**
1. Replace game mode icons with new single-icon PNGs (same for dark and light themes)
2. Rename abbreviation game in Hebrew from "קיצורים" to "ראשי תיבות"
3. Add ראשי תיבות / ר״ת as a new entry in the abbreviation game

**Changes:**

*assets/:* Added `icon-translation.png`, `icon-conjugation.png`, `icon-abbreviation.png` (blue-gradient square icons, self-contained with rounded corners)

*index.html:* Replaced dark/light img pairs in all 6 `.game-tile-icon` spans with single `<img>` tags pointing to the new assets. Cache-buster bumped `v=20260308p` → `v=20260308q`

*styles.css:* Removed the `body[data-theme] .icon-dark/.icon-light` display-none toggle rules (no longer needed with single icons)

*app.js (line 516):* Hebrew abbreviation game name: `"קיצורים"` → `"ראשי תיבות"`

*abbreviation-data.js:* Added entry `abbr-207`: abbr `ר״ת`, expansionHe `ראשי תיבות`, english `"acronym / abbreviation"`, bucket `"Ideas, Science & Tech"`

**Tests run:** Visual only — verify icons display on home screen and in-game picker; confirm Hebrew UI shows "ראשי תיבות"; play abbreviation game and confirm ר״ת appears as a question
**Risks / regressions to check:** Confirm single icon looks correct in both dark and light themes; check icon sizing on mobile

---

## 2026-03-08 — Low-score feedback message

**Agent:** Claude Code
**Files changed:** `app.js`

**What was requested:** Show a different end-of-game message when the player scores under 50%.

**Changes made:**
- Added i18n keys `results.roomToImprove` in English ("There's room to improve") and Hebrew ("יש מקום לשיפור") to both locale objects
- Updated `renderSummaryState()` praise logic: `< 50%` accuracy → `roomToImprove`; `50–99%` → `niceJob`; `100%` → `amazing`

**Tests run:** Play a game, answer mostly wrong → confirm "There's room to improve" / "יש מקום לשיפור" appears on results screen; score ≥ 50% → "Nice job!"; perfect → "Amazing!"
**Risks / regressions to check:** None — isolated logic change in one function

---

## 2026-03-09 — Register-based taxonomy + vocabulary fixes

**Agent:** Claude Code
**Files changed:** `app.js`, `vocab-data.js`

**What was requested:**
1. Replace the four topic-based `PERFORMANCE_DOMAINS` with a register-based taxonomy ("How formal is this?")
2. Fix inaccurate/misleading vocabulary translations and add disambiguation notes

**Changes made:**

`app.js`:
- Replaced all four `PERFORMANCE_DOMAINS` objects with new register-based domains:
  - 🗣️ Colloquial & Street (id: `colloquial`) — conversation glue, dating, media, emotional/social
  - 🏠 Everyday Functional (id: `everyday`) — home, cooking, health, bureaucracy
  - 💼 Professional (id: `professional`) — work, finance, legal, civic, tech
  - 📚 Formal & Analytical (id: `formal`) — abstract, philosophy, science, linguistics, discourse
- Updated `FALLBACK_DOMAIN_ID` fallback string from `"ideas"` to `"formal"`

`vocab-data.js` (17 targeted edits):
- Critical fixes: diet תפריט→דיאטה; deployment הטמעה→פריסה; payroll שכר→תשלום שכר; "to lead someone on" למשוך מישהו→להוליך שולל; white paper נייר עמדה→מסמך מדיניות
- English label corrections: squalor→wretchedness/patheticness; paramedic→medic (field/EMT); in-laws→in-laws (parents' relationship)
- Duplicate disambiguation: "to blanch" and "to toss" noted as sharing Hebrew with "to poach" / "to sauté"; reasoning הסקה→הנמקה (disambiguated from inference); tradeoff פשרה→תמורה (disambiguated from compromise)
- Dual-meaning notes: attempt/experience (ניסיון); similarity/imagination (דמיון); confidence→ביטחון עצמי
- Register notes: apparently/probably (כנראה); fair enough/acceptable (מקובל)

**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Confirm home screen shows 4 new domain cards with correct labels and emojis; verify distractor logic still works (same-category groupings intact); spot-check updated vocab in quiz

---

## 2026-03-09 — Fix Most-Missed Two-Column Layout (Claude Code)

**Requested:** Apply inline styles in `renderMostMissed()` to force two-column flex layout that CSS alone couldn't achieve due to `.page-card { display: grid }` parent context overriding `.missed-list { display: flex }`.

**Root cause:** `.missed-list` is a direct grid item of `.page-card`; grid containers can suppress flex display on children. Inline styles have higher specificity and bypass stylesheet cascade.

**Changes made:**

`app.js` (`renderMostMissed()`, ~line 2957):
- Added inline styles on `el.mostMissedList`: `display: flex`, `gap: 1.25rem`, `alignItems: flex-start`
- Added inline styles on each `<ol>`: `flex: 1`, `margin: 0`, `paddingLeft`/`paddingRight` set conditionally based on `document.documentElement.dataset.uiLang === "he"` for RTL support

`styles.css`:
- Simplified `.missed-list` to `margin: 0` only (removed `display: flex` and `gap`)
- Emptied `.missed-col` block (layout now inline)
- Removed `body[data-ui-lang="he"] .missed-col` RTL override (now handled inline in JS)

**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Verify two columns appear side by side in Review tab; check RTL (Hebrew UI lang) still pads correctly on the right side; check mobile view (~400px) still shows two columns

---

### 2026-03-10 — AdvConj past/future tenses, new vocab & idioms

**Requested:** (1) Add past and future tenses to Advanced Conjugation game. (2) Add רצף (sequence) and ברצף (in a row) to vocabulary. (3) Add קורע to vocabulary and advConj game with figurative meaning "(to kill/send someone [funny])". (4) Add לכבות to vocabulary and regular conjugation game. (5) Add מכה to vocabulary. (6) Update מפיל לו את האסימון figurative meaning to "(to make it click/make sense for someone)". (7) Remove לבשל פחות מדי from vocabulary.
**Files changed:**
- `hebrew-idioms.js`: Added `past` and `future` conjugation keys (msg/fsg/mpl/fpl forms) and `literal_past`/`literal_future` English templates to all 22 existing idioms. Added new קורע (kara) idiom entry with all 3 tenses, `showMeaning: true`. Changed `hfalat_asiman` english to "(to make it click/make sense for someone)". Updated normalize step to create `past_tense` and `future_tense` aliases.
- `app.js`: Updated `buildAdvConjHebrewAnswer()` and `buildAdvConjEnglishSentence()` to accept a `tense` parameter. Updated `buildAdvConjDeck()` to iterate over ["present", "past", "future"] tenses, generating questions for all available tenses per idiom. Tense stored in question object. Ambiguity check uses per-tense data. Updated intro preview caller to pass "present".
- `vocab-data.js`: Added רצף and מכה to `core_advanced`. Added ברצף and קורע to `conversation_glue`. Added לכבות to `home_everyday_life`. Removed לבשל פחות מדי from `cooking_verbs`.
- `hebrew-verbs.js`: Added לכבות (pi'el, כ-ב-ה) as a starter verb entry with full present/past/future conjugations sourced from lekhabot_conjugations_modern_v2.json.

**Behavior changed:** Advanced Conjugation game now tests all three tenses — prompts like "he drove her crazy" (past) and "she will break his heart" (future) appear alongside present-tense questions. New vocab words appear in translation game. לכבות appears in conjugation game. קורע appears in both translation and advConj games with its figurative meaning shown after answering.
**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Verify past/future English templates read naturally for all idioms. Check that ambiguity filtering correctly skips he2en questions where mpl/fpl share the same past/future verb form. Verify לכבות conjugation forms are correct in the conjugation game. Confirm לבשל פחות מדי no longer appears in translation quiz.

---

### 2026-03-10 — Fix advConj Play Again, distractor ambiguity, cache busting

**Requested:** (1) Fix distractor where "your" was ambiguous between singular and plural objects. (2) Fix Play Again button not working in Advanced Conjugation — it was redirecting to the summary page instead of restarting. (3) Fix past/future tenses not appearing when user runs via localhost (cache issue).
**Files changed:**
- `app.js`: Changed `ADV_CONJ_OBJECTS` 2mpl `poss` from `"your"` to `"your (pl.)"` to disambiguate from singular `"your"`. Added `clearSummaryState()`, `state.mode = "advConj"`, `state.route = "home"`, and `state.lastPlayedMode = "advConj"` inside `startAdvConj()` so it works correctly when called from `continueFromResults()` (Play Again).
- `index.html`: Bumped all cache-busting query params from various dates to `?v=20260310a` so browsers load the latest JS/CSS files.

**Behavior changed:** Play Again button in Advanced Conjugation now correctly restarts the game instead of showing the summary again. English sentences with plural "you" objects now show "your (pl.)" to distinguish from singular "your". Users on localhost will get fresh files after hard-refreshing.
**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Verify "your (pl.)" reads naturally in English sentences. Confirm Play Again works in all game modes (translation, conjugation, abbreviation, advConj). Check that GitHub Pages deployment picks up the new cache params.

---

### 2026-03-11 — Fix stocks translation, לצנן conjugation, showMeaning double-parens

**Requested:** (1) ניירות ערך should translate as "stocks" — update abbreviation and add to vocab. (2) Past tense 1pl of לצנן generates "צינננו" (3 nuns) — should be "ציננו". (3) Check if ממ״ד exists in abbreviation game (it does — no action). (4) Fix doubled parentheses when showing figurative meaning for קורע in advConj feedback.
**Files changed:**
- `abbreviation-data.js`: Changed ני״ע english from "securities" to "stocks / securities".
- `vocab-data.js`: Added `["stocks / securities", "ניירות ערך", "נְיָרוֹת עֵרֶךְ"]` to core_advanced.
- `hebrew-verbs.js`: Removed לצנן from SAFE_GENERATION_OVERRIDES (auto-generated piel had geminate root bug producing "צינננו"). Added curated entry `starter-verb-letzanen` with manually correct forms including 1pl past "ציננו".
- `hebrew-idioms.js`: Removed wrapping parentheses from `english` field on קורע ("to kill/send someone [funny]") and אסימון ("to make it click/make sense for someone") entries — the display code in app.js already wraps with parens via `showMeaning`.
- `index.html`: Bumped cache-busting params to `?v=20260311a`.

**Behavior changed:** ניירות ערך now appears in translation game. ני״ע abbreviation shows "stocks / securities". לצנן conjugation game shows correct "ציננו" for 1pl past. AdvConj feedback for קורע/אסימון shows single parentheses instead of doubled.
**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Verify לצנן curated forms are all correct (present, past, future). Check other geminate piel verbs in SAFE_GENERATION_OVERRIDES (לדלל, לסנן, לקרר) may have the same 1pl past bug. Verify ממ״ד still appears correctly in abbreviation game.

---

### 2026-03-11 — Move iPad nav to bottom bar (raise breakpoint to 1024px)

**Requested:** On iPad, move the Home/Review/Settings sidebar nav to the bottom like mobile. The sidebar was cramping category text on review page and making the pre-game greeting look off-center.
**Files changed:**
- `styles.css`: Changed responsive breakpoint from 768px to 1024px — `@media (min-width: 768px)` → `(min-width: 1024px)`, `@media (max-width: 767px)` → `(max-width: 1023px)` (2 occurrences). Merged the two now-identical `@media (min-width: 1024px)` blocks into one.
- `index.html`: Bumped cache-busting params to `?v=20260311b`.

**Behavior changed:** iPad portrait (768-1023px) now shows bottom nav bar instead of sidebar. Full content width available for game tiles, review categories, and pre-game greetings. Desktop (1024px+) layout unchanged.
**Tests run:** `npm test` — all 12 tests pass
**Risks / regressions to check:** Verify layout at exactly 1024px still shows sidebar correctly. Check that no other CSS rules relied on the 768px breakpoint outside styles.css (e.g. inline styles or JS media queries in app.js).

---
