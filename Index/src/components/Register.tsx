import React, { useState } from 'react';
import {
  Card,
  Button,
  Form,
  Input,
  Alert,
  Divider,
  Select,
  Space,
  message,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
  MailOutlined,
  PhoneOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import api from '../config/api'; // ✅ dùng axios instance chuẩn

const { Option } = Select;

interface RegisterProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

interface RegisterResponse {
  message: string;
  user: {
    user_id: number;
    full_name: string;
    email: string;
    role: string;
  };
}

const Register: React.FC<RegisterProps> = ({ onSuccess, onBackToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ✅ Hàm gọi API thật tới NestJS backend
  const handleRegister = async (values: any) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      console.log('Gửi dữ liệu đăng ký thật:', values);

      // Gọi API backend NestJS
      const response = await api.post<RegisterResponse>('/api/auth/register', {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone || null,
        password: values.password,
        role: values.role,
        avatar: values.avatar || null,
      });

      console.log('✅ Kết quả từ Backend:', response.data);

      setSuccess('🎉 Đăng ký thành công! Dữ liệu đã lưu vào SQL Server.');
      message.success('Đăng ký thành công!');

      // Chuyển về trang đăng nhập sau 2 giây
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Lỗi đăng ký:', err);

      let msg = 'Không thể đăng ký tài khoản. Vui lòng thử lại.';
      if (err.response?.data?.message) msg = err.response.data.message;
      else if (err.message.includes('Network')) msg = 'Không kết nối được đến backend API.';

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
            <h1 className="text-2xl font-bold text-gray-800">
              Đăng ký tài khoản
            </h1>
            <p className="text-gray-600 text-sm">
              Take Care Me - Hệ thống chăm sóc người cao tuổi
            </p>
          </div>
        }
      >
        <Form
          layout="vertical"
          onFinish={handleRegister}
          initialValues={{ role: 'Family' }}
        >
          <Form.Item
            label="Họ và tên"
            name="fullName"
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên' },
              { min: 2, message: 'Tên phải có ít nhất 2 ký tự' },
            ]}
          >
            <Input
              size="large"
              prefix={<UserOutlined />}
              placeholder="Nhập họ và tên đầy đủ"
            />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="Nhập email"
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { pattern: /^[0-9]{9,15}$/, message: 'Số điện thoại không hợp lệ' },
            ]}
          >
            <Input
              size="large"
              prefix={<PhoneOutlined />}
              placeholder="Nhập số điện thoại (tuỳ chọn)"
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item
            label="Vai trò"
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
          >
            <Select size="large" placeholder="Chọn vai trò người dùng">
              <Option value="Family">Người thân</Option>
              <Option value="Elder">Người cao tuổi</Option>
              <Option value="Staff">Nhân viên</Option>
              <Option value="Doctor">Bác sĩ</Option>
            </Select>
          </Form.Item>

          {error && (
            <Alert
              message="Lỗi đăng ký"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              className="mb-3"
            />
          )}

          {success && (
            <Alert
              message="Đăng ký thành công!"
              description={success}
              type="success"
              showIcon
              className="mb-3"
            />
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              style={{ height: '48px', fontSize: '16px' }}
            >
              {loading ? 'Đang đăng ký...' : 'Đăng ký tài khoản'}
            </Button>
          </Form.Item>
        </Form>

        <Divider />

        <div className="text-center">
          <Button type="link" onClick={onBackToLogin} className="text-blue-600">
            ← Quay lại đăng nhập
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Register;
