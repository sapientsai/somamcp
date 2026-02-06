import type { Tool as MCPTool } from "@modelcontextprotocol/sdk/types.js"

export type SynapseConfig = {
  id: string
  name?: string
  proxyTools?: boolean
  reconnect?: boolean
  reconnectIntervalMs?: number
  toolPrefix?: string
  url: string
}

export type SynapseStatus = "connected" | "connecting" | "disconnected" | "error"

export type SynapseInfo = {
  id: string
  name: string
  remoteTools: ReadonlyArray<{ description?: string; name: string }>
  status: SynapseStatus
  url: string
}

export type SynapseInstance = {
  readonly config: SynapseConfig
  readonly info: SynapseInfo
  readonly name: string
  readonly status: SynapseStatus
  readonly tools: ReadonlyArray<MCPTool>
  callTool: (name: string, args?: Record<string, unknown>) => Promise<unknown>
  connect: () => Promise<void>
  disconnect: () => Promise<void>
}

export type SynapseManagerInstance = {
  readonly connectedCount: number
  readonly totalCount: number
  add: (config: SynapseConfig) => SynapseInstance
  connectAll: () => Promise<void>
  disconnectAll: () => Promise<void>
  get: (id: string) => SynapseInstance | undefined
  getAll: () => ReadonlyArray<SynapseInstance>
  getInfoAll: () => ReadonlyArray<SynapseInfo>
}
