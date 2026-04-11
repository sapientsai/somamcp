import type { SessionAuth } from "./core.js"

// ── Logger ────────────────────────────────────────────────────────────

export type Logger = {
  debug: (...args: unknown[]) => void
  error: (...args: unknown[]) => void
  info: (...args: unknown[]) => void
  log: (...args: unknown[]) => void
  warn: (...args: unknown[]) => void
}

// ── Server Config ─────────────────────────────────────────────────────

export type ServerConfig<T extends SessionAuth = SessionAuth> = {
  authenticate?: (request: unknown) => Promise<T>
  instructions?: string
  logger?: Logger
  name: string
  version: `${number}.${number}.${number}`
}

// ── Transport Config ──────────────────────────────────────────────────

export type TransportConfig =
  | { transportType: "stdio" }
  | {
      httpStream: {
        enableJsonResponse?: boolean
        endpoint?: `/${string}`
        host?: string
        port: number
      }
      transportType: "httpStream"
    }
