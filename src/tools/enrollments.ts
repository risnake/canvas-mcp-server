import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerEnrollmentTools(
  server: McpServer,
  client: CanvasClient
): void {
  server.tool(
    "list_enrollments",
    "List enrollments in a course",
    {
      course_id: z.string().describe("Course ID"),
      type: z
        .enum([
          "StudentEnrollment",
          "TeacherEnrollment",
          "TaEnrollment",
          "ObserverEnrollment",
          "DesignerEnrollment",
        ])
        .optional()
        .describe("Filter by enrollment type"),
      state: z
        .enum([
          "active",
          "invited",
          "creation_pending",
          "deleted",
          "rejected",
          "completed",
          "inactive",
        ])
        .optional()
        .describe("Filter by enrollment state"),
      per_page: z
        .number()
        .default(50)
        .optional()
        .describe("Number of results per page (default 50)"),
    },
    async ({ course_id, type, state, per_page }) => {
      try {
        const params: Record<string, string> = {};
        if (type) params["type[]"] = type;
        if (state) params["state[]"] = state;
        if (per_page !== undefined) params["per_page"] = String(per_page);

        const result = await client.get(
          `/courses/${course_id}/enrollments`,
          params
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
    "get_user_enrollments",
    "List enrollments for a user",
    {
      user_id: z
        .string()
        .optional()
        .describe("User ID (defaults to 'self' for the current user)"),
      state: z
        .enum([
          "active",
          "invited",
          "creation_pending",
          "deleted",
          "rejected",
          "completed",
          "inactive",
        ])
        .optional()
        .describe("Filter by enrollment state"),
      per_page: z
        .number()
        .default(50)
        .optional()
        .describe("Number of results per page (default 50)"),
    },
    async ({ user_id, state, per_page }) => {
      try {
        const params: Record<string, string> = {};
        if (state) params["state[]"] = state;
        if (per_page !== undefined) params["per_page"] = String(per_page);

        const result = await client.get(
          `/users/${user_id || "self"}/enrollments`,
          params
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
}
