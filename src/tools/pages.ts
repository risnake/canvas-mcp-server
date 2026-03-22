import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerPageTools(
  server: McpServer,
  client: CanvasClient
): void {
  server.tool(
    "list_pages",
    "List wiki pages in a course",
    {
      course_id: z.string().describe("Course ID"),
      sort: z
        .enum(["title", "created_at", "updated_at"])
        .optional()
        .describe("Sort order for results"),
      per_page: z
        .number()
        .optional()
        .default(20)
        .describe("Number of results per page"),
    },
    async ({ course_id, sort, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (sort) params.set("sort", sort);
        if (per_page !== undefined) params.set("per_page", String(per_page));

        const result = await client.get(
          `/courses/${course_id}/pages?${params.toString()}`
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
    "get_page",
    "Get a specific wiki page",
    {
      course_id: z.string().describe("Course ID"),
      url_or_id: z.string().describe("Page URL slug or ID"),
    },
    async ({ course_id, url_or_id }) => {
      try {
        const result = await client.get(
          `/courses/${course_id}/pages/${url_or_id}`
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
    "create_page",
    "Create a wiki page",
    {
      course_id: z.string().describe("Course ID"),
      title: z.string().describe("Page title"),
      body: z.string().describe("Page body content (HTML)"),
      published: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether the page should be published"),
    },
    async ({ course_id, title, body, published }) => {
      try {
        const result = await client.post(`/courses/${course_id}/pages`, {
          wiki_page: {
            title,
            body,
            published,
          },
        });
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
    "update_page",
    "Update a wiki page",
    {
      course_id: z.string().describe("Course ID"),
      url_or_id: z.string().describe("Page URL slug or ID"),
      title: z.string().optional().describe("New page title"),
      body: z.string().optional().describe("New page body content (HTML)"),
      published: z
        .boolean()
        .optional()
        .describe("Whether the page should be published"),
    },
    async ({ course_id, url_or_id, title, body, published }) => {
      try {
        const wiki_page: Record<string, string | boolean> = {};
        if (title !== undefined) wiki_page.title = title;
        if (body !== undefined) wiki_page.body = body;
        if (published !== undefined) wiki_page.published = published;

        const result = await client.put(
          `/courses/${course_id}/pages/${url_or_id}`,
          { wiki_page }
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
}
