import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerModuleTools(
  server: McpServer,
  client: CanvasClient
): void {
  // 1. List modules in a course
  server.tool(
    "list_modules",
    "List modules in a course",
    {
      course_id: z.string().describe("Course ID"),
      per_page: z
        .number()
        .default(20)
        .describe("Number of results per page (default 20)"),
    },
    async ({ course_id, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.append("per_page", String(per_page));
        params.append("include[]", "items");
        params.append("include[]", "content_details");
        const result = await client.get(`/courses/${course_id}/modules?${params.toString()}`);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                "Error: " +
                (error instanceof Error ? error.message : String(error)),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 2. Get a specific module
  server.tool(
    "get_module",
    "Get a specific module",
    {
      course_id: z.string().describe("Course ID"),
      module_id: z.string().describe("Module ID"),
    },
    async ({ course_id, module_id }) => {
      try {
        const params = new URLSearchParams();
        params.append("include[]", "items");
        params.append("include[]", "content_details");
        const result = await client.get(`/courses/${course_id}/modules/${module_id}?${params.toString()}`);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                "Error: " +
                (error instanceof Error ? error.message : String(error)),
            },
          ],
          isError: true,
        };
      }
    }
  );

  // 3. List items in a module
  server.tool(
    "list_module_items",
    "List items in a module",
    {
      course_id: z.string().describe("Course ID"),
      module_id: z.string().describe("Module ID"),
      per_page: z
        .number()
        .default(50)
        .describe("Number of results per page (default 50)"),
    },
    async ({ course_id, module_id, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.append("per_page", String(per_page));
        params.append("include[]", "content_details");
        const result = await client.get(`/courses/${course_id}/modules/${module_id}/items?${params.toString()}`);
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text:
                "Error: " +
                (error instanceof Error ? error.message : String(error)),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
