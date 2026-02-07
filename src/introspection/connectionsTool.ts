import type { FastMCPSessionAuth, Tool } from "fastmcp"

import type { GatewayInfo } from "../gateway/types.js"

export const createConnectionsTool = <T extends FastMCPSessionAuth>(
  getConnections: () => ReadonlyArray<GatewayInfo>,
): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Lists all gateway connections to remote cells with their status and available tools",
  execute: () => Promise.resolve(JSON.stringify(getConnections(), null, 2)),
  name: "soma_connections",
})
