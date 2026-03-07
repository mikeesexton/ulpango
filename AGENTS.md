# Codex Agent — Project Instructions

## Task Log (required)

`task-log.md` is a shared log maintained by all AI agents (Claude Code and ChatGPT Codex).

**At the end of every task session, append a new entry to `task-log.md`** using the format defined at the top of that file. An entry must include:

- Date and time
- Short title summarizing the task
- What was requested
- Files changed (with a brief description of what changed in each)
- Behavior changed (observable differences to the running app, or "None")
- Tests run (exact commands and pass/fail outcome)
- Risks / regressions to check

Do not skip the log entry even for small or documentation-only tasks.

## General editing approach

- Make changes conservatively. Avoid large structural refactors unless explicitly asked.
- Read a file before editing it.
- Do not add features, error handling, or abstractions beyond what is directly requested.
- Do not add comments or docstrings to code you did not write.
- Run `npm test` before and after non-trivial code changes and record the result in the log.

## Project structure

- `index.html` — app entry point (no build step; open directly or via local HTTP server)
- `app.js` — main app logic
- `styles.css` — all styling
- `vocab-data.js` — vocabulary dataset
- `hebrew-verbs.js` — verb conjugation data
- `abbreviation-data.js` — abbreviation dataset
- `tests/` — Node built-in test suite (`npm test`)
- `task-log.md` — shared AI task log (Claude Code + Codex)
