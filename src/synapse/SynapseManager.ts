import type { TelemetryCollector } from "../telemetry/TelemetryCollector.js"
import { createSynapse } from "./Synapse.js"
import type { SynapseConfig, SynapseInfo, SynapseInstance, SynapseManagerInstance } from "./types.js"

export const createSynapseManager = (telemetry: TelemetryCollector): SynapseManagerInstance => {
  const synapses = new Map<string, SynapseInstance>()

  return {
    get connectedCount() {
      return [...synapses.values()].filter((s) => s.status === "connected").length
    },
    get totalCount() {
      return synapses.size
    },

    add(config: SynapseConfig): SynapseInstance {
      const synapse = createSynapse(config, telemetry)
      synapses.set(config.id, synapse)
      return synapse
    },

    async connectAll(): Promise<void> {
      await Promise.allSettled([...synapses.values()].map((s) => s.connect()))
    },

    async disconnectAll(): Promise<void> {
      await Promise.allSettled([...synapses.values()].map((s) => s.disconnect()))
    },

    get(id: string): SynapseInstance | undefined {
      return synapses.get(id)
    },

    getAll(): ReadonlyArray<SynapseInstance> {
      return [...synapses.values()]
    },

    getInfoAll(): ReadonlyArray<SynapseInfo> {
      return [...synapses.values()].map((s) => s.info)
    },
  }
}
