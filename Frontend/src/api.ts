export type ApiSummary = {
  totalElders: number;
  totalStaff: number;
  openAlerts: number;
  criticalAlerts: number;
  recentVitals: number;
  lastUpdated?: string;
};

export type User = {
  userId: number;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  permissions?: string[];
};

export type LoginResponse = {
  accessToken: string;
  user: User;
};

export const getApiBaseUrl = (): string => {
  const raw = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  return raw.replace(/\/$/, '');
};

// Auth API - Kết nối Backend
export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const base = getApiBaseUrl();
  console.log('🔗 Kết nối tới Backend:', `${base}/api/auth/login`);
  
  const response = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Lưu token và user data vào localStorage
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('userData', JSON.stringify(data.user));
  
  console.log('✅ Đăng nhập thành công:', data.user);
  return data;
}

export async function registerUser(userData: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: string;
  avatar?: string;
}): Promise<any> {
  const base = getApiBaseUrl();
  
  console.log('Gọi API đăng ký:', `${base}/api/auth/register`);
  console.log('Dữ liệu gửi đi:', userData);
  
  const response = await fetch(`${base}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  console.log('Response status:', response.status);
  console.log('Response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (parseError) {
      console.error('Cannot parse error response:', parseError);
      errorMessage = `Server error: ${response.status} ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  const result = await response.json();
  console.log('API Response:', result);
  return result;
}

export async function getProfile(accessToken?: string): Promise<User> {
  const base = getApiBaseUrl();
  const token = accessToken || localStorage.getItem('accessToken') || '';
  
  console.log('🔗 Lấy profile từ Backend:', `${base}/api/auth/profile`);
  
  const response = await fetch(`${base}/api/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function changePassword(oldPassword: string, newPassword: string, accessToken?: string): Promise<any> {
  const base = getApiBaseUrl();
  const response = await fetch(`${base}/api/auth/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function logoutUser() {
  console.log('🔓 Đăng xuất người dùng');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userData');
}

// Dashboard API
export async function getDashboardSummary(accessToken?: string): Promise<ApiSummary> {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/dashboard/summary`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Summary failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Elders API
export async function getElders(accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/elders`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Get elders failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createElder(elderData: any, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/elders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
    body: JSON.stringify(elderData),
  });
  if (!res.ok) {
    throw new Error(`Create elder failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateElder(id: string, elderData: any, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/elders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
    body: JSON.stringify(elderData),
  });
  if (!res.ok) {
    throw new Error(`Update elder failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteElder(id: string, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/elders/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Delete elder failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Health Records API
export async function getHealthRecords(accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/vitals`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Get health records failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createHealthRecord(recordData: any, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/vitals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
    body: JSON.stringify(recordData),
  });
  if (!res.ok) {
    throw new Error(`Create health record failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Alerts API
export async function getAlerts(accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/alerts`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Get alerts failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function acknowledgeAlert(id: string, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/alerts/${id}/acknowledge`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Acknowledge alert failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function resolveAlert(id: string, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/alerts/${id}/resolve`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Resolve alert failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Medications API
export async function getMedications(accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/medications`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Get medications failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createMedication(medicationData: any, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/medications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
    body: JSON.stringify(medicationData),
  });
  if (!res.ok) {
    throw new Error(`Create medication failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Staff API
export async function getStaff(accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/users?role=staff`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Get staff failed: HTTP ${res.status}`);
  }
  return res.json();
}

// Payments API
export async function getPayments(accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/payments`, {
    headers: {
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Get payments failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function createPayment(paymentData: any, accessToken?: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/api/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken || localStorage.getItem('accessToken') || ''}`,
    },
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) {
    throw new Error(`Create payment failed: HTTP ${res.status}`);
  }
  return res.json();
}