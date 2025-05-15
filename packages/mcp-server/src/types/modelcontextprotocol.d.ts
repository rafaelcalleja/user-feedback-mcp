declare module '@modelcontextprotocol/sdk' {
  export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
    returns: {
      type: string;
      properties: Record<string, any>;
      required?: string[];
    };
  }

  export class StdioTransport {
    constructor();
  }

  export interface MCPServerOptions {
    transport: StdioTransport;
  }

  export class MCPServer {
    constructor(options: MCPServerOptions);
    registerTool(definition: ToolDefinition, handler: (params: any) => Promise<any>): void;
    start(): Promise<void>;
  }
}
