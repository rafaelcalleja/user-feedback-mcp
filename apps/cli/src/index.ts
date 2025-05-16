import { Command } from "commander";
// Using require for package.json to avoid TypeScript issues
const { version } = require("../package.json");

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
  .version(version)
  .option("-d, --debug", "Enable debug logging")
  .option(
    "-t, --timeout <timeout>",
    "Default timeout for feedback requests (in milliseconds)"
  );

// Main action handler
async function main() {
  try {
    const options = program.opts();

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
}

// Parse command-line arguments
program.parse();

// Start the MCP server immediately
main();
