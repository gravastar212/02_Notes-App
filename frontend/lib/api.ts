import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
      withCredentials: true, // Include cookies for refresh token
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add access token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      },
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then(() => {
                return this.client(originalRequest);
              })
              .catch(err => {
                return Promise.reject(err);
              });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              // Process queued requests
              this.processQueue(null, newToken);

              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            } else {
              // Refresh failed, redirect to login
              this.processQueue(new Error('Token refresh failed'), null);
              this.redirectToLogin();
              return Promise.reject(error);
            }
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.redirectToLogin();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      },
    );
  }

  private processQueue(error: unknown, token: string | null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });

    this.failedQueue = [];
  }

  private async refreshToken(): Promise<string | null> {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/refresh`,
        {},
        { withCredentials: true },
      );

      const { accessToken } = response.data;
      this.setAccessToken(accessToken);
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearAccessToken();
      return null;
    }
  }

  private getAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  private setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private clearAccessToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  private redirectToLogin(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  // Public methods for making API calls
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Authentication methods
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    const { accessToken, user } = response.data;
    this.setAccessToken(accessToken);
    return { user, accessToken };
  }

  async register(email: string, password: string) {
    const response = await this.client.post('/auth/register', { email, password });
    const { accessToken, user } = response.data;
    this.setAccessToken(accessToken);
    return { user, accessToken };
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAccessToken();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }
}

// Create singleton instance
const apiClient = new ApiClient();

export default apiClient;
