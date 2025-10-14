import React from 'react';
import { Card, Row, Col, Statistic, List, Tag, Progress } from 'antd';
import {
  CalendarOutlined,
  HeartOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const WeeklyReport: React.FC = () => {
  const weeklyStats = {
    totalAppointments: 28,
    completedAppointments: 25,
    cancelledAppointments: 2,
    rescheduledAppointments: 1,
    healthRecords: 18,
    emergencyCalls: 1,
    newElderly: 1,
    averageResponseTime: 15, // minutes
  };

  const dailyBreakdown = [
    { day: 'Thứ 2', appointments: 6, completed: 6, healthRecords: 4 },
    { day: 'Thứ 3', appointments: 5, completed: 4, healthRecords: 3 },
    { day: 'Thứ 4', appointments: 4, completed: 4, healthRecords: 2 },
    { day: 'Thứ 5', appointments: 7, completed: 6, healthRecords: 5 },
    { day: 'Thứ 6', appointments: 4, completed: 3, healthRecords: 3 },
    { day: 'Thứ 7', appointments: 2, completed: 2, healthRecords: 1 },
    { day: 'Chủ nhật', appointments: 0, completed: 0, healthRecords: 0 },
  ];

  const recentActivities = [
    {
      id: 1,
      type: 'appointment',
      title: 'Cuộc hẹn khám sức khỏe hoàn thành',
      description: 'Nguyễn Văn An - Khám định kỳ',
      time: '2 giờ trước',
      status: 'completed',
    },
    {
      id: 2,
      type: 'health',
      title: 'Cập nhật hồ sơ sức khỏe',
      description: 'Trần Thị Bình - Huyết áp: 145/95 mmHg',
      time: '4 giờ trước',
      status: 'warning',
    },
    {
      id: 3,
      type: 'emergency',
      title: 'Cuộc gọi khẩn cấp',
      description: 'Lê Văn Cường - Cần hỗ trợ ngay',
      time: '6 giờ trước',
      status: 'emergency',
    },
    {
      id: 4,
      type: 'medication',
      title: 'Nhắc nhở uống thuốc',
      description: 'Phạm Thị Dung - Metformin 500mg',
      time: '8 giờ trước',
      status: 'info',
    },
    {
      id: 5,
      type: 'new',
      title: 'Thêm người cao tuổi mới',
      description: 'Hoàng Văn E (68 tuổi) đã được thêm vào hệ thống',
      time: '1 ngày trước',
      status: 'success',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'warning':
        return 'orange';
      case 'emergency':
        return 'red';
      case 'info':
        return 'blue';
      case 'success':
        return 'green';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined className="text-green-500" />;
      case 'warning':
        return <ExclamationCircleOutlined className="text-orange-500" />;
      case 'emergency':
        return <ExclamationCircleOutlined className="text-red-500" />;
      case 'info':
        return <HeartOutlined className="text-blue-500" />;
      case 'success':
        return <CheckCircleOutlined className="text-green-500" />;
      default:
        return <CalendarOutlined className="text-gray-500" />;
    }
  };

  const completionRate = (weeklyStats.completedAppointments / weeklyStats.totalAppointments) * 100;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuộc hẹn tuần này"
              value={weeklyStats.totalAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#0ea5e9' }}
            />
            <div className="mt-2">
              <Progress
                percent={completionRate}
                size="small"
                status={completionRate >= 90 ? 'success' : completionRate >= 70 ? 'active' : 'exception'}
              />
              <span className="text-sm text-gray-600 ml-2">
                {completionRate.toFixed(1)}% hoàn thành
              </span>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hồ sơ sức khỏe"
              value={weeklyStats.healthRecords}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
            <div className="mt-2 text-sm text-gray-600">
              Được cập nhật trong tuần
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuộc gọi khẩn cấp"
              value={weeklyStats.emergencyCalls}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
            <div className="mt-2 text-sm text-gray-600">
              Trong tuần này
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thời gian phản hồi TB"
              value={weeklyStats.averageResponseTime}
              suffix="phút"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
            <div className="mt-2 text-sm text-gray-600">
              Trung bình
            </div>
          </Card>
        </Col>
      </Row>

      {/* Daily Breakdown */}
      <Card title="Phân tích theo ngày" size="small">
        <Row gutter={[16, 16]}>
          {dailyBreakdown.map((day, index) => (
            <Col xs={24} sm={12} lg={8} key={index}>
              <Card size="small" className="text-center">
                <h4 className="font-medium mb-2">{day.day}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cuộc hẹn:</span>
                    <span className="font-medium">{day.appointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hoàn thành:</span>
                    <span className="font-medium text-green-600">{day.completed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Hồ sơ sức khỏe:</span>
                    <span className="font-medium text-blue-600">{day.healthRecords}</span>
                  </div>
                  {day.appointments > 0 && (
                    <Progress
                      percent={(day.completed / day.appointments) * 100}
                      size="small"
                      status={day.completed === day.appointments ? 'success' : 'active'}
                    />
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Recent Activities */}
      <Card title="Hoạt động gần đây" size="small">
        <List
          dataSource={recentActivities}
          renderItem={(activity) => (
            <List.Item>
              <List.Item.Meta
                avatar={getStatusIcon(activity.status)}
                title={
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{activity.title}</span>
                    <Tag color={getStatusColor(activity.status)}>
                      {activity.time}
                    </Tag>
                  </div>
                }
                description={activity.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Weekly Insights */}
      <Card title="Nhận xét tuần" size="small">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Thành tích tốt</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Tỷ lệ hoàn thành cuộc hẹn cao ({completionRate.toFixed(1)}%)</li>
              <li>• Thời gian phản hồi nhanh ({weeklyStats.averageResponseTime} phút)</li>
              <li>• Cập nhật hồ sơ sức khỏe đều đặn ({weeklyStats.healthRecords} hồ sơ)</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">⚠️ Cần cải thiện</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Có {weeklyStats.cancelledAppointments} cuộc hẹn bị hủy</li>
              <li>• {weeklyStats.rescheduledAppointments} cuộc hẹn phải dời lịch</li>
              <li>• Có {weeklyStats.emergencyCalls} cuộc gọi khẩn cấp</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">📈 Mục tiêu tuần tới</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Giảm số cuộc hẹn bị hủy xuống 0</li>
              <li>• Tăng số hồ sơ sức khỏe được cập nhật</li>
              <li>• Cải thiện thời gian phản hồi xuống dưới 10 phút</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WeeklyReport;
