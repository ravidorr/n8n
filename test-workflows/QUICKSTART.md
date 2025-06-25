# Pendo MCP Server & n8n Workflows - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Start Pendo MCP Server

```bash
# Clone or navigate to the repository
cd packages/@n8n/mcp-pendo-server

# Set your Pendo API key
export PENDO_API_KEY="your-pendo-api-key"

# Install dependencies and start
npm install
npm run build
npm start
```

### 2. Import a Workflow into n8n

1. Open n8n in your browser
2. Click **"Import from File"**
3. Choose one of these workflows:
   - `pendo-simple-demo-fixed.json` - Basic analytics using HTTP requests
   - `pendo-ai-agent-demo.json` - AI agent with MCP tools
   - `pendo-detractor-delight.json` - Real-time NPS response system

### 3. Configure Essential Credentials

**Minimum Requirements:**
- **Pendo API Key** (already set for MCP server)
- **Slack Webhook URL** (for notifications)
- **Email SMTP** (for reports)

## 📋 Workflow Quick Reference

### Simple Analytics Workflow
**Use Case:** Weekly analytics reports
**Triggers:** Schedule (9 AM weekdays)
**Outputs:** Email, Slack, Google Sheets
**Setup Time:** 5 minutes

### Detractor Response Workflow
**Use Case:** Real-time NPS crisis management
**Triggers:** Pendo webhook on NPS submission
**Outputs:** Multi-channel alerts and tickets
**Setup Time:** 15 minutes

### AI Analytics Workflow
**Use Case:** Intelligent insights and automation
**Triggers:** Manual or scheduled
**Outputs:** AI summaries, guide management
**Setup Time:** 10 minutes

## 🔧 Common Configuration

### Environment Variables
```bash
# Required
export PENDO_API_KEY="your-api-key"
export SLACK_WEBHOOK_URL="https://hooks.slack.com/..."

# Optional
export OPENAI_API_KEY="sk-..." # For AI features
export PAGERDUTY_ROUTING_KEY="..." # For critical alerts
```

### Database Setup (Optional)
```bash
# Quick PostgreSQL setup
psql -U postgres -f test-workflows/pendo-database-setup.sql
```

## 🎯 First Steps by Role

### Product Managers
1. Import `pendo-simple-demo.json`
2. Configure Slack webhook
3. Run workflow manually to test
4. Enable weekly schedule

### Customer Success Teams
1. Import `pendo-detractor-delight.json`
2. Set up Pendo webhook for NPS
3. Configure Slack + ticketing system
4. Test with a sample NPS submission

### Data Analysts
1. Import all workflows
2. Set up PostgreSQL database
3. Configure all integrations
4. Create custom dashboards

## 🔍 Testing Your Setup

### Test MCP Server Connection
```bash
curl http://localhost:3000/health
```

### Test Workflow Execution
1. Click **"Execute Workflow"** in n8n
2. Check Slack for notifications
3. Verify email delivery
4. Review execution logs

## 📊 Sample Pendo Webhook Payload

For testing the detractor workflow:
```json
{
  "event_type": "nps_submitted",
  "visitor_id": "test_visitor_123",
  "account_id": "test_account_456",
  "score": 3,
  "comment": "Testing the workflow",
  "timestamp": "2025-01-20T15:30:00Z"
}
```

## 🆘 Quick Troubleshooting

### MCP Server Won't Start
- Check API key: `echo $PENDO_API_KEY`
- Verify Node.js version: `node --version` (v16+)
- Check port 3000 availability

### Workflow Errors
- Verify all credentials are configured
- Check n8n logs: Settings > Logs
- Test each node individually

### No Data Returned
- Confirm Pendo has data for the requested period
- Check API permissions in Pendo
- Verify account/visitor IDs exist

## 📚 Next Steps

1. **Customize Workflows:** Modify nodes to match your needs
2. **Add Integrations:** Connect more tools (HubSpot, Intercom, etc.)
3. **Build Dashboards:** Use the database logs for analytics
4. **Scale Up:** Deploy to production with proper monitoring

## 💡 Pro Tips

- Start with the simple workflow and gradually add complexity
- Use n8n's built-in error handling for production
- Set up a test Pendo account for development
- Monitor API rate limits in high-volume scenarios
- Document your customizations for team knowledge sharing

## 🔗 Resources

- **Pendo API Docs:** https://developers.pendo.io/
- **n8n Documentation:** https://docs.n8n.io/
- **MCP Protocol:** https://modelcontextprotocol.io/
- **Workflow Examples:** `/test-workflows/`
- **Database Schema:** `/test-workflows/pendo-database-setup.sql`

---

**Need Help?** Check the detailed guides:
- `pendo-workflow-setup.md` - Complete workflow documentation
- `pendo-detractor-delight-guide.md` - NPS workflow deep dive
- `packages/@n8n/mcp-pendo-server/README.md` - MCP server details
