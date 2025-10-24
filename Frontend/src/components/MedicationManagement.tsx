 import React, { useEffect, useState } from 'react';
import {
  Table, Button, Space, Modal, Form, Input, Select, DatePicker, TimePicker,
  Row, Col, Card, Statistic, Popconfirm, message, Tag, Spin, Empty
} from 'antd';
import {
  EditOutlined, DeleteOutlined, PlusOutlined, MedicineBoxOutlined,
  ClockCircleOutlined, CalendarOutlined,ReloadOutlined
} from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
// Controllers
import {
  fetchMedications,
  fetchMedicationsByElder,
  createMedication,
  updateMedication,
  deleteMedication,
  fetchEldersController,
} from '../controllers/medicationController';

// Types
import { Medication } from '../types/Medication';

const { Option } = Select;

interface Elder {
  elderId: number;
  fullName: string;
  age?: number;
  gender?: string;
  phone?: string;
}

const MedicationManagement: React.FC = () => {
  // ==================== STATE ====================
  const [medications, setMedications] = useState<Medication[]>([]);
  const [elders, setElders] = useState<Elder[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(
    null
  );
  const [selectedElderId, setSelectedElderId] = useState<number | null>(null);
  const [form] = Form.useForm();

  // ==================== LOAD DATA ====================
  const loadElders = async () => {
    try {
      const data = await fetchEldersController();
      setElders(data);
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const loadMedications = async () => {
    try {
      setLoading(true);
      let data: Medication[];

      if (selectedElderId) {
        // Load medications for specific elder
        data = await fetchMedicationsByElder(selectedElderId);
      } else {
        // Load all medications
        data = await fetchMedications();
      }

      setMedications(data);
    } catch (error: any) {
      message.error(error.message);
      setMedications([]);
    } finally {
      setLoading(false);
    }
  };

  // Load elders on mount
  useEffect(() => {
    loadElders();
  }, []);

  // Load medications when elder selected
  useEffect(() => {
    if (selectedElderId) {
      loadMedications();
    }
  }, [selectedElderId]);

  // ==================== HANDLERS ====================
  const handleAdd = () => {
    setEditingMedication(null);
    form.resetFields();
    
    // Pre-fill elder if one is selected
    if (selectedElderId) {
      form.setFieldsValue({ elderId: selectedElderId });
    }
    
    setIsModalVisible(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);

    // Parse time range if exists
    let timeRange: [Dayjs, Dayjs] | undefined;
    if (medication.time) {
      const times = medication.time.split(' - ');
      if (times.length === 2) {
        timeRange = [
          dayjs(times[0], 'HH:mm'),
          dayjs(times[1], 'HH:mm'),
        ];
      }
    }

    form.setFieldsValue({
      elderId: medication.elderId,
      name: medication.name,
      dose: medication.dose,
      frequency: medication.frequency,
      time: timeRange,
      startDate: medication.startDate ? dayjs(medication.startDate) : undefined,
      endDate: medication.endDate ? dayjs(medication.endDate) : undefined,
      notes: medication.notes,
    });

    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteMedication(id);
      message.success('Xóa thuốc thành công');
      loadMedications();
    } catch (error: any) {
      message.error(error.message);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      // Format time range
      let timeRange: string | null = null;
      if (Array.isArray(values.time) && values.time.length === 2) {
        timeRange = values.time
          .map((t: Dayjs) => t.format('HH:mm'))
          .join(' - ');
      }

      const payload: Partial<Medication> = {
        elderId: Number(values.elderId),
        name: values.name,
        dose: values.dose || null,
        frequency: values.frequency || null,
        time: timeRange,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        notes: values.notes || null,
      };

      if (editingMedication) {
        await updateMedication(editingMedication.medicationId, payload);
        message.success('Cập nhật thuốc thành công');
      } else {
        await createMedication(payload);
        message.success('Thêm thuốc mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      loadMedications();
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        message.error('Vui lòng kiểm tra lại thông tin');
      } else {
        message.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMedication(null);
  };

  const handleRefresh = () => {
    loadMedications();
  };

  // ==================== HELPERS ====================
  const getMedicationStatus = (medication: Medication) => {
    const today = dayjs();

    if (medication.endDate && dayjs(medication.endDate).isBefore(today)) {
      return { label: 'Đã hết hạn', color: 'red' };
    }

    if (
      medication.startDate &&
      dayjs(medication.startDate).isAfter(today)
    ) {
      return { label: 'Chưa bắt đầu', color: 'orange' };
    }

    return { label: 'Đang sử dụng', color: 'green' };
  };

  // ==================== STATISTICS ====================
  const stats = {
    total: medications.length,
    active: medications.filter(
      (m) => !m.endDate || dayjs(m.endDate).isAfter(dayjs())
    ).length,
    expired: medications.filter(
      (m) => m.endDate && dayjs(m.endDate).isBefore(dayjs())
    ).length,
    upcoming: medications.filter(
      (m) => m.startDate && dayjs(m.startDate).isAfter(dayjs())
    ).length,
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (text: string) => (
        <Space>
          <MedicineBoxOutlined style={{ color: '#1890ff' }} />
          <span className="font-medium">{text}</span>
        </Space>
      ),
    },
    {
      title: 'Người cao tuổi',
      key: 'elder',
      width: 190,
      render: (_: any, record: Medication) => {
        const elder =
          record.elder || elders.find((e) => e.elderId === record.elderId);
        return elder ? elder.fullName : '-';
      },
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dose',
      key: 'dose',
      width: 120,
      render: (text: string) => text || '-',
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 130,
      render: (text: string) => text || '-',
    },
    {
      title: 'Thời gian uống',
      dataIndex: 'time',
      key: 'time',
      width: 140,
      render: (text: string) =>
        text ? (
          <Space>
            <ClockCircleOutlined />
            {text}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) =>
        date ? (
          <Space>
            <CalendarOutlined />
            {dayjs(date).format('DD/MM/YYYY')}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string) =>
        date ? (
          <Space>
            <CalendarOutlined />
            {dayjs(date).format('DD/MM/YYYY')}
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 130,
      render: (_: any, record: Medication) => {
        const status = getMedicationStatus(record);
        return <Tag color={status.color}>{status.label}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (text: string) => text || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: Medication) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xác nhận xóa"
            description="Bạn có chắc chắn muốn xóa thuốc này?"
            onConfirm={() => handleDelete(record.medicationId)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ==================== RENDER ====================
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Quản lý thuốc
            </h1>
            <p className="text-gray-600">
              Theo dõi và quản lý lịch dùng thuốc của người cao tuổi
            </p>
          </div>
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm thuốc mới
            </Button>
          </Space>
        </div>

        {/* Elder Selection */}
        <Card>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lọc theo người cao tuổi
              </label>
              <Select
                style={{ width: 300 }}
                placeholder="Chọn người cao tuổi"
                value={selectedElderId}
                onChange={(value) => setSelectedElderId(value)}
                allowClear
                onClear={() => setSelectedElderId(null)}
                showSearch
                filterOption={(input, option) => {
                  const label = String(option?.label || '');
                  return label.toLowerCase().includes(input.toLowerCase());
                }}
              >
                {elders.map((elder) => (
                  <Option key={elder.elderId} value={elder.elderId}>
                    {elder.fullName}
                    {elder.age && ` (${elder.age} tuổi)`}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng số thuốc"
                value={stats.total}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#0ea5e9' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đang sử dụng"
                value={stats.active}
                valueStyle={{ color: '#10b981' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã hết hạn"
                value={stats.expired}
                valueStyle={{ color: '#ef4444' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Chưa bắt đầu"
                value={stats.upcoming}
                valueStyle={{ color: '#f59e0b' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card>
          <Spin spinning={loading}>
            {medications.length > 0 ? (
              <Table
                columns={columns}
                dataSource={medications}
                rowKey="medicationId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total) => `Tổng ${total} thuốc`,
                }}
                scroll={{ x: 1400 }}
              />
            ) : (
              <Empty
                description={
                  selectedElderId
                    ? 'Chưa có thuốc nào được thêm cho người cao tuổi này'
                    : 'Chọn người cao tuổi để xem danh sách thuốc'
                }
              />
            )}
          </Spin>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={
          editingMedication ? 'Chỉnh sửa thông tin thuốc' : 'Thêm thuốc mới'
        }
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        width={800}
        confirmLoading={submitting}
        okText={editingMedication ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="elderId"
                label="Người cao tuổi"
                rules={[
                  { required: true, message: 'Vui lòng chọn người cao tuổi' },
                ]}
              >
                <Select
                  placeholder="Chọn người cao tuổi"
                  showSearch
                  filterOption={(input, option) => {
                    const label = String(option?.label || '');
                    return label.toLowerCase().includes(input.toLowerCase());
                  }}
                >
                  {elders.map((elder) => (
                    <Option key={elder.elderId} value={elder.elderId}>
                      {elder.fullName}
                      {elder.age && ` (${elder.age} tuổi)`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên thuốc"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên thuốc' },
                  { max: 100, message: 'Tên thuốc tối đa 100 ký tự' },
                ]}
              >
                <Input placeholder="Nhập tên thuốc" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="dose"
                label="Liều lượng"
                rules={[{ max: 50, message: 'Liều lượng tối đa 50 ký tự' }]}
              >
                <Input placeholder="VD: 500mg, 1 viên" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="frequency" label="Tần suất">
                <Select placeholder="Chọn tần suất">
                  <Option value="1 lần/ngày">1 lần/ngày</Option>
                  <Option value="2 lần/ngày">2 lần/ngày</Option>
                  <Option value="3 lần/ngày">3 lần/ngày</Option>
                  <Option value="1 lần/tuần">1 lần/tuần</Option>
                  <Option value="Theo chỉ định">Theo chỉ định</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Thời gian uống"
                rules={[
                  { required: true, message: 'Vui lòng chọn thời gian uống' },
                ]}
              >
                <TimePicker.RangePicker format="HH:mm" className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
            rules={[{ max: 255, message: 'Ghi chú tối đa 255 ký tự' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Nhập ghi chú nếu có (cách dùng, lưu ý đặc biệt...)"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationManagement;