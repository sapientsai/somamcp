import type { ServerCapabilities } from "../types.js"
import type { SessionAuth, Tool } from "../types/core.js"

export const createCapabilitiesTool = <T extends SessionAuth>(getCapabilities: () => ServerCapabilities): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Lists all tools, resources, and prompts registered on this server",
  execute: () => Promise.resolve(JSON.stringify(getCapabilities(), null, 2)),
  name: "soma_capabilities",
})
