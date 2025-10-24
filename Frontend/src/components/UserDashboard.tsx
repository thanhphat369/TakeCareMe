import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, List, Avatar, Tag, Button, Select, DatePicker, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  MedicineBoxOutlined,
  HeartOutlined,
  HomeOutlined,
  CrownOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { UserStats, User } from '../types';
import { getUserStats, getUsers } from '../api/users';

const { RangePicker } = DatePicker;
const { Option } = Select;

const UserDashboard: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<string>('30days');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, users] = await Promise.all([
        getUserStats(),
        getUsers()
      ]);
      setUserStats(stats);
      setRecentUsers(users.slice(0, 10)); // Get first 10 users
    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return <CrownOutlined />;
      case 'Admin': return <TeamOutlined />;
      case 'Doctor': return <MedicineBoxOutlined />;
      case 'Staff': return <HeartOutlined />;
      case 'Family': return <HomeOutlined />;
      case 'Elder': return <UserOutlined />;
      default: return <UserOutlined />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'red';
      case 'Admin': return 'blue';
      case 'Doctor': return 'green';
      case 'Staff': return 'orange';
      case 'Family': return 'purple';
      case 'Elder': return 'cyan';
      default: return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'SuperAdmin': return 'Super Admin';
      case 'Admin': return 'Quản lý';
      case 'Doctor': return 'Bác sĩ';
      case 'Staff': return 'Nhân viên';
      case 'Family': return 'Người thân';
      case 'Elder': return 'Người cao tuổi';
      default: return role;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'green';
      case 'Inactive': return 'orange';
      case 'Banned': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Active': return 'Hoạt động';
      case 'Inactive': return 'Không hoạt động';
      case 'Banned': return 'Bị khóa';
      default: return status;
    }
  };

  if (!userStats) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Người dùng</h1>
          <p className="text-gray-600">Tổng quan về người dùng và hoạt động hệ thống</p>
        </div>
        <Space>
          <Select
            value={timeRange}
            onChange={setTimeRange}
            style={{ width: 120 }}
          >
            <Option value="7days">7 ngày</Option>
            <Option value="30days">30 ngày</Option>
            <Option value="90days">90 ngày</Option>
            <Option value="1year">1 năm</Option>
          </Select>
          <Button icon={<EyeOutlined />}>
            Xem chi tiết
          </Button>
        </Space>
      </div>

      {/* Main Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={userStats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={userStats.activeUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Không hoạt động"
              value={userStats.inactiveUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Bị khóa"
              value={userStats.bannedUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Additional Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đăng nhập gần đây"
              value={userStats.recentLogins}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Người dùng mới tháng này"
              value={userStats.newUsersThisMonth}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tỷ lệ hoạt động"
              value={Math.round((userStats.activeUsers / userStats.totalUsers) * 100)}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Users by Role */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Phân bố theo vai trò" loading={loading}>
            <div className="space-y-4">
              {userStats.usersByRole.map((roleData) => (
                <div key={roleData.role} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl mr-3" style={{ color: getRoleColor(roleData.role) }}>
                      {getRoleIcon(roleData.role)}
                    </div>
                    <div>
                      <div className="font-medium">{getRoleLabel(roleData.role)}</div>
                      <div className="text-sm text-gray-500">{roleData.count} người dùng</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-medium">{roleData.percentage}%</div>
                    <Progress 
                      percent={roleData.percentage} 
                      size="small" 
                      strokeColor={getRoleColor(roleData.role)}
                      showInfo={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Người dùng gần đây" loading={loading}>
            <List
              dataSource={recentUsers}
              renderItem={(user) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        src={user.avatar} 
                        icon={<UserOutlined />}
                        style={{ backgroundColor: getRoleColor(user.role) }}
                      />
                    }
                    title={
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{user.fullName}</span>
                        <Tag color={getRoleColor(user.role)}>
                          {getRoleLabel(user.role)}
                        </Tag>
                      </div>
                    }
                    description={
                      <div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center justify-between mt-1">
                          <Tag 
                            color={getStatusColor(user.status)}
                          >
                            {getStatusText(user.status)}
                          </Tag>
                          <span className="text-xs text-gray-400">
                            {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Role Overview Cards */}
      <Row gutter={[16, 16]}>
        {userStats.usersByRole.map((roleData) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={roleData.role}>
            <Card 
              hoverable
              className="text-center"
              style={{ borderColor: getRoleColor(roleData.role) }}
            >
              <div className="text-4xl mb-3" style={{ color: getRoleColor(roleData.role) }}>
                {getRoleIcon(roleData.role)}
              </div>
              <div className="text-2xl font-bold mb-1">{roleData.count}</div>
              <div className="text-sm text-gray-600 mb-2">{getRoleLabel(roleData.role)}</div>
              <Progress 
                percent={roleData.percentage} 
                size="small" 
                strokeColor={getRoleColor(roleData.role)}
                showInfo={false}
              />
              <div className="text-xs text-gray-500 mt-2">
                {roleData.percentage}% tổng người dùng
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default UserDashboard;
