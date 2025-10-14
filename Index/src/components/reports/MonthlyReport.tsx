import React from 'react';
import { Card, Row, Col, Statistic, Table, Progress } from 'antd';
import { UserOutlined, CalendarOutlined, HeartOutlined, TeamOutlined } from '@ant-design/icons';

const MonthlyReport: React.FC = () => {
  const monthlyStats = {
    totalElderly: 25,
    newElderly: 3,
    totalAppointments: 120,
    completedAppointments: 110,
    healthRecords: 85,
    criticalCases: 2,
    averageRating: 4.7,
    totalCaregivers: 8,
    activeCaregivers: 7,
  };

  const topCaregivers = [
    {
      key: '1',
      name: 'Nguyễn Thị Lan',
      completedAppointments: 25,
      rating: 4.8,
      elderlyCount: 5,
    },
    {
      key: '2',
      name: 'Trần Văn Minh',
      completedAppointments: 22,
      rating: 4.9,
      elderlyCount: 4,
    },
    {
      key: '3',
      name: 'Lê Thị Hoa',
      completedAppointments: 18,
      rating: 4.6,
      elderlyCount: 3,
    },
  ];

  const healthTrends = [
    {
      key: '1',
      condition: 'Huyết áp cao',
      count: 8,
      percentage: 32,
      trend: 'up',
    },
    {
      key: '2',
      condition: 'Tiểu đường',
      count: 5,
      percentage: 20,
      trend: 'stable',
    },
    {
      key: '3',
      condition: 'Tim mạch',
      count: 3,
      percentage: 12,
      trend: 'down',
    },
    {
      key: '4',
      condition: 'Alzheimer',
      count: 2,
      percentage: 8,
      trend: 'stable',
    },
  ];

  const caregiverColumns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Cuộc hẹn hoàn thành',
      dataIndex: 'completedAppointments',
      key: 'completedAppointments',
      sorter: (a: any, b: any) => a.completedAppointments - b.completedAppointments,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => `${rating}/5`,
      sorter: (a: any, b: any) => a.rating - b.rating,
    },
    {
      title: 'Số bệnh nhân',
      dataIndex: 'elderlyCount',
      key: 'elderlyCount',
      sorter: (a: any, b: any) => a.elderlyCount - b.elderlyCount,
    },
  ];

  const healthColumns = [
    {
      title: 'Tình trạng sức khỏe',
      dataIndex: 'condition',
      key: 'condition',
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      sorter: (a: any, b: any) => a.count - b.count,
    },
    {
      title: 'Tỷ lệ',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (percentage: number) => (
        <Progress
          percent={percentage}
          size="small"
          status={percentage > 30 ? 'exception' : percentage > 20 ? 'active' : 'success'}
        />
      ),
      sorter: (a: any, b: any) => a.percentage - b.percentage,
    },
    {
      title: 'Xu hướng',
      dataIndex: 'trend',
      key: 'trend',
      render: (trend: string) => {
        const trendConfig = {
          up: { color: 'red', text: 'Tăng' },
          down: { color: 'green', text: 'Giảm' },
          stable: { color: 'blue', text: 'Ổn định' },
        };
        const config = trendConfig[trend as keyof typeof trendConfig];
        return (
          <span style={{ color: config.color }}>
            {config.text}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng số người cao tuổi"
              value={monthlyStats.totalElderly}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#0ea5e9' }}
            />
            <div className="mt-2 text-sm text-green-600">
              +{monthlyStats.newElderly} mới trong tháng
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Cuộc hẹn"
              value={monthlyStats.totalAppointments}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#10b981' }}
            />
            <div className="mt-2 text-sm text-green-600">
              {monthlyStats.completedAppointments} hoàn thành
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hồ sơ sức khỏe"
              value={monthlyStats.healthRecords}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#f59e0b' }}
            />
            <div className="mt-2 text-sm text-gray-600">
              Được cập nhật trong tháng
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đánh giá trung bình"
              value={monthlyStats.averageRating}
              suffix="/5"
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#8b5cf6' }}
            />
            <div className="mt-2 text-sm text-gray-600">
              Từ {monthlyStats.activeCaregivers} người chăm sóc
            </div>
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Top người chăm sóc" size="small">
            <Table
              columns={caregiverColumns}
              dataSource={topCaregivers}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Tình trạng sức khỏe phổ biến" size="small">
            <Table
              columns={healthColumns}
              dataSource={healthTrends}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Key Insights */}
      <Card title="Nhận xét chính" size="small">
        <div className="space-y-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">✅ Điểm tích cực</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Tỷ lệ hoàn thành cuộc hẹn cao (91.7%)</li>
              <li>• Đánh giá người chăm sóc tốt (4.7/5)</li>
              <li>• Số lượng hồ sơ sức khỏe được cập nhật thường xuyên</li>
            </ul>
          </div>
          
          <div className="p-4 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">⚠️ Cần chú ý</h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Có 2 trường hợp khẩn cấp cần theo dõi</li>
              <li>• Tỷ lệ huyết áp cao khá cao (32%)</li>
              <li>• Cần tăng cường hoạt động phòng ngừa</li>
            </ul>
          </div>
          
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">💡 Khuyến nghị</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Tăng cường chương trình tập thể dục cho người cao tuổi</li>
              <li>• Cải thiện chế độ dinh dưỡng và theo dõi huyết áp</li>
              <li>• Đào tạo thêm kỹ năng cho người chăm sóc</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MonthlyReport;
