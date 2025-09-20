import axios, { AxiosInstance } from 'axios';
import { 
  User, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest,
  Policy,
  PolicyTemplate,
  ComplianceFramework,
  ComplianceReport,
  AIPolicyGenerationRequest,
  AIPolicyGenerationResponse,
  ApiResponse,
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

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_tokens');
        if (token) {
          const { accessToken } = JSON.parse(token);
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
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
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const token = localStorage.getItem('auth_tokens');
            if (token) {
              const { refreshToken } = JSON.parse(token);
              const response = await this.refreshToken(refreshToken);
              
              localStorage.setItem('auth_tokens', JSON.stringify(response.tokens));
              originalRequest.headers.Authorization = `Bearer ${response.tokens.accessToken}`;
              
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('auth_tokens');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/login', credentials);
    return response.data.data!;
  }

  async register(data: RegisterRequest): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.api.post<ApiResponse<{ user: User; tokens: AuthTokens }>>('/auth/register', data);
    return response.data.data!;
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: AuthTokens }> {
    const response = await this.api.post<ApiResponse<{ tokens: AuthTokens }>>('/auth/refresh', { refreshToken });
    return response.data.data!;
  }

  async getCurrentUser(): Promise<User> {
    const response = await this.api.get<ApiResponse<User>>('/auth/me');
    return response.data.data!;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
  }

  // Policy methods
  async getPolicies(params?: PaginationParams & FilterParams): Promise<PaginatedResponse<Policy>> {
    const response = await this.api.get<PaginatedResponse<Policy>>('/policies', { params });
    return response.data;
  }

  async getPolicy(id: string): Promise<Policy> {
    const response = await this.api.get<ApiResponse<Policy>>(`/policies/${id}`);
    return response.data.data!;
  }

  async createPolicy(policy: Partial<Policy>): Promise<Policy> {
    const response = await this.api.post<ApiResponse<Policy>>('/policies', policy);
    return response.data.data!;
  }

  async updatePolicy(id: string, policy: Partial<Policy>): Promise<Policy> {
    const response = await this.api.put<ApiResponse<Policy>>(`/policies/${id}`, policy);
    return response.data.data!;
  }

  async deletePolicy(id: string): Promise<void> {
    await this.api.delete(`/policies/${id}`);
  }

  async evaluatePolicy(id: string, resource: any): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>(`/policies/${id}/evaluate`, { resource });
    return response.data.data!;
  }

  // Template methods
  async getTemplates(params?: PaginationParams & FilterParams): Promise<PaginatedResponse<PolicyTemplate>> {
    const response = await this.api.get<PaginatedResponse<PolicyTemplate>>('/templates', { params });
    return response.data;
  }

  async getTemplate(id: string): Promise<PolicyTemplate> {
    const response = await this.api.get<ApiResponse<PolicyTemplate>>(`/templates/${id}`);
    return response.data.data!;
  }

  async createTemplate(template: Partial<PolicyTemplate>): Promise<PolicyTemplate> {
    const response = await this.api.post<ApiResponse<PolicyTemplate>>('/templates', template);
    return response.data.data!;
  }

  async updateTemplate(id: string, template: Partial<PolicyTemplate>): Promise<PolicyTemplate> {
    const response = await this.api.put<ApiResponse<PolicyTemplate>>(`/templates/${id}`, template);
    return response.data.data!;
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.api.delete(`/templates/${id}`);
  }

  // Compliance methods
  async getFrameworks(): Promise<ComplianceFramework[]> {
    const response = await this.api.get<ApiResponse<ComplianceFramework[]>>('/compliance/frameworks');
    return response.data.data!;
  }

  async getFramework(id: string): Promise<ComplianceFramework> {
    const response = await this.api.get<ApiResponse<ComplianceFramework>>(`/compliance/frameworks/${id}`);
    return response.data.data!;
  }

  async getReports(params?: PaginationParams): Promise<PaginatedResponse<ComplianceReport>> {
    const response = await this.api.get<PaginatedResponse<ComplianceReport>>('/compliance/reports', { params });
    return response.data;
  }

  async generateReport(frameworkId: string): Promise<ComplianceReport> {
    const response = await this.api.post<ApiResponse<ComplianceReport>>('/compliance/reports', { frameworkId });
    return response.data.data!;
  }

  // AI methods
  async generatePolicy(request: AIPolicyGenerationRequest): Promise<AIPolicyGenerationResponse> {
    const response = await this.api.post<ApiResponse<AIPolicyGenerationResponse>>('/ai/generate-policy', request);
    return response.data.data!;
  }

  async optimizePolicy(policyId: string, optimizationType: string): Promise<any> {
    const response = await this.api.post<ApiResponse<any>>(`/ai/optimize-policy/${policyId}`, { optimizationType });
    return response.data.data!;
  }

  // Monitoring methods
  async getMetrics(): Promise<any> {
    const response = await this.api.get<ApiResponse<any>>('/monitoring/metrics');
    return response.data.data!;
  }

  async getAlerts(params?: PaginationParams): Promise<PaginatedResponse<any>> {
    const response = await this.api.get<PaginatedResponse<any>>('/monitoring/alerts', { params });
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    this.api.defaults.headers.Authorization = `Bearer ${token}`;
  }

  clearAuthToken(): void {
    delete this.api.defaults.headers.Authorization;
  }

  // File upload
  async uploadFile(file: File, endpoint: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post<ApiResponse<any>>(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data!;
  }

  // Health check
  async healthCheck(): Promise<any> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const api = new ApiService();

