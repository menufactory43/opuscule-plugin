import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Snapshot, StudioLog, Suggestion, VolumeStatus } from '../types'

const PANE = 'opuscule'
const TITLE = 'Opuscule'
const REFRESH_MS = 30 * 60 * 1000

// Un tour « qui compte » : long, chargé en outils, ou qui se termine par un commit.
const LONG_TURN_MS = 5 * 60 * 1000
const BUSY_TURN_TOOLS = 25

const snapshot = atom({ plugin: 'opuscule', key: 'snapshot' } as const, {
  status: null,
  isLoading: false,
  error: null,
  updatedAt: null,
} as Snapshot)
const suggestion = atom({ plugin: 'opuscule', key: 'suggestion' } as const, null as Suggestion)
const isPinnedThisSession = atom({ plugin: 'opuscule', key: 'isPinnedThisSession' } as const, false)
const studioLog = atom({ plugin: 'opuscule', key: 'studioLog' } as const, { lines: [], isActive: false } as StudioLog)

// Le Studio lancé en arrière-plan (bouton, plugin) écrit sa progression dans ce journal au lieu d'un terminal.
const STUDIO_LOG = '.opuscule/studio/studio.log'
const STUDIO_ACTIVE_MS = 90_000
const STUDIO_POLL_MS = 2_000

// Le Python de l'installation uv d'Opuscule, retrouvé depuis le shebang de la commande `opuscule`.
// Il tourne dans le dossier de la session : le nom de ce dossier est la clé du projet pour Opuscule.
const python = (code: string) => [
  '/bin/sh',
  '-c',
  'PATH="$HOME/.local/bin:$PATH"; bin=$(command -v opuscule) || exit 127; py=$(head -1 "$bin" | cut -c3-); exec "$py" -c "$0"',
  code,
]

const STATUS_PY = `
import json, os
from opuscule.mcp import statut, profil, bruit
from opuscule.volume import display_name
r = statut({})["structuredContent"]
k = os.path.basename(os.getcwd())
r["current"] = {"key": k, "name": display_name(k), "in_volume": k in (profil().get("projects") or []),
                "is_noise": bruit(k) or os.getcwd() == os.path.expanduser("~")}
print(json.dumps(r))
`
const ADD_PY = `
import json, os
from opuscule.studio import PROFILE, _read_profile
k = os.path.basename(os.getcwd())
p = _read_profile()
ps = p.get("projects") or []
if k not in ps:
    p["projects"] = ps + [k]
    t = PROFILE.with_suffix(".tmp")
    t.write_text(json.dumps(p, ensure_ascii=False, indent=1))
    t.replace(PROFILE)
`
const STUDIO_PY = 'from opuscule.mcp import ouvrir_studio; ouvrir_studio()'
const PIN_PROMPT = 'Épingle ce moment pour mon livre Opuscule.'

const SAISONS = ['hiver', 'printemps', 'été', 'automne']

function saison(since: string) {
  const [an, mois] = since.split('-').map(Number)

  return `${SAISONS[Math.floor((mois - 1) / 3)]} ${an}`
}

function joursAvantCloture(now: number) {
  const d = new Date(now)
  const fin = new Date(d.getFullYear(), Math.floor(d.getMonth() / 3) * 3 + 3, 1)

  return Math.ceil((fin.getTime() - now) / 86_400_000)
}

