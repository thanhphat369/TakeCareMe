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
  InputNumber,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Rate,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { mockCaregivers } from '../data/mockData';
import { Caregiver } from '../types';

const { Option } = Select;

const CaregiverManagement: React.FC = () => {
  const [caregivers, setCaregivers] = useState<Caregiver[]>(mockCaregivers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCaregiver, setEditingCaregiver] = useState<Caregiver | null>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingCaregiver(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: Caregiver) => {
    setEditingCaregiver(record);
    setIsModalVisible(true);
    form.setFieldsValue(record);
  };

  const handleDelete = (id: string) => {
    setCaregivers(caregivers.filter(item => item.id !== id));
    message.success('Xóa thành công');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const newCaregiver: Caregiver = {
        ...values,
        id: editingCaregiver?.id || Date.now().toString(),
      };

      if (editingCaregiver) {
        setCaregivers(caregivers.map(item => item.id === editingCaregiver.id ? newCaregiver : item));
        message.success('Cập nhật thành công');
      } else {
        setCaregivers([...caregivers, newCaregiver]);
        message.success('Thêm mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'green';
      case 'busy':
        return 'orange';
      case 'offline':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'busy':
        return 'Bận';
      case 'offline':
        return 'Ngoại tuyến';
      default:
        return status;
    }
  };

  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Caregiver) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_: any, record: Caregiver) => (
        <div>
          <div className="flex items-center text-sm">
            <PhoneOutlined className="mr-1" />
            {record.phone}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <MailOutlined className="mr-1" />
            {record.email}
          </div>
        </div>
      ),
    },
    {
      title: 'Chuyên môn',
      dataIndex: 'specialization',
      key: 'specialization',
      render: (specializations: string[]) => (
        <div className="flex flex-wrap gap-1">
          {specializations.map((spec, index) => (
            <Tag key={index} color="blue" className="text-xs">
              {spec}
            </Tag>
          ))}
        </div>
      ),
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      key: 'experience',
      render: (experience: number) => `${experience} năm`,
      sorter: (a: Caregiver, b: Caregiver) => a.experience - b.experience,
    },
    {
      title: 'Đánh giá',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <div className="flex items-center">
          <Rate disabled value={rating} className="text-sm" />
          <span className="ml-1 text-sm text-gray-500">({rating})</span>
        </div>
      ),
      sorter: (a: Caregiver, b: Caregiver) => a.rating - b.rating,
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
      title: 'Bệnh nhân',
      dataIndex: 'assignedElderly',
      key: 'assignedElderly',
      render: (assignedElderly: string[]) => (
        <Tag color="purple">
          {assignedElderly.length} người
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Caregiver) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => {/* Handle view */}}
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
    total: caregivers.length,
    available: caregivers.filter(c => c.status === 'available').length,
    busy: caregivers.filter(c => c.status === 'busy').length,
    offline: caregivers.filter(c => c.status === 'offline').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý người chăm sóc</h1>
          <p className="text-gray-600">Quản lý thông tin và phân công người chăm sóc</p>
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
              title="Có sẵn"
              value={stats.available}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đang bận"
              value={stats.busy}
              valueStyle={{ color: '#f59e0b' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Ngoại tuyến"
              value={stats.offline}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={caregivers}
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
        title={editingCaregiver ? 'Chỉnh sửa thông tin' : 'Thêm mới người chăm sóc'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={600}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'available',
            rating: 5,
            experience: 0,
            specialization: [],
            assignedElderly: [],
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
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Chuyên môn"
            rules={[{ required: true, message: 'Vui lòng chọn chuyên môn' }]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn chuyên môn"
              options={[
                { value: 'Chăm sóc người cao tuổi', label: 'Chăm sóc người cao tuổi' },
                { value: 'Vật lý trị liệu', label: 'Vật lý trị liệu' },
                { value: 'Y tá', label: 'Y tá' },
                { value: 'Chăm sóc bệnh nhân Alzheimer', label: 'Chăm sóc bệnh nhân Alzheimer' },
                { value: 'Dinh dưỡng', label: 'Dinh dưỡng' },
                { value: 'Tâm lý học', label: 'Tâm lý học' },
                { value: 'Cấp cứu', label: 'Cấp cứu' },
              ]}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="experience"
                label="Kinh nghiệm (năm)"
                rules={[{ required: true, message: 'Vui lòng nhập số năm kinh nghiệm' }]}
              >
                <InputNumber min={0} max={50} className="w-full" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="rating"
                label="Đánh giá"
                rules={[{ required: true, message: 'Vui lòng chọn đánh giá' }]}
              >
                <Rate />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: 'Vui lòng chọn trạng thái' }]}
              >
                <Select>
                  <Option value="available">Có sẵn</Option>
                  <Option value="busy">Bận</Option>
                  <Option value="offline">Ngoại tuyến</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CaregiverManagement;
