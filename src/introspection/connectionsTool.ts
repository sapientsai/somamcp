import type { GatewayInfo } from "../gateway/types.js"
import type { SessionAuth, Tool } from "../types/core.js"

export const createConnectionsTool = <T extends SessionAuth>(
  getConnections: () => ReadonlyArray<GatewayInfo>,
): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Lists all gateway connections to remote servers with their status and available tools",
  execute: () => Promise.resolve(JSON.stringify(getConnections(), null, 2)),
  name: "soma_connections",
})
