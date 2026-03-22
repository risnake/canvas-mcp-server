import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerMiscTools(
  server: McpServer,
  client: CanvasClient,
): void {
  server.tool(
    "list_todo_items",
    "List the current user's todo items",
    {},
    async () => {
      try {
        const result = await client.get("/users/self/todo");
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: "Error: " + message }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "search_courses",
    "Search for courses across the account",
    {
      search_term: z.string().describe("The search term to find courses"),
      per_page: z
        .number()
        .optional()
        .default(10)
        .describe("Number of results per page (default 10)"),
    },
    async ({ search_term, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.append("search", search_term);
        params.append("per_page", String(per_page));
        params.append("open_enrollment_only", "false");

        const result = await client.get(
          `/search/all_courses?${params.toString()}`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: "Error: " + message }],
          isError: true,
        };
      }
    },
  );

  server.tool(
    "get_course_activity_stream",
    "Get recent activity for a course",
    {
      course_id: z.string().describe("The ID of the course"),
    },
    async ({ course_id }) => {
      try {
        const result = await client.get(
          `/courses/${course_id}/activity_stream/summary`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: "Error: " + message }],
          isError: true,
        };
      }
    },
  );
}
