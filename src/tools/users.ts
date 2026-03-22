import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerUserTools(
  server: McpServer,
  client: CanvasClient,
): void {
  server.tool(
    "get_user_profile",
    "Get the current user's profile",
    {},
    async () => {
      try {
        const result = await client.get("/users/self/profile");
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
    "get_user",
    "Get a specific user's profile",
    {
      user_id: z.string().describe("The ID of the user"),
    },
    async ({ user_id }) => {
      try {
        const result = await client.get(`/users/${user_id}/profile`);
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
    "list_course_users",
    "List users in a course",
    {
      course_id: z.string().describe("The ID of the course"),
      enrollment_type: z
        .enum(["teacher", "student", "ta", "observer", "designer"])
        .optional()
        .describe("Filter by enrollment type"),
      per_page: z
        .number()
        .optional()
        .default(50)
        .describe("Number of results per page (default 50)"),
    },
    async ({ course_id, enrollment_type, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (enrollment_type) {
          params.append("enrollment_type[]", enrollment_type);
        }
        params.append("per_page", String(per_page));
        params.append("include[]", "email");
        params.append("include[]", "enrollments");
        params.append("include[]", "avatar_url");

        const result = await client.get(
          `/courses/${course_id}/users?${params.toString()}`,
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
