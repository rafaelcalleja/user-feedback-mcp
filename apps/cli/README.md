# User Feedback MCP CLI

A command-line interface for the User Feedback MCP tool. This CLI allows you to start the MCP server and test the user feedback functionality.

## Installation

```bash
# Install globally
npm install -g user-feedback-mcp

# Or run directly with npx
npx user-feedback-mcp
```

## Usage

### Starting the MCP Server

```bash
# Start the MCP server
user-feedback-mcp start

# Start with debug logging
user-feedback-mcp start --debug

# Set a custom timeout
user-feedback-mcp start --timeout 60000
```

### Testing the Tool

```bash
# Test the tool with a custom prompt
user-feedback-mcp test --prompt "What do you think about this feature?"

# Set a custom timeout for the test
user-feedback-mcp test --prompt "Your prompt" --timeout 30000
```

## Development

### Prerequisites

- Node.js 14 or later
- npm 7 or later or yarn

### Setup

```bash
# Install dependencies
yarn install

# Build the CLI
yarn build

# Run the CLI
yarn start
```

### Running Tests

```bash
# Run tests
yarn test
```

## Configuration

The tool can be configured using environment variables:

- `DEBUG`: Enable debug logging
- `DEFAULT_TIMEOUT`: Default timeout for feedback requests (in milliseconds)
