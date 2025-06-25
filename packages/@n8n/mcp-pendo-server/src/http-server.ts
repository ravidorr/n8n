import express from 'express';
import { PendoConfig } from './types.js';
import { PendoMCPServer } from './server.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

export async function startHttpServer(config: PendoConfig, port: number = 3000) {
	const app = express();
	app.use(express.json());

	// CORS handling - must be before routes
	app.use((req, res, next) => {
		res.header('Access-Control-Allow-Origin', '*');
		res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
		res.header('Access-Control-Max-Age', '86400');

		if (req.method === 'OPTIONS') {
			console.log('CORS preflight request received for:', req.path);
			res.sendStatus(204);
		} else {
			next();
		}
	});

	// Health check endpoint
	app.get('/health', (req, res) => {
		res.json({ status: 'ok', service: 'pendo-mcp-server' });
	});

	// SSE endpoint for n8n MCP Client Tool - proper MCP protocol implementation
	app.get('/sse', async (req, res) => {
		console.log('SSE connection requested - MCP protocol mode');
		console.log('Request headers:', req.headers);

		try {
			// Create MCP server instance for this connection
			const mcpServer = new PendoMCPServer(config);

			// Create SSE transport - provide endpoint path and response object
			const transport = new SSEServerTransport('/sse', res);

			// Connect the transport to the server
			await mcpServer.server.connect(transport);
			console.log('MCP server connected to SSE transport');

			// Handle client disconnect
			req.on('close', () => {
				console.log('SSE client disconnected');
				transport.close();
			});
		} catch (error) {
			console.error('Error setting up SSE connection:', error);
			res.status(500).end();
		}
	});

	// Handle POST requests for SSE sessions
	app.post('/sse', async (req, res) => {
		console.log('SSE POST request received');
		console.log('Request body:', req.body);
		console.log('Request query:', req.query);

		// The SSE transport will handle the request
		// For now, just acknowledge the request
		res.status(200).json({ status: 'ok' });
	});

	app.listen(port, () => {
		console.log(`Pendo MCP HTTP server listening on port ${port}`);
		console.log(`SSE endpoint: http://localhost:${port}/sse`);
		console.log(`Health check: http://localhost:${port}/health`);
	});
}
