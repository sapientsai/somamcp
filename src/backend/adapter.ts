import type { Hono } from "hono"

import type { Prompt, PromptArgument, Resource, SchemaParams, ServerStatus, SessionAuth, Tool } from "../types/core.js"
import type { TransportConfig } from "../types/server.js"

// ── Backend Session ───────────────────────────────────────────────────

export type BackendSession<T extends SessionAuth = SessionAuth> = {
  sessionId?: string
  auth?: T
}

// ── Backend Events ────────────────────────────────────────────────────

export type BackendEvents<T extends SessionAuth> = {
  connect: (event: { session: BackendSession<T> }) => void
  disconnect: (event: { session: BackendSession<T> }) => void
}

// ── Backend Adapter ───────────────────────────────────────────────────

export type BackendAdapter<T extends SessionAuth = SessionAuth> = {
  readonly serverState: ServerStatus
  readonly sessions: ReadonlyArray<BackendSession<T>>

  addPrompt: <Args extends PromptArgument<T>[]>(prompt: Prompt<T, Args>) => void
  addResource: (resource: Resource<T>) => void
  addResourceTemplate: (...args: ReadonlyArray<unknown>) => void
  addTool: <P extends SchemaParams>(tool: Tool<T, P>) => void

  getApp: () => Hono

  on: <E extends keyof BackendEvents<T>>(event: E, handler: BackendEvents<T>[E]) => void

  removePrompt: (name: string) => void
  removeResource: (name: string) => void
  removeTool: (name: string) => void

  start: (transport?: TransportConfig) => Promise<void>
  stop: () => Promise<void>
}

// ── Backend Factory ───────────────────────────────────────────────────

export type BackendFactory<T extends SessionAuth = SessionAuth> = (
  config: {
    authenticate?: (request: unknown) => Promise<T>
    instructions?: string
    name: string
    version: `${number}.${number}.${number}`
  },
  backendOptions?: Record<string, unknown>,
) => BackendAdapter<T>
