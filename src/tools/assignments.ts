import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerAssignmentTools(
  server: McpServer,
  client: CanvasClient,
): void {
  // ── list_assignments ────────────────────────────────────────────────
  server.tool(
    "list_assignments",
    "List assignments for a Canvas course",
    {
      course_id: z.string().describe("The course ID"),
      order_by: z
        .enum(["position", "name", "due_at"])
        .optional()
        .describe("Sort order for the assignments"),
      per_page: z
        .number()
        .optional()
        .default(20)
        .describe("Number of results per page (default 20)"),
    },
    async ({ course_id, order_by, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.set("per_page", String(per_page));
        params.append("include[]", "submission");
        if (order_by) {
          params.set("order_by", order_by);
        }

        const result = await client.get(
          `/courses/${course_id}/assignments?${params.toString()}`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // ── get_assignment ──────────────────────────────────────────────────
  server.tool(
    "get_assignment",
    "Get details of a specific Canvas assignment",
    {
      course_id: z.string().describe("The course ID"),
      assignment_id: z.string().describe("The assignment ID"),
    },
    async ({ course_id, assignment_id }) => {
      try {
        const params = new URLSearchParams();
        params.append("include[]", "submission");

        const result = await client.get(
          `/courses/${course_id}/assignments/${assignment_id}?${params.toString()}`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // ── create_assignment ───────────────────────────────────────────────
  server.tool(
    "create_assignment",
    "Create a new assignment in a Canvas course",
    {
      course_id: z.string().describe("The course ID"),
      name: z.string().describe("The name of the assignment"),
      description: z
        .string()
        .optional()
        .describe("The assignment description (HTML allowed)"),
      due_at: z
        .string()
        .optional()
        .describe("Due date in ISO 8601 format"),
      points_possible: z
        .number()
        .optional()
        .describe("Maximum points for the assignment"),
      submission_types: z
        .string()
        .optional()
        .describe(
          "Comma-separated submission types: online_text_entry,online_upload,online_url,on_paper,none",
        ),
      published: z
        .boolean()
        .optional()
        .default(false)
        .describe("Whether the assignment is published (default false)"),
    },
    async ({
      course_id,
      name,
      description,
      due_at,
      points_possible,
      submission_types,
      published,
    }) => {
      try {
        const result = await client.post(
          `/courses/${course_id}/assignments`,
          {
            assignment: {
              name,
              description,
              due_at,
              points_possible,
              submission_types: submission_types?.split(","),
              published,
            },
          },
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // ── update_assignment ───────────────────────────────────────────────
  server.tool(
    "update_assignment",
    "Update an existing assignment in a Canvas course",
    {
      course_id: z.string().describe("The course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      name: z.string().optional().describe("New name for the assignment"),
      description: z
        .string()
        .optional()
        .describe("New description for the assignment"),
      due_at: z
        .string()
        .optional()
        .describe("New due date in ISO 8601 format"),
      points_possible: z
        .number()
        .optional()
        .describe("New maximum points"),
      published: z
        .boolean()
        .optional()
        .describe("Whether the assignment is published"),
    },
    async ({
      course_id,
      assignment_id,
      name,
      description,
      due_at,
      points_possible,
      published,
    }) => {
      try {
        const fields: Record<string, unknown> = {};
        if (name !== undefined) fields.name = name;
        if (description !== undefined) fields.description = description;
        if (due_at !== undefined) fields.due_at = due_at;
        if (points_possible !== undefined)
          fields.points_possible = points_possible;
        if (published !== undefined) fields.published = published;

        const result = await client.put(
          `/courses/${course_id}/assignments/${assignment_id}`,
          { assignment: fields },
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // ── list_submissions ────────────────────────────────────────────────
  server.tool(
    "list_submissions",
    "List submissions for a Canvas assignment",
    {
      course_id: z.string().describe("The course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      per_page: z
        .number()
        .optional()
        .default(20)
        .describe("Number of results per page (default 20)"),
    },
    async ({ course_id, assignment_id, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.append("include[]", "user");
        params.append("include[]", "submission_comments");
        params.set("per_page", String(per_page));

        const result = await client.get(
          `/courses/${course_id}/assignments/${assignment_id}/submissions?${params.toString()}`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // ── get_submission ──────────────────────────────────────────────────
  server.tool(
    "get_submission",
    "Get a specific student submission for a Canvas assignment",
    {
      course_id: z.string().describe("The course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      user_id: z.string().describe("The user/student ID"),
    },
    async ({ course_id, assignment_id, user_id }) => {
      try {
        const params = new URLSearchParams();
        params.append("include[]", "user");
        params.append("include[]", "submission_comments");

        const result = await client.get(
          `/courses/${course_id}/assignments/${assignment_id}/submissions/${user_id}?${params.toString()}`,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );

  // ── grade_submission ────────────────────────────────────────────────
  server.tool(
    "grade_submission",
    "Grade a student submission for a Canvas assignment",
    {
      course_id: z.string().describe("The course ID"),
      assignment_id: z.string().describe("The assignment ID"),
      user_id: z.string().describe("The user/student ID"),
      grade: z
        .string()
        .describe(
          "The grade value (e.g. '95', 'A', 'pass', 'incomplete')",
        ),
      comment: z
        .string()
        .optional()
        .describe("Optional text comment to include with the grade"),
    },
    async ({ course_id, assignment_id, user_id, grade, comment }) => {
      try {
        const body: Record<string, unknown> = {
          submission: { posted_grade: grade },
        };
        if (comment) {
          body.comment = { text_comment: comment };
        }

        const result = await client.put(
          `/courses/${course_id}/assignments/${assignment_id}/submissions/${user_id}`,
          body,
        );
        return {
          content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text", text: `Error: ${message}` }],
          isError: true,
        };
      }
    },
  );
}
