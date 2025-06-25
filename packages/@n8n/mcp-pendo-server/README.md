# Pendo MCP Server

A Model Context Protocol (MCP) server for integrating with the Pendo Engage API. This server enables AI models to interact with Pendo's product analytics and user engagement platform.

## Features

This MCP server provides access to the following Pendo functionality:

### Analytics & Data Retrieval
- **Get Pages**: Retrieve information about pages tracked in your Pendo application
- **Get Accounts**: Access account (organization) data and metadata
- **Get Visitors**: Retrieve individual user data and visitor information
- **Get Events**: Access user interaction events and analytics data
- **Get Feature Usage**: Analyze feature usage patterns and analytics

### Guide Management
- **Get Guides**: Retrieve in-app guides and walkthroughs
- **Create Guide**: Build new in-app guides for user onboarding
- **Update Guide**: Modify existing guides and their targeting
- **Delete Guide**: Remove guides from your Pendo instance

### Individual Resource Access
- **Get Account**: Retrieve detailed information about a specific account
- **Get Visitor**: Access detailed visitor profile information
- **Get Page**: Get comprehensive page tracking data

### Utilities
- **Test Connection**: Verify API connectivity and credentials

## Installation

### Prerequisites

- Node.js 18+
- Pendo account with API access
- Pendo API key

### Install Dependencies

```bash
cd packages/@n8n/mcp-pendo-server
npm install
```

### Build the Project

```bash
npm run build
```

## Configuration

### Environment Variables

Set the following environment variables:

```bash
# Required: Your Pendo API key
export PENDO_API_KEY="your-pendo-api-key-here"

# Optional: Custom Pendo API base URL (defaults to https://engageapi.pendo.io)
export PENDO_BASE_URL="https://engageapi.pendo.io"
```

### Getting Your Pendo API Key

1. Log in to your Pendo account
2. Navigate to Settings → Integrations → API Keys
3. Generate a new API key with appropriate permissions
4. Copy the API key and set it as the `PENDO_API_KEY` environment variable

## Usage

### Running the Server

```bash
# Development mode
npm run dev

# Production mode
npm run start
```

### Using with MCP Clients

The server communicates via stdio and can be integrated with any MCP-compatible client. Here's an example configuration for popular MCP clients:

#### Claude Desktop Configuration

Add to your Claude Desktop config file:

```json
{
  "mcpServers": {
    "pendo": {
      "command": "node",
      "args": ["path/to/packages/@n8n/mcp-pendo-server/dist/index.js"],
      "env": {
        "PENDO_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Available Tools

### Data Retrieval Tools

#### `get_pages`
Retrieve pages tracked in your Pendo application.

**Parameters:**
- `limit` (optional): Maximum number of pages (1-1000, default: 100)
- `offset` (optional): Number of pages to skip for pagination (default: 0)
- `app_id` (optional): Filter pages by application ID

**Example:**
```json
{
  "limit": 50,
  "offset": 0,
  "app_id": "your-app-id"
}
```

#### `get_accounts`
Retrieve account information from Pendo.

**Parameters:**
- `limit` (optional): Maximum number of accounts (1-1000, default: 100)
- `offset` (optional): Number of accounts to skip for pagination (default: 0)
- `filter` (optional): Filter accounts by name or criteria

#### `get_visitors`
Get visitor data from Pendo.

**Parameters:**
- `limit` (optional): Maximum number of visitors (1-1000, default: 100)
- `offset` (optional): Number of visitors to skip for pagination (default: 0)
- `account_id` (optional): Filter visitors by account ID

#### `get_events`
Retrieve user interaction events.

**Parameters:**
- `visitor_id` (optional): Filter events by visitor ID
- `account_id` (optional): Filter events by account ID
- `event_name` (optional): Filter events by event name/type
- `start_date` (optional): Start date for event filtering (YYYY-MM-DD format)
- `end_date` (optional): End date for event filtering (YYYY-MM-DD format)
- `limit` (optional): Maximum number of events (1-1000, default: 100)

#### `get_feature_usage`
Get feature usage analytics.

**Parameters:**
- `start_date` (required): Start date for analytics (YYYY-MM-DD format)
- `end_date` (required): End date for analytics (YYYY-MM-DD format)
- `feature_id` (optional): Filter by specific feature ID
- `page_id` (optional): Filter by specific page ID
- `period` (optional): Aggregation period - 'day', 'week', or 'month' (default: 'day')

### Guide Management Tools

#### `get_guides`
Retrieve in-app guides.

**Parameters:**
- `state` (optional): Filter by guide state - 'active', 'inactive', 'draft', or 'all' (default: 'all')
- `limit` (optional): Maximum number of guides (1-1000, default: 100)
- `offset` (optional): Number of guides to skip for pagination (default: 0)

#### `create_guide`
Create a new in-app guide.

**Parameters:**
- `name` (required): Name of the guide
- `steps` (required): Array of guide steps
- `launch_method` (optional): How the guide launches - 'auto', 'badge', or 'dom' (default: 'auto')
- `targeting` (optional): Targeting rules for the guide

**Example:**
```json
{
  "name": "Welcome Guide",
  "steps": [
    {
      "type": "tooltip",
      "element": "#welcome-button",
      "content": "Click here to get started!"
    },
    {
      "type": "modal",
      "content": "Welcome to our application!"
    }
  ],
  "launch_method": "auto"
}
```

#### `update_guide`
Update an existing guide.

**Parameters:**
- `guide_id` (required): ID of the guide to update
- `name` (optional): New name for the guide
- `state` (optional): New state - 'active', 'inactive', or 'draft'
- `steps` (optional): Updated array of guide steps

#### `delete_guide`
Delete a guide permanently.

**Parameters:**
- `guide_id` (required): ID of the guide to delete

### Individual Resource Tools

#### `get_account`
Get detailed information about a specific account.

**Parameters:**
- `account_id` (required): ID of the account to retrieve

#### `get_visitor`
Get detailed information about a specific visitor.

**Parameters:**
- `visitor_id` (required): ID of the visitor to retrieve

#### `get_page`
Get detailed information about a specific page.

**Parameters:**
- `page_id` (required): ID of the page to retrieve

### Utility Tools

#### `test_connection`
Test the connection to Pendo API.

**Parameters:** None

## API Reference

This server integrates with the Pendo Engage API. For detailed API documentation, visit:
- [Pendo Developers Documentation](https://developers.pendo.io/)
- [Pendo Engage API](https://engageapi.pendo.io/)

## Error Handling

The server includes comprehensive error handling for:
- Invalid API credentials
- Network connectivity issues
- Invalid input parameters
- API rate limits
- Malformed requests

All errors are returned with descriptive messages to help diagnose issues.

## Development

### Project Structure

```
src/
├── index.ts          # Main entry point
├── server.ts         # MCP server implementation
├── pendo-client.ts   # Pendo API client
└── types.ts          # TypeScript type definitions
```

### Running Tests

```bash
npm test
```

### Linting and Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

### Building for Production

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
1. Check the [Pendo API documentation](https://developers.pendo.io/)
2. Review the error messages for troubleshooting hints
3. Open an issue in this repository

## Security

- Never commit API keys to version control
- Use environment variables for sensitive configuration
- Regularly rotate your Pendo API keys
- Monitor API usage for unusual activity
