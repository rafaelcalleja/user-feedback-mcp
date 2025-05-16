import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerUserFeedbackTool } from "./tools";
import logger from "./utils/logger";

// Track if the server is already running to prevent multiple instances
let isServerRunning = false;
let serverInstance: McpServer | null = null;

/**
 * Main entry point for the MCP server
 */
export async function startMCPServer(): Promise<void> {
  // If the server is already running, log a warning and return
  if (isServerRunning) {
    logger.warn(
      "MCP server is already running, ignoring duplicate start request"
    );
    return;
  }

  try {
    logger.info("Starting MCP server");
    isServerRunning = true;

    // Create MCP server
    serverInstance = new McpServer({
      name: "User Feedback MCP",
      version: "1.0.0",
    });

    // Register tools
    registerUserFeedbackTool(serverInstance);

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    logger.info("Connecting to stdio transport");
    await serverInstance.connect(transport);

    // Set up error handler for the transport
    transport.onclose = () => {
      logger.info("Transport closed, resetting server state");
      isServerRunning = false;
      serverInstance = null;
    };

    logger.info("MCP server started successfully");
  } catch (error: any) {
    logger.error("Failed to start MCP server", {
      error: error.message || String(error),
    });
    isServerRunning = false;
    serverInstance = null;
    process.exit(1);
  }
}

/**
 * Stops the MCP server if it's running
 */
export async function stopMCPServer(): Promise<void> {
  if (isServerRunning && serverInstance) {
    logger.info("Stopping MCP server");
    // The server doesn't have a direct stop method, but we can reset our state
    isServerRunning = false;
    serverInstance = null;
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  startMCPServer();
}

// Export for use in other modules
export * from "./tools";
