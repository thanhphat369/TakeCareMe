import axios, { AxiosInstance, AxiosError } from "axios";

// Lấy URL API từ biến môi trường CRA (.env)
// CRA chỉ chấp nhận biến có tiền tố REACT_APP_
const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:3000";

console.log("API Base URL:", API_BASE_URL);

// Tạo instance axios chung cho toàn bộ app

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor cho Request – tự động thêm Bearer Token

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Interceptor cho Response – xử lý lỗi 401 (hết hạn đăng nhập)
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Kiểu trả về từ API đăng nhập
export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    full_name: string;
    email: string;
    role: string;
    avatar?: string;
    phone?: string;
  };
}

// Hàm đăng nhập
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    console.log("Gửi request đăng nhập...");
    const res = await apiClient.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    console.log("✅ Đăng nhập thành công!");

    localStorage.setItem("accessToken", res.data.accessToken);
    localStorage.setItem("userData", JSON.stringify(res.data.user));

    return res.data;
  } catch (err: any) {
    console.error("❌ Lỗi đăng nhập:", err.response?.data || err.message);
    const message =
      err.response?.data?.message ||
      "Đăng nhập thất bại. Vui lòng kiểm tra email/mật khẩu.";
    throw new Error(message);
  }
};

// Lấy thông tin profile người dùng (sau khi đăng nhập)
export const getProfile = async () => {
  const res = await apiClient.get("/api/auth/profile");
  return res.data;
};

// Đăng xuất (xoá token & reload)

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("userData");
  window.location.href = "/login";
};

//Xuất mặc định (default export)
export default apiClient;
