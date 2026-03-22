#!/usr/bin/env node

import dotenv from "dotenv";
dotenv.config();

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { CanvasClient } from "./canvas-client.js";

import { registerCourseTools } from "./tools/courses.js";
import { registerAssignmentTools } from "./tools/assignments.js";
import { registerUserTools } from "./tools/users.js";
import { registerAnnouncementTools } from "./tools/announcements.js";
import { registerModuleTools } from "./tools/modules.js";
import { registerDiscussionTools } from "./tools/discussions.js";
import { registerCalendarTools } from "./tools/calendar.js";
import { registerFileTools } from "./tools/files.js";
import { registerPageTools } from "./tools/pages.js";
import { registerEnrollmentTools } from "./tools/enrollments.js";
import { registerConversationTools } from "./tools/conversations.js";
import { registerMiscTools } from "./tools/misc.js";

async function main() {
  const server = new McpServer({
    name: "canvas-lms",
    version: "1.0.0",
  });

  const client = new CanvasClient();

  registerCourseTools(server, client);
  registerAssignmentTools(server, client);
  registerUserTools(server, client);
  registerAnnouncementTools(server, client);
  registerModuleTools(server, client);
  registerDiscussionTools(server, client);
  registerCalendarTools(server, client);
  registerFileTools(server, client);
  registerPageTools(server, client);
  registerEnrollmentTools(server, client);
  registerConversationTools(server, client);
  registerMiscTools(server, client);

  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("Canvas LMS MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
