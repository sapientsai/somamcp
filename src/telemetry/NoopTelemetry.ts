import type { TelemetryCollector } from "./TelemetryCollector.js"

export const NoopTelemetry: TelemetryCollector = {
  flush: () => Promise.resolve(),
  recordEvent: () => {},
}
