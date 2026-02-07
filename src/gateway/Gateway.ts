import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js"
import type { Tool as MCPTool } from "@modelcontextprotocol/sdk/types.js"

import type { TelemetryCollector } from "../telemetry/TelemetryCollector.js"
import type { GatewayConfig, GatewayInstance, GatewayStatus } from "./types.js"

export const createGateway = (config: GatewayConfig, telemetry: TelemetryCollector): GatewayInstance => {
  /* eslint-disable functional/no-let -- closure state for factory */
  let client: Client | undefined
  let transport: StreamableHTTPClientTransport | undefined
  let remoteTools: MCPTool[] = []
  let currentStatus: GatewayStatus = "disconnected"
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined
  /* eslint-enable functional/no-let */

  const gatewayName = config.name ?? config.id

  const scheduleReconnect = (): void => {
    const interval = config.reconnectIntervalMs ?? 5000
    reconnectTimer = setTimeout(() => {
      void instance.connect()
    }, interval)
  }

  const instance: GatewayInstance = {
    get config() {
      return config
    },
    get info() {
      return {
        id: config.id,
        name: gatewayName,
        remoteTools: remoteTools.map((t) => ({
          description: t.description,
          name: t.name,
        })),
        status: currentStatus,
        url: config.url,
      }
    },
    get name() {
      return gatewayName
    },
    get status() {
      return currentStatus
    },
    get tools() {
      return remoteTools as ReadonlyArray<MCPTool>
    },

    async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
      if (!client || currentStatus !== "connected") {
        throw new Error(`Gateway ${config.id} is not connected`)
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
          name: `soma-gateway-${config.id}`,
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
          name: gatewayName,
          timestamp: start,
          type: "gateway.connect",
        })
      } catch (error) {
        currentStatus = "error"

        telemetry.recordEvent({
          data: { id: config.id, url: config.url },
          error: error instanceof Error ? error.message : String(error),
          name: gatewayName,
          timestamp: start,
          type: "gateway.error",
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
        name: gatewayName,
        timestamp: Date.now(),
        type: "gateway.disconnect",
      })
    },
  }

  return instance
}
