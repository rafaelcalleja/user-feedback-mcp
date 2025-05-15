# Product Requirements Document (PRD)

## Title

**Local User Feedback Interface for MCP Tool**

---

## Overview

This feature enables a local Model Context Protocol (MCP) server to expose a tool that, when invoked by an LLM agent, opens a GUI window prompting the user for feedback. Once the user submits the input, the message is returned as the tool's response to the LLM.

The system integrates a Node.js-based MCP server with an Electron-powered GUI for user interaction. The entire setup runs locally and communicates through the file system.

---

## Goals

- Enable an LLM to call a tool named `get_user_feedback` via MCP.
- Open a lightweight GUI window to collect user input.
- Return the user's response as the tool’s output.
- Ensure the system works offline and runs locally (e.g., via `npx`).

---

## Components

### 1. MCP Server

**Responsibility**:  
Expose the `get_user_feedback` tool over MCP using the `stdio` transport.

**Key Features**:

- Listens for tool calls from the LLM.
- On tool invocation, launches a subprocess to display a feedback UI.
- Waits for user input to be written to a file.
- Reads the file and returns the message as the tool response.

**Integration Details**:

- Runs as a long-lived Node.js process using the MCP SDK.
- Invokes the GUI process (Electron app) as a child process.
- Monitors a known temporary file (e.g., `feedback.txt`) for output from the GUI.

---

### 2. Electron GUI

**Responsibility**:  
Provide a minimal user interface that displays a prompt and allows the user to submit feedback.

**Key Features**:

- Renders a window with a message area and text input.
- Accepts an optional prompt string (e.g., via environment variable).
- Writes the user’s input to a known file when submitted.
- Closes the window and exits the process after submission.

**Integration Details**:

- Runs as a standalone process launched by the MCP server.
- Uses IPC (Inter-Process Communication) to communicate the user input between the main process and renderer.
- Electron’s main process listens for the submit event and writes the result to the shared file path.

---

### 3. File-based Bridge (Inter-process Communication)

**Responsibility**:  
Serve as a simple communication mechanism between the MCP server and the Electron app.

**Key Features**:

- Known file path used as a handshake point (`feedback.txt`).
- Electron app writes the user’s input to this file.
- MCP server reads the content once the GUI process terminates.

**Reasoning**:

- Keeps the integration minimal and cross-platform.
- Avoids the complexity of sockets or named pipes for a local-only MVP.

---

## Sequence Flow

1. The LLM invokes the `get_user_feedback` tool.
2. MCP server:
   - Spawns the Electron GUI.
   - Waits for the process to exit.
   - Reads the output file (e.g., `feedback.txt`).
3. GUI:
   - Displays prompt and input area.
   - Writes input to file on submission.
   - Exits cleanly.
4. MCP server returns the feedback string to the LLM.

---

## Constraints

- All components must run locally.
- No external network access is assumed or required.
- The UI should be minimal and usable without dependencies beyond Electron.

---

## Future Enhancements

- Accept structured input or additional metadata (e.g., tags, confidence).
- Return JSON instead of plain text.
- Use IPC or sockets for more robust messaging.
- Allow timeouts or cancellation from the LLM side.
- Persist user input history for future reference or learning.
