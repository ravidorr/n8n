-- Pendo Workflows Database Setup Script
-- This script creates all necessary tables for Pendo n8n workflow analytics

-- Create schema if needed (optional)
-- CREATE SCHEMA IF NOT EXISTS pendo_analytics;
-- SET search_path TO pendo_analytics;

-- =====================================================
-- NPS Detractor Log Table
-- =====================================================
DROP TABLE IF EXISTS nps_detractor_log CASCADE;

CREATE TABLE nps_detractor_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  visitor_id VARCHAR(255) NOT NULL,
  visitor_email VARCHAR(255),
  visitor_name VARCHAR(255),
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  account_plan VARCHAR(100),
  account_mrr DECIMAL(10,2),
  nps_score INTEGER NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
  nps_comment TEXT,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 10),
  urgency_level VARCHAR(20),
  root_cause VARCHAR(100),
  ai_summary TEXT,
  suggested_action TEXT,
  is_high_value BOOLEAN DEFAULT FALSE,
  actions_taken JSONB,
  response_time_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_nps_visitor_id ON nps_detractor_log(visitor_id);
CREATE INDEX idx_nps_account_id ON nps_detractor_log(account_id);
CREATE INDEX idx_nps_account_name ON nps_detractor_log(account_name);
CREATE INDEX idx_nps_timestamp ON nps_detractor_log(timestamp);
CREATE INDEX idx_nps_score ON nps_detractor_log(nps_score);
CREATE INDEX idx_nps_risk_score ON nps_detractor_log(risk_score);
CREATE INDEX idx_nps_root_cause ON nps_detractor_log(root_cause);
CREATE INDEX idx_nps_high_value ON nps_detractor_log(is_high_value) WHERE is_high_value = TRUE;

-- =====================================================
-- Pendo Analytics Log Table (General Purpose)
-- =====================================================
DROP TABLE IF EXISTS pendo_analytics_log CASCADE;

