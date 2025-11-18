import React, { useState } from 'react';
import { Card, Form, Input, Button, Switch, Select, message, Tabs, Row, Col, Divider } from 'antd';
import { SaveOutlined, UserOutlined, BellOutlined, SecurityScanOutlined, DatabaseOutlined } from '@ant-design/icons';
import EmergencyAlertSettings from './EmergencyAlertSettings';

const { Option } = Select;
const { TabPane } = Tabs;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSave = (values: any) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Cài đặt đã được lưu thành công');
    }, 1000);
  };

  const generalSettings = (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          systemName: 'Hệ thống quản lý chăm sóc người cao tuổi',
          language: 'vi',
          timezone: 'Asia/Ho_Chi_Minh',
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24h',
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="systemName"
              label="Tên hệ thống"
              rules={[{ required: true, message: 'Vui lòng nhập tên hệ thống' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: 'Vui lòng chọn ngôn ngữ' }]}
            >
              <Select>
                <Option value="vi">Tiếng Việt</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="timezone"
              label="Múi giờ"
              rules={[{ required: true, message: 'Vui lòng chọn múi giờ' }]}
            >
              <Select>
                <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Option>
                <Option value="UTC">UTC</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="dateFormat"
              label="Định dạng ngày"
              rules={[{ required: true, message: 'Vui lòng chọn định dạng ngày' }]}
            >
              <Select>
                <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="timeFormat"
          label="Định dạng giờ"
          rules={[{ required: true, message: 'Vui lòng chọn định dạng giờ' }]}
        >
          <Select>
            <Option value="12h">12 giờ (AM/PM)</Option>
            <Option value="24h">24 giờ</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
          Lưu cài đặt
        </Button>
      </Form>
    </Card>
  );

  const notificationSettings = (
    <Card>
      <Form
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          emailNotifications: true,
          smsNotifications: false,
          appointmentReminders: true,
          healthAlerts: true,
          emergencyAlerts: true,
          reminderTime: 30,
        }}
      >
        <h3 className="text-lg font-medium mb-4">Thông báo qua Email</h3>
        <Form.Item name="emailNotifications" valuePropName="checked">
          <Switch />
          <span className="ml-2">Bật thông báo email</span>
        </Form.Item>

        <h3 className="text-lg font-medium mb-4 mt-6">Thông báo qua SMS</h3>
        <Form.Item name="smsNotifications" valuePropName="checked">
          <Switch />
          <span className="ml-2">Bật thông báo SMS</span>
        </Form.Item>

        <Divider />

        <h3 className="text-lg font-medium mb-4">Loại thông báo</h3>
        <Form.Item name="appointmentReminders" valuePropName="checked">
          <Switch />
          <span className="ml-2">Nhắc nhở cuộc hẹn</span>
        </Form.Item>

        <Form.Item name="healthAlerts" valuePropName="checked">
          <Switch />
          <span className="ml-2">Cảnh báo sức khỏe</span>
        </Form.Item>

        <Form.Item name="emergencyAlerts" valuePropName="checked">
          <Switch />
          <span className="ml-2">Cảnh báo khẩn cấp</span>
        </Form.Item>

        <Form.Item
          name="reminderTime"
          label="Thời gian nhắc nhở trước (phút)"
        >
          <Select>
            <Option value={15}>15 phút</Option>
            <Option value={30}>30 phút</Option>
            <Option value={60}>1 giờ</Option>
            <Option value={120}>2 giờ</Option>
            <Option value={1440}>1 ngày</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
          Lưu cài đặt
        </Button>
      </Form>

      <div style={{ marginTop: 16 }}>
        <EmergencyAlertSettings />
      </div>
    </Card>
  );

  const securitySettings = (
    <Card>
      <Form
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          sessionTimeout: 30,
          passwordPolicy: 'medium',
          twoFactorAuth: false,
          loginAttempts: 5,
        }}
      >
        <h3 className="text-lg font-medium mb-4">Bảo mật phiên đăng nhập</h3>
        <Form.Item
          name="sessionTimeout"
          label="Thời gian hết hạn phiên (phút)"
        >
          <Select>
            <Option value={15}>15 phút</Option>
            <Option value={30}>30 phút</Option>
            <Option value={60}>1 giờ</Option>
            <Option value={120}>2 giờ</Option>
            <Option value={480}>8 giờ</Option>
          </Select>
        </Form.Item>

        <h3 className="text-lg font-medium mb-4 mt-6">Chính sách mật khẩu</h3>
        <Form.Item
          name="passwordPolicy"
          label="Độ mạnh mật khẩu"
        >
          <Select>
            <Option value="low">Thấp (6 ký tự)</Option>
            <Option value="medium">Trung bình (8 ký tự, có số và chữ)</Option>
            <Option value="high">Cao (10 ký tự, có số, chữ và ký tự đặc biệt)</Option>
          </Select>
        </Form.Item>

        <Form.Item name="twoFactorAuth" valuePropName="checked">
          <Switch />
          <span className="ml-2">Xác thực hai yếu tố (2FA)</span>
        </Form.Item>

        <Form.Item
          name="loginAttempts"
          label="Số lần đăng nhập sai tối đa"
        >
          <Select>
            <Option value={3}>3 lần</Option>
            <Option value={5}>5 lần</Option>
            <Option value={10}>10 lần</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
          Lưu cài đặt
        </Button>
      </Form>
    </Card>
  );

  const dataSettings = (
    <Card>
      <Form
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          dataRetention: 365,
          backupFrequency: 'daily',
          autoBackup: true,
          exportFormat: 'excel',
        }}
      >
        <h3 className="text-lg font-medium mb-4">Lưu trữ dữ liệu</h3>
        <Form.Item
          name="dataRetention"
          label="Thời gian lưu trữ dữ liệu (ngày)"
        >
          <Select>
            <Option value={90}>90 ngày</Option>
            <Option value={180}>180 ngày</Option>
            <Option value={365}>1 năm</Option>
            <Option value={730}>2 năm</Option>
            <Option value={1095}>3 năm</Option>
          </Select>
        </Form.Item>

        <h3 className="text-lg font-medium mb-4 mt-6">Sao lưu dữ liệu</h3>
        <Form.Item name="autoBackup" valuePropName="checked">
          <Switch />
          <span className="ml-2">Tự động sao lưu</span>
        </Form.Item>

        <Form.Item
          name="backupFrequency"
          label="Tần suất sao lưu"
        >
          <Select>
            <Option value="daily">Hàng ngày</Option>
            <Option value="weekly">Hàng tuần</Option>
            <Option value="monthly">Hàng tháng</Option>
          </Select>
        </Form.Item>

        <h3 className="text-lg font-medium mb-4 mt-6">Xuất dữ liệu</h3>
        <Form.Item
          name="exportFormat"
          label="Định dạng xuất mặc định"
        >
          <Select>
            <Option value="excel">Excel (.xlsx)</Option>
            <Option value="csv">CSV</Option>
            <Option value="pdf">PDF</Option>
          </Select>
        </Form.Item>

        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
          Lưu cài đặt
        </Button>
      </Form>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Cài đặt hệ thống</h1>
        <p className="text-gray-600">Quản lý cài đặt và cấu hình hệ thống</p>
      </div>

      <Tabs defaultActiveKey="general">
        <TabPane
          tab={
            <span>
              <UserOutlined />
              Tổng quan
            </span>
          }
          key="general"
        >
          {generalSettings}
        </TabPane>
        <TabPane
          tab={
            <span>
              <BellOutlined />
              Thông báo
            </span>
          }
          key="notifications"
        >
          {notificationSettings}
        </TabPane>
        <TabPane
          tab={
            <span>
              <SecurityScanOutlined />
              Bảo mật
            </span>
          }
          key="security"
        >
          {securitySettings}
        </TabPane>
        <TabPane
          tab={
            <span>
              <DatabaseOutlined />
              Dữ liệu
            </span>
          }
          key="data"
        >
          {dataSettings}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;
