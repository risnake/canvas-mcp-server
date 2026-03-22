import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod/v4";
import { CanvasClient } from "../canvas-client.js";

export function registerCalendarTools(
  server: McpServer,
  client: CanvasClient
): void {
  server.tool(
    "list_calendar_events",
    "List calendar events",
    {
      start_date: z
        .string()
        .optional()
        .describe("Start date in ISO 8601 format"),
      end_date: z
        .string()
        .optional()
        .describe("End date in ISO 8601 format"),
      context_codes: z
        .string()
        .optional()
        .describe(
          "Comma-separated context codes (e.g. 'course_123,user_456')"
        ),
      per_page: z
        .number()
        .optional()
        .default(20)
        .describe("Number of results per page"),
    },
    async ({ start_date, end_date, context_codes, per_page }) => {
      try {
        const params = new URLSearchParams();
        if (start_date) params.set("start_date", start_date);
        if (end_date) params.set("end_date", end_date);
        if (per_page !== undefined) params.set("per_page", String(per_page));

        let url = `/calendar_events?${params.toString()}`;

        if (context_codes) {
          const codes = context_codes.split(",").map((c) => c.trim());
          for (const code of codes) {
            url += `&context_codes[]=${encodeURIComponent(code)}`;
          }
        }

        const result = await client.get(url);
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
    "create_calendar_event",
    "Create a calendar event",
    {
      context_code: z
        .string()
        .describe("Context code (e.g. 'course_123')"),
      title: z.string().describe("Event title"),
      start_at: z
        .string()
        .describe("Start date/time in ISO 8601 format"),
      end_at: z
        .string()
        .optional()
        .describe("End date/time in ISO 8601 format"),
      description: z.string().optional().describe("Event description"),
      location_name: z.string().optional().describe("Location name"),
    },
    async ({ context_code, title, start_at, end_at, description, location_name }) => {
      try {
        const result = await client.post("/calendar_events", {
          calendar_event: {
            context_code,
            title,
            start_at,
            end_at,
            description,
            location_name,
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
}