CREATE TABLE pendo_analytics_log (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP NOT NULL,
  workflow_name VARCHAR(255) NOT NULL,
  workflow_execution_id VARCHAR(255),
  report_type VARCHAR(100),
  status VARCHAR(50) NOT NULL,
  summary TEXT,
  guides_updated TEXT,
  metrics JSONB,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_timestamp ON pendo_analytics_log(timestamp);
CREATE INDEX idx_analytics_workflow ON pendo_analytics_log(workflow_name);
CREATE INDEX idx_analytics_status ON pendo_analytics_log(status);
CREATE INDEX idx_analytics_type ON pendo_analytics_log(report_type);

-- =====================================================
-- Detractor Resolution Tracking
-- =====================================================
DROP TABLE IF EXISTS detractor_resolution CASCADE;

CREATE TABLE detractor_resolution (
  id SERIAL PRIMARY KEY,
  detractor_log_id INTEGER REFERENCES nps_detractor_log(id),
  visitor_id VARCHAR(255) NOT NULL,
  resolution_date TIMESTAMP,
  resolution_type VARCHAR(100), -- 'converted_passive', 'converted_promoter', 'churned', 'pending'
  follow_up_nps_score INTEGER,
  days_to_resolution INTEGER,
  resolution_notes TEXT,
  csm_email VARCHAR(255),
  ticket_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resolution_visitor ON detractor_resolution(visitor_id);
CREATE INDEX idx_resolution_type ON detractor_resolution(resolution_type);
CREATE INDEX idx_resolution_date ON detractor_resolution(resolution_date);

-- =====================================================
-- Root Cause Taxonomy
-- =====================================================
DROP TABLE IF EXISTS root_cause_taxonomy CASCADE;

CREATE TABLE root_cause_taxonomy (
  id SERIAL PRIMARY KEY,
  root_cause VARCHAR(100) UNIQUE NOT NULL,
  category VARCHAR(50),
  description TEXT,
  typical_resolution TEXT,
  avg_resolution_days INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default root causes
INSERT INTO root_cause_taxonomy (root_cause, category, description, typical_resolution) VALUES
('product_issue', 'Product', 'Bugs, crashes, or technical problems', 'Engineering fix required'),
('support_issue', 'Support', 'Poor support experience or slow response', 'Support team review and training'),
('pricing', 'Commercial', 'Price too high or poor value perception', 'Commercial discussion with sales/CSM'),
('onboarding', 'Experience', 'Difficult or incomplete onboarding', 'Implementation review and support'),
('feature_gap', 'Product', 'Missing critical functionality', 'Product roadmap consideration'),
('performance', 'Technical', 'Slow performance or reliability issues', 'Infrastructure or optimization work'),
('unknown', 'Other', 'Uncategorized or unclear feedback', 'Further investigation required');

-- =====================================================
-- Response Time Tracking
-- =====================================================
DROP TABLE IF EXISTS response_time_metrics CASCADE;

CREATE TABLE response_time_metrics (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  avg_webhook_to_slack_ms INTEGER,
  avg_webhook_to_ticket_ms INTEGER,
  avg_webhook_to_csm_task_ms INTEGER,
  total_detractors INTEGER,
  high_value_detractors INTEGER,
  critical_detractors INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_response_metrics_date ON response_time_metrics(date);

-- =====================================================
-- Views for Analytics
-- =====================================================

-- Daily NPS Summary View
CREATE OR REPLACE VIEW v_daily_nps_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_detractors,
  COUNT(CASE WHEN nps_score <= 3 THEN 1 END) as critical_count,
  COUNT(CASE WHEN is_high_value THEN 1 END) as high_value_count,
  ROUND(AVG(nps_score), 2) as avg_score,
  ROUND(AVG(risk_score), 2) as avg_risk_score,
  COUNT(DISTINCT account_id) as unique_accounts,
  STRING_AGG(DISTINCT root_cause, ', ') as root_causes
FROM nps_detractor_log
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Root Cause Distribution View
CREATE OR REPLACE VIEW v_root_cause_distribution AS
SELECT
  root_cause,
  COUNT(*) as occurrences,
  ROUND(AVG(nps_score), 2) as avg_nps_score,
  ROUND(AVG(risk_score), 2) as avg_risk_score,
  COUNT(CASE WHEN is_high_value THEN 1 END) as high_value_count,
  ROUND(COUNT(*)::numeric / SUM(COUNT(*)) OVER () * 100, 2) as percentage
FROM nps_detractor_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '90 days'
  AND root_cause IS NOT NULL
GROUP BY root_cause
ORDER BY occurrences DESC;

-- Account Health View
CREATE OR REPLACE VIEW v_account_health AS
SELECT
  account_id,
  account_name,
  account_plan,
  COUNT(*) as detractor_count,
  MIN(nps_score) as lowest_score,
  MAX(risk_score) as highest_risk,
  STRING_AGG(DISTINCT root_cause, ', ') as issues,
  MAX(timestamp) as last_detractor_date,
  BOOL_OR(is_high_value) as is_high_value_account
FROM nps_detractor_log
WHERE timestamp >= CURRENT_DATE - INTERVAL '180 days'
GROUP BY account_id, account_name, account_plan
HAVING COUNT(*) >= 2  -- Accounts with multiple detractors
ORDER BY detractor_count DESC, highest_risk DESC;

-- Resolution Performance View
CREATE OR REPLACE VIEW v_resolution_performance AS
SELECT
  dr.resolution_type,
  COUNT(*) as count,
  ROUND(AVG(dr.days_to_resolution), 1) as avg_days_to_resolve,
  ROUND(AVG(ndl.nps_score), 2) as avg_initial_score,
  ROUND(AVG(dr.follow_up_nps_score), 2) as avg_final_score,
  ROUND(AVG(dr.follow_up_nps_score - ndl.nps_score), 2) as avg_score_improvement
FROM detractor_resolution dr
JOIN nps_detractor_log ndl ON dr.detractor_log_id = ndl.id
WHERE dr.resolution_date IS NOT NULL
GROUP BY dr.resolution_type
ORDER BY count DESC;

-- =====================================================
-- Functions for Analytics
-- =====================================================

-- Function to calculate conversion rate
CREATE OR REPLACE FUNCTION calculate_detractor_conversion_rate(
  start_date DATE,
  end_date DATE
) RETURNS TABLE(
  total_detractors INTEGER,
  converted_count INTEGER,
  churned_count INTEGER,
  pending_count INTEGER,
  conversion_rate DECIMAL(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(DISTINCT ndl.id)::INTEGER as total_detractors,
    COUNT(DISTINCT CASE WHEN dr.resolution_type IN ('converted_passive', 'converted_promoter') THEN ndl.id END)::INTEGER as converted_count,
    COUNT(DISTINCT CASE WHEN dr.resolution_type = 'churned' THEN ndl.id END)::INTEGER as churned_count,
    COUNT(DISTINCT CASE WHEN dr.resolution_type = 'pending' OR dr.resolution_type IS NULL THEN ndl.id END)::INTEGER as pending_count,
    ROUND(
      COUNT(DISTINCT CASE WHEN dr.resolution_type IN ('converted_passive', 'converted_promoter') THEN ndl.id END)::DECIMAL /
      NULLIF(COUNT(DISTINCT ndl.id), 0) * 100,
      2
    ) as conversion_rate
  FROM nps_detractor_log ndl
  LEFT JOIN detractor_resolution dr ON ndl.id = dr.detractor_log_id
  WHERE ndl.timestamp BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get account risk profile
CREATE OR REPLACE FUNCTION get_account_risk_profile(
  p_account_id VARCHAR(255)
) RETURNS TABLE(
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  detractor_events INTEGER,
  avg_nps_score DECIMAL(3,1),
  latest_risk_score INTEGER,
  days_since_last_detractor INTEGER,
  recurring_issues TEXT,
  risk_level VARCHAR(20)
) AS $$
BEGIN
  RETURN QUERY
  WITH account_stats AS (
    SELECT
      ndl.account_id,
      MAX(ndl.account_name) as account_name,
      COUNT(*) as detractor_events,
      ROUND(AVG(ndl.nps_score), 1) as avg_nps_score,
      MAX(ndl.risk_score) as latest_risk_score,
      EXTRACT(DAY FROM CURRENT_DATE - MAX(ndl.timestamp))::INTEGER as days_since_last,
      STRING_AGG(DISTINCT ndl.root_cause, ', ') as recurring_issues
    FROM nps_detractor_log ndl
    WHERE ndl.account_id = p_account_id
      AND ndl.timestamp >= CURRENT_DATE - INTERVAL '180 days'
    GROUP BY ndl.account_id
  )
  SELECT
    as.account_id,
    as.account_name,
    as.detractor_events,
    as.avg_nps_score,
    as.latest_risk_score,
    as.days_since_last,
    as.recurring_issues,
    CASE
      WHEN as.detractor_events >= 3 AND as.latest_risk_score >= 8 THEN 'CRITICAL'
      WHEN as.detractor_events >= 2 AND as.latest_risk_score >= 6 THEN 'HIGH'
      WHEN as.detractor_events >= 1 AND as.latest_risk_score >= 4 THEN 'MEDIUM'
      ELSE 'LOW'
    END as risk_level
  FROM account_stats as;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Triggers for Updated Timestamps
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nps_detractor_log_updated_at
  BEFORE UPDATE ON nps_detractor_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_detractor_resolution_updated_at
  BEFORE UPDATE ON detractor_resolution
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Permissions (adjust as needed)
-- =====================================================

-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly_user;
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- =====================================================
-- Sample Queries for Testing
-- =====================================================

/*
-- Test detractor conversion rate for last 30 days
SELECT * FROM calculate_detractor_conversion_rate(
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE
);

-- Get risk profile for a specific account
SELECT * FROM get_account_risk_profile('account_123');

-- View today's summary
SELECT * FROM v_daily_nps_summary WHERE date = CURRENT_DATE;

-- Check root cause distribution
SELECT * FROM v_root_cause_distribution;
*/
