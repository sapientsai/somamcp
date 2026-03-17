import { describe, expect, it, vi } from "vitest"

import { createCompositeTelemetry } from "../../src/telemetry/CompositeTelemetry.js"
import type { TelemetryCollector, TelemetryEvent } from "../../src/telemetry/TelemetryCollector.js"

const createMockCollector = (): TelemetryCollector & { events: TelemetryEvent[]; flushed: boolean } => {
  const events: TelemetryEvent[] = []
  return {
    events,
    flush: vi.fn().mockImplementation(async () => {
      // eslint-disable-next-line functional/no-let
      ;(collector as { flushed: boolean }).flushed = true
    }),
    flushed: false,
    recordEvent: (event) => events.push(event),
  }
  // eslint-disable-next-line functional/no-let
  var collector = { events, flushed: false }
}

describe("CompositeTelemetry", () => {
  it("dispatches events to all collectors", () => {
    const collector1 = createMockCollector()
    const collector2 = createMockCollector()
    const composite = createCompositeTelemetry([collector1, collector2])

    const event: TelemetryEvent = {
      name: "test",
      timestamp: Date.now(),
      type: "tool.execute",
    }
    composite.recordEvent(event)

    expect(collector1.events).toHaveLength(1)
    expect(collector2.events).toHaveLength(1)
    expect(collector1.events[0]).toBe(event)
    expect(collector2.events[0]).toBe(event)
  })

  it("flushes all collectors", async () => {
    const flush1 = vi.fn().mockResolvedValue(undefined)
    const flush2 = vi.fn().mockResolvedValue(undefined)
    const composite = createCompositeTelemetry([
      { flush: flush1, recordEvent: vi.fn() },
      { flush: flush2, recordEvent: vi.fn() },
    ])

    await composite.flush!()

    expect(flush1).toHaveBeenCalled()
    expect(flush2).toHaveBeenCalled()
  })

  it("handles collectors without flush", async () => {
    const composite = createCompositeTelemetry([{ recordEvent: vi.fn() }, { recordEvent: vi.fn() }])

    await expect(composite.flush!()).resolves.toBeUndefined()
  })
})
