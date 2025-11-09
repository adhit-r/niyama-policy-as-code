import axios, { AxiosInstance, AxiosError } from 'axios';
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

    // Response interceptor with retry logic
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;
        
        // Don't retry if already retried or if it's not a server error
        if (config._retryCount >= 3 || !error.response || error.response.status < 500) {
          if (error.response?.status === 401) {
            // Redirect to sign-in if unauthorized
            window.location.href = '/sign-in';
          }
          return Promise.reject(error);
        }

        // Retry logic for server errors
        config._retryCount = (config._retryCount || 0) + 1;
        const delay = Math.pow(2, config._retryCount) * 1000; // Exponential backoff
        
        console.log(`Retrying request (attempt ${config._retryCount}/3) after ${delay}ms`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.api(config);
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

  // User Stats
  async getUserStats(): Promise<any> {
    const response = await this.api.get('/user/stats');
    return response.data;
  }

  // Policy History
  async getPolicyHistory(limit?: number): Promise<any[]> {
    const response = await this.api.get('/history', { 
      params: { limit: limit || 10 } 
    });
    return response.data.evaluations || [];
  }

  // Validation
  async validateIaC(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await this.api.post('/validate/iac', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Detect endpoint (alias for validate)
  async detectUpload(files: File[]): Promise<any> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    
    const response = await this.api.post('/detect/test-upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const api = new ApiService();