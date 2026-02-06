import { describe, expect, it, vi } from "vitest"

import { createConsoleTelemetry } from "../../src/telemetry/ConsoleTelemetry.js"
import type { TelemetryEvent } from "../../src/telemetry/TelemetryCollector.js"

describe("ConsoleTelemetry", () => {
  it("logs events to console.log", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {})
    const telemetry = createConsoleTelemetry()

    const event: TelemetryEvent = {
      data: { name: "test-tool" },
      durationMs: 42,
      name: "test-tool",
      timestamp: Date.now(),
      type: "tool.execute",
    }

    telemetry.recordEvent(event)

    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0]?.[0]).toContain("[soma]")
    expect(spy.mock.calls[0]?.[0]).toContain("tool.execute")
    spy.mockRestore()
  })

  it("logs error events to console.error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const telemetry = createConsoleTelemetry("[test]")

    const event: TelemetryEvent = {
      error: "something failed",
      name: "test-tool",
      timestamp: Date.now(),
      type: "tool.error",
    }

    telemetry.recordEvent(event)

    expect(spy).toHaveBeenCalledOnce()
    expect(spy.mock.calls[0]?.[0]).toContain("[test]")
    spy.mockRestore()
  })

  it("flush resolves immediately", async () => {
    const telemetry = createConsoleTelemetry()
    await expect(telemetry.flush?.()).resolves.toBeUndefined()
  })
})
