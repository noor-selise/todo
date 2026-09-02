# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

No application code exists yet in this repository — it currently contains only the SELISE Blocks
bootstrap artifacts (this file, `AGENTS.md`, and the vendored skills under `.codex/skills/` and
`.claude/skills/`). There is no build, lint, or test tooling to document until the app is scaffolded.
Update this file once real source and tooling exist.

The target app (per project context, not yet implemented): a simple todo application backed by
SELISE Blocks, where only an admin role can delete a todo.

<!-- blocks-skills:start -->
## SELISE Blocks

For Blocks work in this repo, read [AGENTS.md](./AGENTS.md) and follow the Blocks section there.

This block scopes Blocks rules only; it says nothing about the rest of this file. Keep Blocks
guidance in `AGENTS.md` rather than duplicating it here — a second copy will drift.
<!-- blocks-skills:end -->
