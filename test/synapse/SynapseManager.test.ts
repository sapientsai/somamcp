import { describe, expect, it } from "vitest"

import { createSynapseManager } from "../../src/synapse/SynapseManager.js"
import { NoopTelemetry } from "../../src/telemetry/NoopTelemetry.js"

describe("SynapseManager", () => {
  it("adds and retrieves synapses", () => {
    const manager = createSynapseManager(NoopTelemetry)

    manager.add({ id: "a", url: "http://localhost:3001/mcp" })
    manager.add({ id: "b", url: "http://localhost:3002/mcp" })

    expect(manager.totalCount).toBe(2)
    expect(manager.get("a")).toBeDefined()
    expect(manager.get("b")).toBeDefined()
    expect(manager.get("c")).toBeUndefined()
  })

  it("returns all synapses", () => {
    const manager = createSynapseManager(NoopTelemetry)
    manager.add({ id: "x", url: "http://localhost:3001/mcp" })
    manager.add({ id: "y", url: "http://localhost:3002/mcp" })

    const all = manager.getAll()
    expect(all).toHaveLength(2)
  })

  it("reports connected count", () => {
    const manager = createSynapseManager(NoopTelemetry)
    manager.add({ id: "x", url: "http://localhost:3001/mcp" })

    expect(manager.connectedCount).toBe(0)
  })

  it("returns info for all synapses", () => {
    const manager = createSynapseManager(NoopTelemetry)
    manager.add({ id: "a", name: "Alpha", url: "http://localhost:3001/mcp" })

    const infos = manager.getInfoAll()
    expect(infos).toHaveLength(1)
    expect(infos[0]?.id).toBe("a")
    expect(infos[0]?.name).toBe("Alpha")
  })
})
