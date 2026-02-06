import type { FastMCPSessionAuth, Tool } from "fastmcp"

import type { CellCapabilities } from "../types.js"

export const createCapabilitiesTool = <T extends FastMCPSessionAuth>(
  getCapabilities: () => CellCapabilities,
): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Lists all tools, resources, and prompts registered on this cell",
  execute: () => Promise.resolve(JSON.stringify(getCapabilities(), null, 2)),
  name: "soma_capabilities",
})
