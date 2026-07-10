// Client for the dev-only disk store (Next route handlers under app/lab-io).
// Used by the lab for live listing/saving/deleting. Not available in prod.
// (Endpoints avoid an underscore prefix — Next treats _folders as private.)

import type { Scene } from './scene'

const ROUTE = '/lab-io/scenes'

export async function listScenes(): Promise<Scene[]> {
  const res = await fetch(ROUTE)
  if (!res.ok) throw new Error(`listScenes failed: ${res.status}`)
  return res.json()
}

export async function saveScene(scene: Scene): Promise<void> {
  const res = await fetch(ROUTE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(scene),
  })
  if (!res.ok) throw new Error(`saveScene failed: ${res.status}`)
}

export async function deleteScene(id: string): Promise<void> {
  const res = await fetch(`${ROUTE}/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`deleteScene failed: ${res.status}`)
}

const PROMOTED_ROUTE = '/lab-io/promoted'

export async function getPromoted(): Promise<string | null> {
  const res = await fetch(PROMOTED_ROUTE)
  if (!res.ok) throw new Error(`getPromoted failed: ${res.status}`)
  const body = await res.json()
  return typeof body.id === 'string' ? body.id : null
}

export async function setPromoted(id: string | null): Promise<void> {
  const res = await fetch(PROMOTED_ROUTE, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  })
  if (!res.ok) throw new Error(`setPromoted failed: ${res.status}`)
}
