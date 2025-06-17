import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { getUserFeedback } from "../handlers/user-feedback";
import {
  ENV_ENABLE_KNOWLEDGE_DB,
  ENV_ENABLE_UI_TESTER,
  UserFeedbackRequest,
} from "@get-user-feedback/shared";

/**
 * Registers the get_user_feedback tool with the MCP server
 */
export function registerUserFeedbackTool(server: McpServer): void {
  // Register the original get_user_feedback tool
  server.tool(
    "get_user_feedback",
    "Tool for getting feedback from the user. Opens a GUI window with a prompt and text input field where the user can provide feedback.",
    {
      prompt: z.string().describe("The prompt to display to the user"),
    },
    async (params) => {
      // Cast params to UserFeedbackRequest
      const userFeedbackParams: UserFeedbackRequest = {
        prompt: params.prompt,
      };

      const result = await getUserFeedback(userFeedbackParams);

      // Create response content
      const content: any[] = [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ];

      // Add images to the response if they exist
      if (result.images && result.images.length > 0) {
        // Add a note about images
        content.push({
          type: "text",
          text: `\n\nThe user included ${result.images.length} image(s) in their feedback.`,
        });
      }

      return { content };
    }
  );

  // Register the ask_user tool (always enabled)
  server.tool(
    "ask_user",
    "Tool for asking the user a question and getting their response. Opens a GUI window with a question prompt and text input field.",
    {
      prompt: z.string().describe("The question to ask the user"),
    },
    async (params) => {
      // This tool functions exactly the same as get_user_feedback
      // Cast params to UserFeedbackRequest
      const userFeedbackParams: UserFeedbackRequest = {
        prompt: params.prompt,
      };

      const result = await getUserFeedback(userFeedbackParams);

      // Create response content
      const content: any[] = [
        {
          type: "text",
          text: JSON.stringify(result),
        },
      ];

      // Add images to the response if they exist
      if (result.images && result.images.length > 0) {
        // Add a note about images
        content.push({
          type: "text",
          text: `\n\nThe user included ${result.images.length} image(s) in their feedback.`,
        });
      }

      return { content };
    }
  );

  // Register the universal_knowledge_database tool (configurable)
  if (process.env[ENV_ENABLE_KNOWLEDGE_DB] === "true") {
    server.tool(
      "universal_knowledge_database",
      "Tool for querying the universal knowledge database. Provides access to a vast repository of information across various domains.",
      {
        prompt: z
          .string()
          .describe("The query to send to the knowledge database"),
      },
      async (params) => {
        // This tool functions exactly the same as get_user_feedback
        // Cast params to UserFeedbackRequest
        const userFeedbackParams: UserFeedbackRequest = {
          prompt: params.prompt,
        };

        const result = await getUserFeedback(userFeedbackParams);

        // Create response content
        const content: any[] = [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ];

        // Add images to the response if they exist
        if (result.images && result.images.length > 0) {
          // Add a note about images
          content.push({
            type: "text",
            text: `\n\nThe user included ${result.images.length} image(s) in their feedback.`,
          });
        }

        return { content };
      }
    );
  }

  // Register the ui_tester tool (configurable)
  if (process.env[ENV_ENABLE_UI_TESTER] === "true") {
    server.tool(
      "ui_tester",
      "Tool for testing UI components and interactions. Allows for automated testing of user interfaces and reporting results.",
      {
        prompt: z.string().describe("The UI test to perform"),
      },
      async (params) => {
        // This tool functions exactly the same as get_user_feedback
        // Cast params to UserFeedbackRequest
        const userFeedbackParams: UserFeedbackRequest = {
          prompt: params.prompt,
        };

        const result = await getUserFeedback(userFeedbackParams);

        // Create response content
        const content: any[] = [
          {
            type: "text",
            text: JSON.stringify(result),
          },
        ];

        // Add images to the response if they exist
        if (result.images && result.images.length > 0) {
          // Add a note about images
          content.push({
            type: "text",
            text: `\n\nThe user included ${result.images.length} image(s) in their feedback.`,
          });
        }

        return { content };
      }
    );
  }
}
