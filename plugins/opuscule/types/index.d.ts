export type Project = { project: string; sessions: number; images: number; in_volume: boolean }

export type CurrentProject = { key: string; name: string; in_volume: boolean; is_noise: boolean }

export type VolumeStatus = {
  period: { since: string; until: string }
  volume: { configured: boolean; formula_pages: number; session_slots: number; sessions_available: number; full: boolean }
  projects: Project[]
  pins: { count: number }
  archive: { state: string; sessions?: number; size_mb?: number }
  filter: { sessions_to_review: number }
  current: CurrentProject
}

export type Snapshot = {
  status: VolumeStatus | null
  isLoading: boolean
  error: string | null
  updatedAt: number | null
}

export type Suggestion = { reason: string } | null

export type StudioLog = { lines: string[]; isActive: boolean }

declare module 'claude-code' {
  interface PluginState {
    'opuscule': { snapshot: Snapshot; suggestion: Suggestion; isPinnedThisSession: boolean; studioLog: StudioLog }
  }
}
