import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerUserFeedbackTool } from "./tools";
import logger from "./utils/logger";

/**
 * Main entry point for the MCP server
 */
export async function startMCPServer(): Promise<void> {
  try {
    logger.info("Starting MCP server");

    // Create MCP server
    const server = new McpServer({
      name: "User Feedback MCP",
      version: "1.0.0",
    });

    // Register tools
    registerUserFeedbackTool(server);

    // Create stdio transport
    const transport = new StdioServerTransport();

    // Connect the server to the transport
    logger.info("Connecting to stdio transport");
    await server.connect(transport);

    logger.info("MCP server started successfully");
  } catch (error: any) {
    logger.error("Failed to start MCP server", {
      error: error.message || String(error),
    });
    process.exit(1);
  }
}

// Start the server if this file is executed directly
if (require.main === module) {
  startMCPServer();
}

// Export for use in other modules
export * from "./tools";
