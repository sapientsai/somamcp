export type TelemetryEventType =
  | "cell.start"
  | "cell.stop"
  | "tool.execute"
  | "tool.error"
  | "resource.load"
  | "resource.error"
  | "prompt.load"
  | "prompt.error"
  | "gateway.connect"
  | "gateway.disconnect"
  | "gateway.error"
  | "session.connect"
  | "session.disconnect"

export type TelemetryEvent = {
  data?: Record<string, unknown>
  durationMs?: number
  error?: string
  name: string
  timestamp: number
  type: TelemetryEventType
}

export type TelemetryCollector = {
  flush?: () => Promise<void>
  recordEvent: (event: TelemetryEvent) => void
}
