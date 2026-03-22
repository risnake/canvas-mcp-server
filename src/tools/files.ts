import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerFileTools(
  server: McpServer,
  client: CanvasClient
): void {
  server.tool(
    "list_files",
    "List files in a course",
    {
      course_id: z.string().describe("Course ID"),
      search_term: z.string().optional().describe("Search term to filter files"),
      sort: z
        .enum(["name", "size", "created_at", "updated_at", "content_type"])
        .optional()
        .describe("Sort order for results"),
      per_page: z
        .number()
        .optional()
        .default(20)
        .describe("Number of results per page"),
    },
    async ({ course_id, search_term, sort, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (search_term) params.set("search_term", search_term);
        if (sort) params.set("sort", sort);
        if (per_page !== undefined) params.set("per_page", String(per_page));

        const result = await client.get(
          `/courses/${course_id}/files?${params.toString()}`
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "get_file",
    "Get file details",
    {
      file_id: z.string().describe("File ID"),
    },
    async ({ file_id }) => {
      try {
        const result = await client.get(`/files/${file_id}`);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    "list_folders",
    "List folders in a course",
    {
      course_id: z.string().describe("Course ID"),
    },
    async ({ course_id }) => {
      try {
        const result = await client.get(`/courses/${course_id}/folders`);
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
