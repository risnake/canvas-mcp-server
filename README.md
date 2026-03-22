# @risnake/canvas-mcp-server

A TypeScript Model Context Protocol (MCP) server for Canvas LMS. It exposes Canvas API operations over stdio so MCP-compatible clients can work with courses, assignments, modules, discussions, files, users, and other Canvas resources.

## Environment variables

- `CANVAS_API_TOKEN` **required**: Canvas API bearer token used for authentication
- `CANVAS_BASE_URL` optional: Base URL for your Canvas instance, for example `https://school.instructure.com`

If `CANVAS_BASE_URL` is not set, the server uses the project's current built-in default.

## Local build and run

```bash
npm install
npm run build
node dist/index.js
```

For a quick local development run:

```bash
npm run dev
```

## MCP client configuration

### Local build

```json
{
  "mcpServers": {
    "canvas": {
      "command": "node",
      "args": ["/absolute/path/to/canvas-mcp-server/dist/index.js"],
      "env": {
        "CANVAS_API_TOKEN": "your-canvas-token",
        "CANVAS_BASE_URL": "https://school.instructure.com"
      }
    }
  }
}
```

### Published package with npx

```json
{
  "mcpServers": {
    "canvas": {
      "command": "npx",
      "args": ["-y", "@risnake/canvas-mcp-server"],
      "env": {
        "CANVAS_API_TOKEN": "your-canvas-token",
        "CANVAS_BASE_URL": "https://school.instructure.com"
      }
    }
  }
}
```

After publishing, this package can also be started with:

```bash
bunx @risnake/canvas-mcp-server
```

## Major tool groups

- Courses and enrollments
- Assignments, modules, pages, and files
- Discussions, announcements, and calendar data
- Users, conversations, and miscellaneous Canvas utilities

## Publishing notes

The package is configured for scoped public publishing and includes the built `dist/` output plus this README when packed or published.
