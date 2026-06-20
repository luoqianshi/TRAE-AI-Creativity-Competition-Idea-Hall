const API_BASE = '/api';

interface ApiOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

class ApiService {
  private getUrl(path: string, params?: Record<string, string | undefined>): string {
    const url = new URL(window.location.origin + API_BASE);
    url.pathname = url.pathname + path;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          url.searchParams.set(k, v);
        }
      });
    }
    return url.toString();
  }

  private async safeParseJson(response: Response): Promise<any> {
    const text = await response.text();
    if (!text) {
      return null;
    }
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  private async request<T>(path: string, options?: ApiOptions): Promise<T> {
    const { params, ...fetchOptions } = options || {};
    const url = this.getUrl(path, params);

    let response: Response;
    try {
      response = await fetch(url, {
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions?.headers,
        },
        credentials: 'include',
      });
    } catch (error) {
      throw new Error('网络连接失败，请检查后端服务是否启动');
    }

    const data = await this.safeParseJson(response);

    if (response.status === 401) {
      throw new Error(data?.message || '登录已过期');
    }

    if (response.status === 403) {
      throw new Error(data?.message || '权限不足');
    }

    if (response.status >= 500) {
      throw new Error(data?.message || '服务器内部错误，请稍后重试');
    }

    if (!response.ok) {
      throw new Error(data?.message || '请求失败');
    }

    if (data === null) {
      throw new Error('服务器返回空响应');
    }

    if (!data.success) {
      throw new Error(data.message || '请求失败');
    }

    return data.data;
  }

  // Auth
  async login(username: string, password: string) {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<any>('/auth/me');
  }

  async getProfile() {
    return this.getMe();
  }

  // Daily Records
  async getDailyRecords(startDate?: string, endDate?: string) {
    return this.request<any[]>('/records/daily', {
      params: { startDate, endDate },
    });
  }

  async getDailyStatistics(month: string) {
    return this.request<any[]>('/records/daily/stats', {
      params: { month },
    });
  }

  async getDailyRecordByDate(date: string) {
    return this.request<any>(`/records/daily/${date}`);
  }

  async saveDailyRecord(date: string, readings: Record<string, any>) {
    return this.request<any>('/records/daily', {
      method: 'POST',
      body: JSON.stringify({ date, readings }),
    });
  }

  // Monthly Records
  async getMonthlyRecords(month: string) {
    return this.request<any[]>('/records/monthly', {
      params: { month },
    });
  }

  async saveMonthlyRecords(month: string, records: any[]) {
    return this.request<any>('/records/monthly', {
      method: 'POST',
      body: JSON.stringify({ month, records }),
    });
  }

  // Config
  async getConfig() {
    return this.request<any>('/config');
  }

  async updateConfig(key: string, value: any) {
    return this.request<any>('/config', {
      method: 'PUT',
      body: JSON.stringify({ key, value }),
    });
  }

  // Backup
  async exportBackup() {
    const response = await fetch(`${API_BASE}/backup/export`, {
      method: 'POST',
      credentials: 'include',
    });
    const data = await this.safeParseJson(response);
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || '导出失败');
    }
    return data.data;
  }

  async importBackup(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/backup/import`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });
    const data = await this.safeParseJson(response);
    if (!response.ok || !data?.success) {
      throw new Error(data?.message || '导入失败');
    }
    return data.data;
  }
}

export const apiService = new ApiService();
