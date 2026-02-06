import type { FastMCPSessionAuth, InputPrompt, InputPromptArgument, Resource, Tool, ToolParameters } from "fastmcp"

import type { TelemetryCollector } from "./TelemetryCollector.js"

export const wrapTool = <T extends FastMCPSessionAuth, P extends ToolParameters>(
  tool: Tool<T, P>,
  telemetry: TelemetryCollector,
): Tool<T, P> => ({
  ...tool,
  execute: async (args, context) => {
    const start = Date.now()
    try {
      const result = await tool.execute(args, context)
      telemetry.recordEvent({
        data: { name: tool.name },
        durationMs: Date.now() - start,
        name: tool.name,
        timestamp: start,
        type: "tool.execute",
      })
      return result
    } catch (error) {
      telemetry.recordEvent({
        data: { name: tool.name },
        durationMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
        name: tool.name,
        timestamp: start,
        type: "tool.error",
      })
      throw error
    }
  },
})

export const wrapResource = <T extends FastMCPSessionAuth>(
  resource: Resource<T>,
  telemetry: TelemetryCollector,
): Resource<T> => ({
  ...resource,
  load: async (auth) => {
    const start = Date.now()
    try {
      const result = await resource.load(auth)
      telemetry.recordEvent({
        data: { name: resource.name, uri: resource.uri },
        durationMs: Date.now() - start,
        name: resource.name,
        timestamp: start,
        type: "resource.load",
      })
      return result
    } catch (error) {
      telemetry.recordEvent({
        data: { name: resource.name, uri: resource.uri },
        durationMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
        name: resource.name,
        timestamp: start,
        type: "resource.error",
      })
      throw error
    }
  },
})

export const wrapPrompt = <
  T extends FastMCPSessionAuth,
  Args extends InputPromptArgument<T>[] = InputPromptArgument<T>[],
>(
  prompt: InputPrompt<T, Args>,
  telemetry: TelemetryCollector,
): InputPrompt<T, Args> => ({
  ...prompt,
  load: async (args, auth) => {
    const start = Date.now()
    try {
      const result = await prompt.load(args, auth)
      telemetry.recordEvent({
        data: { name: prompt.name },
        durationMs: Date.now() - start,
        name: prompt.name,
        timestamp: start,
        type: "prompt.load",
      })
      return result
    } catch (error) {
      telemetry.recordEvent({
        data: { name: prompt.name },
        durationMs: Date.now() - start,
        error: error instanceof Error ? error.message : String(error),
        name: prompt.name,
        timestamp: start,
        type: "prompt.error",
      })
      throw error
    }
  },
})
