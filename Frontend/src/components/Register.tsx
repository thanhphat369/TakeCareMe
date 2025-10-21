import React, { useState } from 'react';
import { Card, Button, Form, Input, Alert, message, Select, Divider, } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined, MailOutlined, PhoneOutlined, } from '@ant-design/icons';
import api from '../config/api';

const { Option } = Select;

interface RegisterProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
}

interface RegisterResponse {
  message: string;
  user: {
    userId: number;
    fullName: string;
    email: string;
    role: string;
  };
}

const Register: React.FC<RegisterProps> = ({ onBackToLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ====================
  // Hàm xử lý đăng ký
  // ====================
  const handleRegister = async (values: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword?: string;
    role: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 🧹 Loại bỏ confirmPassword (backend không nhận)
      const { confirmPassword, ...dataToSend } = values;
      console.log('Gửi dữ liệu đăng ký:', dataToSend);

      // Gọi API backend
      const res = await api.post<RegisterResponse>('/api/auth/register', dataToSend);
      console.log('✅ Kết quả từ Backend:', res.data);

      // Cập nhật state hiển thị thành công
      setSuccess(res.data.message || 'Đăng ký thành công!');

      // Hiển thị popup toast
      message.success(res.data.message || 'Đăng ký thành công!');

      // Quay lại đăng nhập sau 2 giây
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    } catch (err: any) {
      console.error('❌ Lỗi đăng ký:', err);

      // Lấy message từ backend (NestJS có thể trả dạng chuỗi hoặc mảng)
      const backendMessage = err.response?.data?.message;

      const msg = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage || 'Đăng ký thất bại, vui lòng thử lại.';

      // Chỉ hiển thị trong Alert, không dùng message.error
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-xl rounded-2xl"
        title={
          <div className="text-center">
            <SafetyOutlined className="text-4xl text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Đăng ký tài khoản</h1>
            <p className="text-gray-600 text-sm">Hệ thống chăm sóc người cao tuổi - Take Care Me</p>
          </div>
        }
      >
        <Form
          layout="vertical"
          onFinish={handleRegister}
          form={form}
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
            <Input size="large" prefix={<UserOutlined />} placeholder="Nhập họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input size="large" prefix={<MailOutlined />} placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ pattern: /^[0-9]{9,15}$/, message: 'Số điện thoại không hợp lệ' }]}
          >
            <Input size="large" prefix={<PhoneOutlined />} placeholder="Nhập số điện thoại (tuỳ chọn)" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="Nhập mật khẩu" />
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
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="Nhập lại mật khẩu" />
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

          {/* Hiển thị lỗi từ backend */}
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

          {/* Hiển thị thành công */}
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
