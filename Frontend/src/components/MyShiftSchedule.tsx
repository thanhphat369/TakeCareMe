import React, { useEffect, useMemo, useState } from 'react';
import {
  Card,
  List,
  Tag,
  Typography,
  Space,
  DatePicker,
  Select,
  Empty,
  Statistic,
  Row,
  Col,
  message,
  Skeleton,
  Button,
  Badge,
  Divider,
} from 'antd';
import {
  CalendarOutlined,
  FieldTimeOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/vi';
import { getMyShifts, Shift, startShift, completeShift } from '../api/shifts';

dayjs.locale('vi');

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title, Text } = Typography;

type FilterState = {
  status?: string;
  range?: [Dayjs, Dayjs] | null;
};

const statusOptions: Record<string, { color: string; label: string }> = {
  Scheduled: { color: 'blue', label: 'Đã lên lịch' },
  InProgress: { color: 'green', label: 'Đang thực hiện' },
  Completed: { color: 'default', label: 'Hoàn thành' },
  Cancelled: { color: 'red', label: 'Đã hủy' },
};

const MyShiftSchedule: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    range: [dayjs().startOf('week'), dayjs().endOf('week')],
  });
  const [role, setRole] = useState<'Doctor' | 'Staff' | string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'week'>('week');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setRole(parsed?.role ?? null);
      } catch {}
    }
  }, []);

  const derivedStats = useMemo(() => {
    if (!shifts.length) {
      return {
        total: 0,
        upcoming: 0,
        durationHours: 0,
        today: 0,
      };
    }

    const now = dayjs();
    const today = dayjs().startOf('day');
    const upcoming = shifts.filter((shift) => dayjs(shift.startTime).isAfter(now))
      .length;
    const todayShifts = shifts.filter((shift) =>
      dayjs(shift.startTime).isSame(today, 'day')
    ).length;
    const durationHours = shifts.reduce((acc, shift) => {
      const start = dayjs(shift.startTime);
      const end = dayjs(shift.endTime);
      return acc + Math.max(end.diff(start, 'hour', true), 0);
    }, 0);

    return {
      total: shifts.length,
      upcoming,
      today: todayShifts,
      durationHours: Math.round(durationHours * 10) / 10,
    };
  }, [shifts]);

  // Group shifts by day for week view
  const shiftsByDay = useMemo(() => {
    const grouped: Record<string, Shift[]> = {};
    shifts.forEach((shift) => {
      const dateKey = dayjs(shift.startTime).format('YYYY-MM-DD');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(shift);
    });
    return grouped;
  }, [shifts]);

  // Get week days
  const weekDays = useMemo(() => {
    const start = filters.range?.[0] || dayjs().startOf('week');
    const days: Dayjs[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(start.add(i, 'day'));
    }
    return days;
  }, [filters.range]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const params: { status?: string; from?: string; to?: string } = {};

        if (filters.status) {
          params.status = filters.status;
        }
        if (filters.range) {
          params.from = filters.range[0]?.startOf('day').toISOString();
          params.to = filters.range[1]?.endOf('day').toISOString();
        }

        const data = await getMyShifts(params);
        setShifts(data);
      } catch (error: any) {
        console.error('Failed to load my shifts:', error);
        message.error('Không thể tải lịch trực của bạn');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters]);

  const renderStatusTag = (status: string) => {
    const mapped = statusOptions[status] || { color: 'default', label: status };
    return <Tag color={mapped.color}>{mapped.label}</Tag>;
  };

  const canControl = role === 'Doctor' || role === 'Staff';

  const handleStart = async (id: number) => {
    try {
      await startShift(id);
      message.success('Đã bắt đầu ca trực');
      setFilters((prev) => ({ ...prev })); // trigger reload
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Không thể bắt đầu ca trực');
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await completeShift(id);
      message.success('Đã hoàn thành ca trực');
      setFilters((prev) => ({ ...prev })); // trigger reload
    } catch (e: any) {
      message.error(e?.response?.data?.message || 'Không thể hoàn thành ca trực');
    }
  };
  

  return (
    <div className="space-y-4">
      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space align="center" size="middle">
            <CalendarOutlined style={{ fontSize: 20 }} />
            <Title level={3} style={{ margin: 0 }}>
              Lịch trực của tôi
            </Title>
          </Space>

          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#f0f2f5' }}>
                <Statistic
                  title="Tổng số ca"
                  value={derivedStats.total}
                  suffix="ca"
                  prefix={<CalendarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#e6f7ff' }}>
                <Statistic
                  title="Ca hôm nay"
                  value={derivedStats.today}
                  suffix="ca"
                  prefix={<ClockCircleOutlined style={{ color: '#1890ff' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#f6ffed' }}>
                <Statistic
                  title="Ca sắp tới"
                  value={derivedStats.upcoming}
                  suffix="ca"
                  prefix={<FieldTimeOutlined style={{ color: '#52c41a' }} />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card bordered={false} style={{ background: '#fff7e6' }}>
                <Statistic
                  title="Tổng giờ trực"
                  value={derivedStats.durationHours}
                  suffix="giờ"
                  prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12} lg={8}>
              <RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={filters.range as any}
                onChange={(range) =>
                  setFilters((prev) => ({
                    ...prev,
                    range: range && range.length === 2 ? range : null,
                  }))
                }
                allowClear
                placeholder={['Từ ngày', 'Đến ngày']}
              />
            </Col>
            <Col xs={24} md={12} lg={6}>
              <Select
                placeholder="Lọc theo trạng thái"
                allowClear
                style={{ width: '100%' }}
                value={filters.status}
                onChange={(value) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: value || undefined,
                  }))
                }
              >
                {Object.entries(statusOptions).map(([key, option]) => (
                  <Option key={key} value={key}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} md={24} lg={10}>
              <Space>
                <Button
                  type={viewMode === 'week' ? 'primary' : 'default'}
                  onClick={() => setViewMode('week')}
                >
                  Tuần
                </Button>
                <Button
                  type={viewMode === 'list' ? 'primary' : 'default'}
                  onClick={() => setViewMode('list')}
                >
                  Danh sách
                </Button>
              </Space>
            </Col>
          </Row>
        </Space>
      </Card>

      <Card>
        {loading ? (
          <div className="space-y-3">
            <Skeleton active />
            <Skeleton active />
          </div>
        ) : shifts.length === 0 ? (
          <Empty
            description="Không có ca trực nào trong khoảng thời gian đã chọn"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : viewMode === 'week' ? (
          <div className="week-view">
            <Row gutter={[16, 16]}>
              {weekDays.map((day) => {
                const dateKey = day.format('YYYY-MM-DD');
                const dayShifts = shiftsByDay[dateKey] || [];
                const isToday = day.isSame(dayjs(), 'day');
                const isPast = day.isBefore(dayjs(), 'day');
                
                return (
                  <Col xs={24} sm={12} md={12} lg={12} xl={24 / 7} key={dateKey}>
                    <Card
                      size="small"
                      title={
                        <Space>
                          <Text strong style={{ fontSize: '16px' }}>
                            {day.format('dddd')}
                          </Text>
                          <Badge
                            count={dayShifts.length}
                            style={{ backgroundColor: isToday ? '#52c41a' : '#1890ff' }}
                          />
                        </Space>
                      }
                      extra={
                        <Text
                          type={isToday ? 'success' : isPast ? 'secondary' : 'default'}
                          style={{ fontWeight: isToday ? 'bold' : 'normal' }}
                        >
                          {day.format('DD/MM/YYYY')}
                        </Text>
                      }
                      style={{
                        border: isToday ? '2px solid #52c41a' : undefined,
                        backgroundColor: isToday ? '#f6ffed' : undefined,
                        minHeight: '300px',
                      }}
                    >
                      {dayShifts.length === 0 ? (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Không có ca trực"
                          style={{ padding: '20px 0' }}
                        />
                      ) : (
                        <div className="space-y-2">
                          {dayShifts
                            .sort((a, b) =>
                              dayjs(a.startTime).diff(dayjs(b.startTime))
                            )
                            .map((shift) => {
                              const start = dayjs(shift.startTime);
                              const end = dayjs(shift.endTime);
                              const duration = end.diff(start, 'hour', true);
                              const now = dayjs();
                              const isSameDay = now.isSame(start, 'day');
                              const canStartNow =
                                shift.status === 'Scheduled' &&
                                isSameDay &&
                                (now.isAfter(start) || now.isSame(start));
                              const canCompleteNow = shift.status === 'InProgress';

                              return (
                                <Card
                                  key={shift.shiftId}
                                  size="small"
                                  style={{
                                    marginBottom: '8px',
                                    borderLeft: `4px solid ${
                                      statusOptions[shift.status]?.color || '#d9d9d9'
                                    }`,
                                  }}
                                  bodyStyle={{ padding: '12px' }}
                                >
                                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                                    <Space size="small" wrap>
                                      {renderStatusTag(shift.status)}
                                      <Text strong style={{ fontSize: '14px' }}>
                                        {start.format('HH:mm')} - {end.format('HH:mm')}
                                      </Text>
                                    </Space>
                                    <Space size="small">
                                      <ClockCircleOutlined />
                                      <Text type="secondary">{duration.toFixed(1)} giờ</Text>
                                    </Space>
                                    {shift.location && (
                                      <Space size="small">
                                        <EnvironmentOutlined />
                                        <Text type="secondary" ellipsis>
                                          {shift.location}
                                        </Text>
                                      </Space>
                                    )}
                                    {shift.elders && shift.elders.length > 0 && (
                                      <div>
                                        <Space size="small" wrap>
                                          <UserOutlined />
                                          <Text type="secondary" style={{ fontSize: '12px' }}>
                                            Phụ trách:{' '}
                                          </Text>
                                          {shift.elders.map((elder) => (
                                            <Tag
                                              key={elder.elderId}
                                              color="cyan"
                                              style={{ margin: 0, fontSize: '12px' }}
                                            >
                                              {elder.user?.fullName || `Mã ${elder.elderId}`}
                                            </Tag>
                                          ))}
                                        </Space>
                                      </div>
                                    )}
                                    {canControl && (canStartNow || canCompleteNow) && (
                                      <Divider style={{ margin: '8px 0' }} />
                                    )}
                                    {canControl && canStartNow && (
                                      <Button
                                        type="primary"
                                        icon={<PlayCircleOutlined />}
                                        size="small"
                                        block
                                        onClick={() => handleStart(shift.shiftId)}
                                      >
                                        Bắt đầu ca trực
                                      </Button>
                                    )}
                                    {canControl && canCompleteNow && (
                                      <Button
                                        type="default"
                                        icon={<CheckCircleOutlined />}
                                        size="small"
                                        block
                                        onClick={() => handleComplete(shift.shiftId)}
                                      >
                                        Hoàn thành
                                      </Button>
                                    )}
                                  </Space>
                                </Card>
                              );
                            })}
                        </div>
                      )}
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </div>
        ) : (
          <List
            dataSource={shifts}
            renderItem={(shift) => {
              const start = dayjs(shift.startTime);
              const end = dayjs(shift.endTime);
              const duration = end.diff(start, 'hour', true);
              const now = dayjs();
              const isSameDay = now.isSame(start, 'day');
              const canStartNow =
                shift.status === 'Scheduled' &&
                isSameDay &&
                (now.isAfter(start) || now.isSame(start));
              const canCompleteNow = shift.status === 'InProgress';

              return (
                <List.Item
                  actions={
                    canControl && (canStartNow || canCompleteNow)
                      ? [
                          canStartNow && (
                            <Button
                              key="start"
                              type="primary"
                              icon={<PlayCircleOutlined />}
                              onClick={() => handleStart(shift.shiftId)}
                            >
                              Bắt đầu
                            </Button>
                          ),
                          canCompleteNow && (
                            <Button
                              key="complete"
                              icon={<CheckCircleOutlined />}
                              onClick={() => handleComplete(shift.shiftId)}
                            >
                              Hoàn thành
                            </Button>
                          ),
                        ].filter(Boolean)
                      : undefined
                  }
                  style={{
                    borderLeft: `4px solid ${
                      statusOptions[shift.status]?.color || '#d9d9d9'
                    }`,
                    marginBottom: '8px',
                    padding: '16px',
                  }}
                >
                  <List.Item.Meta
                    title={
                      <Space size="middle" align="center">
                        {renderStatusTag(shift.status)}
                        <Text strong style={{ fontSize: '16px' }}>
                          {start.format('DD/MM/YYYY HH:mm')} - {end.format('HH:mm')}
                        </Text>
                      </Space>
                    }
                    description={
                      <div className="space-y-2" style={{ marginTop: '8px' }}>
                        <Space size="middle" wrap>
                          <Space size="small">
                            <ClockCircleOutlined />
                            <Text type="secondary">
                              Thời lượng: {duration.toFixed(1)} giờ
                            </Text>
                          </Space>
                        </Space>
                        {shift.location && (
                          <div>
                            <Space size="small">
                              <EnvironmentOutlined />
                              <Text type="secondary">Địa điểm: </Text>
                              <Text>{shift.location}</Text>
                            </Space>
                          </div>
                        )}
                        {shift.note && (
                          <div>
                            <Space size="small">
                              <FileTextOutlined />
                              <Text type="secondary">Ghi chú: </Text>
                              <Text>{shift.note}</Text>
                            </Space>
                          </div>
                        )}
                        {shift.elders && shift.elders.length > 0 && (
                          <div>
                            <Space size="small" wrap>
                              <UserOutlined />
                              <Text type="secondary">Người cao tuổi phụ trách: </Text>
                              {shift.elders.map((elder) => (
                                <Tag key={elder.elderId} color="cyan">
                                  {elder.user?.fullName || `Mã ${elder.elderId}`}
                                </Tag>
                              ))}
                            </Space>
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default MyShiftSchedule;



