import type { TelemetryCollector, TelemetryEvent } from "./TelemetryCollector.js"

export const createConsoleTelemetry = (prefix = "[soma]"): TelemetryCollector => ({
  flush: () => Promise.resolve(),
  recordEvent: (event: TelemetryEvent) => {
    const entry = {
      data: event.data,
      durationMs: event.durationMs,
      error: event.error,
      name: event.name,
      timestamp: new Date(event.timestamp).toISOString(),
      type: event.type,
    }
    if (event.error) {
      console.error(`${prefix} ${event.type}`, JSON.stringify(entry))
    } else {
      console.log(`${prefix} ${event.type}`, JSON.stringify(entry))
    }
  },
})
