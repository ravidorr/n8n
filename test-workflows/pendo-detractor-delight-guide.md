# Pendo Proactive Detractor-to-Delight Workflow Guide

## Overview

The **Proactive Detractor-to-Delight Workflow** transforms negative NPS feedback from a lagging indicator into a real-time, actionable event. This workflow enables your customer success and product teams to intervene before a detractor churns, turning a reactive process into a proactive one.

## Workflow Architecture

### Real-time Processing Flow
```
Pendo NPS Webhook → Filter Detractors → Enrich Context → AI Analysis → Multi-Channel Actions
```

### Key Features
- **Instant Response**: Processes NPS submissions in real-time
- **Intelligent Filtering**: Automatically identifies detractors (scores 0-6)
- **Context Enrichment**: Pulls visitor and account data from Pendo
- **AI-Powered Analysis**: Uses GPT-4 to analyze feedback and suggest actions
- **Multi-Channel Orchestration**: Notifies teams via Slack, creates tickets, and assigns tasks
- **Risk-Based Prioritization**: Escalates high-value accounts to leadership

## Setup Instructions

### Prerequisites

1. **Pendo MCP Server**: Ensure the server is running (see main README)
2. **API Keys & Credentials**:
   - Pendo API Key (for MCP server)
   - OpenAI API Key (for GPT-4 analysis)
   - Slack Webhook URL
   - Zendesk/Jira credentials
   - Salesforce OAuth2 (for high-value accounts)
   - SMTP credentials (for email alerts)
   - PostgreSQL database (for logging)
   - PagerDuty webhook (optional, for critical alerts)

### Step 1: Configure Pendo Webhook

1. In Pendo, navigate to **Settings > Webhooks**
2. Create a new webhook with:
   - **Event**: NPS Submitted
   - **URL**: `https://your-n8n-instance.com/webhook/pendo-nps-webhook`
   - **Method**: POST
   - **Headers**:
     ```json
     {
       "Content-Type": "application/json",
       "X-Pendo-Signature": "your-webhook-secret"
     }
     ```

3. Expected webhook payload format:
   ```json
   {
     "event_type": "nps_submitted",
     "visitor_id": "visitor_123",
     "account_id": "account_456",
     "score": 3,
     "comment": "The product is too slow and crashes frequently",
     "timestamp": "2025-01-20T15:30:00Z"
   }
   ```

### Step 2: Import and Configure Workflow

1. Import `pendo-detractor-delight.json` into n8n
2. Configure credentials for each integration:

