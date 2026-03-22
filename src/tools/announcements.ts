import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerAnnouncementTools(
  server: McpServer,
  client: CanvasClient,
): void {
  server.tool(
    "list_announcements",
    "List announcements for a course",
    {
      course_id: z.string().describe("The ID of the course"),
      start_date: z
        .string()
        .optional()
        .describe("Start date in ISO 8601 format"),
      end_date: z
        .string()
        .optional()
        .describe("End date in ISO 8601 format"),
      per_page: z
        .number()
        .optional()
        .default(10)
        .describe("Number of results per page (default 10)"),
    },
    async ({ course_id, start_date, end_date, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.append("context_codes[]", `course_${course_id}`);
        if (start_date) {
          params.append("start_date", start_date);
        }
        if (end_date) {
          params.append("end_date", end_date);
        }
        params.append("per_page", String(per_page));

        const result = await client.get(
          `/announcements?${params.toString()}`,
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
    "create_announcement",
    "Create an announcement in a course",
    {
      course_id: z.string().describe("The ID of the course"),
      title: z.string().describe("Title of the announcement"),
      message: z.string().describe("Body/message of the announcement"),
    },
    async ({ course_id, title, message }) => {
      try {
        const result = await client.post(
          `/courses/${course_id}/discussion_topics`,
          {
            title,
            message,
            is_announcement: true,
            published: true,
          },
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: "Error: " + msg }],
          isError: true,
        };
      }
    },
  );
}
