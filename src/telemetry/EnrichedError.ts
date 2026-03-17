import type { ErrorCategory } from "./TelemetryCollector.js"

export type EnrichedErrorResponse = {
  errorCategory: ErrorCategory
  message: string
  relatedState?: Record<string, unknown>
  suggestions?: ReadonlyArray<string>
}

export const classifyError = (error: unknown): ErrorCategory => {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase()
    if (msg.includes("validation") || msg.includes("invalid") || msg.includes("schema")) return "validation"
    if (msg.includes("timeout") || msg.includes("timed out") || msg.includes("etimedout")) return "timeout"
    if (
      msg.includes("gateway") ||
      msg.includes("not connected") ||
      msg.includes("econnrefused") ||
      msg.includes("connection refused")
    )
      return "gateway"
    if (msg.includes("auth") || msg.includes("unauthorized") || msg.includes("forbidden")) return "auth"
    if (msg.includes("not found") || msg.includes("404")) return "not_found"
  }
  if (error !== null && typeof error === "object" && "name" in error) {
    const e = error as { name: string }
    if (e.name === "UserError") return "validation"
  }
  return "internal"
}

const getSuggestions = (
  category: ErrorCategory,
  context?: { gatewayStatus?: string; toolName?: string },
): ReadonlyArray<string> => {
  switch (category) {
    case "validation":
      return ["Check the tool's parameter schema and provide valid input"]
    case "timeout":
      return ["The operation timed out. Try again or reduce the scope of the request"]
    case "gateway":
      return [
        `Gateway is ${context?.gatewayStatus ?? "unavailable"}. The remote service may be down`,
        "Try again later or check the remote service status",
      ]
    case "auth":
      return ["Authentication failed. Check credentials or permissions"]
    case "not_found":
      return ["The requested resource was not found. Verify the identifier"]
    case "internal":
      return ["An internal error occurred. The tool maintainer should investigate"]
  }
}

export const createEnrichedError = (
  error: unknown,
  context?: { gatewayStatus?: string; toolName?: string },
): EnrichedErrorResponse => {
  const errorCategory = classifyError(error)
  const message = error instanceof Error ? error.message : String(error)
  const suggestions = getSuggestions(errorCategory, context)
  const relatedState: Record<string, unknown> = {
    ...(context?.gatewayStatus && { gatewayStatus: context.gatewayStatus }),
    ...(context?.toolName && { toolName: context.toolName }),
  }

  return {
    errorCategory,
    message,
    ...(Object.keys(relatedState).length > 0 && { relatedState }),
    suggestions,
  }
}
