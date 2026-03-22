import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

/**
 * Registers MCP tools for Canvas LMS course operations.
 *
 * Tools registered:
 * - list_courses: List all courses for the current user
 * - get_course: Get details of a specific course
 * - list_students: List students enrolled in a course
 * - get_course_settings: Get course settings
 */
export function registerCourseTools(
  server: McpServer,
  client: CanvasClient,
): void {
  // ── list_courses ──────────────────────────────────────────────────────
  server.tool(
    "list_courses",
    "List all courses for the current user. Optionally filter by enrollment type and course state.",
    {
      enrollment_type: z
        .enum(["teacher", "student", "ta", "observer", "designer"])
        .optional()
        .describe(
          "Filter by enrollment type (teacher, student, ta, observer, designer)",
        ),
      state: z
        .enum(["unpublished", "available", "completed", "deleted"])
        .optional()
        .describe(
          "Filter by course state (unpublished, available, completed, deleted)",
        ),
      per_page: z
        .number()
        .optional()
        .describe("Number of results per page (default 10)"),
    },
    async ({ enrollment_type, state, per_page }) => {
      try {
        const params = new URLSearchParams();

        if (enrollment_type) {
          params.append("enrollment_type", enrollment_type);
        }
        if (state) {
          params.append("state[]", state);
        }
        params.append("per_page", String(per_page ?? 10));
        params.append("include[]", "total_students");
        params.append("include[]", "term");
        params.append("include[]", "teachers");

        const courses = await client.get(`/courses?${params.toString()}`);

        const formatted = (courses as any[]).map((course: any) => ({
          id: course.id,
          name: course.name,
          course_code: course.course_code,
          enrollment_term: course.term?.name ?? null,
          state: course.workflow_state,
        }));

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(formatted, null, 2) },
          ],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Error: ${message}` },
          ],
          isError: true,
        };
      }
    },
  );

  // ── get_course ────────────────────────────────────────────────────────
  server.tool(
    "get_course",
    "Get detailed information about a specific Canvas course, including syllabus, term, teachers, and student count.",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async ({ course_id }) => {
      try {
        const params = new URLSearchParams();
        params.append("include[]", "total_students");
        params.append("include[]", "term");
        params.append("include[]", "teachers");
        params.append("include[]", "syllabus_body");

        const course = await client.get(
          `/courses/${course_id}?${params.toString()}`,
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(course, null, 2) },
          ],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Error: ${message}` },
          ],
          isError: true,
        };
      }
    },
  );

  // ── list_students ─────────────────────────────────────────────────────
  server.tool(
    "list_students",
    "List all students enrolled in a specific Canvas course, including their email and enrollment details.",
    {
      course_id: z.string().describe("The Canvas course ID"),
      per_page: z
        .number()
        .optional()
        .describe("Number of results per page (default 50)"),
    },
    async ({ course_id, per_page }) => {
      try {
        const params = new URLSearchParams();
        params.append("enrollment_type[]", "student");
        params.append("per_page", String(per_page ?? 50));
        params.append("include[]", "email");
        params.append("include[]", "enrollments");

        const students = await client.get(
          `/courses/${course_id}/users?${params.toString()}`,
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(students, null, 2) },
          ],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Error: ${message}` },
          ],
          isError: true,
        };
      }
    },
  );

  // ── get_course_settings ───────────────────────────────────────────────
  server.tool(
    "get_course_settings",
    "Get the settings for a specific Canvas course.",
    {
      course_id: z.string().describe("The Canvas course ID"),
    },
    async ({ course_id }) => {
      try {
        const settings = await client.get(
          `/courses/${course_id}/settings`,
        );

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(settings, null, 2) },
          ],
        };
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Error: ${message}` },
          ],
          isError: true,
        };
      }
    },
  );
}
