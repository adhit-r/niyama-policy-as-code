import axios, { AxiosInstance } from 'axios';
import { 
  Policy,
  PolicyTemplate,
  ComplianceFramework,
  ComplianceReport,
  AIPolicyGenerationRequest,
  AIPolicyGenerationResponse,
  PaginatedResponse,
  PaginationParams,
  FilterParams
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - will be updated to use Clerk session token
    this.api.interceptors.request.use(
      (config) => {
        // Clerk will handle authentication via session tokens
        // The backend will verify the session token
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Redirect to sign-in if unauthorized
          window.location.href = '/sign-in';
        }
        return Promise.reject(error);
      }
    );
  }

  // Policy Management
  async getPolicies(params?: PaginationParams & FilterParams): Promise<PaginatedResponse<Policy>> {
    const response = await this.api.get('/policies', { params });
    return response.data;
  }

  async getPolicy(id: string): Promise<Policy> {
    const response = await this.api.get(`/policies/${id}`);
    return response.data;
  }

  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Promise<Policy> {
    const response = await this.api.post('/policies', policy);
    return response.data;
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    const response = await this.api.put(`/policies/${id}`, policy);
    return response.data;
  }

  async deletePolicy(id: string): Promise<void> {
    await this.api.delete(`/policies/${id}`);
  }

  async testPolicy(id: string, input: any): Promise<any> {
    const response = await this.api.post(`/policies/${id}/test`, { input });
    return response.data;
  }

  // Template Management
  async getTemplates(params?: PaginationParams & FilterParams): Promise<PaginatedResponse<PolicyTemplate>> {
    const response = await this.api.get('/templates', { params });
    return response.data;
  }

  async getTemplate(id: string): Promise<PolicyTemplate> {
    const response = await this.api.get(`/templates/${id}`);
    return response.data;
  }

  async createTemplate(template: Omit<PolicyTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<PolicyTemplate> {
    const response = await this.api.post('/templates', template);
    return response.data;
  }

  async updateTemplate(id: string, template: Partial<PolicyTemplate>): Promise<PolicyTemplate> {
    const response = await this.api.put(`/templates/${id}`, template);
    return response.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.api.delete(`/templates/${id}`);
  }

  // Compliance Management
  async getFrameworks(): Promise<ComplianceFramework[]> {
    const response = await this.api.get('/compliance/frameworks');
    return response.data;
  }

  async getComplianceReport(frameworkId: string): Promise<ComplianceReport> {
    const response = await this.api.get(`/compliance/reports/${frameworkId}`);
    return response.data;
  }

  async generateComplianceReport(frameworkId: string): Promise<ComplianceReport> {
    const response = await this.api.post(`/compliance/reports/${frameworkId}/generate`);
    return response.data;
  }

  // AI Policy Generation
  async generatePolicy(request: AIPolicyGenerationRequest): Promise<AIPolicyGenerationResponse> {
    const response = await this.api.post('/ai/generate-policy', request);
    return response.data;
  }

  // Monitoring
  async getMetrics(): Promise<any> {
    const response = await this.api.get('/monitoring/metrics');
    return response.data;
  }

  async getAlerts(limit?: number): Promise<any[]> {
    const response = await this.api.get('/monitoring/alerts', { 
      params: { limit: limit || 10 } 
    });
    return response.data;
  }

  // Analytics
  async getAnalytics(timeRange?: string): Promise<any> {
    const response = await this.api.get('/analytics', { 
      params: { timeRange: timeRange || '7d' } 
    });
    return response.data;
  }

  // User Management (for admin users)
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUser(id: string): Promise<any> {
    const response = await this.api.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, user: Partial<any>): Promise<any> {
    const response = await this.api.put(`/users/${id}`, user);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }
}

export const api = new ApiService();