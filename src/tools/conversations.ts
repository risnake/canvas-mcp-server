import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerConversationTools(
  server: McpServer,
  client: CanvasClient
): void {
  server.tool(
    "list_conversations",
    "List conversations for the current user",
    {
      scope: z
        .enum(["unread", "starred", "archived"])
        .optional()
        .describe("Filter by conversation scope"),
      per_page: z
        .number()
        .default(20)
        .optional()
        .describe("Number of results per page (default 20)"),
    },
    async ({ scope, per_page }) => {
      try {
        const params: Record<string, string> = {};
        if (scope) params["scope"] = scope;
        if (per_page !== undefined) params["per_page"] = String(per_page);

        const result = await client.get("/conversations", params);
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
    }
  );

  server.tool(
    "get_conversation",
    "Get a specific conversation",
    {
      conversation_id: z.string().describe("Conversation ID"),
    },
    async ({ conversation_id }) => {
      try {
        const result = await client.get(
          `/conversations/${conversation_id}`
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
    }
  );

  server.tool(
    "create_conversation",
    "Send a new message",
    {
      recipients: z
        .string()
        .describe("Comma-separated user IDs to send the message to"),
      subject: z.string().describe("Subject of the conversation"),
      body: z.string().describe("Body of the message"),
      course_id: z
        .string()
        .optional()
        .describe("Course ID to use as context for the message"),
    },
    async ({ recipients, subject, body, course_id }) => {
      try {
        const result = await client.post("/conversations", {
          recipients: recipients.split(","),
          subject,
          body,
          context_code: course_id ? "course_" + course_id : undefined,
        });
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
    }
  );
}
