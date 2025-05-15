# Project Overview: Local User Feedback Interface for MCP Tool

## Project Summary

This project implements a local Model Context Protocol (MCP) server that exposes a tool called `get_user_feedback`. When invoked by an LLM agent, this tool opens a GUI window prompting the user for feedback. Once the user submits their input, the message is returned as the tool's response to the LLM.

The system integrates a Node.js-based MCP server with an Electron-powered GUI for user interaction. The entire setup runs locally and communicates through the file system.

## Architecture Overview

We will implement this project using a Turborepo monorepo structure to clearly separate concerns between the MCP server and the Electron GUI components. This approach provides several benefits:

1. **Clear Component Separation**: The MCP server and Electron GUI are functionally distinct components with different responsibilities and dependencies.

2. **Independent Development Cycles**: Each component can evolve at different rates, especially if future enhancements are implemented.

3. **Dependency Isolation**: Electron has significant dependencies that shouldn't need to be installed for users who only need the MCP server.

4. **Simplified Testing**: Allows for isolated testing of each component.

5. **Future-Proofing**: Makes it easier to implement future enhancements such as structured input, JSON responses, or alternative communication methods.

## Monorepo Structure

```
user-feedback-mcp/
├── package.json (workspace root)
├── turbo.json
├── packages/
│   ├── mcp-server/
│   │   ├── package.json
│   │   └── src/
│   ├── electron-gui/
│   │   ├── package.json
│   │   └── src/
│   └── shared/
│       ├── package.json
│       └── src/ (constants, types, utilities)
└── apps/
    └── cli/ (for the npx entry point)
        ├── package.json
        └── src/
```

## Key Components

1. **MCP Server**: Exposes the `get_user_feedback` tool over MCP using the `stdio` transport.

2. **Electron GUI**: Provides a minimal user interface that displays a prompt and allows the user to submit feedback.

3. **Shared Utilities**: Contains common code, constants, and types used by both components.

4. **CLI Application**: Serves as the entry point for users, orchestrating the components.

5. **File-based Bridge**: Serves as a simple communication mechanism between the MCP server and the Electron app.

## Implementation Approach

The implementation will follow a phased approach, starting with the project setup and infrastructure, followed by the implementation of individual components, integration, testing, and finally packaging and distribution.

See the subsequent plan files for detailed implementation steps for each phase.
