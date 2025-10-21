import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Card,
  Statistic,
  Popconfirm,
  message,
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

// 🟢 cập nhật: import đúng type Elder
import { Elderly } from '../types';
import {
  fetchEldersController,
  createElderController,
  updateElderController,
  deleteElderController,
} from '../controllers/eldersController';
import ElderDetailModal from './modals/ElderlyDetailModal'; // 🟢 cập nhật: đổi tên modal tương ứng

const { Option } = Select;

const ElderlyManagement: React.FC = () => {
  // 🟢 cập nhật: đổi state từ elderly → elders, type Elder
  const [elders, setElders] = useState<Elderly[]>([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingElder, setEditingElder] = useState<Elderly | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedElder, setSelectedElder] = useState<Elderly | null>(null);

  // 🟢 cập nhật: thêm fetch dữ liệu thật từ backend
  const loadElders = async () => {
    try {
      setLoading(true);
      const data = await fetchEldersController();
      setElders(data);
    } catch (error) {
      message.error('Không thể tải danh sách người cao tuổi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElders();
  }, []);

  const handleAdd = () => {
    setEditingElder(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (record: Elderly) => {
    setEditingElder(record);
    setIsModalVisible(true);
    form.setFieldsValue({
      fullName: record.fullName,
      gender: record.gender,
      dob: record.dob ? dayjs(record.dob) : undefined,
      age: record.age,
      phone: record.phone,
      address: record.address,
      contactPhone: record.contactPhone,
      note: record.note,
    });
  };

  const handleView = (record: Elderly) => {
    setSelectedElder(record);
    setIsDetailModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteElderController(id);
      message.success('Xóa thành công');
      loadElders();
    } catch {
      message.error('Xóa thất bại');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
     if (values.dob && dayjs.isDayjs(values.dob)) {
  values.dob = values.dob.format('YYYY-MM-DD');
} else if (values.dob instanceof Date) {
  values.dob = dayjs(values.dob).format('YYYY-MM-DD');
}
console.log('✅ DOB sau khi convert:', values.dob);
      if (editingElder) {
        await updateElderController(editingElder.id, values);
        message.success('Cập nhật thành công');
      } else {
        await createElderController(values);
        message.success('Thêm mới thành công');
      }
      
      setIsModalVisible(false);
      loadElders();
    } catch (error: any) {
  console.error('❌ Lỗi khi lưu:', error);
  if (error.response) {
    console.error('📡 Response status:', error.response.status);
    console.error('📄 Response data:', JSON.stringify(error.response.data, null, 2));
    message.error(error.response.data?.message || 'Lưu dữ liệu thất bại');
  } else if (error.request) {
    console.error('🚫 Không nhận được phản hồi từ server:', error.request);
    message.error('Không thể kết nối tới máy chủ.');
  } else {
    console.error('⚙️ Lỗi khi cấu hình request:', error.message);
    message.error('Lỗi khi gửi yêu cầu.');
  }; }} 

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'Active':
        return 'green';
      case 'monitoring':
        return 'orange';
      case 'critical':
      case 'Inactive':
        return 'red';
      default:
        return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'Active':
        return 'Khỏe mạnh';
      case 'monitoring':
        return 'Theo dõi';
      case 'critical':
      case 'Inactive':
        return 'Nguy cấp';
      default:
        return status;
    }
  };

  // 🟢 cập nhật: thay Elderly → Elder, và các field đồng bộ backend
  const columns = [
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Elderly) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">ID: {record.id}</div>
        </div>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'dob',
      key: 'dob',
      render: (dob?: Date) =>
        dob ? new Date(dob).toLocaleDateString('vi-VN') : '-',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      render: (gender: string) => (
        <Tag color={gender === 'M' ? 'blue' : 'pink'}>
          {gender === 'M' ? 'Nam' : 'Nữ'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: 'SĐT liên hệ',
      dataIndex: 'contactPhone',
      key: 'contactPhone',
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note',
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

  // cập nhật: tính thống kê dựa trên danh sách elders
  const stats = {
    total: elders.length,
    active: elders.filter((e) => e.status === 'Active').length,
    inactive: elders.filter((e) => e.status === 'Inactive').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Quản lý người cao tuổi
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin và theo dõi sức khỏe người cao tuổi
          </p>
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

      {/* 🟢 cập nhật: thống kê */}
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng số"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#0ea5e9' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Ngừng hoạt động"
              value={stats.inactive}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 🟢 cập nhật: bảng dữ liệu elders */}
      <Card>
        <Table
          columns={columns}
          dataSource={elders}
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

      {/* 🟢 cập nhật: form thêm/sửa */}
      <Modal
        title={editingElder ? 'Chỉnh sửa thông tin' : 'Thêm mới người cao tuổi'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
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
                name="gender"
                label="Giới tính"
                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
              >
                <Select>
                  <Option value="M">Nam</Option>
                  <Option value="F">Nữ</Option>
                </Select>
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
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dob" label="Ngày sinh">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Só điện thoại">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 🟢 cập nhật: modal chi tiết Elder */}
      <ElderDetailModal
        visible={isDetailModalVisible}
        elderly={selectedElder}
        onClose={() => setIsDetailModalVisible(false)}
      />
    </div>
  );
};

export default ElderlyManagement;