function heure(ms: number) {
  const d = new Date(ms)

  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

function sessionsDansLeLivre(s: VolumeStatus) {
  const n = s.projects.filter(p => p.in_volume).reduce((t, p) => t + p.sessions, 0)

  return Math.min(n, s.volume.session_slots)
}

let isRunning = false

async function refresh($: EngineInterface) {
  if (isRunning) return
  isRunning = true
  await update($, snapshot, s => ({ ...s, isLoading: true, error: null }))
  try {
    const { exitCode, stdout, stderr } = await $.process.run(python(STATUS_PY), { timeoutMs: 120_000 })
    if (exitCode !== 0) {
      const raison = exitCode === 127 ? 'commande opuscule introuvable' : stderr.trim().split('\n').pop() || `code ${exitCode}`
      await update($, snapshot, s => ({ ...s, isLoading: false, error: raison }))
      $.ui.status(undefined)
    } else {
      const status = JSON.parse(stdout) as VolumeStatus
      const now = await $.clock.now()
      await update($, snapshot, () => ({ status, isLoading: false, error: null, updatedAt: now }))
      $.ui.status(`📖 ${saison(status.period.since)} · ${sessionsDansLeLivre(status)}/${status.volume.session_slots}`)
    }
  } catch (err) {
    await update($, snapshot, s => ({ ...s, isLoading: false, error: String(err).slice(0, 120) }))
  } finally {
    isRunning = false
  }
}

let home = ''

async function pollStudio($: EngineInterface) {
  if (!home) {
    const { stdout } = await $.process.run(['/bin/sh', '-c', 'printf %s "$HOME"'])
    home = stdout.trim()
  }
  const path = `${home}/${STUDIO_LOG}`
  const prev = await read($, studioLog)
  try {
    const { mtimeMs } = await $.fs.stat(path)
    const isActive = (await $.clock.now()) - mtimeMs < STUDIO_ACTIVE_MS
    if (!isActive) {
      if (prev.isActive) await update($, studioLog, () => ({ lines: prev.lines, isActive: false }))
      return
    }
    const text = await $.fs.read(path)
    const lines = text
      .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
      .split(/\r?\n|\r/)
      .map(l => l.trimEnd())
      .filter(l => l.trim())
      .slice(-6)
    if (!prev.isActive || lines.join('\n') !== prev.lines.join('\n')) {
      await update($, studioLog, () => ({ lines, isActive: true }))
    }
  } catch {
    // Pas encore de journal : le Studio n'a jamais tourné en arrière-plan.
  }
}

async function addProject($: EngineInterface) {
  const { exitCode } = await $.process.run(python(ADD_PY), { timeoutMs: 30_000 })
  const snap = await read($, snapshot)
  const nom = snap.status?.current.name ?? 'Ce projet'
  $.ui.toast(exitCode === 0 ? `${nom} ajouté au livre` : `Impossible d'ajouter ${nom} au livre`)
  await refresh($)
}

async function pin($: EngineInterface) {
  await update($, suggestion, () => null)
  await update($, isPinnedThisSession, () => true)
  await $.prompt.submit(PIN_PROMPT)
}

export const register: Register = on => {
  let turnTools = 0
  let isCommit = false

  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'livre', description: 'Ouvre le panneau Opuscule : ton volume en cours' })
    void refresh($)
    $.clock.every(REFRESH_MS, () => void refresh($))
    $.clock.every(STUDIO_POLL_MS, () => void pollStudio($))

    return next(e)
  })

  on('command.run', { command: 'livre' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })
    void refresh($)

    return { text: 'Panneau Opuscule ouvert.' }
  })

  on('prompt.submit', async ($, e, next) => {
    turnTools = 0
    isCommit = false
    if (e.text.includes(PIN_PROMPT) || /épingl|pin (this|the) moment/i.test(e.text)) {
      await update($, isPinnedThisSession, () => true)
    }
    await update($, suggestion, () => null)

    return next(e)
  })

  on('tool.call', ($, e, next) => {
    turnTools += 1
    const command = (e as { command?: unknown }).command
    if (e.tool === 'Bash' && typeof command === 'string' && /\bgit\s+commit\b/.test(command)) {
      isCommit = true
    }

    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (!e.agentId && !e.isAborted && !(await read($, isPinnedThisSession))) {
      const minutes = Math.round(e.durationMs / 60_000)
      const raison = isCommit
        ? 'un commit vient de partir'
        : e.durationMs >= LONG_TURN_MS
          ? `${minutes} min de travail d'affilée`
          : turnTools >= BUSY_TURN_TOOLS
            ? `${turnTools} actions de l'agent`
            : null
      if (raison) {
        await update($, suggestion, () => ({ reason: raison }))
      }
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const sug = await read($, suggestion)
    if (!sug || e.props.hasSurvey) {
      return next(e)
    }
    const { Box, Text, Button } = $.ui.resolve(e)

    return (
      <Box flexDirection="row" gap={1}>
        <Text color="red">📖</Text>
        <Text>Ce moment ira bien dans ton livre</Text>
        <Text dimColor>({sug.reason})</Text>
        <Button key="pin-suggest" label="Épingler" onPress={() => void pin($)} />
        <Button key="dismiss-suggest" label="Non merci" onPress={() => void update($, suggestion, () => null)} />
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const snap = await read($, snapshot)
    const s = snap.status
    const studio = await read($, studioLog)

    const boutons = (
      <Box flexDirection="row" gap={1} marginTop={1}>
        <Button key="pin" label="Épingler ce moment" onPress={() => void pin($)} />
        <Button
          key="studio"
          label="Studio"
          onPress={async () => {
            await $.process.run(python(STUDIO_PY), { timeoutMs: 30_000 })
            $.ui.toast("Studio ouvert : sa progression s'affiche ici")
            void pollStudio($)
          }}
        />
        <Button key="refresh" label={snap.isLoading ? 'Calcul…' : 'Actualiser'} onPress={() => void refresh($)} />
      </Box>
    )

    if (!s) {
      return (
        <Box flexDirection="column">
          {snap.error ? <Text color="red">Opuscule : {snap.error}</Text> : <Text dimColor>Lecture de tes sessions… (une quinzaine de secondes)</Text>}
          {boutons}
        </Box>
      )
    }

    const dansLeLivre = s.projects.filter(p => p.in_volume)
    const hors = s.projects.filter(p => !p.in_volume)
    const room = Math.max(2, (e.viewport?.rows ?? 24) - 18)
    const cur = s.current

    return (
      <Box flexDirection="column">
        <Text bold color="red">Volume · {saison(s.period.since)}</Text>
        <Text>
          {s.volume.formula_pages} pages · {sessionsDansLeLivre(s)}/{s.volume.session_slots} sessions{s.volume.full ? ' · complet' : ''}
        </Text>
        <Text dimColor>Clôture dans {joursAvantCloture(Date.now())} jours · ★ {s.pins.count} épinglé{s.pins.count > 1 ? 's' : ''}</Text>

        {!cur.is_noise && (
          <Box flexDirection="row" gap={1} marginTop={1}>
            {cur.in_volume ? (
              <Text color="green">✓ {cur.name} est dans le livre</Text>
            ) : (
              <>
                <Text>{cur.name} n'est pas dans le livre</Text>
                <Button key="add" label="Ajouter" onPress={() => void addProject($)} />
              </>
            )}
          </Box>
        )}

        <Box flexDirection="column" marginTop={1}>
          <Text bold>Dans le livre</Text>
          {dansLeLivre.length === 0 && <Text dimColor>Aucun projet ce trimestre.</Text>}
          {dansLeLivre.slice(0, room).map(p => (
            <Text>  {p.project} · {p.sessions} session{p.sessions > 1 ? 's' : ''}</Text>
          ))}
        </Box>

        {hors.length > 0 && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Hors du volume</Text>
            {hors.slice(0, room).map(p => (
              <Text dimColor>  {p.project} · {p.sessions}</Text>
            ))}
          </Box>
        )}

        {s.filter.sessions_to_review > 0 && (
          <Text color="yellow">{s.filter.sessions_to_review} session(s) à relire avant impression</Text>
        )}
        {s.archive.state === 'on' && s.archive.sessions != null && (
          <Text dimColor>Archive : {s.archive.sessions} sessions · {((s.archive.size_mb ?? 0) / 1024).toFixed(1)} Go</Text>
        )}

        {studio.isActive && (
          <Box flexDirection="column" marginTop={1}>
            <Text bold>Studio en cours</Text>
            {studio.lines.map(l => (
              <Text dimColor={!l.includes('…')}>{l.length > 70 ? l.slice(0, 69) + '…' : l}</Text>
            ))}
          </Box>
        )}

        {boutons}
        <Text dimColor>
          {snap.isLoading ? 'Mise à jour…' : snap.updatedAt ? `Mis à jour ${heure(snap.updatedAt)}` : ''}
          {snap.error ? ` · erreur : ${snap.error}` : ''}
        </Text>
      </Box>
    )
  })
}
