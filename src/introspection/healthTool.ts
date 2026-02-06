import type { FastMCPSessionAuth, Tool } from "fastmcp"

import type { CellHealth } from "../types.js"

export const createHealthTool = <T extends FastMCPSessionAuth>(getHealth: () => CellHealth): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Returns health and status information for this cell including uptime, sessions, and synapse status",
  execute: () => Promise.resolve(JSON.stringify(getHealth(), null, 2)),
  name: "soma_health",
})
