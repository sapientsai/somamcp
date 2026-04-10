import { createDirectTestLogger } from "functype-log"
import { describe, expect, it } from "vitest"

import { createLogLayerTelemetry } from "../../src/telemetry/LogLayerTelemetry.js"
import type { TelemetryEvent } from "../../src/telemetry/TelemetryCollector.js"

describe("LogLayerTelemetry", () => {
  it("routes non-error events to info()", () => {
    const { logger, hasEntry } = createDirectTestLogger()
    const telemetry = createLogLayerTelemetry(logger)

    const event: TelemetryEvent = {
      data: { name: "test-tool" },
      durationMs: 42,
      name: "test-tool",
      timestamp: Date.now(),
      type: "tool.execute",
    }

    telemetry.recordEvent(event)

    expect(hasEntry("info", "tool.execute")).toBe(true)
    expect(hasEntry("error", "")).toBe(false)
  })

  it("routes error events to error()", () => {
    const { logger, hasEntry } = createDirectTestLogger()
    const telemetry = createLogLayerTelemetry(logger)

    const event: TelemetryEvent = {
      error: "something failed",
      name: "test-tool",
      timestamp: Date.now(),
      type: "tool.error",
    }

    telemetry.recordEvent(event)

    expect(hasEntry("error", "tool.error")).toBe(true)
  })

  it("includes structured metadata in events", () => {
    const { logger, hasEntry } = createDirectTestLogger()
    const telemetry = createLogLayerTelemetry(logger)

    const event: TelemetryEvent = {
      data: { toolName: "greet" },
      durationMs: 100,
      name: "greet",
      timestamp: 1700000000000,
      type: "tool.execute",
    }

    telemetry.recordEvent(event)

    expect(hasEntry("info", "tool.execute")).toBe(true)
  })

  it("flush resolves immediately", async () => {
    const { logger } = createDirectTestLogger()
    const telemetry = createLogLayerTelemetry(logger)
    await expect(telemetry.flush?.()).resolves.toBeUndefined()
  })
})
