import type { DirectLogger } from "functype-log"
import { createDirectConsoleLogger } from "functype-log"

export const createDefaultLogger = (name: string): DirectLogger =>
  createDirectConsoleLogger({ prefix: `[${name}]` }).withContext({ cell: name })
