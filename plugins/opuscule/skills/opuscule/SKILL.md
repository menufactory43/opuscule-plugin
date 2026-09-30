---
name: opuscule
description: Opuscule makes a printed book of the user's sessions with coding agents (Codex, Claude Code), one volume per quarter, composed and filtered on their Mac. Use when the user mentions their Opuscule book or volume, asks to keep or pin the current session or moment "for the book", wants to review, compose or order their book, or asks about book sizes and prices.
---

# Opuscule

Opuscule turns the user's agent sessions into a book: one spread per session (their request as they wrote it,
what happened, the images made), a quarterly report, a closing letter. The engine runs on the user's Mac; the
`opuscule` MCP server exposes it.

## Tools

- `opuscule_volume_status`: where the current volume stands (sessions per project, slots in the book size,
  items the local filter removes, pinned moments, Claude Code sessions about to be deleted).
- `opuscule_pin_moment`: keep the current session, at this point of the conversation, for the book.
- `opuscule_open_studio`: open the Studio in the browser (review pages, summaries, cover, order).
- `opuscule_formats`: book sizes and prices.

## How to help

1. **"Where's my volume?"**: call `opuscule_volume_status` and answer in a few lines: how full the volume is,
   projects not in the volume that have many sessions (the user adds them in the Studio settings), and the number
   of sessions to review. If Claude Code sessions are about to be deleted, say how many and offer to raise
   `cleanupPeriodDays` in `~/.claude/settings.json`; change that file only after the user says yes.
2. **"Keep this for the book"**: call `opuscule_pin_moment`. Pass `note` only with the user's own words about
   why; never invent one. Confirm in one sentence, and relay the tool's warning if the project isn't in the volume.
3. **Offering a pin**: at most once per session, and only when something clearly worth remembering just happened
   (a first working version, a launch, an image the user loves), you may ask in one short line whether to keep
   the moment for the book. Never pin without the user's yes.
4. **Review, compose, order**: call `opuscule_open_studio` and tell the user it opened in their browser.
   Ordering happens only in the Studio, after the user approves every page; never order from the conversation.
5. **Sizes and prices**: call `opuscule_formats`.

## Rules

- Everything stays on the Mac. The tools return counts and project names; don't ask the user to paste sessions
  into the chat, and don't read `~/.codex/sessions` or `~/.claude/projects` yourself to fill the book.
- The user's words are never rewritten in the book: sensitive text is removed, not paraphrased.
- If a tool says the `opuscule` command is missing, the user installs it with
  `curl -fsSL https://opuscule.app/install.sh | sh` (ask before running it).
