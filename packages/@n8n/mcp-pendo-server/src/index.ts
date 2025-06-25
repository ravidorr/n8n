#!/usr/bin/env node

import { PendoMCPServer } from './server.js';
import { PendoConfig } from './types.js';

async function main() {
	// Get API key from environment variable
	const apiKey = process.env.PENDO_API_KEY;

	if (!apiKey) {
		console.error('Error: PENDO_API_KEY environment variable is required');
		console.error('Please set your Pendo API key:');
		console.error('export PENDO_API_KEY="your-api-key-here"');
		process.exit(1);
	}

	// Get optional base URL from environment (defaults to https://engageapi.pendo.io)
	const baseUrl = process.env.PENDO_BASE_URL;

	const config: PendoConfig = {
		apiKey,
		baseUrl,
	};

	const server = new PendoMCPServer(config);

	// Handle process termination gracefully
	process.on('SIGINT', () => {
		console.error('Received SIGINT, shutting down gracefully...');
		process.exit(0);
	});

	process.on('SIGTERM', () => {
		console.error('Received SIGTERM, shutting down gracefully...');
		process.exit(0);
	});

	try {
		await server.run();
	} catch (error) {
		console.error('Failed to start Pendo MCP server:', error);
		process.exit(1);
	}
}

if (import.meta.url === `file://${process.argv[1]}`) {
	main().catch((error) => {
		console.error('Unhandled error:', error);
		process.exit(1);
	});
}
