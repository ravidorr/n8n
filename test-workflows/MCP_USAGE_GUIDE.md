# Pendo MCP Server Usage Guide for n8n

## Understanding MCP in n8n

The Model Context Protocol (MCP) in n8n works differently than you might expect. The MCP Client Tool node (`@n8n/n8n-nodes-langchain.mcpClientTool`) is designed to provide tools to an AI agent, not to directly call MCP server functions.

## Correct Usage Patterns

### 1. AI Agent with MCP Tools

The proper way to use MCP tools in n8n is through an AI agent:

```
[Start] → [AI Agent] ← [MCP Client Tool]
                    ← [AI Model (e.g., OpenAI)]
```

The MCP Client Tool connects to your Pendo MCP server and makes its tools available to the AI agent, which can then decide when and how to use them.

**Example**: See `pendo-ai-agent-demo.json`

### 2. Direct HTTP Requests

For simpler workflows without AI, use HTTP Request nodes to call the MCP server directly:

```
[Start] → [HTTP Request] → [Process Data] → [Output]
```

**Example**: See `pendo-simple-demo-fixed.json`

### 3. MCP Server Trigger

To expose n8n tools as an MCP server:

```
[MCP Trigger] → [Connected Tools]
```

This allows external MCP clients to use your n8n workflows as tools.

## Starting the Pendo MCP Server

### For n8n Integration (HTTP Mode)

1. Set environment variables:
```bash
export PENDO_API_KEY="your-api-key"
export MCP_MODE=http
export PORT=3000
```

2. Build and start the server:
```bash
cd packages/@n8n/mcp-pendo-server
npm install
npm run build
npm start
```

The server will be available at:
- JSON-RPC endpoint: `http://localhost:3000/` (for direct HTTP requests)
- SSE endpoint: `http://localhost:3000/sse` (for future MCP Client Tool support)
- Health check: `http://localhost:3000/health`

### For Traditional MCP Clients (stdio Mode)

```bash
export PENDO_API_KEY="your-api-key"
export MCP_MODE=stdio
npm start
```

## Common Issues and Solutions

### Issue: "Unrecognized node type: @n8n/nodes-langchain.mcpClient"

**Solution**: The correct node type is `@n8n/n8n-nodes-langchain.mcpClientTool` (note the extra `n8n-` prefix).

### Issue: MCP Client Tool not working as expected

**Solution**: Remember that MCP Client Tool must be connected to an AI agent. It doesn't execute tools directly but makes them available to the agent.

### Issue: Connection failed to MCP server

**Solution**:
1. Ensure the server is running in HTTP mode (`MCP_MODE=http`)
2. Check the SSE endpoint URL is correct (`http://localhost:3000/sse`)
3. Verify your Pendo API key is set correctly

## Workflow Examples

### AI-Powered Analytics (Recommended)

Uses an AI agent to intelligently query Pendo data and generate reports:

1. Import `pendo-ai-agent-demo.json`
2. Configure OpenAI credentials
3. Update the MCP server URL if needed
4. Run the workflow

### Direct API Calls

For simpler use cases without AI:

1. Import `pendo-simple-demo-fixed.json`
2. Update the HTTP request URLs to your MCP server
3. Configure output destinations (Email, Slack, etc.)
4. Run the workflow

### Real-time NPS Response

For webhook-triggered workflows:

1. Import `pendo-detractor-delight.json`
2. Configure all integration credentials
3. Set up the webhook in Pendo
4. Activate the workflow

## Best Practices

1. **Use AI agents for complex logic**: When you need intelligent decision-making about which tools to use and how to interpret results.

2. **Use direct HTTP for simple workflows**: When you know exactly what data you need and in what order.

3. **Set appropriate timeouts**: MCP operations can take time, especially with large datasets.

4. **Handle errors gracefully**: Always add error handling nodes after MCP operations.

5. **Monitor API limits**: Be aware of Pendo's API rate limits when designing workflows.

## Troubleshooting

### Enable Debug Logging

```bash
export DEBUG=mcp:*
export NODE_ENV=development
```

### Test Connection

Use curl to test the MCP server:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Test SSE connection
curl -N http://localhost:3000/sse
```

### Common Error Messages

- **"PENDO_API_KEY environment variable is required"**: Set your API key
- **"Connection refused"**: Ensure the server is running and the port is correct
- **"Invalid node type"**: Use the correct node type with the `n8n-` prefix

## Further Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [n8n AI Nodes Documentation](https://docs.n8n.io/integrations/builtin/cluster-nodes/sub-nodes/langchain/)
- [Pendo API Documentation](https://engageapi.pendo.io/)
