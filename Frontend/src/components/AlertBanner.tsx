import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Space, 
  Tag, 
  Badge,
  Row,
  Col,
  Statistic,
  Alert,
  Tabs,
  Timeline,
  Avatar
} from 'antd';
import {
  BellOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  UserOutlined,
  HeartOutlined,
  MedicineBoxOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Extend dayjs with relativeTime plugin
dayjs.extend(relativeTime);

const { Option } = Select;
const { TabPane } = Tabs;
const { TextArea } = Input;

interface AlertItem {
  id: string;
  type: 'health' | 'medication' | 'emergency' | 'appointment' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  elderlyId: string;
  elderlyName: string;
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  createdAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
  resolvedBy?: string;
  notes?: string;
}

const AlertsManagement: React.FC = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'health',
      priority: 'critical',
      title: 'Huyết áp cao bất thường',
      description: 'Huyết áp của Cụ Nguyễn Văn A đạt 180/110 mmHg, vượt ngưỡng an toàn',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      status: 'active',
      createdAt: '2024-01-15 14:30:00',
      notes: 'Cần theo dõi sát và có thể cần can thiệp y tế'
    },
    {
      id: '2',
      type: 'medication',
      priority: 'high',
      title: 'Bỏ lỡ thuốc quan trọng',
      description: 'Cụ Trần Thị B chưa uống thuốc Metformin trong 2 giờ qua',
      elderlyId: '2',
      elderlyName: 'Cụ Trần Thị B',
      status: 'acknowledged',
      createdAt: '2024-01-15 12:00:00',
      acknowledgedAt: '2024-01-15 12:15:00',
      acknowledgedBy: 'Điều dưỡng Phạm Thị Y tá'
    },
    {
      id: '3',
      type: 'emergency',
      priority: 'critical',
      title: 'Ngã và cần hỗ trợ',
      description: 'Cụ Lê Văn C bị ngã trong phòng, cần kiểm tra ngay lập tức',
      elderlyId: '3',
      elderlyName: 'Cụ Lê Văn C',
      status: 'resolved',
      createdAt: '2024-01-15 10:45:00',
      resolvedAt: '2024-01-15 11:00:00',
      resolvedBy: 'Điều dưỡng Nguyễn Văn D',
      notes: 'Đã kiểm tra, cụ không bị thương nghiêm trọng'
    },
    {
      id: '4',
      type: 'appointment',
      priority: 'medium',
      title: 'Lịch hẹn sắp tới',
      description: 'Cụ Nguyễn Văn A có lịch hẹn với bác sĩ tim mạch trong 30 phút',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      status: 'active',
      createdAt: '2024-01-15 15:00:00'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertItem | null>(null);
  const [form] = Form.useForm();

  const typeIcons = {
    health: <HeartOutlined className="text-red-500" />,
    medication: <MedicineBoxOutlined className="text-orange-500" />,
    emergency: <ExclamationCircleOutlined className="text-red-600" />,
    appointment: <ClockCircleOutlined className="text-blue-500" />,
    system: <BellOutlined className="text-gray-500" />
  };

  const priorityColors = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  };

  const statusColors = {
    active: 'red',
    acknowledged: 'orange',
    resolved: 'green',
    dismissed: 'gray'
  };

  const statusLabels = {
    active: 'Đang hoạt động',
    acknowledged: 'Đã xác nhận',
    resolved: 'Đã giải quyết',
    dismissed: 'Đã bỏ qua'
  };

  const columns = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type: keyof typeof typeIcons) => (
        <div className="flex items-center">
          {typeIcons[type]}
          <span className="ml-2 capitalize">{type}</span>
        </div>
      ),
    },
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: AlertItem) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.elderlyName}</div>
        </div>
      ),
    },
    {
      title: 'Mức độ',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: keyof typeof priorityColors) => (
        <Tag color={priorityColors[priority]} className="uppercase">
          {priority}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: keyof typeof statusColors) => (
        <Tag color={statusColors[status]}>
          {statusLabels[status]}
        </Tag>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: unknown, record: AlertItem) => (
        <Space>
          <Button 
            type="link" 
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          {record.status === 'active' && (
            <Button 
              type="link" 
              onClick={() => handleAcknowledge(record.id)}
            >
              Xác nhận
            </Button>
          )}
          {record.status === 'acknowledged' && (
            <Button 
              type="link" 
              onClick={() => handleResolve(record.id)}
            >
              Giải quyết
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleView = (alert: AlertItem) => {
    setSelectedAlert(alert);
    setIsModalVisible(true);
  };

  const handleAcknowledge = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { 
            ...alert, 
            status: 'acknowledged' as const,
            acknowledgedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            acknowledgedBy: 'Người dùng hiện tại'
          }
        : alert
    ));
  };

  const handleResolve = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id 
        ? { 
            ...alert, 
            status: 'resolved' as const,
            resolvedAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            resolvedBy: 'Người dùng hiện tại'
          }
        : alert
    ));
  };

  const getStatistics = () => {
    const total = alerts.length;
    const active = alerts.filter(a => a.status === 'active').length;
    const critical = alerts.filter(a => a.priority === 'critical').length;
    const resolved = alerts.filter(a => a.status === 'resolved').length;

    return { total, active, critical, resolved };
  };

  const stats = getStatistics();

  const recentAlerts = alerts
    .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý cảnh báo</h1>
        <p className="text-gray-600">Theo dõi và xử lý các cảnh báo khẩn cấp và thông báo hệ thống</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng cảnh báo"
              value={stats.total}
              prefix={<BellOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={stats.critical}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã giải quyết"
              value={stats.resolved}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Critical Alerts */}
      {stats.critical > 0 && (
        <Alert
          message="Cảnh báo khẩn cấp"
          description={`Có ${stats.critical} cảnh báo khẩn cấp cần xử lý ngay lập tức!`}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          action={
            <Button size="small" danger>
              Xem ngay
            </Button>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        {/* Alerts Table */}
        <Col xs={24} lg={16}>
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Danh sách cảnh báo</h2>
            </div>

            <Tabs defaultActiveKey="all">
              <TabPane tab={`Tất cả (${stats.total})`} key="all">
                <Table 
                  columns={columns} 
                  dataSource={alerts}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              <TabPane tab={`Đang hoạt động (${stats.active})`} key="active">
                <Table 
                  columns={columns} 
                  dataSource={alerts.filter(a => a.status === 'active')}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
              <TabPane tab={`Khẩn cấp (${stats.critical})`} key="critical">
                <Table 
                  columns={columns} 
                  dataSource={alerts.filter(a => a.priority === 'critical')}
                  rowKey="id"
                  pagination={{ pageSize: 10 }}
                />
              </TabPane>
            </Tabs>
          </Card>
        </Col>

        {/* Recent Activity */}
        <Col xs={24} lg={8}>
          <Card title="Hoạt động gần đây">
            <Timeline>
              {recentAlerts.map(alert => (
                <Timeline.Item
                  key={alert.id}
                  dot={
                    <Avatar 
                      size="small" 
                      style={{ 
                        backgroundColor: priorityColors[alert.priority] 
                      }}
                    >
                      {typeIcons[alert.type]}
                    </Avatar>
                  }
                >
                  <div>
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs text-gray-500">
                      {alert.elderlyName} • {dayjs(alert.createdAt).fromNow()}
                    </div>
                    <Tag 
                      color={statusColors[alert.status]}
                      className="mt-1 text-xs"
                    >
                      {statusLabels[alert.status]}
                    </Tag>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>
      </Row>

      {/* Alert Detail Modal */}
      <Modal
        title="Chi tiết cảnh báo"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{selectedAlert.title}</h3>
              <p className="text-gray-600">{selectedAlert.description}</p>
            </div>

            <Row gutter={16}>
              <Col span={12}>
                <div>
                  <strong>Loại:</strong> 
                  <Tag color={priorityColors[selectedAlert.priority]} className="ml-2">
                    {selectedAlert.priority.toUpperCase()}
                  </Tag>
                </div>
              </Col>
              <Col span={12}>
                <div>
                  <strong>Trạng thái:</strong> 
                  <Tag color={statusColors[selectedAlert.status]} className="ml-2">
                    {statusLabels[selectedAlert.status]}
                  </Tag>
                </div>
              </Col>
            </Row>

            <div>
              <strong>Người cao tuổi:</strong> {selectedAlert.elderlyName}
            </div>

            <div>
              <strong>Thời gian tạo:</strong> {dayjs(selectedAlert.createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </div>

            {selectedAlert.acknowledgedAt && (
              <div>
                <strong>Đã xác nhận:</strong> {dayjs(selectedAlert.acknowledgedAt).format('DD/MM/YYYY HH:mm:ss')}
                {selectedAlert.acknowledgedBy && ` bởi ${selectedAlert.acknowledgedBy}`}
              </div>
            )}

            {selectedAlert.resolvedAt && (
              <div>
                <strong>Đã giải quyết:</strong> {dayjs(selectedAlert.resolvedAt).format('DD/MM/YYYY HH:mm:ss')}
                {selectedAlert.resolvedBy && ` bởi ${selectedAlert.resolvedBy}`}
              </div>
            )}

            {selectedAlert.notes && (
              <div>
                <strong>Ghi chú:</strong>
                <p className="mt-1 p-2 bg-gray-50 rounded">{selectedAlert.notes}</p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              {selectedAlert.status === 'active' && (
                <Button 
                  type="primary"
                  onClick={() => {
                    handleAcknowledge(selectedAlert.id);
                    setIsModalVisible(false);
                  }}
                >
                  Xác nhận
                </Button>
              )}
              {selectedAlert.status === 'acknowledged' && (
                <Button 
                  type="primary"
                  onClick={() => {
                    handleResolve(selectedAlert.id);
                    setIsModalVisible(false);
                  }}
                >
                  Giải quyết
                </Button>
              )}
              <Button onClick={() => setIsModalVisible(false)}>
                Đóng
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AlertsManagement;