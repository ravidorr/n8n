# Pendo MCP Server n8n Workflows

This directory contains n8n workflows that demonstrate integration with the Pendo MCP Server for analytics and user engagement automation.

## Workflows

### 1. Pendo MCP Server Demo - Analytics and Guide Management
**File:** `pendo-mcp-demo.json`

A comprehensive workflow that showcases:
- AI-powered analytics using GPT-4 integration
- Automated guide creation and management
- Email reporting with formatted HTML
- Slack notifications
- Database logging
- Event analysis and dashboard generation

### 2. Pendo MCP Server - Simple Demo
**File:** `pendo-simple-demo.json`

A straightforward workflow that demonstrates:
- Basic Pendo data retrieval (pages, accounts, visitors, features)
- Data processing and report generation
- Multiple output channels (Email, Google Sheets, Slack)
- Scheduled execution (weekdays at 9 AM)
- Automated onboarding guide creation

### 3. Pendo Proactive Detractor-to-Delight Workflow
**File:** `pendo-detractor-delight.json`

A real-time NPS detractor response system that:
- Triggers instantly on NPS submissions via webhook
- Filters and enriches detractor data with AI analysis
- Orchestrates multi-channel responses (Slack, Zendesk, Jira, Salesforce)
- Prioritizes high-value accounts with escalation paths
- Logs all interactions for ROI measurement
- Includes PagerDuty alerts for critical scores

## Prerequisites

### 1. Pendo MCP Server Setup
First, ensure the Pendo MCP server is running:

```bash
cd packages/@n8n/mcp-pendo-server
export PENDO_API_KEY="your-pendo-api-key"
npm run dev
```

### 2. Required n8n Credentials

#### SMTP Email (for email reports)
```
Host: smtp.company.com
Port: 587
Username: your-email@company.com
Password: your-app-password
```

#### Google Sheets OAuth2 (for data logging)
- Create a Google Cloud Project
- Enable Google Sheets API
- Create OAuth2 credentials
- Configure in n8n

#### Slack Webhook (for notifications)
- Create a Slack app
- Add incoming webhook
- Copy webhook URL to workflow

#### PostgreSQL (for advanced logging)
```
Host: localhost
Port: 5432
Database: analytics
Username: analytics_user
Password: secure_password
```

## Setup Instructions

### 1. Import Workflows

1. Open n8n interface
2. Click "Import from file"
3. Upload `pendo-simple-demo.json` or `pendo-mcp-demo.json`
4. Configure credentials for each node

### 2. Configure MCP Client Nodes

Ensure the MCP Client Tool nodes point to your running Pendo MCP server:
- **Server URL:** `http://localhost:3000/pendo-analytics`
- **Authentication:** None (or configure if secured)

### 3. Update Node Parameters

#### Email Nodes
- Update recipient addresses
- Configure SMTP credentials

#### Google Sheets Node
- Replace document ID with your sheet ID
- Update sheet name if different

#### Slack Nodes
- Replace webhook URL with your Slack webhook
- Customize message format as needed

### 4. Test the Workflow

1. **Manual Test:** Click "Execute Workflow" to test manually
2. **Check Outputs:** Verify email, Slack, and Google Sheets outputs
3. **Schedule:** Enable the cron trigger for automated execution

## Workflow Features

### Data Collection
- **Pages:** Retrieves page view analytics
- **Accounts:** Gets account/organization data
- **Visitors:** Fetches user behavior data
- **Feature Usage:** Analyzes feature adoption

### Processing & Analysis
- Merges data from multiple Pendo endpoints
- Processes and formats analytics into readable reports
- Calculates visitor insights (new vs returning)
- Identifies top-performing pages and features

### Output Channels
- **Email:** HTML formatted reports to stakeholders
- **Google Sheets:** Structured data logging for trending
- **Slack:** Real-time notifications with key metrics
- **Database:** Historical logging for advanced analytics

### Guide Management
- Automatically creates onboarding guides
- Updates existing guides based on analytics
- Targets low-engagement pages for improvement

## Customization

### Adding New Pendo Tools
To use additional MCP tools, add new MCP Client Tool nodes:

```json
{
  "parameters": {
    "toolName": "get-events",
    "arguments": {
      "period": "last_24_hours",
      "limit": 50
    }
  }
}
```

### Custom Report Formatting
Modify the "Process Analytics Data" code node to change report structure:

```javascript
// Custom formatting example
const customReport = {
  period: "weekly",
  metrics: {
    engagement_rate: calculateEngagement(visitors, events),
    conversion_funnel: buildFunnel(pages, events),
    feature_adoption: analyzeFeatures(featureUsage)
  }
};
```

### Schedule Modifications
Update the cron trigger for different schedules:
- **Daily:** `0 9 * * *`
- **Weekly:** `0 9 * * 1` (Mondays at 9 AM)
- **Monthly:** `0 9 1 * *` (First day of month)

## Troubleshooting

### Common Issues

1. **MCP Server Connection Failed**
   - Verify server is running on correct port
   - Check firewall settings
   - Confirm API key is valid

2. **Pendo API Rate Limits**
   - Reduce request frequency
   - Implement retry logic
   - Cache responses when possible

3. **Missing Data in Reports**
   - Check Pendo data availability
   - Verify time periods in requests
   - Review error handling in workflows

### Debug Mode
Enable debug mode in n8n:
1. Set `N8N_LOG_LEVEL=debug`
2. Check execution logs for detailed error messages
3. Test individual nodes separately

## Best Practices

1. **Error Handling:** Use IF nodes to check for data availability
2. **Rate Limiting:** Add delays between Pendo API calls
3. **Data Validation:** Verify data structure before processing
4. **Monitoring:** Set up alerts for workflow failures
5. **Security:** Store API keys in n8n credentials, not in workflow

## Support

For issues with:
- **MCP Server:** Check the server logs and API connectivity
- **n8n Workflows:** Review node configurations and credentials
- **Pendo API:** Consult Pendo documentation and API limits