#### Slack Configuration
- Create incoming webhook in Slack
- Set `SLACK_WEBHOOK_URL` environment variable
- Choose target channel (default: #customer-feedback)

#### Zendesk Configuration
- Use OAuth2 authentication
- Configure custom fields:
  - `custom_field_nps_score`
  - `custom_field_account_mrr`

#### Jira Configuration
- Connect Jira Cloud instance
- Set project key (default: "CS")
- Map custom fields as needed

#### Salesforce Configuration
- Enable OAuth2 integration
- Ensure CSM emails are stored in account metadata
- Create custom fields:
  - `NPS_Score__c`
  - `Risk_Score__c`
  - `Detractor_Root_Cause__c`

### Step 3: Database Setup

Create the logging table in PostgreSQL:

```sql
CREATE TABLE nps_detractor_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  visitor_id VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  account_name VARCHAR(255),
  nps_score INTEGER NOT NULL,
  nps_comment TEXT,
  risk_score INTEGER,
  root_cause VARCHAR(100),
  ai_summary TEXT,
  is_high_value BOOLEAN,
  actions_taken JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_visitor_id ON nps_detractor_log(visitor_id);
CREATE INDEX idx_account_name ON nps_detractor_log(account_name);
CREATE INDEX idx_timestamp ON nps_detractor_log(timestamp);
```

### Step 4: Environment Variables

Set the following environment variables in n8n:

```bash
# Required
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
OPENAI_API_KEY=sk-your-openai-api-key

# Optional (for critical alerts)
PAGERDUTY_WEBHOOK_URL=https://events.pagerduty.com/v2/enqueue
PAGERDUTY_ROUTING_KEY=your-routing-key
```

## Workflow Logic

### 1. Detractor Identification
- **Score Range**: 0-6 (configurable)
- **Urgency Levels**:
  - CRITICAL: Score 0-3
  - HIGH: Score 4-6

### 2. Context Enrichment
The workflow enriches NPS data with:
- **Visitor Details**: Email, name, role, creation date
- **Account Information**: Name, plan, MRR, support tier
- **Calculated Metrics**:
  - Account age in days
  - Risk score (0-10 based on multiple factors)
  - High-value indicator (Enterprise plan or MRR > $5000)

### 3. AI Analysis
GPT-4 analyzes the feedback to provide:
- **Summary**: Main complaint in 1-2 sentences
- **Root Cause**: Categorized as:
  - Product issue
  - Support issue
  - Pricing concern
  - Onboarding problem
  - Feature gap
  - Performance issue
- **Immediate Action**: Specific recommendation
- **Risk Assessment**: Low/Medium/High/Critical

### 4. Multi-Channel Response

#### For All Detractors:
1. **Slack Alert**: Rich notification with buttons
2. **Support Ticket**: Zendesk or Jira issue
3. **Database Log**: Complete record for analytics

#### For High-Value Accounts:
4. **Salesforce Task**: Assigned to CSM with 24-hour SLA
5. **Email Alert**: HTML email to CSM with action buttons

#### For Zero Scores:
6. **PagerDuty Alert**: Critical incident for immediate response

## Customization Options

### Modify Detractor Threshold
Change the score range in the "Is Detractor?" node:
```javascript
// Current: 0-6
// To change to 0-4:
value2: 4 // instead of 6
```

### Adjust Risk Calculation
Edit the `calculateRiskScore` function in "Enrich Context":
```javascript
function calculateRiskScore(npsScore, isHighValue, accountAge) {
  let risk = 10 - npsScore; // Base risk
  if (isHighValue) risk += 3; // Increase for high-value
  if (accountAge < 90) risk += 2; // Increase for new accounts
  // Add custom factors:
  if (previousChurn) risk += 2;
  return Math.min(risk, 10);
}
```

### Custom Slack Messages
Modify the Slack block kit format for different styles:
```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Your custom message"
      }
    }
  ]
}
```

### Add Additional Integrations
To add more tools (e.g., Intercom, HubSpot):
1. Add new nodes after "Combine Data"
2. Use the enriched data object
3. Configure error handling with `continueOnFail`

## Monitoring & Analytics

### Key Metrics to Track
1. **Response Time**: Webhook receipt to first action
2. **Resolution Rate**: Detractors converted to passives/promoters
3. **Root Cause Distribution**: Most common issues
4. **CSM Response Time**: Task creation to first contact

### SQL Queries for Analysis

**Daily Detractor Summary**:
```sql
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_detractors,
  AVG(nps_score) as avg_score,
  AVG(risk_score) as avg_risk,
  COUNT(CASE WHEN is_high_value THEN 1 END) as high_value_count
FROM nps_detractor_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(timestamp)
ORDER BY date DESC;
```

**Root Cause Analysis**:
```sql
SELECT
  root_cause,
  COUNT(*) as occurrences,
  AVG(nps_score) as avg_score,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM nps_detractor_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY root_cause
ORDER BY occurrences DESC;
```

## Best Practices

### 1. Response Time Goals
- **Critical (0-3)**: Respond within 2 hours
- **High (4-6)**: Respond within 24 hours
- **High-Value**: Always within 4 hours

### 2. Follow-up Templates
Create email templates for common root causes:
- Product issues → Engineering escalation
- Support issues → Support team review
- Pricing concerns → Sales/CSM discussion
- Feature gaps → Product roadmap review

### 3. Escalation Matrix
| Score | Account Type | Response Owner | SLA |
|-------|-------------|----------------|-----|
| 0-3 | Enterprise | VP of CS | 2 hours |
| 0-3 | Standard | CS Manager | 4 hours |
| 4-6 | Enterprise | CSM | 24 hours |
| 4-6 | Standard | Support Team | 48 hours |

### 4. Continuous Improvement
- Weekly review of AI summaries for accuracy
- Monthly analysis of root causes
- Quarterly review of resolution rates
- Adjust risk scoring based on churn correlation

## Troubleshooting

### Common Issues

**Webhook Not Triggering**
- Verify webhook URL is publicly accessible
- Check Pendo webhook logs for errors
- Ensure webhook signature validation (if enabled)

**Missing Visitor/Account Data**
- Confirm Pendo API permissions
- Check if visitor exists in Pendo
- Verify account association

**AI Analysis Failing**
- Check OpenAI API key and credits
- Review prompt for edge cases
- Add error handling for malformed responses

**Ticket Creation Errors**
- Verify API credentials are current
- Check required custom fields exist
- Review API rate limits

### Debug Mode
Enable detailed logging:
1. Set workflow settings > Error Workflow
2. Add console.log statements in code nodes
3. Use n8n execution logs for troubleshooting

## ROI Measurement

### Calculate Impact
Track these metrics before and after implementation:
- **Detractor Recovery Rate**: % converted to passive/promoter
- **Response Time Reduction**: Hours saved per incident
- **Churn Prevention**: Revenue saved from at-risk accounts
- **Team Efficiency**: Tickets resolved per CSM

### Success Stories Template
Document wins to demonstrate value:
```
Customer: [Account Name]
Issue: [Root Cause]
Response Time: [X hours]
Action Taken: [Summary]
Result: [Outcome - retained, upgraded, etc.]
Revenue Impact: $[Amount]
```

## Advanced Features

### 1. Sentiment Trending
Track NPS trajectory per account:
```javascript
// Add to enrichment logic
const trend = calculateTrend(
  previousScores,
  currentScore
);
```

### 2. Predictive Churn Risk
Integrate with ML models:
```javascript
// Call churn prediction API
const churnProbability = await predictChurn({
  nps_score: data.nps_score,
  account_age: data.account_age_days,
  usage_metrics: data.usage_data
});
```

### 3. Automated Playbooks
Create response templates based on patterns:
- Low usage + low NPS → Onboarding intervention
- High usage + low NPS → Performance optimization
- New account + low NPS → Implementation review

## Conclusion

The Proactive Detractor-to-Delight Workflow transforms your NPS program from a quarterly survey into a real-time customer success engine. By combining Pendo's analytics with n8n's automation capabilities, you can respond to at-risk customers in minutes rather than days, dramatically improving retention and customer satisfaction.

Remember: The goal isn't just to respond quickly, but to respond intelligently with the right message, through the right channel, to the right person. This workflow provides the framework – your team's expertise provides the human touch that turns detractors into promoters.