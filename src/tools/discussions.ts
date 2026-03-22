import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerDiscussionTools(
  server: McpServer,
  client: CanvasClient
): void {
  // 1. List discussion topics in a course
  server.tool(
    "list_discussions",
    "List discussion topics in a course",
    {
      course_id: z.string().describe("Course ID"),
      order_by: z
        .enum(["position", "recent_activity", "title"])
        .optional()
        .describe("Order results by field"),
      per_page: z
        .number()
        .default(20)
        .describe("Number of results per page (default 20)"),
    },
    async ({ course_id, order_by, per_page }) => {
      try {
        const result = await client.get(
          `/courses/${course_id}/discussion_topics`,
          {
            order_by,
            per_page,
            exclude_context_module_locked_topics: true,
          }
        );
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

  // 2. Get a specific discussion topic
  server.tool(
    "get_discussion",
    "Get a specific discussion topic",
    {
      course_id: z.string().describe("Course ID"),
      topic_id: z.string().describe("Discussion topic ID"),
    },
    async ({ course_id, topic_id }) => {
      try {
        const result = await client.get(
          `/courses/${course_id}/discussion_topics/${topic_id}`
        );
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

  // 3. Create a discussion topic
  server.tool(
    "create_discussion",
    "Create a discussion topic",
    {
      course_id: z.string().describe("Course ID"),
      title: z.string().describe("Discussion title"),
      message: z.string().describe("Discussion message/body"),
      discussion_type: z
        .enum(["side_comment", "threaded"])
        .default("side_comment")
        .describe("Discussion type (default side_comment)"),
      published: z
        .boolean()
        .default(true)
        .describe("Whether the discussion is published (default true)"),
    },
    async ({ course_id, title, message, discussion_type, published }) => {
      try {
        const result = await client.post(
          `/courses/${course_id}/discussion_topics`,
          {
            title,
            message,
            discussion_type,
            published,
          }
        );
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

  // 4. List entries (replies) in a discussion
  server.tool(
    "list_discussion_entries",
    "List entries (replies) in a discussion",
    {
      course_id: z.string().describe("Course ID"),
      topic_id: z.string().describe("Discussion topic ID"),
      per_page: z
        .number()
        .default(20)
        .describe("Number of results per page (default 20)"),
    },
    async ({ course_id, topic_id, per_page }) => {
      try {
        const result = await client.get(
          `/courses/${course_id}/discussion_topics/${topic_id}/entries`,
          {
            per_page,
          }
        );
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
