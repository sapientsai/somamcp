import { createDirectConsoleLogger } from "functype-log"

import { createLogLayerTelemetry } from "./LogLayerTelemetry.js"
import type { TelemetryCollector } from "./TelemetryCollector.js"

export const createConsoleTelemetry = (prefix = "[soma]"): TelemetryCollector => {
  const logger = createDirectConsoleLogger({ prefix })
  return createLogLayerTelemetry(logger)
}
