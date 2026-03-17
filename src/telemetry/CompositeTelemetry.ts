import type { TelemetryCollector, TelemetryEvent } from "./TelemetryCollector.js"

export const createCompositeTelemetry = (collectors: ReadonlyArray<TelemetryCollector>): TelemetryCollector => ({
  flush: async () => {
    await Promise.all(collectors.map((c) => (c.flush ? c.flush() : Promise.resolve())))
  },
  recordEvent: (event: TelemetryEvent) => {
    collectors.forEach((collector) => collector.recordEvent(event))
  },
})
