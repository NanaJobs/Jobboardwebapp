/**
 * Job Board Unified Frontend API Client
 * Connects directly to the Django REST Backend
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://job-board1-sghl.onrender.com";

export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  const cleanBase = API_BASE_URL.replace(/\/+$/, "");

  // If already an absolute URL (Cloudinary, AWS, S3, data URI, blob)
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:") || url.startsWith("blob:")) {
    // If it's a dummy/broken Cloudinary placeholder URL (e.g. jobboard cloud name), fallback to backend media
    if (url.includes("res.cloudinary.com/jobboard/")) {
      const path = url.replace(/^https?:\/\/res\.cloudinary\.com\/jobboard/, "");
      return `${cleanBase}${path.startsWith("/media/") ? path : `/media${path}`}`;
    }
    // If it's a real Cloudinary URL, preserve it
    if (url.includes("cloudinary.com")) {
      return url;
    }
    // Strip testserver prefix
    if (url.startsWith("http://testserver/")) {
      const cleanPath = url.replace("http://testserver", "");
      return `${cleanBase}${cleanPath.startsWith("/media/") ? cleanPath : `/media${cleanPath}`}`;
    }
    // If it's a local/127.0.0.1 media URL with different port, rewrite to current API_BASE_URL
    if ((url.includes("localhost:") || url.includes("127.0.0.1:")) && url.includes("/media/")) {
      const path = url.substring(url.indexOf("/media/"));
      return `${cleanBase}${path}`;
    }
    return url;
  }

  // Relative path (e.g. "applicant_avatars/..." or "/media/applicant_avatars/...")
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (!cleanPath.startsWith("/media/")) {
    return `${cleanBase}/media${cleanPath}`;
  }
  return `${cleanBase}${cleanPath}`;
}

// Token & User Persistence
export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  role: 'applicant' | 'company' | 'admin' | 'super_admin';
  is_verified: boolean;
  is_suspended: boolean;
  created_at: string;
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}

export function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('nanajobs-authenticated');
  localStorage.removeItem('kindred-authenticated');
}

export function getStoredUser(): AuthUser | null {
  const user = localStorage.getItem('auth_user');
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem('auth_user', JSON.stringify(user));
  localStorage.setItem('nanajobs-authenticated', 'true');
  localStorage.setItem('kindred-authenticated', 'true');
}

// Base Fetcher with Token Refresh
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // If payload is not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // Handle Token Refresh on 401
  if (response.status === 401 && getRefreshToken()) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: getRefreshToken() }),
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        const newAccess = refreshData.data?.access || refreshData.access;
        if (newAccess) {
          localStorage.setItem('access_token', newAccess);
          headers['Authorization'] = `Bearer ${newAccess}`;
          response = await fetch(url, { ...options, headers });
        }
      } else {
        clearTokens();
      }
    } catch {
      clearTokens();
    }
  }

function formatErrorMessage(data: any): string {
  if (!data) return 'An unexpected error occurred';
  if (typeof data.message === 'string' && data.message.trim()) {
    return data.message;
  }
  if (typeof data.detail === 'string' && data.detail.trim()) {
    return data.detail;
  }
  if (data.errors) {
    if (typeof data.errors === 'string') return data.errors;
    if (typeof data.errors === 'object' && data.errors !== null) {
      const messages: string[] = [];
      for (const [key, value] of Object.entries(data.errors)) {
        if (Array.isArray(value)) {
          messages.push(value.join(' '));
        } else if (typeof value === 'string') {
          messages.push(value);
        } else if (typeof value === 'object' && value !== null) {
          messages.push(Object.values(value).flat().join(' '));
        }
      }
      if (messages.length > 0) return messages.join(' ');
    }
  }
  if (data.error && typeof data.error === 'string') return data.error;
  return 'An error occurred. Please check your credentials or try again.';
}

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = formatErrorMessage(data);
    throw new Error(errorMsg);
  }

  return data;
}

// -------------------------------------------------------------
// 1. Authentication & User API
// -------------------------------------------------------------
export const authApi = {
  async register(data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    confirm_password?: string;
    role?: string;
  }) {
    const payload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      password: data.password,
      confirm_password: data.confirm_password || data.password,
      role: data.role?.toLowerCase() || 'applicant',
    };
    return apiRequest('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async login(email: string, password: string) {
    const data = await apiRequest('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.data?.access && data.data?.refresh) {
      setTokens(data.data.access, data.data.refresh);
      if (data.data.user) {
        setStoredUser(data.data.user);
      }
    }
    return data;
  },

  async logout() {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await apiRequest('/api/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh }),
        });
      }
    } finally {
      clearTokens();
    }
  },

  async getProfile() {
    const data = await apiRequest('/api/auth/profile/');
    if (data.data) {
      setStoredUser(data.data);
    }
    return data;
  },

  async updateProfile(data: { first_name?: string; last_name?: string; email?: string }) {
    return apiRequest('/api/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async changePassword(oldPassword: string, newPassword: string) {
    return apiRequest('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });
  },

  async resendVerification(email: string) {
    return apiRequest('/api/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async requestPasswordReset(email: string) {
    return apiRequest('/api/auth/password-reset/request/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async confirmPasswordReset(data: {
    email: string;
    token: string;
    new_password: string;
    confirm_password: string;
  }) {
    return apiRequest('/api/auth/password-reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async forgotPassword(email: string) {
    return apiRequest('/api/auth/forgot-password/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string) {
    return apiRequest('/api/auth/reset-password/', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },

  async verifyEmail(token: string) {
    return apiRequest(`/api/auth/verify-email/${token}/`, {
      method: 'GET',
    });
  },
};

// -------------------------------------------------------------
// 2. Jobs API
// -------------------------------------------------------------
export const jobsApi = {
  async list(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, String(val));
      }
    });
    const qs = query.toString();
    return apiRequest(`/api/jobs/${qs ? `?${qs}` : ''}`);
  },

  async getDetail(idOrSlug: string) {
    return apiRequest(`/api/jobs/${idOrSlug}/`);
  },

  async getCategories() {
    return apiRequest('/api/jobs/categories/');
  },

  async create(jobData: Record<string, any>) {
    return apiRequest('/api/jobs/create/', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async getMyJobs() {
    return apiRequest('/api/jobs/company/my-jobs/');
  },

  async update(id: string, jobData: Record<string, any>) {
    return apiRequest(`/api/jobs/company/${id}/update/`, {
      method: 'PATCH',
      body: JSON.stringify(jobData),
    });
  },

  async toggleStatus(id: string) {
    return apiRequest(`/api/jobs/company/${id}/toggle-status/`, {
      method: 'PATCH',
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/jobs/company/${id}/delete/`, {
      method: 'DELETE',
    });
  },
};

// -------------------------------------------------------------
// 3. Applications API
// -------------------------------------------------------------
export const applicationsApi = {
  async apply(jobId: string, data: { resume_url?: string; cover_letter?: string } | FormData) {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    return apiRequest(`/api/applications/apply/${jobId}/`, {
      method: 'POST',
      body,
    });
  },

  async getMyApplications() {
    return apiRequest('/api/applications/my-applications/');
  },

  async getMyApplicationDetail(id: string) {
    return apiRequest(`/api/applications/my-applications/${id}/`);
  },

  async withdraw(id: string) {
    return apiRequest(`/api/applications/my-applications/${id}/withdraw/`, {
      method: 'POST',
    });
  },

  async getCompanyApplications(statusFilter?: string) {
    const qs = statusFilter ? `?status=${statusFilter}` : '';
    return apiRequest(`/api/applications/company/all/${qs}`);
  },

  async getJobApplications(jobId: string) {
    return apiRequest(`/api/applications/job/${jobId}/`);
  },

  async updateStatus(id: string, status: string, rating?: number, company_notes?: string) {
    return apiRequest(`/api/applications/company/${id}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status, rating, company_notes }),
    });
  },
};

// -------------------------------------------------------------
// 4. Profiles API
// -------------------------------------------------------------
export const profilesApi = {
  async getCompanyProfile() {
    return apiRequest('/api/profiles/company/me/');
  },

  async updateCompanyProfile(data: Record<string, any>) {
    return apiRequest('/api/profiles/company/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async uploadCompanyLogo(formData: FormData) {
    return apiRequest('/api/profiles/company/me/logo/', {
      method: 'POST',
      body: formData,
    });
  },

  async getCompanies(query?: string) {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiRequest(`/api/profiles/companies/${qs}`);
  },

  async getCompanyDetail(slugOrId: string) {
    return apiRequest(`/api/profiles/companies/${slugOrId}/`);
  },

  async getApplicantProfile() {
    return apiRequest('/api/profiles/applicant/me/');
  },

  async updateApplicantProfile(data: Record<string, any>) {
    return apiRequest('/api/profiles/applicant/me/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async uploadApplicantAvatar(formData: FormData) {
    return apiRequest('/api/profiles/applicant/me/avatar/', {
      method: 'POST',
      body: formData,
    });
  },

  async uploadApplicantResume(formData: FormData) {
    return apiRequest('/api/profiles/applicant/me/resume/', {
      method: 'POST',
      body: formData,
    });
  },

  async getSkills(query?: string) {
    const qs = query ? `?q=${encodeURIComponent(query)}` : '';
    return apiRequest(`/api/profiles/skills/${qs}`);
  },

  async addExperience(data: Record<string, any>) {
    return apiRequest('/api/profiles/applicant/me/experience/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteExperience(id: string) {
    return apiRequest(`/api/profiles/applicant/me/experience/${id}/`, {
      method: 'DELETE',
    });
  },

  async addEducation(data: Record<string, any>) {
    return apiRequest('/api/profiles/applicant/me/education/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteEducation(id: string) {
    return apiRequest(`/api/profiles/applicant/me/education/${id}/`, {
      method: 'DELETE',
    });
  },
};

// -------------------------------------------------------------
// 5. Search & Discovery API
// -------------------------------------------------------------
export const searchApi = {
  async unified(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/search/${qs ? `?${qs}` : ''}`);
  },

  async suggestions(q: string) {
    return apiRequest(`/api/search/suggestions/?q=${encodeURIComponent(q)}`);
  },

  async facets(q?: string) {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return apiRequest(`/api/search/facets/${qs}`);
  },

  async trending() {
    return apiRequest('/api/search/trending/');
  },
};

// -------------------------------------------------------------
// 6. Dashboards & Analytics API
// -------------------------------------------------------------
export const dashboardApi = {
  async getCompanyDashboard() {
    return apiRequest('/api/dashboard/company/');
  },

  async getApplicantDashboard() {
    return apiRequest('/api/dashboard/applicant/');
  },

  async getAdminDashboard() {
    return apiRequest('/api/dashboard/admin/');
  },
};

// -------------------------------------------------------------
// 7. In-App Notifications API
// -------------------------------------------------------------
export const notificationsApi = {
  async list(isRead?: boolean) {
    const qs = isRead !== undefined ? `?is_read=${isRead}` : '';
    return apiRequest(`/api/notifications/${qs}`);
  },

  async getUnreadCount() {
    return apiRequest('/api/notifications/unread-count/');
  },

  async markRead(id: string) {
    return apiRequest(`/api/notifications/${id}/read/`, {
      method: 'PATCH',
    });
  },

  async markAllRead() {
    return apiRequest('/api/notifications/mark-all-read/', {
      method: 'POST',
    });
  },

  async delete(id: string) {
    return apiRequest(`/api/notifications/${id}/`, {
      method: 'DELETE',
    });
  },
};

// -------------------------------------------------------------
// 8. Reports & Super Admin Moderation API
// -------------------------------------------------------------
export const reportsApi = {
  async submit(data: {
    target_type: 'job' | 'user';
    job_id?: string;
    user_id?: string;
    reason: string;
    description: string;
    evidence_url?: string;
  }) {
    return apiRequest('/api/reports/submit/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMyReports() {
    return apiRequest('/api/reports/my-reports/');
  },

  async getAdminReports(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/reports/admin/all/${qs ? `?${qs}` : ''}`);
  },

  async getAdminReportDetail(id: string) {
    return apiRequest(`/api/reports/admin/${id}/`);
  },

  async resolveAdminReport(id: string, data: { status: string; action_taken: string; admin_notes?: string }) {
    return apiRequest(`/api/reports/admin/${id}/resolve/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// -------------------------------------------------------------
// 9. Marketplace & Talent Discovery API
// -------------------------------------------------------------
export const marketplaceApi = {
  async getOverview() {
    return apiRequest('/api/profiles/marketplace/overview/');
  },

  async getProducts(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/jobs/products/${qs ? `?${qs}` : ''}`);
  },

  async getProductDetail(idOrSlug: string) {
    return apiRequest(`/api/jobs/products/${idOrSlug}/`);
  },

  async createProduct(data: Record<string, any> | FormData) {
    return apiRequest('/api/jobs/products/', {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  async updateProduct(idOrSlug: string, data: Record<string, any> | FormData) {
    return apiRequest(`/api/jobs/products/${idOrSlug}/`, {
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  },

  async deleteProduct(idOrSlug: string) {
    return apiRequest(`/api/jobs/products/${idOrSlug}/`, {
      method: 'DELETE',
    });
  },

  async getMyProducts() {
    return apiRequest('/api/jobs/products/my-products/');
  },

  async inquireProduct(idOrSlug: string, data: { sender_name: string; sender_email: string; message: string; sender_phone?: string }) {
    return apiRequest(`/api/jobs/products/${idOrSlug}/inquire/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTalent(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/profiles/talent/${qs ? `?${qs}` : ''}`);
  },

  async getTalentDetail(id: string) {
    return apiRequest(`/api/profiles/talent/${id}/`);
  },

  async getCompanies(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/profiles/companies/${qs ? `?${qs}` : ''}`);
  },
};

// -------------------------------------------------------------
// 10. Super Admin Comprehensive Management API
// -------------------------------------------------------------
export const adminApi = {
  async getDashboard() {
    return apiRequest('/api/dashboard/admin/');
  },

  async getUsers(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/admin/users/${qs ? `?${qs}` : ''}`);
  },

  async getUserDetail(id: string) {
    return apiRequest(`/api/admin/users/${id}/`);
  },

  async suspendUser(id: string, action: 'suspend' | 'activate') {
    return apiRequest(`/api/admin/users/${id}/suspend/`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  async deleteUser(id: string) {
    return apiRequest(`/api/admin/users/${id}/`, {
      method: 'DELETE',
    });
  },

  async getJobs(params: Record<string, any> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    const qs = query.toString();
    return apiRequest(`/api/jobs/admin/all/${qs ? `?${qs}` : ''}`);
  },

  async toggleFeatureJob(id: string) {
    return apiRequest(`/api/jobs/admin/${id}/feature/`, {
      method: 'PATCH',
    });
  },

  async deleteJob(id: string) {
    return apiRequest(`/api/jobs/admin/${id}/`, {
      method: 'DELETE',
    });
  },

  async updateUser(id: string, data: Record<string, any>) {
    return apiRequest(`/api/admin/users/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async getCategories() {
    return apiRequest('/api/jobs/categories/');
  },

  async createCategory(data: { name: string; description?: string }) {
    return apiRequest('/api/jobs/admin/categories/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCategory(id: string, data: { name?: string; description?: string }) {
    return apiRequest(`/api/jobs/admin/categories/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async deleteCategory(id: string) {
    return apiRequest(`/api/jobs/admin/categories/${id}/`, {
      method: 'DELETE',
    });
  },

  async toggleVerifyCompany(id: string) {
    return apiRequest(`/api/profiles/admin/companies/${id}/verify/`, {
      method: 'PATCH',
    });
  },
};
