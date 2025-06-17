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
  .name("get-user-feedback")
  .description("Local User Feedback Interface for MCP Tool")
  .version(version)
  .option("-d, --debug", "Enable debug logging")
  .option(
    "--enable-knowledge-db",
    "Enable the universal knowledge database tool"
  )
  .option("--enable-ui-tester", "Enable the UI tester tool");

// Main action handler
async function main() {
  try {
    const options = program.opts();

    // Set debug mode if specified
    if (options.debug) {
      process.env.DEBUG = "true";
      safeConsole.log("Debug mode enabled");
    }

    // Timeout option has been removed

    // Enable additional tools if specified
    if (options.enableKnowledgeDb) {
      process.env.ENABLE_KNOWLEDGE_DB = "true";
      safeConsole.log("Universal knowledge database tool enabled");
    }

    if (options.enableUiTester) {
      process.env.ENABLE_UI_TESTER = "true";
      safeConsole.log("UI tester tool enabled");
    }

    // Start the MCP server
    safeConsole.log("Starting MCP server...");
    // Import dynamically to avoid TypeScript issues
    const { startMCPServer } = await import("@get-user-feedback/mcp-server");
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
