#!/bin/bash

# Pendo MCP Server Development Startup Script

set -e

echo "🚀 Starting Pendo MCP Server in development mode..."

# Check if API key is set
if [ -z "$PENDO_API_KEY" ]; then
    echo "❌ Error: PENDO_API_KEY environment variable is required"
    echo "Please set your Pendo API key:"
    echo "export PENDO_API_KEY=\"your-api-key-here\""
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the mcp-pendo-server directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building project..."
npm run build

# Set mode to HTTP for n8n integration
export MCP_MODE=http
export PORT=${PORT:-3000}

# Start the server
echo "✅ Starting MCP server in HTTP mode..."
echo "Server will be available at:"
echo "  - SSE endpoint: http://localhost:${PORT}/sse"
echo "  - HTTP endpoint: http://localhost:${PORT}/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
