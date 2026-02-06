import type { FastMCPSessionAuth, Tool } from "fastmcp"

import type { SynapseInfo } from "../synapse/types.js"

export const createConnectionsTool = <T extends FastMCPSessionAuth>(
  getConnections: () => ReadonlyArray<SynapseInfo>,
): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Lists all synapse connections to remote cells with their status and available tools",
  execute: () => Promise.resolve(JSON.stringify(getConnections(), null, 2)),
  name: "soma_connections",
})
