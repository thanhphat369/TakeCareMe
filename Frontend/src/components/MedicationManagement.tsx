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
  TimePicker, 
  Space, 
  Tag, 
  Badge,
  Row,
  Col,
  Statistic,
  Alert,
  Tabs
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MedicineBoxOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  time: string;
  elderlyId: string;
  elderlyName: string;
  status: 'active' | 'completed' | 'missed' | 'overdue';
  startDate: string;
  endDate?: string;
  notes?: string;
}

const MedicationManagement: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([
    {
      id: '1',
      name: 'Aspirin 100mg',
      dosage: '1 viên',
      frequency: 'Hàng ngày',
      time: '08:00',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      status: 'active',
      startDate: '2024-01-01',
      notes: 'Uống sau bữa sáng'
    },
    {
      id: '2',
      name: 'Metformin 500mg',
      dosage: '2 viên',
      frequency: '2 lần/ngày',
      time: '08:00, 20:00',
      elderlyId: '2',
      elderlyName: 'Cụ Trần Thị B',
      status: 'missed',
      startDate: '2024-01-15',
      notes: 'Thuốc tiểu đường'
    },
    {
      id: '3',
      name: 'Vitamin D3',
      dosage: '1 viên',
      frequency: 'Hàng ngày',
      time: '12:00',
      elderlyId: '1',
      elderlyName: 'Cụ Nguyễn Văn A',
      status: 'overdue',
      startDate: '2024-01-10',
      notes: 'Bổ sung vitamin'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [form] = Form.useForm();

  const statusColors = {
    active: 'green',
    completed: 'blue',
    missed: 'red',
    overdue: 'orange'
  };

  const statusLabels = {
    active: 'Đang dùng',
    completed: 'Hoàn thành',
    missed: 'Bỏ lỡ',
    overdue: 'Quá hạn'
  };

  const columns = [
    {
      title: 'Tên thuốc',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center">
          <MedicineBoxOutlined className="mr-2 text-blue-500" />
          <span className="font-medium">{text}</span>
        </div>
      ),
    },
    {
      title: 'Liều lượng',
      dataIndex: 'dosage',
      key: 'dosage',
    },
    {
      title: 'Tần suất',
      dataIndex: 'frequency',
      key: 'frequency',
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (time: string) => (
        <div className="flex items-center">
          <ClockCircleOutlined className="mr-1 text-gray-500" />
          {time}
        </div>
      ),
    },
    {
      title: 'Người cao tuổi',
      dataIndex: 'elderlyName',
      key: 'elderlyName',
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
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Medication) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingMedication(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    form.setFieldsValue({
      ...medication,
      time: medication.time.split(', ').map(t => dayjs(t, 'HH:mm'))
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setMedications(medications.filter(m => m.id !== id));
  };

  const handleSubmit = (values: any) => {
    const timeStr = Array.isArray(values.time) 
      ? values.time.map((t: any) => t.format('HH:mm')).join(', ')
      : values.time.format('HH:mm');

    if (editingMedication) {
      setMedications(medications.map(m => 
        m.id === editingMedication.id 
          ? { ...m, ...values, time: timeStr }
          : m
      ));
    } else {
      const newMedication: Medication = {
        id: Date.now().toString(),
        ...values,
        time: timeStr,
        elderlyName: 'Cụ Nguyễn Văn A', // Mock data
        status: 'active'
      };
      setMedications([...medications, newMedication]);
    }
    setIsModalVisible(false);
  };

  const getStatistics = () => {
    const total = medications.length;
    const active = medications.filter(m => m.status === 'active').length;
    const missed = medications.filter(m => m.status === 'missed').length;
    const overdue = medications.filter(m => m.status === 'overdue').length;

    return { total, active, missed, overdue };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý thuốc</h1>
        <p className="text-gray-600">Quản lý thuốc và lịch nhắc uống thuốc cho người cao tuổi</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng số thuốc"
              value={stats.total}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang dùng"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Bỏ lỡ"
              value={stats.missed}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts */}
      {stats.missed > 0 && (
        <Alert
          message="Cảnh báo thuốc"
          description={`Có ${stats.missed} thuốc bị bỏ lỡ và ${stats.overdue} thuốc quá hạn. Vui lòng kiểm tra ngay.`}
          type="warning"
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      )}

      {/* Main Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách thuốc</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm thuốc mới
          </Button>
        </div>

        <Tabs defaultActiveKey="all">
          <TabPane tab={`Tất cả (${stats.total})`} key="all">
            <Table 
              columns={columns} 
              dataSource={medications}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Đang dùng (${stats.active})`} key="active">
            <Table 
              columns={columns} 
              dataSource={medications.filter(m => m.status === 'active')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Bỏ lỡ (${stats.missed})`} key="missed">
            <Table 
              columns={columns} 
              dataSource={medications.filter(m => m.status === 'missed')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingMedication ? 'Sửa thuốc' : 'Thêm thuốc mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Tên thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên thuốc' }]}
          >
            <Input placeholder="Nhập tên thuốc" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dosage"
                label="Liều lượng"
                rules={[{ required: true, message: 'Vui lòng nhập liều lượng' }]}
              >
                <Input placeholder="Ví dụ: 1 viên, 5ml" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="frequency"
                label="Tần suất"
                rules={[{ required: true, message: 'Vui lòng chọn tần suất' }]}
              >
                <Select placeholder="Chọn tần suất">
                  <Option value="Hàng ngày">Hàng ngày</Option>
                  <Option value="2 lần/ngày">2 lần/ngày</Option>
                  <Option value="3 lần/ngày">3 lần/ngày</Option>
                  <Option value="Theo chỉ định">Theo chỉ định</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="time"
            label="Thời gian uống"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian' }]}
          >
            <TimePicker.RangePicker 
              format="HH:mm"
              placeholder={['Bắt đầu', 'Kết thúc']}
              className="w-full"
            />
          </Form.Item>

          <Form.Item
            name="elderlyId"
            label="Người cao tuổi"
            rules={[{ required: true, message: 'Vui lòng chọn người cao tuổi' }]}
          >
            <Select placeholder="Chọn người cao tuổi">
              <Option value="1">Cụ Nguyễn Văn A</Option>
              <Option value="2">Cụ Trần Thị B</Option>
              <Option value="3">Cụ Lê Văn C</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú về thuốc, cách dùng..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingMedication ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MedicationManagement;
