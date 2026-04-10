import { appendFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"

import { Ref } from "functype"

import type { TelemetryCollector, TelemetryEvent } from "./TelemetryCollector.js"

export type JsonFileTelemetryOptions = {
  filePath: string
  flushIntervalMs?: number
}

const DEFAULT_FLUSH_INTERVAL_MS = 1000

export const createJsonFileTelemetry = (options: JsonFileTelemetryOptions): TelemetryCollector => {
  const buffer = Ref<TelemetryEvent[]>([])
  const flushTimer = Ref<ReturnType<typeof setTimeout> | undefined>(undefined)
  const dirEnsured = Ref(false)

  const writeBuffer = async (): Promise<void> => {
    const events = buffer.getAndSet([])
    if (events.length === 0) return
    if (!dirEnsured.get()) {
      await mkdir(dirname(options.filePath), { recursive: true })
      dirEnsured.set(true)
    }
    const lines = `${events.map((e) => JSON.stringify(e)).join("\n")}\n`
    await appendFile(options.filePath, lines)
  }

  const scheduleFlush = (): void => {
    if (flushTimer.get()) return
    flushTimer.set(
      setTimeout(() => {
        flushTimer.set(undefined)
        void writeBuffer()
      }, options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS),
    )
  }

  return {
    flush: async () => {
      const timer = flushTimer.get()
      if (timer) {
        clearTimeout(timer)
        flushTimer.set(undefined)
      }
      await writeBuffer()
    },
    recordEvent: (event: TelemetryEvent) => {
      buffer.update((b) => [...b, event])
      scheduleFlush()
    },
  }
}
