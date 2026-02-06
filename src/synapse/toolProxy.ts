import type { FastMCPSessionAuth, Tool } from "fastmcp"

import type { SynapseInstance } from "./types.js"

export const createProxiedTools = <T extends FastMCPSessionAuth>(synapse: SynapseInstance): ReadonlyArray<Tool<T>> => {
  const prefix = synapse.config.toolPrefix ?? `${synapse.config.id}_`

  return synapse.tools.map(
    (remoteTool): Tool<T> => ({
      annotations: {
        openWorldHint: true,
        readOnlyHint: true,
      },
      description: `[${synapse.name}] ${remoteTool.description ?? "Remote tool"}`,
      execute: async (args) => {
        const result = await synapse.callTool(remoteTool.name, args as Record<string, unknown>)
        return JSON.stringify(result, null, 2)
      },
      name: `${prefix}${remoteTool.name}`,
    }),
  )
}
