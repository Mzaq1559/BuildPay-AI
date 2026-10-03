import { 
  Project, 
  BOQ, 
  BOQItem, 
  CheckRequest, 
  Measurement, 
  Variation, 
  IPC, 
  Document, 
  AuditEvent, 
  Notification, 
  User, 
  OverviewMetrics 
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiClient {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('buildpay_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('buildpay_token', token);
      } else {
        localStorage.removeItem('buildpay_token');
      }
    }
  }

  getToken(): string | null {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('buildpay_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Network response error' }));
      throw new Error(errorData.detail || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(credentials: { email: string; password: string }) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await response.json();
    this.setToken(data.access_token);
    return data;
  }

  logout() {
    this.setToken(null);
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async seedData(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/seed', { method: 'POST' });
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects');
  }

  async getProject(id: number): Promise<Project> {
    return this.request<Project>(`/projects/${id}`);
  }

  async createProject(data: Partial<Project>): Promise<Project> {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // BOQ
  async getBOQs(projectId: number): Promise<BOQ[]> {
    return this.request<BOQ[]>(`/projects/${projectId}/boq`);
  }

  async getBOQ(projectId: number, id: number): Promise<BOQ> {
    return this.request<BOQ>(`/projects/${projectId}/boq/${id}`);
  }

  async getBOQItems(projectId: number, boqId: number): Promise<BOQItem[]> {
    return this.request<BOQItem[]>(`/projects/${projectId}/boq/${boqId}/items`);
  }

  async createBOQFromTemplate(projectId: number, boqType: string): Promise<BOQ> {
    return this.request<BOQ>(`/projects/${projectId}/boq/import`, {
      method: 'POST',
      body: JSON.stringify({ boq_type: boqType }),
    });
  }

  // Check Requests
  async getCheckRequests(projectId: number): Promise<CheckRequest[]> {
    return this.request<CheckRequest[]>(`/projects/${projectId}/check-requests`);
  }

  async getCheckRequest(projectId: number, id: number): Promise<CheckRequest> {
    return this.request<CheckRequest>(`/projects/${projectId}/check-requests/${id}`);
  }

  async createCheckRequest(data: {
    project_id: number;
    boq_item_id: number;
    requested_quantity: number;
    description: string;
    location?: string;
    notes?: string;
  }): Promise<CheckRequest> {
    return this.request<CheckRequest>(`/projects/${data.project_id}/check-requests`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async triggerCRReview(projectId: number, id: number): Promise<CheckRequest> {
    return this.request<CheckRequest>(`/projects/${projectId}/check-requests/${id}/ai-review`, { method: 'POST' });
  }

  async decideCR(projectId: number, id: number, decision: 'approved' | 'returned' | 'rejected', notes?: string): Promise<CheckRequest> {
    return this.request<CheckRequest>(`/projects/${projectId}/check-requests/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  }

  // Measurements
  async getMeasurements(projectId: number): Promise<Measurement[]> {
    return this.request<Measurement[]>(`/projects/${projectId}/measurements`);
  }

  async createMeasurement(data: {
    project_id: number;
    check_request_id?: number;
    boq_item_id: number;
    current_quantity: number;
    measurement_date: string;
    location_description?: string;
    comments?: string;
  }): Promise<Measurement> {
    return this.request<Measurement>(`/projects/${data.project_id}/measurements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Variations
  async getVariations(projectId: number): Promise<Variation[]> {
    return this.request<Variation[]>(`/projects/${projectId}/variations`);
  }

  async getVariation(projectId: number, id: number): Promise<Variation> {
    return this.request<Variation>(`/projects/${projectId}/variations/${id}`);
  }

  async createVariation(data: {
    project_id: number;
    boq_item_id: number;
    title: string;
    justification: string;
    proposed_quantity: number;
  }): Promise<Variation> {
    return this.request<Variation>(`/projects/${data.project_id}/variations`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async triggerVariationReview(projectId: number, id: number): Promise<Variation> {
    return this.request<Variation>(`/projects/${projectId}/variations/${id}/ai-review`, { method: 'POST' });
  }

  async decideVariation(projectId: number, id: number, decision: 'approved' | 'returned' | 'rejected', notes?: string): Promise<Variation> {
    return this.request<Variation>(`/projects/${projectId}/variations/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision, notes }),
    });
  }

  // IPC
  async getIPCs(projectId: number): Promise<IPC[]> {
    return this.request<IPC[]>(`/projects/${projectId}/ipc`);
  }

  async getIPC(projectId: number, id: number): Promise<IPC> {
    return this.request<IPC>(`/projects/${projectId}/ipc/${id}`);
  }

  async generateIPC(data: { project_id: number; period_start: string; period_end: string; notes?: string }): Promise<IPC> {
    return this.request<IPC>(`/projects/${data.project_id}/ipc/generate`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async triggerIPCReview(projectId: number, id: number): Promise<IPC> {
    return this.request<IPC>(`/projects/${projectId}/ipc/${id}/ai-review`, { method: 'POST' });
  }

  async certifiyIPC(projectId: number, id: number, notes?: string): Promise<IPC> {
    return this.request<IPC>(`/projects/${projectId}/ipc/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'certified', notes }),
    });
  }

  async approveIPC(projectId: number, id: number, notes?: string): Promise<IPC> {
    return this.request<IPC>(`/projects/${projectId}/ipc/${id}/decide`, {
      method: 'POST',
      body: JSON.stringify({ decision: 'certified', notes }),
    });
  }

  // Documents
  async getDocuments(projectId: number): Promise<Document[]> {
    return this.request<Document[]>(`/documents?project_id=${projectId}`);
  }

  // Reports & Analytics
  async getOverviewMetrics(projectId: number): Promise<OverviewMetrics> {
    return this.request<OverviewMetrics>(`/projects/${projectId}/reports/dashboard`);
  }

  // Audit
  async getAuditTrail(projectId?: number): Promise<AuditEvent[]> {
    const url = projectId ? `/audit?project_id=${projectId}` : '/audit';
    return this.request<AuditEvent[]>(url);
  }

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/notifications');
  }
}

export const api = new ApiClient();
