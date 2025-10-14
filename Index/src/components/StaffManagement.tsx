import React, { useEffect, useState } from 'react';
import {
  Card, Table, Button, Modal, Form, Input, Select, DatePicker,
  Space, Tag, Row, Col, Statistic, Avatar, message
} from 'antd';
import {
  UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, TeamOutlined, SafetyOutlined, HeartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { getAllStaff, createStaff, updateStaff, deleteStaff, Staff } from '../api/staff';

const { Option } = Select;

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();

  // 📥 Lấy dữ liệu thật từ backend
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const data = await getAllStaff();
      setStaff(data);
    } catch (err: any) {
      console.error('❌ Lỗi khi tải dữ liệu nhân viên:', err);
      message.error('Không thể tải danh sách nhân viên');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 🎨 Giao diện bảng
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: ['user', 'fullName'],
      key: 'fullName',
      render: (_: any, record: Staff) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-3" />
          <div>
            <div className="font-medium">{record.user?.fullName}</div>
            <div className="text-sm text-gray-500">{record.user?.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: ['user', 'role'],
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'Doctor' ? 'blue' : role === 'Staff' ? 'green' : 'orange'}>
          {role}
        </Tag>
      ),
    },
    {
      title: 'Chức danh',
      dataIndex: 'roleTitle',
      key: 'roleTitle',
    },
    {
      title: 'Kỹ năng',
      dataIndex: 'skills',
      key: 'skills',
    },
    {
      title: 'Kinh nghiệm (năm)',
      dataIndex: 'experienceYears',
      key: 'experienceYears',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.staffId)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  // 🧩 CRUD Handlers
  const handleAdd = () => {
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      ...staff,
      experienceYears: staff.experienceYears,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa nhân viên này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        try {
          await deleteStaff(id);
          message.success('Xóa nhân viên thành công');
          fetchStaff();
        } catch (err) {
          message.error('Không thể xóa nhân viên');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.staffId, values);
        message.success('Cập nhật nhân viên thành công');
      } else {
        await createStaff(values);
        message.success('Thêm nhân viên thành công');
      }
      setIsModalVisible(false);
      fetchStaff();
    } catch (err) {
      message.error('Không thể lưu dữ liệu');
    }
  };

  // 📊 Thống kê
  const stats = {
    total: staff.length,
    doctors: staff.filter(s => s.user?.role === 'Doctor').length,
    active: staff.filter(s => s.status === 'Active').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý nhân viên</h1>
        <p className="text-gray-600">Danh sách nhân viên lấy từ cơ sở dữ liệu SQL Server</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Tổng nhân viên" value={stats.total} prefix={<TeamOutlined />} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Đang hoạt động" value={stats.active} valueStyle={{ color: '#52c41a' }} /></Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card><Statistic title="Bác sĩ" value={stats.doctors} prefix={<SafetyOutlined />} /></Card>
        </Col>
      </Row>

      {/* Table */}
      <Card
        title="Danh sách nhân viên"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm nhân viên</Button>}
      >
        <Table
          columns={columns}
          dataSource={staff}
          rowKey="staffId"
          loading={loading}
          pagination={{ pageSize: 8 }}
        />
      </Card>

      {/* Modal thêm/sửa */}
      <Modal
        title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item label="Chức danh" name="roleTitle" rules={[{ required: true, message: 'Nhập chức danh' }]}>
            <Input placeholder="VD: Bác sĩ, Điều dưỡng..." />
          </Form.Item>
          <Form.Item label="Kỹ năng" name="skills">
            <Input placeholder="VD: Tim mạch, vật lý trị liệu..." />
          </Form.Item>
          <Form.Item label="Số năm kinh nghiệm" name="experienceYears">
            <Input type="number" placeholder="Nhập số năm" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">Lưu</Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;
