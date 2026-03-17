import { describe, expect, it } from "vitest"

import { classifyError, createEnrichedError } from "../../src/telemetry/EnrichedError.js"

describe("EnrichedError", () => {
  describe("classifyError", () => {
    it("classifies validation errors", () => {
      expect(classifyError(new Error("invalid input format"))).toBe("validation")
      expect(classifyError(new Error("schema validation failed"))).toBe("validation")
    })

    it("classifies timeout errors", () => {
      expect(classifyError(new Error("request timed out"))).toBe("timeout")
      expect(classifyError(new Error("ETIMEDOUT"))).toBe("timeout")
    })

    it("classifies gateway errors", () => {
      expect(classifyError(new Error("ECONNREFUSED"))).toBe("gateway")
      expect(classifyError(new Error("gateway not connected"))).toBe("gateway")
    })

    it("classifies auth errors", () => {
      expect(classifyError(new Error("unauthorized"))).toBe("auth")
      expect(classifyError(new Error("forbidden resource"))).toBe("auth")
    })

    it("classifies not_found errors", () => {
      expect(classifyError(new Error("resource not found"))).toBe("not_found")
      expect(classifyError(new Error("404"))).toBe("not_found")
    })

    it("classifies UserError as validation", () => {
      const error = { message: "bad input", name: "UserError" }
      expect(classifyError(error)).toBe("validation")
    })

    it("defaults to internal for unknown errors", () => {
      expect(classifyError(new Error("something went wrong"))).toBe("internal")
      expect(classifyError("string error")).toBe("internal")
    })
  })

  describe("createEnrichedError", () => {
    it("returns enriched response with category and suggestions", () => {
      const result = createEnrichedError(new Error("connection refused"))
      expect(result.errorCategory).toBe("gateway")
      expect(result.message).toBe("connection refused")
      expect(result.suggestions).toBeDefined()
      expect(result.suggestions!.length).toBeGreaterThan(0)
    })

    it("includes gateway status in relatedState", () => {
      const result = createEnrichedError(new Error("not connected"), {
        gatewayStatus: "error",
        toolName: "remote_search",
      })
      expect(result.relatedState).toEqual({
        gatewayStatus: "error",
        toolName: "remote_search",
      })
    })

    it("omits relatedState when no context provided", () => {
      const result = createEnrichedError(new Error("boom"))
      expect(result.relatedState).toBeUndefined()
    })

    it("handles non-Error values", () => {
      const result = createEnrichedError("string error")
      expect(result.message).toBe("string error")
      expect(result.errorCategory).toBe("internal")
    })
  })
})
