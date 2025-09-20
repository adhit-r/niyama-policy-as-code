-- Niyama Database Schema
-- Policy as Code Platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM (
    'admin',
    'compliance_officer',
    'devsecops_engineer',
    'platform_engineer',
    'viewer'
);

CREATE TYPE policy_language AS ENUM (
    'rego',
    'yaml',
    'json'
);

CREATE TYPE policy_category AS ENUM (
    'security',
    'compliance',
    'resource_management',
    'data_governance',
    'network',
    'rbac',
    'image_scanning'
);

CREATE TYPE policy_severity AS ENUM (
    'low',
    'medium',
    'high',
    'critical'
);

CREATE TYPE policy_result AS ENUM (
    'allow',
    'deny',
    'warn'
);

CREATE TYPE violation_status AS ENUM (
    'open',
    'acknowledged',
    'resolved',
    'suppressed'
);

CREATE TYPE parameter_type AS ENUM (
    'string',
    'number',
    'boolean',
    'array',
    'object'
);

CREATE TYPE mapping_type AS ENUM (
    'direct',
    'indirect',
    'partial'
);

CREATE TYPE evidence_type AS ENUM (
    'policy_code',
    'configuration',
    'log_entry',
    'screenshot',
    'document',
    'test_result'
);

CREATE TYPE report_status AS ENUM (
    'draft',
    'in_progress',
    'completed',
    'expired'
);

CREATE TYPE compliance_status AS ENUM (
    'compliant',
    'non_compliant',
    'partial',
    'not_applicable'
);

CREATE TYPE optimization_type AS ENUM (
    'performance',
    'security',
    'compliance',
    'readability'
);

CREATE TYPE health_status AS ENUM (
    'healthy',
    'degraded',
    'unhealthy'
);

CREATE TYPE alert_type AS ENUM (
    'policy_violation',
    'system_error',
    'compliance_breach',
    'performance_degradation',
    'security_incident'
);

CREATE TYPE alert_status AS ENUM (
    'active',
    'acknowledged',
    'resolved',
    'suppressed'
);

CREATE TYPE subscription_plan AS ENUM (
    'starter',
    'professional',
    'enterprise',
    'enterprise_plus'
);

CREATE TYPE integration_type AS ENUM (
    'slack',
    'email',
    'pagerduty',
    'webhook',
    'siem',
    'gitops'
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    plan subscription_plan NOT NULL DEFAULT 'starter',
    is_active BOOLEAN NOT NULL DEFAULT true,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'viewer',
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Policies table
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    language policy_language NOT NULL,
    category policy_category NOT NULL,
    severity policy_severity NOT NULL DEFAULT 'medium',
    is_active BOOLEAN NOT NULL DEFAULT true,
    version INTEGER NOT NULL DEFAULT 1,
    author_id UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Policy templates table
CREATE TABLE policy_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    language policy_language NOT NULL,
    category policy_category NOT NULL,
    parameters JSONB NOT NULL DEFAULT '[]',
    is_public BOOLEAN NOT NULL DEFAULT false,
    author_id UUID NOT NULL REFERENCES users(id),
    download_count INTEGER NOT NULL DEFAULT 0,
    rating DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Compliance frameworks table
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(50) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Compliance controls table
CREATE TABLE compliance_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    evidence_types evidence_type[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(framework_id, code)
);

-- Policy mappings table
CREATE TABLE policy_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,
    mapping_type mapping_type NOT NULL,
    confidence DECIMAL(3,2) NOT NULL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(policy_id, control_id)
);

-- Evidence table
CREATE TABLE evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mapping_id UUID NOT NULL REFERENCES policy_mappings(id) ON DELETE CASCADE,
    type evidence_type NOT NULL,
    content TEXT NOT NULL,
    source VARCHAR(255) NOT NULL,
    collected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    is_valid BOOLEAN NOT NULL DEFAULT true
);

-- Policy evaluations table
CREATE TABLE policy_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    result policy_result NOT NULL,
    evaluated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB NOT NULL DEFAULT '{}'
);

-- Policy violations table
CREATE TABLE policy_violations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    resource_id VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity policy_severity NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    status violation_status NOT NULL DEFAULT 'open'
);

-- Compliance reports table
CREATE TABLE compliance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    framework_id UUID NOT NULL REFERENCES compliance_frameworks(id),
    status report_status NOT NULL DEFAULT 'draft',
    score DECIMAL(5,2) NOT NULL DEFAULT 0.0,
    total_controls INTEGER NOT NULL DEFAULT 0,
    compliant_controls INTEGER NOT NULL DEFAULT 0,
    non_compliant_controls INTEGER NOT NULL DEFAULT 0,
    partial_controls INTEGER NOT NULL DEFAULT 0,
    generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Compliance findings table
