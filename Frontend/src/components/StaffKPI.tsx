import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Row,
  Col,
  Statistic,
  Select,
  DatePicker,
  Space,
  Tag,
  message,
  Tabs,
  Button,
  Modal,
} from 'antd';
import {
  TrophyOutlined,
  ClockCircleOutlined,
  UserOutlined,
  AlertOutlined,
  HeartOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getAllStaffKPIs,
  getKPISummary,
  getCareHistory,
  getAlertHistory,
  StaffKPI,
  KPISummary,
} from '../api/kpi';
import { getAllStaff, Staff } from '../api/staff';
import type { ColumnsType } from 'antd/es/table';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;

const StaffKPIComponent: React.FC = () => {
  const [kpis, setKpis] = useState<StaffKPI[]>([]);
  const [summary, setSummary] = useState<KPISummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<{
    from?: string;
    to?: string;
    department?: string;
  }>({});
  const [selectedStaff, setSelectedStaff] = useState<number | null>(null);
  const [careHistory, setCareHistory] = useState<any[]>([]);
  const [alertHistory, setAlertHistory] = useState<any[]>([]);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadKPIs();
    loadSummary();
  }, [filters]);

  const loadKPIs = async () => {
    try {
      setLoading(true);
      const data = await getAllStaffKPIs(filters);
      setKpis(data);
    } catch (error: any) {
      message.error('Không thể tải dữ liệu KPI');
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    try {
      const data = await getKPISummary(filters);
      setSummary(data);
    } catch (error: any) {
      console.error('Error loading summary:', error);
    }
  };

  const loadHistory = async (staffId: number) => {
    try {
      setHistoryLoading(true);
      const [care, alerts] = await Promise.all([
        getCareHistory(staffId, 20),
        getAlertHistory(staffId, 20),
      ]);
      setCareHistory(care);
      setAlertHistory(alerts);
      setHistoryModalVisible(true);
    } catch (error: any) {
      message.error('Không thể tải lịch sử');
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatMinutes = (minutes: number) => {
    if (minutes === 0) return 'N/A';
    if (minutes < 60) return `${Math.round(minutes)} phút`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}p`;
  };

  const columns: ColumnsType<StaffKPI> = [
    {
      title: 'Nhân viên',
      key: 'staffName',
      render: (_, record) => (
        <div>
          <div className="font-medium">{record.staffName}</div>
          <Tag color="blue">{record.role}</Tag>
        </div>
      ),
    },
    {
      title: 'Tổng lượt chăm sóc',
      dataIndex: 'totalCareVisits',
      key: 'totalCareVisits',
      sorter: (a, b) => a.totalCareVisits - b.totalCareVisits,
      render: (value) => <span className="font-semibold">{value}</span>,
    },
    {
      title: 'Tháng này',
      dataIndex: 'careVisitsThisMonth',
      key: 'careVisitsThisMonth',
      sorter: (a, b) => a.careVisitsThisMonth - b.careVisitsThisMonth,
    },
    {
      title: 'Tuần này',
      dataIndex: 'careVisitsThisWeek',
      key: 'careVisitsThisWeek',
      sorter: (a, b) => a.careVisitsThisWeek - b.careVisitsThisWeek,
    },
    {
      title: 'Cảnh báo được giao',
      dataIndex: 'totalAlertsAssigned',
      key: 'totalAlertsAssigned',
      sorter: (a, b) => a.totalAlertsAssigned - b.totalAlertsAssigned,
    },
    {
      title: 'Đã xử lý',
      key: 'alertsResolved',
      render: (_, record) => (
        <div>
          <Tag color="green">{record.alertsResolved}</Tag>
          <span className="text-gray-500 text-xs ml-1">
            / {record.alertsAcknowledged}
          </span>
        </div>
      ),
    },
    {
      title: 'Thời gian phản hồi TB',
      dataIndex: 'averageResponseTime',
      key: 'averageResponseTime',
      sorter: (a, b) => a.averageResponseTime - b.averageResponseTime,
      render: (value) => (
        <Tag color={value < 30 ? 'green' : value < 60 ? 'orange' : 'red'}>
          {formatMinutes(value)}
        </Tag>
      ),
    },
    {
      title: 'Nhanh nhất',
      dataIndex: 'fastestResponseTime',
      key: 'fastestResponseTime',
      render: (value) => (
        <Tag color="green">{formatMinutes(value)}</Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedStaff(record.staffId);
            loadHistory(record.staffId);
          }}
        >
          Xem lịch sử
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <TrophyOutlined className="mr-2" />
          Theo dõi KPI nhân viên
        </h2>

        {/* Filters */}
        <Row gutter={16} className="mb-4">
          <Col span={8}>
            <RangePicker
              showTime
              style={{ width: '100%' }}
              onChange={(dates) => {
                if (dates) {
                  setFilters({
                    ...filters,
                    from: dates[0]?.format('YYYY-MM-DD'),
                    to: dates[1]?.format('YYYY-MM-DD'),
                  });
                } else {
                  setFilters({
                    ...filters,
                    from: undefined,
                    to: undefined,
                  });
                }
              }}
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Lọc theo phòng ban"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) =>
                setFilters({ ...filters, department: value || undefined })
              }
            >
              <Option value="Điều dưỡng">Điều dưỡng</Option>
              <Option value="Y tế">Y tế</Option>
              <Option value="Chăm sóc">Chăm sóc</Option>
            </Select>
          </Col>
        </Row>

        {/* Summary Statistics */}
        {summary && (
          <Row gutter={16} className="mb-4">
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng nhân viên"
                  value={summary.totalStaff}
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng lượt chăm sóc"
                  value={summary.totalCareVisits}
                  prefix={<HeartOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Tổng cảnh báo"
                  value={summary.totalAlerts}
                  prefix={<AlertOutlined />}
                />
              </Card>
            </Col>
            <Col span={6}>
              <Card>
                <Statistic
                  title="Thời gian phản hồi TB"
                  value={formatMinutes(summary.averageResponseTime)}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Top Performers */}
        {summary && summary.topPerformers.length > 0 && (
          <Card title="Top 5 nhân viên chăm sóc nhiều nhất" className="mb-4">
            <Space direction="vertical" style={{ width: '100%' }}>
              {summary.topPerformers.map((staff, index) => (
                <div
                  key={staff.staffId}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div className="flex items-center">
                    <TrophyOutlined
                      className={`mr-2 ${
                        index === 0
                          ? 'text-yellow-500'
                          : index === 1
                          ? 'text-gray-400'
                          : index === 2
                          ? 'text-orange-500'
                          : 'text-gray-300'
                      }`}
                    />
                    <span className="font-medium">{staff.staffName}</span>
                    <Tag color="blue" className="ml-2">
                      {staff.role}
                    </Tag>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg">
                      {staff.totalCareVisits}
                    </div>
                    <div className="text-xs text-gray-500">lượt chăm sóc</div>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {/* Fastest Responders */}
        {summary && summary.fastestResponders.length > 0 && (
          <Card title="Top 5 phản hồi nhanh nhất" className="mb-4">
            <Space direction="vertical" style={{ width: '100%' }}>
              {summary.fastestResponders.map((staff, index) => (
                <div
                  key={staff.staffId}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div className="flex items-center">
                    <ClockCircleOutlined className="mr-2 text-green-500" />
                    <span className="font-medium">{staff.staffName}</span>
                    <Tag color="blue" className="ml-2">
                      {staff.role}
                    </Tag>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-lg text-green-600">
                      {formatMinutes(staff.averageResponseTime)}
                    </div>
                    <div className="text-xs text-gray-500">thời gian TB</div>
                  </div>
                </div>
              ))}
            </Space>
          </Card>
        )}

        {/* KPI Table */}
        <Table
          columns={columns}
          dataSource={kpis}
          loading={loading}
          rowKey="staffId"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* History Modal */}
      <Modal
        title="Lịch sử hoạt động"
        open={historyModalVisible}
        onCancel={() => setHistoryModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Tabs defaultActiveKey="care">
          <TabPane tab="Lịch sử chăm sóc" key="care">
            <Table
              dataSource={careHistory}
              loading={historyLoading}
              rowKey="eventId"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: 'Thời gian',
                  dataIndex: 'timestamp',
                  key: 'timestamp',
                  render: (text) =>
                    dayjs(text).format('DD/MM/YYYY HH:mm'),
                },
                {
                  title: 'Người cao tuổi',
                  key: 'elder',
                  render: (_, record) =>
                    record.elder?.user?.fullName || record.elder?.fullName || 'N/A',
                },
                {
                  title: 'Loại',
                  dataIndex: 'type',
                  key: 'type',
                },
                {
                  title: 'Ghi chú',
                  dataIndex: 'notes',
                  key: 'notes',
                },
              ]}
            />
          </TabPane>
          <TabPane tab="Lịch sử cảnh báo" key="alerts">
            <Table
              dataSource={alertHistory}
              loading={historyLoading}
              rowKey="alertId"
              pagination={{ pageSize: 10 }}
              columns={[
                {
                  title: 'Thời gian',
                  dataIndex: 'triggeredAt',
                  key: 'triggeredAt',
                  render: (text) =>
                    dayjs(text).format('DD/MM/YYYY HH:mm'),
                },
                {
                  title: 'Người cao tuổi',
                  key: 'elder',
                  render: (_, record) =>
                    record.elder?.user?.fullName || record.elder?.fullName || 'N/A',
                },
                {
                  title: 'Mức độ',
                  dataIndex: 'severity',
                  key: 'severity',
                  render: (severity) => {
                    const colorMap: Record<string, string> = {
                      Critical: 'red',
                      High: 'orange',
                      Medium: 'yellow',
                      Low: 'blue',
                    };
                    return (
                      <Tag color={colorMap[severity] || 'default'}>
                        {severity}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => {
                    const colorMap: Record<string, string> = {
                      Open: 'red',
                      Acknowledged: 'orange',
                      Resolved: 'green',
                    };
                    return (
                      <Tag color={colorMap[status] || 'default'}>
                        {status}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Thời gian phản hồi',
                  key: 'responseTime',
                  render: (_, record) => {
                    if (!record.acknowledgedAt) return 'Chưa phản hồi';
                    const triggered = dayjs(record.triggeredAt);
                    const acknowledged = dayjs(record.acknowledgedAt);
                    const minutes = acknowledged.diff(triggered, 'minute');
                    return formatMinutes(minutes);
                  },
                },
              ]}
            />
          </TabPane>
        </Tabs>
      </Modal>
    </div>
  );
};

export default StaffKPIComponent;













