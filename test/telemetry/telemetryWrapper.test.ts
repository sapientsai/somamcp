import { describe, expect, it, vi } from "vitest"

import type { TelemetryCollector } from "../../src/telemetry/TelemetryCollector.js"
import { wrapPrompt, wrapResource, wrapTool } from "../../src/telemetry/telemetryWrapper.js"

const createMockTelemetry = (): TelemetryCollector & { events: unknown[] } => {
  const events: unknown[] = []
  return {
    events,
    recordEvent: (event) => events.push(event),
  }
}

describe("telemetryWrapper", () => {
  describe("wrapTool", () => {
    it("records successful tool execution", async () => {
      const telemetry = createMockTelemetry()
      const tool = {
        execute: vi.fn().mockResolvedValue("result"),
        name: "my-tool",
      }

      const wrapped = wrapTool(tool, telemetry)
      const result = await wrapped.execute({}, {} as never)

      expect(result).toBe("result")
      expect(telemetry.events).toHaveLength(1)
      expect(telemetry.events[0]).toMatchObject({
        name: "my-tool",
        type: "tool.execute",
      })
    })

    it("records tool error and re-throws", async () => {
      const telemetry = createMockTelemetry()
      const tool = {
        execute: vi.fn().mockRejectedValue(new Error("boom")),
        name: "fail-tool",
      }

      const wrapped = wrapTool(tool, telemetry)
      await expect(wrapped.execute({}, {} as never)).rejects.toThrow("boom")

      expect(telemetry.events).toHaveLength(1)
      expect(telemetry.events[0]).toMatchObject({
        error: "boom",
        name: "fail-tool",
        type: "tool.error",
      })
    })

    it("preserves tool metadata", () => {
      const telemetry = createMockTelemetry()
      const tool = {
        description: "A tool",
        execute: vi.fn(),
        name: "meta-tool",
      }

      const wrapped = wrapTool(tool, telemetry)
      expect(wrapped.name).toBe("meta-tool")
      expect(wrapped.description).toBe("A tool")
    })
  })

  describe("wrapResource", () => {
    it("records successful resource load", async () => {
      const telemetry = createMockTelemetry()
      const resource = {
        load: vi.fn().mockResolvedValue({ text: "data" }),
        name: "my-resource",
        uri: "res://test",
      }

      const wrapped = wrapResource(resource, telemetry)
      const result = await wrapped.load()

      expect(result).toEqual({ text: "data" })
      expect(telemetry.events).toHaveLength(1)
      expect(telemetry.events[0]).toMatchObject({
        name: "my-resource",
        type: "resource.load",
      })
    })

    it("records resource error and re-throws", async () => {
      const telemetry = createMockTelemetry()
      const resource = {
        load: vi.fn().mockRejectedValue(new Error("load failed")),
        name: "fail-resource",
        uri: "res://fail",
      }

      const wrapped = wrapResource(resource, telemetry)
      await expect(wrapped.load()).rejects.toThrow("load failed")

      expect(telemetry.events[0]).toMatchObject({
        error: "load failed",
        type: "resource.error",
      })
    })
  })

  describe("wrapPrompt", () => {
    it("records successful prompt load", async () => {
      const telemetry = createMockTelemetry()
      const prompt = {
        load: vi.fn().mockResolvedValue("response"),
        name: "my-prompt",
      }

      const wrapped = wrapPrompt(prompt, telemetry)
      const result = await wrapped.load({})

      expect(result).toBe("response")
      expect(telemetry.events).toHaveLength(1)
      expect(telemetry.events[0]).toMatchObject({
        name: "my-prompt",
        type: "prompt.load",
      })
    })

    it("records prompt error and re-throws", async () => {
      const telemetry = createMockTelemetry()
      const prompt = {
        load: vi.fn().mockRejectedValue(new Error("prompt failed")),
        name: "fail-prompt",
      }

      const wrapped = wrapPrompt(prompt, telemetry)
      await expect(wrapped.load({})).rejects.toThrow("prompt failed")

      expect(telemetry.events[0]).toMatchObject({
        error: "prompt failed",
        type: "prompt.error",
      })
    })
  })
})
