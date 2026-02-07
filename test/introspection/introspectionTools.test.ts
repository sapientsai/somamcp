import { describe, expect, it } from "vitest"

import { createCapabilitiesTool } from "../../src/introspection/capabilitiesTool.js"
import { createConnectionsTool } from "../../src/introspection/connectionsTool.js"
import { createHealthTool } from "../../src/introspection/healthTool.js"
import type { CellCapabilities, CellHealth } from "../../src/types.js"

describe("introspection tools", () => {
  describe("soma_health", () => {
    it("returns health as JSON string", async () => {
      const health: CellHealth = {
        activeSessions: 2,
        name: "test",
        startedAt: 1000,
        status: "running",
        gateways: { connected: 1, total: 2 },
        uptime: 5000,
      }

      const tool = createHealthTool(() => health)
      const result = await tool.execute({}, {} as never)

      expect(typeof result).toBe("string")
      const parsed = JSON.parse(result as string)
      expect(parsed.status).toBe("running")
      expect(parsed.activeSessions).toBe(2)
    })
  })

  describe("soma_capabilities", () => {
    it("returns capabilities as JSON string", async () => {
      const capabilities: CellCapabilities = {
        prompts: [{ description: "A prompt", name: "p1" }],
        resources: [{ description: "A res", name: "r1", uri: "res://1" }],
        tools: [{ description: "A tool", name: "t1" }],
      }

      const tool = createCapabilitiesTool(() => capabilities)
      const result = await tool.execute({}, {} as never)

      const parsed = JSON.parse(result as string)
      expect(parsed.tools).toHaveLength(1)
      expect(parsed.resources).toHaveLength(1)
      expect(parsed.prompts).toHaveLength(1)
    })
  })

  describe("soma_connections", () => {
    it("returns empty array when no connections", async () => {
      const tool = createConnectionsTool(() => [])
      const result = await tool.execute({}, {} as never)

      const parsed = JSON.parse(result as string)
      expect(parsed).toEqual([])
    })

    it("returns gateway info", async () => {
      const connections = [
        {
          id: "remote-1",
          name: "Remote Cell",
          remoteTools: [{ description: "A tool", name: "hello" }],
          status: "connected" as const,
          url: "http://localhost:3001/mcp",
        },
      ]

      const tool = createConnectionsTool(() => connections)
      const result = await tool.execute({}, {} as never)

      const parsed = JSON.parse(result as string)
      expect(parsed).toHaveLength(1)
      expect(parsed[0].id).toBe("remote-1")
      expect(parsed[0].status).toBe("connected")
    })
  })
})
