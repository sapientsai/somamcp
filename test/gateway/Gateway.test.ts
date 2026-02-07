import { describe, expect, it } from "vitest"

import { createGateway } from "../../src/gateway/Gateway.js"
import { NoopTelemetry } from "../../src/telemetry/NoopTelemetry.js"

describe("Gateway", () => {
  it("starts in disconnected state", () => {
    const gateway = createGateway({ id: "test", url: "http://localhost:9999/mcp" }, NoopTelemetry)

    expect(gateway.status).toBe("disconnected")
    expect(gateway.tools).toHaveLength(0)
  })

  it("uses config.name or falls back to id", () => {
    const withName = createGateway({ id: "test", name: "My Gateway", url: "http://localhost:9999/mcp" }, NoopTelemetry)
    expect(withName.name).toBe("My Gateway")

    const withoutName = createGateway({ id: "test-2", url: "http://localhost:9999/mcp" }, NoopTelemetry)
    expect(withoutName.name).toBe("test-2")
  })

  it("returns info with correct structure", () => {
    const gateway = createGateway({ id: "s1", name: "Remote", url: "http://localhost:3001/mcp" }, NoopTelemetry)

    const info = gateway.info
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

    const gateway = createGateway({ id: "fail", reconnect: false, url: "http://localhost:1/mcp" }, telemetry)

    await gateway.connect()

    expect(gateway.status).toBe("error")
    expect(events).toHaveLength(1)
    expect(events[0]).toMatchObject({ type: "gateway.error" })
  })

  it("throws when calling tool while disconnected", async () => {
    const gateway = createGateway({ id: "test", url: "http://localhost:9999/mcp" }, NoopTelemetry)

    await expect(gateway.callTool("some-tool")).rejects.toThrow("not connected")
  })

  it("disconnect cleans up state", async () => {
    const events: unknown[] = []
    const telemetry = {
      recordEvent: (e: unknown) => events.push(e),
    }

    const gateway = createGateway({ id: "dc", url: "http://localhost:9999/mcp" }, telemetry)

    await gateway.disconnect()

    expect(gateway.status).toBe("disconnected")
    expect(gateway.tools).toHaveLength(0)
  })
})
