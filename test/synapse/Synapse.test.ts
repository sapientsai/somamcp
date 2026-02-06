import { describe, expect, it } from "vitest"

import { createSynapse } from "../../src/synapse/Synapse.js"
import { NoopTelemetry } from "../../src/telemetry/NoopTelemetry.js"

describe("Synapse", () => {
  it("starts in disconnected state", () => {
    const synapse = createSynapse({ id: "test", url: "http://localhost:9999/mcp" }, NoopTelemetry)

    expect(synapse.status).toBe("disconnected")
    expect(synapse.tools).toHaveLength(0)
  })

  it("uses config.name or falls back to id", () => {
    const withName = createSynapse({ id: "test", name: "My Synapse", url: "http://localhost:9999/mcp" }, NoopTelemetry)
    expect(withName.name).toBe("My Synapse")

    const withoutName = createSynapse({ id: "test-2", url: "http://localhost:9999/mcp" }, NoopTelemetry)
    expect(withoutName.name).toBe("test-2")
  })

  it("returns info with correct structure", () => {
    const synapse = createSynapse({ id: "s1", name: "Remote", url: "http://localhost:3001/mcp" }, NoopTelemetry)

    const info = synapse.info
    expect(info.id).toBe("s1")
    expect(info.name).toBe("Remote")
    expect(info.status).toBe("disconnected")
    expect(info.url).toBe("http://localhost:3001/mcp")
    expect(info.remoteTools).toHaveLength(0)
  })

  it("handles connection error gracefully", async () => {
    const events: unknown[] = []
    const telemetry = {
      recordEvent: (e: unknown) => events.push(e),
    }

    const synapse = createSynapse({ id: "fail", reconnect: false, url: "http://localhost:1/mcp" }, telemetry)

    await synapse.connect()

    expect(synapse.status).toBe("error")
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: "synapse.error" })
  })

  it("throws when calling tool while disconnected", async () => {
    const synapse = createSynapse({ id: "test", url: "http://localhost:9999/mcp" }, NoopTelemetry)

    await expect(synapse.callTool("some-tool")).rejects.toThrow("not connected")
  })

  it("disconnect cleans up state", async () => {
    const events: unknown[] = []
    const telemetry = {
      recordEvent: (e: unknown) => events.push(e),
    }

    const synapse = createSynapse({ id: "dc", url: "http://localhost:9999/mcp" }, telemetry)

    await synapse.disconnect()

    expect(synapse.status).toBe("disconnected")
    expect(synapse.tools).toHaveLength(0)
  })
})
