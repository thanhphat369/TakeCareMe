import React, { useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  HeartOutlined,
  PhoneOutlined,
  HomeOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { mockElderly } from '../data/mockData';
import { Elderly } from '../types';
import ElderlyDetailModal from './modals/ElderlyDetailModal';

const { Option } = Select;

const ElderlyManagement: React.FC = () => {
  const [elderly, setElderly] = useState<Elderly[]>(mockElderly);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingElderly, setEditingElderly] = useState<Elderly | null>(null);
  const [selectedElderly, setSelectedElderly] = useState<Elderly | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingElderly(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: Elderly) => {
    setEditingElderly(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      ...record,
      lastCheckup: record.lastCheckup ? new Date(record.lastCheckup) : null,
      nextCheckup: record.nextCheckup ? new Date(record.nextCheckup) : null,
    });
  };

  const handleDelete = (id: string) => {
    setElderly(elderly.filter(item => item.id !== id));
    message.success('Xóa thành công');
  };

  const handleView = (record: Elderly) => {
    setSelectedElderly(record);
    setIsDetailModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newElderly: Elderly = {
        ...values,
        id: editingElderly?.id || Date.now().toString(),
        createdAt: editingElderly?.createdAt || new Date(),
        updatedAt: new Date(),
        lastCheckup: values.lastCheckup?.toDate() || new Date(),
        nextCheckup: values.nextCheckup?.toDate() || new Date(),
      };

      if (editingElderly) {
        setElderly(elderly.map(item => item.id === editingElderly.id ? newElderly : item));
        message.success('Cập nhật thành công');
      } else {
        setElderly([...elderly, newElderly]);
        message.success('Thêm mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'green';
      case 'monitoring':
        return 'orange';
      case 'critical':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Khỏe mạnh';
      case 'monitoring':
        return 'Theo dõi';
      case 'critical':
        return 'Khẩn cấp';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Elderly) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Tuổi',
      dataIndex: 'age',
      key: 'age',
      sorter: (a: Elderly, b: Elderly) => a.age - b.age,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'male' ? 'blue' : 'pink'}>
          {gender === 'male' ? 'Nam' : 'Nữ'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Bác sĩ',
      dataIndex: 'doctor',
      key: 'doctor',
    },
    {
      title: 'Khám tiếp theo',
      dataIndex: 'nextCheckup',
      key: 'nextCheckup',
      render: (date: Date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Elderly) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const stats = {
    total: elderly.length,
    healthy: elderly.filter(e => e.status === 'healthy').length,
    monitoring: elderly.filter(e => e.status === 'monitoring').length,
    critical: elderly.filter(e => e.status === 'critical').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý người cao tuổi</h1>
          <p className="text-gray-600">Quản lý thông tin và theo dõi sức khỏe người cao tuổi</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Thêm mới
        </Button>
      </div>

      {/* Statistics */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng số"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#0ea5e9' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khỏe mạnh"
              value={stats.healthy}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Theo dõi"
              value={stats.monitoring}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={stats.critical}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={elderly}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} của ${total} mục`,
          }}
        />
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingElderly ? 'Chỉnh sửa thông tin' : 'Thêm mới người cao tuổi'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'healthy',
            gender: 'male',
            bloodType: 'A+',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="age"
                label="Tuổi"
                rules={[{ required: true, message: 'Vui lòng nhập tuổi' }]}
              >
                <InputNumber min={60} max={120} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select>
                  <Option value="male">Nam</Option>
                  <Option value="female">Nữ</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="emergencyContact"
                label="Liên hệ khẩn cấp"
                rules={[{ required: true, message: 'Vui lòng nhập số liên hệ khẩn cấp' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="bloodType"
                label="Nhóm máu"
                rules={[{ required: true, message: 'Vui lòng chọn nhóm máu' }]}
              >
                <Select>
                  <Option value="A+">A+</Option>
                  <Option value="A-">A-</Option>
                  <Option value="B+">B+</Option>
                  <Option value="B-">B-</Option>
                  <Option value="AB+">AB+</Option>
                  <Option value="AB-">AB-</Option>
                  <Option value="O+">O+</Option>
                  <Option value="O-">O-</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="doctor"
                label="Bác sĩ phụ trách"
                rules={[{ required: true, message: 'Vui lòng nhập tên bác sĩ' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="healthy">Khỏe mạnh</Option>
                  <Option value="monitoring">Theo dõi</Option>
                  <Option value="critical">Khẩn cấp</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="lastCheckup"
                label="Lần khám cuối"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextCheckup"
                label="Lần khám tiếp theo"
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <ElderlyDetailModal
        visible={isDetailModalVisible}
        elderly={selectedElderly}
        onClose={() => setIsDetailModalVisible(false)}
      />
    </div>
  );
};

export default ElderlyManagement;
