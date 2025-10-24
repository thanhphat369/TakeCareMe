import React, { useState } from 'react';
import { Tabs, Card, Button, Space } from 'antd';
import {
  UserOutlined,
  BarChartOutlined,
  SettingOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import UserManagement from './UserManagement';
import UserDashboard from './UserDashboard';
import RolePermissions from './RolePermissions';

const UserManagementSystem: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabItems = [
    {
      key: 'dashboard',
      label: (
        <span>
          <BarChartOutlined />
          Dashboard
        </span>
      ),
      children: <UserDashboard />,
    },
    {
      key: 'users',
      label: (
        <span>
          <UserOutlined />
          Quản lý người dùng
        </span>
      ),
      children: <UserManagement />,
    },
    {
      key: 'roles',
      label: (
        <span>
          <CrownOutlined />
          Phân quyền
        </span>
      ),
      children: <RolePermissions />,
    },
    {
      key: 'permissions',
      label: (
        <span>
          <SettingOutlined />
          Quyền hạn
        </span>
      ),
      children: <RolePermissions selectedRole="SuperAdmin" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Hệ thống quản lý người dùng</h1>
            <p className="text-gray-600 text-lg">
              Quản lý tài khoản, phân quyền và theo dõi hoạt động người dùng
            </p>
          </div>
          <Space>
            <Button type="primary" icon={<TeamOutlined />}>
              Xuất báo cáo
            </Button>
            <Button icon={<SettingOutlined />}>
              Cài đặt
            </Button>
          </Space>
        </div>
      </Card>

      {/* Quick Stats */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <CrownOutlined className="text-3xl text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-blue-600">6</div>
            <div className="text-sm text-gray-600">Vai trò hệ thống</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <UserOutlined className="text-3xl text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-600">Active</div>
            <div className="text-sm text-gray-600">Trạng thái mặc định</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <SettingOutlined className="text-3xl text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-purple-600">24/7</div>
            <div className="text-sm text-gray-600">Hỗ trợ hệ thống</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <BarChartOutlined className="text-3xl text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-orange-600">Real-time</div>
            <div className="text-sm text-gray-600">Cập nhật dữ liệu</div>
          </div>
        </div>
      </Card>

      {/* Main Content */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>
    </div>
  );
};

export default UserManagementSystem;
