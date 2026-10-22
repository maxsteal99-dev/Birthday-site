# CLAUDE.md

This repo is a personal birthday website ("Happy 30th, Sagarika") that Mani is building for his wife.

## Always do this
1. **Before starting any request, read `PROJECT_NOTES.md` in full.** It holds every instruction the owner has given, the architecture, the build and deploy steps, the test tools and the full change log.
2. **After finishing every request, update `PROJECT_NOTES.md`:** add a numbered entry to the change log (§8) saying what was asked and what was done, correct any section that changed, and bump the "Last updated" line. Commit it together with the code.
3. Develop on branch `claude/birthday-website-cinematic-yn9n3m`; publish by building with Vite and force-pushing `dist/` to `gh-pages` (exact recipe in PROJECT_NOTES.md §2). Live site: https://maxsteal99-dev.github.io/Birthday-site/
4. Test for real (Playwright scripts in `tools/tests/`) before saying something works, and re-check the live site after deploying.
5. Keep the theme (burgundy, champagne, ivory, night; Cormorant / DM Sans / Great Vibes). Preserve her content. The owner tests on an iPhone, so iPhone first.
