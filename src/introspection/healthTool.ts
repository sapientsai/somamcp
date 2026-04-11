import type { ServerHealth } from "../types.js"
import type { SessionAuth, Tool } from "../types/core.js"

export const createHealthTool = <T extends SessionAuth>(getHealth: () => ServerHealth): Tool<T> => ({
  annotations: {
    readOnlyHint: true,
  },
  description: "Returns health and status information for this server including uptime, sessions, and gateway status",
  execute: () => Promise.resolve(JSON.stringify(getHealth(), null, 2)),
  name: "soma_health",
})
