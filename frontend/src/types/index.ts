// User and Authentication Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  ADMIN = 'admin',
  COMPLIANCE_OFFICER = 'compliance_officer',
  DEVSECOPS_ENGINEER = 'devsecops_engineer',
  PLATFORM_ENGINEER = 'platform_engineer',
  VIEWER = 'viewer',
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

// Policy Types
export interface Policy {
  id: string;
  name: string;
  description: string;
  content: string;
  language: PolicyLanguage;
  category: PolicyCategory;
  severity: PolicySeverity;
  isActive: boolean;
  version: number;
  authorId: string;
  organizationId: string;
  tags: string[];
  complianceMappings: ComplianceMapping[];
  createdAt: string;
  updatedAt: string;
}

export enum PolicyLanguage {
  REGO = 'rego',
  YAML = 'yaml',
  JSON = 'json',
}

export enum PolicyCategory {
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  RESOURCE_MANAGEMENT = 'resource_management',
  DATA_GOVERNANCE = 'data_governance',
  NETWORK = 'network',
  RBAC = 'rbac',
  IMAGE_SCANNING = 'image_scanning',
}

export enum PolicySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface PolicyEvaluation {
  id: string;
  policyId: string;
  resourceId: string;
  resourceType: string;
  result: PolicyResult;
  violations: PolicyViolation[];
  evaluatedAt: string;
  metadata: Record<string, any>;
}

export enum PolicyResult {
  ALLOW = 'allow',
  DENY = 'deny',
  WARN = 'warn',
}

export interface PolicyViolation {
  id: string;
  policyId: string;
  resourceId: string;
  message: string;
  severity: PolicySeverity;
  detectedAt: string;
  resolvedAt?: string;
  status: ViolationStatus;
}

export enum ViolationStatus {
  OPEN = 'open',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
}

// Template Types
export interface PolicyTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  language: PolicyLanguage;
  category: PolicyCategory;
  parameters: TemplateParameter[];
  complianceMappings: ComplianceMapping[];
  isPublic: boolean;
  authorId: string;
  downloadCount: number;
  rating: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: any[];
}

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
}

// Compliance Types
export interface ComplianceFramework {
  id: string;
  name: string;
  version: string;
  description: string;
  controls: ComplianceControl[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceControl {
  id: string;
  frameworkId: string;
  code: string;
  title: string;
  description: string;
  category: string;
  requirements: string[];
  evidenceTypes: EvidenceType[];
  mappings: PolicyMapping[];
}

export interface PolicyMapping {
  policyId: string;
  controlId: string;
  mappingType: MappingType;
  confidence: number;
  evidence: Evidence[];
  createdAt: string;
}

export enum MappingType {
  DIRECT = 'direct',
  INDIRECT = 'indirect',
  PARTIAL = 'partial',
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  content: string;
  source: string;
  collectedAt: string;
  isValid: boolean;
}

export enum EvidenceType {
  POLICY_CODE = 'policy_code',
  CONFIGURATION = 'configuration',
  LOG_ENTRY = 'log_entry',
  SCREENSHOT = 'screenshot',
  DOCUMENT = 'document',
  TEST_RESULT = 'test_result',
}

export interface ComplianceMapping {
  frameworkId: string;
  controlId: string;
  mappingType: MappingType;
  confidence: number;
  evidence: Evidence[];
}

export interface ComplianceReport {
  id: string;
  organizationId: string;
  frameworkId: string;
  status: ReportStatus;
  score: number;
  totalControls: number;
  compliantControls: number;
  nonCompliantControls: number;
  partialControls: number;
  generatedAt: string;
  validUntil: string;
  findings: ComplianceFinding[];
}

export enum ReportStatus {
  DRAFT = 'draft',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

export interface ComplianceFinding {
  id: string;
  controlId: string;
  status: ComplianceStatus;
  severity: PolicySeverity;
  description: string;
  recommendation: string;
  evidence: Evidence[];
  remediationSteps: string[];
}

export enum ComplianceStatus {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIAL = 'partial',
  NOT_APPLICABLE = 'not_applicable',
}

// AI Types
export interface AIPolicyGenerationRequest {
  description: string;
  category: PolicyCategory;
  language: PolicyLanguage;
  framework?: string;
  context?: Record<string, any>;
}

export interface AIPolicyGenerationResponse {
  policy: string;
  explanation: string;
  confidence: number;
  suggestions: string[];
  complianceMappings: ComplianceMapping[];
}

export interface AIPolicyOptimizationRequest {
  policyId: string;
  optimizationType: OptimizationType;
  context?: Record<string, any>;
}

export enum OptimizationType {
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  READABILITY = 'readability',
}

export interface AIPolicyOptimizationResponse {
  originalPolicy: string;
  optimizedPolicy: string;
  improvements: PolicyImprovement[];
  confidence: number;
}

export interface PolicyImprovement {
  type: string;
  description: string;
  impact: string;
  code: string;
}

// Monitoring Types
export interface Metrics {
  timestamp: string;
  policyEvaluations: number;
  violations: number;
  complianceScore: number;
  systemHealth: SystemHealth;
}

export interface SystemHealth {
  status: HealthStatus;
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

export enum HealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
}

export interface Alert {
  id: string;
  type: AlertType;
  severity: PolicySeverity;
  title: string;
  message: string;
  resourceId?: string;
  policyId?: string;
  status: AlertStatus;
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
}

export enum AlertType {
  POLICY_VIOLATION = 'policy_violation',
  SYSTEM_ERROR = 'system_error',
  COMPLIANCE_BREACH = 'compliance_breach',
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  SECURITY_INCIDENT = 'security_incident',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  SUPPRESSED = 'suppressed',
}

// Organization Types
export interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: SubscriptionPlan;
  isActive: boolean;
  settings: OrganizationSettings;
  createdAt: string;
  updatedAt: string;
}

export enum SubscriptionPlan {
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  ENTERPRISE_PLUS = 'enterprise_plus',
}

export interface OrganizationSettings {
  maxPolicies: number;
  maxUsers: number;
  allowedFrameworks: string[];
  features: string[];
  integrations: Integration[];
}

export interface Integration {
  id: string;
  type: IntegrationType;
  name: string;
  configuration: Record<string, any>;
  isActive: boolean;
  lastSyncAt?: string;
}

export enum IntegrationType {
  SLACK = 'slack',
  EMAIL = 'email',
  PAGERDUTY = 'pagerduty',
  WEBHOOK = 'webhook',
  SIEM = 'siem',
  GITOPS = 'gitops',
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Request Types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  category?: string;
  severity?: string;
  status?: string;
  framework?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}



