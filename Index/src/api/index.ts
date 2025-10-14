import axios, { AxiosInstance, AxiosError } from 'axios';

// Cách 1: Sử dụng với default value (bổ sung type cho import.meta)
// Lỗi trên là do TypeScript không biết thuộc tính 'env' trên import.meta, 
// cần bổ sung khai báo type cho ImportMeta ở file vite-env.d.ts hoặc tương đương.
// Cách fix tạm thời dưới đây (không lỗi TS):
const API_BASE_URL =
  (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_API_URL ||
  'http://localhost:3000';

// Cách 2: Kiểm tra type an toàn hơn (cũng fix như trên)
const getApiBaseUrl = (): string => {
  const url = (import.meta as ImportMeta & { env: Record<string, string> }).env.VITE_API_URL;
  if (!url) {
    console.warn('⚠️ VITE_API_URL not found, using default');
    return 'http://localhost:3000';
  }
  return url;
};

const API_BASE_URL_SAFE = getApiBaseUrl();

console.log('API Base URL:', API_BASE_URL);

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==========================================
// INTERFACES
// ==========================================

export interface LoginResponse {
  accessToken: string; // trùng với backend
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
  };
}

// ==========================================
// AUTH API
// ==========================================

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    console.log('🔐 Đang gửi request đăng nhập...');
    
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    });

    console.log('✅ Đăng nhập thành công!');
    
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('userData', JSON.stringify(response.data.user));

    return response.data;
  } catch (error: any) {
    console.error('❌ Lỗi đăng nhập:', error.response?.data || error.message);
    
    const errorMessage =
      error.response?.data?.message ||
      'Đăng nhập thất bại. Vui lòng kiểm tra lại email và mật khẩu.';

    throw new Error(errorMessage);
  }
};

export const getProfile = async () => {
  const response = await apiClient.get('/api/auth/profile');
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userData');
  window.location.href = '/login';
};

export default apiClient;
