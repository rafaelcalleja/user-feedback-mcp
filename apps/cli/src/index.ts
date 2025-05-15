import { Command } from "commander";
// Using require for package.json to avoid TypeScript issues
const { version } = require("../package.json");
import { DEFAULT_TIMEOUT } from "@user-feedback-mcp/shared";

// Create no-op console functions to completely disable logging
// to avoid interfering with MCP stdio communication
const safeConsole = {
  log: (..._args: any[]) => {},
  info: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
};

// Create the command-line program
const program = new Command();

// Set up basic information
program
  .name("user-feedback-mcp")
  .description("Local User Feedback Interface for MCP Tool")
  .version(version);

// Add start command
program
  .command("start")
  .description("Start the MCP server")
  .option("-d, --debug", "Enable debug logging")
  .option(
    "-t, --timeout <timeout>",
    "Default timeout for feedback requests (in milliseconds)"
  )
  .action(async (options) => {
    try {
      // Set debug mode if specified
      if (options.debug) {
        process.env.DEBUG = "true";
        safeConsole.log("Debug mode enabled");
      }

      // Set timeout if specified
      if (options.timeout) {
        process.env.DEFAULT_TIMEOUT = options.timeout;
        safeConsole.log(`Default timeout set to ${options.timeout}ms`);
      }

      // Start the MCP server
      safeConsole.log("Starting MCP server...");
      // Import dynamically to avoid TypeScript issues
      const { startMCPServer } = await import("@user-feedback-mcp/mcp-server");
      await startMCPServer();
    } catch (error) {
      safeConsole.error("Failed to start MCP server:", error);
      process.exit(1);
    }
  });

// Add test command for quick testing
program
  .command("test")
  .description("Test the user feedback tool")
  .option(
    "-p, --prompt <prompt>",
    "Prompt to display",
    "Please provide your feedback:"
  )
  .option(
    "-t, --timeout <timeout>",
    "Timeout in milliseconds",
    String(DEFAULT_TIMEOUT)
  )
  .action(async (options) => {
    try {
      // Import dynamically to avoid circular dependencies
      const { getUserFeedback } = await import(
        "@user-feedback-mcp/mcp-server/dist/handlers/user-feedback"
      );

      safeConsole.log(`Testing with prompt: "${options.prompt}"`);

      const result = await getUserFeedback({
        prompt: options.prompt,
        timeout: parseInt(options.timeout, 10),
      });

      safeConsole.log("Result:", result);
    } catch (error) {
      safeConsole.error("Test failed:", error);
      process.exit(1);
    }
  });

// Parse command-line arguments
program.parse();
