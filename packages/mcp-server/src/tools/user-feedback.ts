import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getUserFeedback } from "../handlers/user-feedback";

/**
 * Registers the get_user_feedback tool with the MCP server
 */
export function registerUserFeedbackTool(server: McpServer): void {
  server.tool(
    "get_user_feedback",
    {
      prompt: z.string().describe("The prompt to display to the user"),
      title: z
        .string()
        .optional()
        .describe("Optional title for the feedback window"),
      timeout: z
        .number()
        .optional()
        .describe("Optional timeout in milliseconds"),
    },
    async (params) => {
      const result = await getUserFeedback(params);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ],
      };
    }
  );
}
