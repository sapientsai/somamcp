import type { Context as HonoContext } from "hono"

export type StaticArtifact = {
  contentType: string
  content: string
  path: string
  type: "static"
}

export type DynamicArtifact = {
  handler: (c: HonoContext) => Response | Promise<Response>
  path: string
  type: "dynamic"
}

export type DirectoryArtifact = {
  directory: string
  path: string
  type: "directory"
}

export type ArtifactConfig = DirectoryArtifact | DynamicArtifact | StaticArtifact
