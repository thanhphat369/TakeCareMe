import React, { useState } from 'react';
import { Card, Button, Form, Input, Alert, Divider, Tag, Space, message } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import api from '../config/api'; 

interface LoginProps {
  onSuccess: () => void;
  onShowRegister: () => void;
}

interface LoginResponse {
  accessToken: string;
  user: {
    user_id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

const Login: React.FC<LoginProps> = ({ onSuccess, onShowRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm đăng nhập thật kết nối Backend
  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!email || !password) {
        throw new Error('Vui lòng nhập đầy đủ email và mật khẩu.');
      }

      console.log('Đang đăng nhập:', email);
      const res = await api.post<LoginResponse>('/api/auth/login', { email, password });
      const { accessToken, user } = res.data;

      // Lưu token và user vào localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('userData', JSON.stringify(user));

      message.success('Đăng nhập thành công!');
      onSuccess();
    } catch (err: any) {
      console.error('❌ Lỗi đăng nhập:', err);
      let msg = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message.includes('Network')) msg = 'Không thể kết nối tới Backend API.';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-xl"
        title={
          <div className="text-center">
            <SafetyOutlined className="text-4xl text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Take Care Me</h1>
            <p className="text-gray-600 text-sm">Hệ thống chăm sóc người cao tuổi</p>
          </div>
        }
      >
        <Form layout="vertical" onFinish={handleLogin}>
          <Form.Item label="Email" required>
            <Input
              size="large"
              prefix={<UserOutlined />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email"
              onPressEnter={handleLogin}
            />
          </Form.Item>

          <Form.Item label="Mật khẩu" required>
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              onPressEnter={handleLogin}
            />
          </Form.Item>

          {error && (
            <Alert
              message="Lỗi đăng nhập"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-4"
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              disabled={!email || !password}
              className="w-full"
              style={{ height: '48px', fontSize: '16px' }}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center mt-4">
          <Button type="link" onClick={onShowRegister} className="text-blue-600 font-medium">
            Chưa có tài khoản? Đăng ký ngay
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Login;
