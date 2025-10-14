import React from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Progress, 
  Timeline, 
  Tag, 
  Space,
  Button,
  Alert,
  Divider
} from 'antd';
import {
  SafetyOutlined,
  HeartOutlined,
  TeamOutlined,
  CalendarOutlined,
  MedicineBoxOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  MobileOutlined,
  DesktopOutlined
} from '@ant-design/icons';

const SystemOverview: React.FC = () => {
  const systemStats = {
    totalUsers: 156,
    activeUsers: 142,
    totalElderly: 89,
    activeCaregivers: 24,
    totalAlerts: 12,
    criticalAlerts: 3,
    systemUptime: 99.8,
    dataAccuracy: 98.5
  };

  const recentActivities = [
    {
      time: '10:30',
      action: 'Cụ Nguyễn Văn A đã uống thuốc tim mạch',
      status: 'success',
      user: 'Điều dưỡng Trần Thị Y tá'
    },
    {
      time: '10:15',
      action: 'Cảnh báo huyết áp cao - Cụ Lê Văn C',
      status: 'warning',
      user: 'Hệ thống tự động'
    },
    {
      time: '09:45',
      action: 'Khám sức khỏe định kỳ hoàn thành',
      status: 'success',
      user: 'BS. Nguyễn Văn Bác sĩ'
    },
    {
      time: '09:30',
      action: 'Nhắc nhở uống thuốc - Cụ Trần Thị B',
      status: 'info',
      user: 'Hệ thống tự động'
    },
    {
      time: '09:00',
      action: 'Đăng nhập hệ thống',
      status: 'info',
      user: 'Quản lý Lê Thị Quản lý'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'warning':
        return <ExclamationCircleOutlined className="text-orange-500" />;
      case 'info':
        return <InfoCircleOutlined className="text-blue-500" />;
      default:
        return <InfoCircleOutlined className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Tổng quan hệ thống</h1>
        <p className="text-gray-600">Thông tin tổng quan về hệ thống Take Care Me</p>
      </div>

      {/* System Status */}
      <Alert
        message="Hệ thống hoạt động bình thường"
        description="Tất cả các dịch vụ đang hoạt động ổn định. Thời gian hoạt động: 99.8%"
        type="success"
        icon={<CheckCircleOutlined />}
        showIcon
        action={
          <Button size="small" type="primary">
            Xem chi tiết
          </Button>
        }
      />

      {/* Key Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={systemStats.totalUsers}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div className="mt-2">
              <Progress 
                percent={(systemStats.activeUsers / systemStats.totalUsers) * 100} 
                size="small" 
                status="active"
              />
              <span className="text-sm text-gray-500 ml-2">
                {systemStats.activeUsers} đang hoạt động
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người cao tuổi"
              value={systemStats.totalElderly}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div className="mt-2">
              <span className="text-sm text-green-600">
                Đang được chăm sóc
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Nhân viên chăm sóc"
              value={systemStats.activeCaregivers}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div className="mt-2">
              <span className="text-sm text-orange-600">
                Đang làm việc
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cảnh báo"
              value={systemStats.totalAlerts}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
            <div className="mt-2">
              <span className="text-sm text-red-600">
                {systemStats.criticalAlerts} khẩn cấp
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Performance */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Hiệu suất hệ thống">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Thời gian hoạt động</span>
                  <span className="font-medium">{systemStats.systemUptime}%</span>
                </div>
                <Progress 
                  percent={systemStats.systemUptime} 
                  status="active"
                  strokeColor="#52c41a"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span>Độ chính xác dữ liệu</span>
                  <span className="font-medium">{systemStats.dataAccuracy}%</span>
                </div>
                <Progress 
                  percent={systemStats.dataAccuracy} 
                  status="active"
                  strokeColor="#1890ff"
                />
              </div>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="Tính năng hệ thống">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MobileOutlined className="mr-2 text-blue-500" />
                  <span>Ứng dụng di động</span>
                </div>
                <Tag color="green">Hoạt động</Tag>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DesktopOutlined className="mr-2 text-blue-500" />
                  <span>Giao diện web</span>
                </div>
                <Tag color="green">Hoạt động</Tag>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BellOutlined className="mr-2 text-blue-500" />
                  <span>Hệ thống cảnh báo</span>
                </div>
                <Tag color="green">Hoạt động</Tag>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MedicineBoxOutlined className="mr-2 text-blue-500" />
                  <span>Quản lý thuốc</span>
                </div>
                <Tag color="green">Hoạt động</Tag>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CalendarOutlined className="mr-2 text-blue-500" />
                  <span>Lịch chăm sóc</span>
                </div>
                <Tag color="green">Hoạt động</Tag>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Recent Activities */}
      <Card title="Hoạt động gần đây">
        <Timeline>
          {recentActivities.map((activity, index) => (
            <Timeline.Item
              key={index}
              dot={getStatusIcon(activity.status)}
            >
              <div>
                <div className="font-medium">{activity.action}</div>
                <div className="text-sm text-gray-500">
                  {activity.time} • {activity.user}
                </div>
                <Tag color={getStatusColor(activity.status)} className="mt-1">
                  {activity.status === 'success' && 'Thành công'}
                  {activity.status === 'warning' && 'Cảnh báo'}
                  {activity.status === 'info' && 'Thông tin'}
                </Tag>
              </div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>

      {/* System Information */}
      <Card title="Thông tin hệ thống">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Phiên bản:</span>
                <span className="font-medium">v1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật cuối:</span>
                <span className="font-medium">15/01/2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngôn ngữ:</span>
                <span className="font-medium">Tiếng Việt</span>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Hỗ trợ:</span>
                <span className="font-medium">24/7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bảo mật:</span>
                <span className="font-medium">SSL/TLS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Backup:</span>
                <span className="font-medium">Hàng ngày</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default SystemOverview;
