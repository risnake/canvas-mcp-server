# @rishblob/canvas-mcp-server

TypeScript MCP server for Canvas LMS. It runs over stdio and exposes Canvas API workflows for courses, assignments, submissions, modules, pages, discussions, announcements, files, users, enrollments, conversations, calendar, and utility endpoints.

This package is published to npm as `@rishblob/canvas-mcp-server`.

## Requirements

- Node.js `>=18`
- Canvas API token

## Environment variables

- `CANVAS_API_TOKEN` **required**: Canvas bearer token for API authentication.
- `CANVAS_BASE_URL` optional: Canvas host URL (example: `https://school.instructure.com`).

If `CANVAS_BASE_URL` is omitted, the server defaults to `https://houstonisd.instructure.com`.

## Install and run locally

```bash
npm install
npm run build
npm start
```

For one-shot local development:

```bash
npm run dev
```

## Use as a published npm package

```bash
npx -y @rishblob/canvas-mcp-server
# or
bunx @rishblob/canvas-mcp-server
```

## MCP client configuration

### Option 1: Run from local build

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

### Option 2: Run from npm (recommended)

```json
{
  "mcpServers": {
    "canvas": {
      "command": "npx",
      "args": ["-y", "@rishblob/canvas-mcp-server"],
      "env": {
        "CANVAS_API_TOKEN": "your-canvas-token",
        "CANVAS_BASE_URL": "https://school.instructure.com"
      }
    }
  }
}
```

## Available MCP tools

- Courses: `list_courses`, `get_course`, `list_students`, `get_course_settings`
- Assignments/submissions: `list_assignments`, `get_assignment`, `create_assignment`, `update_assignment`, `list_submissions`, `get_submission`, `grade_submission`
- Users: `get_user_profile`, `get_user`, `list_course_users`
- Announcements: `list_announcements`, `create_announcement`
- Modules: `list_modules`, `get_module`, `list_module_items`
- Discussions: `list_discussions`, `get_discussion`, `create_discussion`, `list_discussion_entries`
- Calendar: `list_calendar_events`, `create_calendar_event`
- Files: `list_files`, `get_file`, `list_folders`
- Pages: `list_pages`, `get_page`, `create_page`, `update_page`
- Enrollments: `list_enrollments`, `get_user_enrollments`
- Conversations: `list_conversations`, `get_conversation`, `create_conversation`
- Misc: `list_todo_items`, `search_courses`, `get_course_activity_stream`

## Publish to npm

```bash
npm login
npm publish
```

`prepack` runs `npm run build`, so package artifacts are built automatically before publish.
