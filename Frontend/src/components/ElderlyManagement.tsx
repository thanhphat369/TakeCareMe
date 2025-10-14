import React, { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
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
import { Elderly } from '../types';
import ElderlyDetailModal from './modals/ElderlyDetailModal';
import dayjs from 'dayjs';

const { Option } = Select;

const ElderlyManagement: React.FC = () => {
  const [elderly, setElderly] = useState<Elderly[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    monitoring: 0,
    critical: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [editingElderly, setEditingElderly] = useState<Elderly | null>(null);
  const [selectedElderly, setSelectedElderly] = useState<Elderly | null>(null);
  const [form] = Form.useForm();

  // Fetch elderly list from backend
  const fetchElderly = async () => {
    try {
      setLoading(true);

      const res = await apiClient.get('/api/elderly', {
        params: { page: 1, limit: 100 },
      });

      console.log('Response from /elderly:', res.data);

      const raw = res.data?.data || [];

      // Map backend data to frontend format
      const formatted = raw.map((item: any) => ({
        id: item.elderlyId.toString(),
        name: item.fullName,
        age: item.age,
        gender: item.gender,
        phone: item.phone,
        emergencyContact: item.emergencyContact,
        address: item.address,
        bloodType: item.bloodType,
        doctor: item.doctor,
        status: item.status,
        lastCheckup: item.lastCheckup ? new Date(item.lastCheckup) : undefined,
        nextCheckup: item.nextCheckup ? new Date(item.nextCheckup) : undefined,
        notes: item.notes,
        medications: item.currentMedications ? item.currentMedications.split(',').map((m: string) => m.trim()) : [],
        medicalHistory: item.medicalHistory,
        allergies: item.allergies,
        createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
      }));

      setElderly(formatted);
    } catch (error: any) {
      console.error('Lỗi tải danh sách người cao tuổi:', error);

      if (error.response?.status === 401) {
        message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      } else {
        message.error(
          error.response?.data?.message ||
          'Không thể tải danh sách người cao tuổi.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStatistics = async () => {
    try {
      const res = await apiClient.get('/api/elderly/statistics');
      const data = res.data;
      setStats({
        total: data.total || 0,
        healthy: data.byStatus?.healthy || 0,
        monitoring: data.byStatus?.monitoring || 0,
        critical: data.byStatus?.critical || 0,
      });
    } catch (error) {
      console.error('Lỗi tải thống kê:', error);
    }
  };

  useEffect(() => {
    fetchElderly();
    fetchStatistics();
  }, []);

  const handleAdd = () => {
    setEditingElderly(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: Elderly) => {
    setEditingElderly(record);
    form.setFieldsValue({
      fullName: record.name,
      age: record.age,
      gender: record.gender,
      phone: record.phone,
      emergencyContact: record.emergencyContact,
      address: record.address,
      bloodType: record.bloodType,
      doctor: record.doctor,
      status: record.status,
      lastCheckup: record.lastCheckup ? dayjs(record.lastCheckup) : null,
      nextCheckup: record.nextCheckup ? dayjs(record.nextCheckup) : null,
      notes: record.notes,
      medicalHistory: record.medicalHistory,
      currentMedications: record.medications && record.medications.length > 0 ? record.medications.join(', ') : '',
      allergies: record.allergies,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await apiClient.delete(`/api/elderly/${id}`);
      message.success('Đã xóa thành công');
      fetchElderly();
      fetchStatistics();
    } catch (error: any) {
      console.error('Lỗi xóa:', error);
      message.error(error.response?.data?.message || 'Không thể xóa');
    }
  };

  const handleView = (record: Elderly) => {
    setSelectedElderly(record);
    setIsDetailModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        fullName: values.fullName,
        age: Number(values.age),
        gender: values.gender,
        phone: values.phone,
        emergencyContact: values.emergencyContact,
        address: values.address,
        bloodType: values.bloodType,
        doctor: values.doctor,
        status: values.status,
        lastCheckup: values.lastCheckup ? values.lastCheckup.format('YYYY-MM-DD') : null,
        nextCheckup: values.nextCheckup ? values.nextCheckup.format('YYYY-MM-DD') : null,
        notes: values.notes || null,
        medicalHistory: values.medicalHistory || null,
        currentMedications: values.currentMedications || null,
        allergies: values.allergies || null,
      };

      if (editingElderly) {
        await apiClient.patch(`/api/elderly/${editingElderly.id}`, payload);
        message.success('Cập nhật thành công');
      } else {
        await apiClient.post('/api/elderly', payload);
        message.success('Thêm mới thành công');
      }

      setIsModalVisible(false);
      form.resetFields();
      fetchElderly();
      fetchStatistics();
    } catch (error: any) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.message;

      if (Array.isArray(errorMsg)) {
        message.error(errorMsg.join(', '));
      } else {
        message.error(errorMsg || 'Lưu thất bại');
      }
    }
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
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '-',
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
          loading={loading}
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
        onOk={() => form.submit()}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'healthy',
            gender: 'male',
            bloodType: 'A+',
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
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
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="nextCheckup"
                label="Lần khám tiếp theo"
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="medicalHistory"
            label="Tiền sử bệnh"
          >
            <Input.TextArea rows={2} placeholder="VD: Tiểu đường, cao huyết áp..." />
          </Form.Item>

          <Form.Item
            name="currentMedications"
            label="Thuốc đang dùng"
          >
            <Input.TextArea rows={2} placeholder="VD: Metformin 500mg, Aspirin..." />
          </Form.Item>

          <Form.Item
            name="allergies"
            label="Dị ứng"
          >
            <Input placeholder="VD: Penicillin, hải sản..." />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea rows={3} placeholder="Thông tin bổ sung..." />
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