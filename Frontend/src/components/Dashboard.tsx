import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Card, Statistic, Progress, Alert, Tabs, Button, Space } from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  HeartOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  BellOutlined,
  MedicineBoxOutlined,
  SafetyOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { mockDashboardStats } from '../data/mockData';
import { ApiSummary, getDashboardSummary } from '../api';
import HealthChart from './charts/HealthChart';
import AppointmentChart from './charts/AppointmentChart';
import RecentActivities from './RecentActivities';
import UpcomingAppointments from './UpcomingAppointments';
import SystemOverview from './SystemOverview';

const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<ApiSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = useMemo(
    () => (process.env.REACT_APP_API_URL || 'http://localhost:3000').replace(/\/$/, ''),
    [],
  );

   useEffect(() => {
    const fetchSummary = async () => {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');

      // ✅ Kiểm tra quyền trước khi gọi API
      if (!['SuperAdmin', 'Admin', 'Doctor'].includes(userData.role)) {
        setError('Bạn không có quyền truy cập Dashboard.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await getDashboardSummary();
        setSummary(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  // Map API -> UI stats (fallback mock if API chưa sẵn sàng)
  const stats = useMemo(() => {
    if (!summary) return mockDashboardStats;
    return {
      totalElderly: summary.totalElders ?? mockDashboardStats.totalElderly,
      activeElderly: mockDashboardStats.activeElderly, // chưa có từ API, tạm giữ mock
      totalCaregivers: summary.totalStaff ?? mockDashboardStats.totalCaregivers,
      availableCaregivers: mockDashboardStats.availableCaregivers, // chưa có từ API
      totalAppointments: mockDashboardStats.totalAppointments, // chưa có từ API
      completedAppointments: mockDashboardStats.completedAppointments, // chưa có từ API
      criticalCases: summary.criticalAlerts ?? mockDashboardStats.criticalCases,
    };
  }, [summary]);

  if (error === 'Bạn không có quyền truy cập Dashboard.') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-700 text-lg font-medium">🚫 {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-gray-500 text-center mt-10">
        Đang tải dữ liệu từ máy chủ...
      </div>
    );
  }

  if (error && error !== 'Bạn không có quyền truy cập Dashboard.') {
    return (
      <div className="text-center text-red-600 mt-10">
        Lỗi: {error}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tổng quan hệ thống</h1>
          <p className="text-gray-600">Chào mừng bạn đến với hệ thống quản lý chăm sóc người cao tuổi</p>
        </div>
        <Space>
          <Button icon={<InfoCircleOutlined />}>
            Hướng dẫn
          </Button>
          <Button type="primary" icon={<BellOutlined />}>
            Cảnh báo
          </Button>
        </Space>
      </div>

      {loading && (
        <div className="text-gray-500">Đang tải dữ liệu từ máy chủ...</div>
      )}
      {error && (
        <div className="text-red-600">Lỗi: {error}</div>
      )}

      {/* Statistics Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số người cao tuổi"
              value={stats.totalElderly}
              prefix={<UserOutlined className="text-primary-500" />}
              valueStyle={{ color: '#0ea5e9' }}
            />
            <div className="mt-2">
              <Progress 
                percent={(stats.activeElderly / stats.totalElderly) * 100} 
                size="small" 
                status="active"
              />
              <span className="text-sm text-gray-500 ml-2">
                {stats.activeElderly} đang hoạt động
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Người chăm sóc"
              value={stats.totalCaregivers}
              prefix={<TeamOutlined className="text-green-500" />}
              valueStyle={{ color: '#10b981' }}
            />
            <div className="mt-2">
              <span className="text-sm text-green-600">
                {stats.availableCaregivers} có sẵn
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuộc hẹn"
              value={stats.totalAppointments}
              prefix={<CalendarOutlined className="text-orange-500" />}
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="mt-2">
              <span className="text-sm text-orange-600">
                {stats.completedAppointments} đã hoàn thành
              </span>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Trường hợp khẩn cấp"
              value={stats.criticalCases}
              prefix={<ExclamationCircleOutlined className="text-red-500" />}
              valueStyle={{ color: '#ef4444' }}
            />
            <div className="mt-2">
              <span className="text-sm text-red-600">
                Cần theo dõi đặc biệt
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.criticalCases > 0 && (
        <Alert
          message="Cảnh báo"
          description={`Có ${stats.criticalCases} trường hợp cần theo dõi đặc biệt. Vui lòng kiểm tra ngay.`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
          action={
            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm">
              Xem chi tiết
            </button>
          }
        />
      )}

      {/* Main Content with Tabs */}
      <Card>
        <Tabs defaultActiveKey="overview" items={[
          {
            key: 'overview',
            label: (
              <span>
                <HeartOutlined />
                Tổng quan
              </span>
            ),
            children: (
              <>
                {/* Charts and Recent Activities */}
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Biểu đồ sức khỏe" className="h-96">
                      <HealthChart />
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Card title="Thống kê cuộc hẹn" className="h-96">
                      <AppointmentChart />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Hoạt động gần đây" className="h-96">
                      <RecentActivities />
                    </Card>
                  </Col>
                  
                  <Col xs={24} lg={12}>
                    <Card title="Cuộc hẹn sắp tới" className="h-96">
                      <UpcomingAppointments />
                    </Card>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: 'system',
            label: (
              <span>
                <SafetyOutlined />
                Hệ thống
              </span>
            ),
            children: <SystemOverview />
          }
        ]} />
      </Card>
    </div>
  );
};

export default Dashboard;