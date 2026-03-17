import { appendFile, mkdir } from "node:fs/promises"
import { dirname } from "node:path"

import type { TelemetryCollector, TelemetryEvent } from "./TelemetryCollector.js"

export type JsonFileTelemetryOptions = {
  filePath: string
  flushIntervalMs?: number
}

const DEFAULT_FLUSH_INTERVAL_MS = 1000

export const createJsonFileTelemetry = (options: JsonFileTelemetryOptions): TelemetryCollector => {
  const buffer: TelemetryEvent[] = []
  // eslint-disable-next-line functional/no-let -- closure state for factory
  let flushTimer: ReturnType<typeof setTimeout> | undefined
  // eslint-disable-next-line functional/no-let -- closure state for factory
  let dirEnsured = false

  const writeBuffer = async (): Promise<void> => {
    if (buffer.length === 0) return
    // eslint-disable-next-line functional/immutable-data -- draining buffer for write
    const events = buffer.splice(0, buffer.length)
    if (!dirEnsured) {
      await mkdir(dirname(options.filePath), { recursive: true })
      dirEnsured = true
    }
    const lines = `${events.map((e) => JSON.stringify(e)).join("\n")}\n`
    await appendFile(options.filePath, lines)
  }

  const scheduleFlush = (): void => {
    if (flushTimer) return
    flushTimer = setTimeout(() => {
      flushTimer = undefined
      void writeBuffer()
    }, options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS)
  }

  return {
    flush: async () => {
      if (flushTimer) {
        clearTimeout(flushTimer)
        flushTimer = undefined
      }
      await writeBuffer()
    },
    recordEvent: (event: TelemetryEvent) => {
      // eslint-disable-next-line functional/immutable-data -- closure state for factory
      buffer.push(event)
      scheduleFlush()
    },
  }
}
