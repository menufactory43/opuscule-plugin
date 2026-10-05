# Opuscule

[Opuscule](https://opuscule.app/en/) turns your sessions with coding agents (Claude Code, Codex) into a printed book:
one spread per session, your prompt as typed, what happened, the images produced. Everything is read and filtered on
your Mac.

This plugin adds Opuscule to Claude Code and Codex:

- **"Where's my Opuscule volume?"**: sessions per project, places left in the book, data the filter will remove.
- **"Keep this moment for the book"**: the exchange that just happened gets its own spread.
- **"Open the Opuscule Studio"**: proofreading, summaries, cover and order, in your browser.
- **The archive, if you accept it**: after each turn, sessions and generated images are copied to `~/.opuscule/archive`
  on your Mac, so none are lost to Claude Code's 30-day cleanup. Opuscule asks you once.
- In Claude Code (recent version, with mods): a `/livre` panel next to the conversation, a status line
  (`📖 autumn 2026 · 12/37`) and a pin suggestion after a turn that matters, at most once per session.

The tools only return numbers and project names to the agent, never the text of your sessions.

## Requirements

The plugin talks to the Opuscule app, which you install first on macOS:

```sh
curl -fsSL https://opuscule.app/install.sh | sh
```

## What the plugin runs

- **MCP server**: `bin/mcp.sh` starts `opuscule mcp` from `~/.local/bin`. Its tools read your local session files and
  return counts and project names.
- **Stop and SessionEnd hooks**: `bin/archive-hook.sh` runs `opuscule archive --hook`, which copies sessions to
  `~/.opuscule/archive` only if you turned the archive on. Without Opuscule installed, it does nothing.
- **The `/livre` panel** (`hooks/register.tsx`): runs Opuscule's local Python to read the volume status, add the
  current project to the book, and open the Studio; it reads the Studio's log in `~/.opuscule/studio`.

The plugin itself sends nothing over the network. The Studio it opens runs on your Mac (`http://127.0.0.1`). The
Opuscule app contacts Opuscule's server only when you order a print, after you approve the book, and Claude's API only
if you turn on AI summaries.

The plugin is free and MIT-licensed. Composing and proofreading the book are free; you pay only if you print.
Privacy: [opuscule.app/confidentialite](https://opuscule.app/confidentialite/).