CREATE TABLE compliance_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES compliance_reports(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES compliance_controls(id),
    status compliance_status NOT NULL,
    severity policy_severity NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT,
    remediation_steps TEXT[] NOT NULL DEFAULT '{}'
);

-- Alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type alert_type NOT NULL,
    severity policy_severity NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    resource_id VARCHAR(255),
    policy_id UUID REFERENCES policies(id) ON DELETE SET NULL,
    status alert_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Integrations table
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    type integration_type NOT NULL,
    name VARCHAR(255) NOT NULL,
    configuration JSONB NOT NULL DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_policies_organization_id ON policies(organization_id);
CREATE INDEX idx_policies_category ON policies(category);
CREATE INDEX idx_policies_severity ON policies(severity);
CREATE INDEX idx_policies_is_active ON policies(is_active);
CREATE INDEX idx_policy_templates_category ON policy_templates(category);
CREATE INDEX idx_policy_templates_is_public ON policy_templates(is_public);
CREATE INDEX idx_policy_mappings_policy_id ON policy_mappings(policy_id);
CREATE INDEX idx_policy_mappings_control_id ON policy_mappings(control_id);
CREATE INDEX idx_policy_evaluations_policy_id ON policy_evaluations(policy_id);
CREATE INDEX idx_policy_evaluations_evaluated_at ON policy_evaluations(evaluated_at);
CREATE INDEX idx_policy_violations_policy_id ON policy_violations(policy_id);
CREATE INDEX idx_policy_violations_status ON policy_violations(status);
CREATE INDEX idx_policy_violations_detected_at ON policy_violations(detected_at);
CREATE INDEX idx_compliance_reports_organization_id ON compliance_reports(organization_id);
CREATE INDEX idx_compliance_reports_framework_id ON compliance_reports(framework_id);
CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_created_at ON alerts(created_at);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policy_templates_updated_at BEFORE UPDATE ON policy_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_frameworks_updated_at BEFORE UPDATE ON compliance_frameworks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_controls_updated_at BEFORE UPDATE ON compliance_controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_compliance_reports_updated_at BEFORE UPDATE ON compliance_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default compliance frameworks
INSERT INTO compliance_frameworks (name, version, description) VALUES
('SOC 2 Type II', '2017', 'Trust Services Criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy'),
('HIPAA', '2023', 'Health Insurance Portability and Accountability Act'),
('GDPR', '2018', 'General Data Protection Regulation'),
('ISO 27001', '2022', 'Information Security Management System'),
('ISO 42001', '2023', 'AI Management System Requirements'),
('PCI DSS', '4.0', 'Payment Card Industry Data Security Standard'),
('NIST Cybersecurity Framework', '2.0', 'Framework for Improving Critical Infrastructure Cybersecurity'),
('CIS Controls', '8.0', 'Center for Internet Security Controls');

-- Insert default policy templates
INSERT INTO policy_templates (name, description, content, language, category, is_public, author_id) VALUES
('RBAC - Admin Only', 'Restrict admin access to specific users', 'package kubernetes.admission

import rego.v1

deny contains msg if {
    input.request.kind.kind == "Role"
    input.request.kind.group == "rbac.authorization.k8s.io"
    input.request.operation == "CREATE"
    not "admin" in input.request.object.metadata.labels
    msg := "Only admin roles are allowed"
}', 'rego', 'rbac', true, (SELECT id FROM users LIMIT 1)),
('Resource Limits', 'Enforce resource limits on containers', 'package kubernetes.admission

import rego.v1

deny contains msg if {
    input.request.kind.kind == "Pod"
    input.request.operation == "CREATE"
    container := input.request.object.spec.containers[_]
    not container.resources.limits.memory
    msg := sprintf("Container %v must have memory limits", [container.name])
}', 'rego', 'resource_management', true, (SELECT id FROM users LIMIT 1)),
('Network Policy', 'Require network policies for namespaces', 'package kubernetes.admission

import rego.v1

deny contains msg if {
    input.request.kind.kind == "Namespace"
    input.request.operation == "CREATE"
    not input.request.object.metadata.labels["network-policy"]
    msg := "Namespaces must have network policies"
}', 'rego', 'network', true, (SELECT id FROM users LIMIT 1));

