import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import type { Tool as MCPTool } from "@modelcontextprotocol/sdk/types.js"

import type { TelemetryCollector } from "../telemetry/TelemetryCollector.js"
import type { SynapseConfig, SynapseInstance, SynapseStatus } from "./types.js"

export const createSynapse = (config: SynapseConfig, telemetry: TelemetryCollector): SynapseInstance => {
  /* eslint-disable functional/no-let -- closure state for factory */
  let client: Client | undefined
  let transport: StreamableHTTPClientTransport | undefined
  let remoteTools: MCPTool[] = []
  let currentStatus: SynapseStatus = "disconnected"
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  /* eslint-enable functional/no-let */

  const synapseName = config.name ?? config.id

  const scheduleReconnect = (): void => {
    const interval = config.reconnectIntervalMs ?? 5000
    reconnectTimer = setTimeout(() => {
      void instance.connect()
    }, interval)
  }

  const instance: SynapseInstance = {
    get config() {
      return config
    },
    get info() {
      return {
        id: config.id,
        name: synapseName,
        remoteTools: remoteTools.map((t) => ({
          description: t.description,
          name: t.name,
        })),
        status: currentStatus,
        url: config.url,
      }
    },
    get name() {
      return synapseName
    },
    get status() {
      return currentStatus
    },
    get tools() {
      return remoteTools as ReadonlyArray<MCPTool>
    },

    async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
      if (!client || currentStatus !== "connected") {
        throw new Error(`Synapse ${config.id} is not connected`)
      }
      const result = await client.callTool({ arguments: args, name })
      return result
    },

    async connect(): Promise<void> {
      if (currentStatus === "connected") return

      currentStatus = "connecting"
      const start = Date.now()

      try {
        transport = new StreamableHTTPClientTransport(new URL(config.url))

        client = new Client({
          name: `soma-synapse-${config.id}`,
          version: "1.0.0",
        })

        await client.connect(transport)

        const toolsResult = await client.listTools()
        remoteTools = toolsResult.tools

        currentStatus = "connected"

        telemetry.recordEvent({
          data: {
            id: config.id,
            remoteToolCount: remoteTools.length,
            url: config.url,
          },
          durationMs: Date.now() - start,
          name: synapseName,
          timestamp: start,
          type: "synapse.connect",
        })
      } catch (error) {
        currentStatus = "error"

        telemetry.recordEvent({
          data: { id: config.id, url: config.url },
          error: error instanceof Error ? error.message : String(error),
          name: synapseName,
          timestamp: start,
          type: "synapse.error",
        })

        if (config.reconnect !== false) {
          scheduleReconnect()
        }
      }
    },

    async disconnect(): Promise<void> {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer)
        reconnectTimer = undefined
      }

      if (client) {
        try {
          await client.close()
        } catch {
          // ignore close errors
        }
      }

      client = undefined
      transport = undefined
      remoteTools = []
      currentStatus = "disconnected"

      telemetry.recordEvent({
        data: { id: config.id },
        name: synapseName,
        timestamp: Date.now(),
        type: "synapse.disconnect",
      })
    },
  }

  return instance
}
