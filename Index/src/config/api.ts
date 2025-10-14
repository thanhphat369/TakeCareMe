import axios from 'axios';
// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  DASHBOARD: {
    SUMMARY: '/api/dashboard/summary',
  },
  ELDERS: {
    LIST: '/elders',
    CREATE: '/elders',
    UPDATE: (id: string) => `/elders/${id}`,
    DELETE: (id: string) => `/elders/${id}`,
  },
  VITALS: {
    LIST: '/vitals',
    CREATE: '/vitals',
    UPDATE: (id: string) => `/vitals/${id}`,
    DELETE: (id: string) => `/vitals/${id}`,
  },
  ALERTS: {
    LIST: '/alerts',
    ACKNOWLEDGE: (id: string) => `/alerts/${id}/acknowledge`,
    RESOLVE: (id: string) => `/alerts/${id}/resolve`,
  },
  MEDICATIONS: {
    LIST: '/medications',
    CREATE: '/medications',
    UPDATE: (id: string) => `/medications/${id}`,
    DELETE: (id: string) => `/medications/${id}`,
  },
  USERS: {
    LIST: '/users',
    STAFF: '/users?role=staff',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  PAYMENTS: {
    LIST: '/payments',
    CREATE: '/payments',
    UPDATE: (id: string) => `/payments/${id}`,
    DELETE: (id: string) => `/payments/${id}`,
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền truy cập tính năng này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu.',
  SERVER_ERROR: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  TIMEOUT: 'Yêu cầu quá thời gian. Vui lòng thử lại.',
};
// =====================
// Axios Instance
// =====================
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động gắn token (nếu có)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error(ERROR_MESSAGES.NETWORK_ERROR);
    } else {
      console.error('API Error:', error.response.data);
    }
    return Promise.reject(error);
  }
);

// Default export để import dễ dàng
export default api;




