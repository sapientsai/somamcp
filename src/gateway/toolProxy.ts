import type { FastMCPSessionAuth, Tool } from "fastmcp"

import type { GatewayInstance } from "./types.js"

export const createProxiedTools = <T extends FastMCPSessionAuth>(gateway: GatewayInstance): ReadonlyArray<Tool<T>> => {
  const prefix = gateway.config.toolPrefix ?? `${gateway.config.id}_`

  return gateway.tools.map(
    (remoteTool): Tool<T> => ({
      annotations: {
        openWorldHint: true,
        readOnlyHint: true,
      },
      description: `[${gateway.name}] ${remoteTool.description ?? "Remote tool"}`,
      execute: async (args) => {
        const result = await gateway.callTool(remoteTool.name, args as Record<string, unknown>)
        return JSON.stringify(result, null, 2)
      },
      name: `${prefix}${remoteTool.name}`,
    }),
  )
}
