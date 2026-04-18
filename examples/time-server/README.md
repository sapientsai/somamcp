# time-server

Sample MCP time server used as a testbed for `somamcp`. Private workspace package — not published.

## Tools

- `get_current_time` — current time, optionally in an IANA timezone (default UTC)
- `convert_timezone` — convert an ISO-8601 timestamp into a target IANA timezone

## Running

From this directory:

```bash
pnpm dev            # HTTP mode: http://localhost:3333/mcp (dashboard at /dashboard)
pnpm dev:stdio      # stdio transport

pnpm build && pnpm start
```

Override the port: `PORT=4000 pnpm dev`.

## Using as a gateway target

Start this server, then point another `somamcp` server at it:

```ts
createServer({
  name: "aggregator",
  version: "1.0.0",
  gateways: [{ id: "time", url: "http://localhost:3333/mcp" }],
})
```

The aggregator will auto-proxy `time_get_current_time` and `time_convert_timezone`.
