import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Input, Alert, message } from 'antd';
import {
  MailOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import api from '../config/api';

interface ActivateAccountProps {
  onActivated: () => void;
  onBackToLogin: () => void;
}

interface ActivateResponse {
  message: string;
}

const ActivateAccount: React.FC<ActivateAccountProps> = ({
  onActivated,
  onBackToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // ✅ Đếm ngược 60 giây khi gửi lại mã
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 🧩 Gửi mã xác nhận
  const handleActivate = async () => {
    if (!code) {
      message.warning('Vui lòng nhập mã xác nhận!');
      return;
    }
    try {
      setLoading(true);
      const res = await api.post<ActivateResponse>('/api/auth/activate', { code });
      setSuccess(res.data.message || 'Kích hoạt thành công!');
      message.success('Kích hoạt tài khoản thành công!');
      setTimeout(() => onActivated(), 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message || 'Mã kích hoạt không hợp lệ hoặc đã hết hạn.';
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Gửi lại mã kích hoạt
  const handleResend = async () => {
    if (!email) {
      message.warning('Vui lòng nhập email để gửi lại mã!');
      return;
    }
    try {
      setResending(true);
      const res = await api.post('/api/auth/resend-code', { email });
      message.success(res.data.message || 'Đã gửi lại mã xác nhận!');
      setCountdown(60);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Không thể gửi lại mã.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card
        className="w-full max-w-md shadow-xl rounded-2xl"
        title={
          <div className="text-center">
            <SafetyOutlined className="text-4xl text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-gray-800">Xác nhận email</h1>
            <p className="text-gray-600 text-sm">
              Mã kích hoạt đã được gửi đến email của bạn.
            </p>
          </div>
        }
      >
        <Form layout="vertical" onFinish={handleActivate}>
          <Form.Item label="Email">
            <Input
              size="large"
              prefix={<MailOutlined />}
              placeholder="Nhập email đã đăng ký"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Item>

          <Form.Item label="Mã xác nhận">
            <Input
              size="large"
              prefix={<CheckCircleOutlined />}
              placeholder="Nhập mã 6 ký tự (VD: ABC123)"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
            />
          </Form.Item>

          {/* Thông báo lỗi */}
          {error && (
            <Alert
              message="Lỗi kích hoạt"
              description={error}
              type="error"
              showIcon
              closable
              className="mb-3"
              onClose={() => setError(null)}
            />
          )}

          {/* Thông báo thành công */}
          {success && (
            <Alert
              message="Thành công"
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
              {loading ? 'Đang xác nhận...' : 'Kích hoạt tài khoản'}
            </Button>
          </Form.Item>

          <Button
            icon={<RedoOutlined />}
            type="link"
            block
            onClick={handleResend}
            disabled={countdown > 0}
            loading={resending}
          >
            {countdown > 0
              ? `Gửi lại mã sau ${countdown}s`
              : 'Gửi lại mã xác nhận'}
          </Button>

          <Button type="link" block onClick={onBackToLogin}>
            ← Quay lại đăng nhập
          </Button>
        </Form>
      </Card>
    </div>
  );
};

export default ActivateAccount;
