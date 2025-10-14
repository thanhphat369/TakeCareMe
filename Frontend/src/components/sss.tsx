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
  Avatar,
  Tabs,
  Switch,
  Upload
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  SafetyOutlined,
  TeamOutlined,
  HeartOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TabPane } = Tabs;

interface Staff {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'doctor' | 'nurse' | 'caregiver' | 'admin' | 'supervisor';
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  hireDate: string;
  avatar?: string;
  qualifications: string[];
  specialties: string[];
  shift: 'morning' | 'afternoon' | 'night' | 'flexible';
  experience: number;
  notes?: string;
}

const StaffManagement: React.FC = () => {
  const [staff, setStaff] = useState<Staff[]>([
    {
      id: '1',
      fullName: 'BS. Nguyễn Văn Bác sĩ',
      email: 'doctor.nguyen@tcm.com',
      phone: '0901234567',
      role: 'doctor',
      department: 'Tim mạch',
      status: 'active',
      hireDate: '2023-01-15',
      qualifications: ['Bác sĩ chuyên khoa Tim mạch', 'Thạc sĩ Y học'],
      specialties: ['Tim mạch', 'Huyết áp', 'Đái tháo đường'],
      shift: 'morning',
      experience: 8,
      notes: 'Chuyên gia về tim mạch người cao tuổi'
    },
    {
      id: '2',
      fullName: 'Điều dưỡng Trần Thị Y tá',
      email: 'nurse.tran@tcm.com',
      phone: '0901234568',
      role: 'nurse',
      department: 'Chăm sóc tổng quát',
      status: 'active',
      hireDate: '2023-03-20',
      qualifications: ['Cử nhân Điều dưỡng', 'Chứng chỉ Chăm sóc người cao tuổi'],
      specialties: ['Chăm sóc cơ bản', 'Theo dõi sinh hiệu', 'Vật lý trị liệu'],
      shift: 'afternoon',
      experience: 5,
      notes: 'Kinh nghiệm chăm sóc người cao tuổi'
    },
    {
      id: '3',
      fullName: 'Người chăm sóc Phạm Văn Hỗ trợ',
      email: 'caregiver.pham@tcm.com',
      phone: '0901234569',
      role: 'caregiver',
      department: 'Chăm sóc hàng ngày',
      status: 'active',
      hireDate: '2023-06-10',
      qualifications: ['Chứng chỉ Chăm sóc người cao tuổi'],
      specialties: ['Hỗ trợ sinh hoạt', 'Vận động', 'Tâm lý'],
      shift: 'flexible',
      experience: 3,
      notes: 'Tận tâm và có kinh nghiệm'
    },
    {
      id: '4',
      fullName: 'Quản lý Lê Thị Quản lý',
      email: 'manager.le@tcm.com',
      phone: '0901234570',
      role: 'admin',
      department: 'Quản lý',
      status: 'on_leave',
      hireDate: '2022-12-01',
      qualifications: ['Thạc sĩ Quản trị Y tế', 'Chứng chỉ ISO 9001'],
      specialties: ['Quản lý', 'Điều phối', 'Báo cáo'],
      shift: 'morning',
      experience: 10,
      notes: 'Quản lý có kinh nghiệm'
    }
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [form] = Form.useForm();

  const roleLabels = {
    doctor: 'Bác sĩ',
    nurse: 'Điều dưỡng',
    caregiver: 'Người chăm sóc',
    admin: 'Quản lý',
    supervisor: 'Giám sát'
  };

  const statusColors = {
    active: 'green',
    inactive: 'red',
    on_leave: 'orange'
  };

  const statusLabels = {
    active: 'Hoạt động',
    inactive: 'Không hoạt động',
    on_leave: 'Nghỉ phép'
  };

  const shiftLabels = {
    morning: 'Ca sáng',
    afternoon: 'Ca chiều',
    night: 'Ca đêm',
    flexible: 'Linh hoạt'
  };

  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Staff) => (
        <div className="flex items-center">
          <Avatar 
            size="small" 
            src={record.avatar}
            icon={<UserOutlined />}
            className="mr-3"
          />
          <div>
            <div className="font-medium">{text}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role: keyof typeof roleLabels) => (
        <Tag color={role === 'doctor' ? 'blue' : role === 'nurse' ? 'green' : 'orange'}>
          {roleLabels[role]}
        </Tag>
      ),
    },
    {
      title: 'Khoa/Phòng',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Ca làm việc',
      dataIndex: 'shift',
      key: 'shift',
      render: (shift: keyof typeof shiftLabels) => shiftLabels[shift],
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
      title: 'Kinh nghiệm',
      dataIndex: 'experience',
      key: 'experience',
      render: (exp: number) => `${exp} năm`,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Staff) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
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
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    form.setFieldsValue({
      ...staff,
      hireDate: dayjs(staff.hireDate)
    });
    setIsModalVisible(true);
  };

  const handleView = (staff: Staff) => {
    setEditingStaff(staff);
    setIsModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setStaff(staff.filter(s => s.id !== id));
  };

  const handleSubmit = (values: any) => {
    if (editingStaff) {
      setStaff(staff.map(s => 
        s.id === editingStaff.id 
          ? { ...s, ...values, hireDate: values.hireDate.format('YYYY-MM-DD') }
          : s
      ));
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        ...values,
        hireDate: values.hireDate.format('YYYY-MM-DD'),
        status: 'active'
      };
      setStaff([...staff, newStaff]);
    }
    setIsModalVisible(false);
  };

  const getStatistics = () => {
    const total = staff.length;
    const active = staff.filter(s => s.status === 'active').length;
    const doctors = staff.filter(s => s.role === 'doctor').length;
    const nurses = staff.filter(s => s.role === 'nurse').length;

    return { total, active, doctors, nurses };
  };

  const stats = getStatistics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý nhân viên</h1>
        <p className="text-gray-600">Quản lý thông tin nhân viên, vai trò và phân công ca làm việc</p>
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Bác sĩ"
              value={stats.doctors}
              prefix={<SafetyOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Điều dưỡng"
              value={stats.nurses}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm nhân viên
          </Button>
        </div>

        <Tabs defaultActiveKey="all">
          <TabPane tab={`Tất cả (${stats.total})`} key="all">
            <Table 
              columns={columns} 
              dataSource={staff}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Đang hoạt động (${stats.active})`} key="active">
            <Table 
              columns={columns} 
              dataSource={staff.filter(s => s.status === 'active')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Bác sĩ (${stats.doctors})`} key="doctors">
            <Table 
              columns={columns} 
              dataSource={staff.filter(s => s.role === 'doctor')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Điều dưỡng (${stats.nurses})`} key="nurses">
            <Table 
              columns={columns} 
              dataSource={staff.filter(s => s.role === 'nurse')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        title={editingStaff ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên mới'}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' }
                ]}
              >
                <Input placeholder="Nhập email" />
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
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="doctor">Bác sĩ</Option>
                  <Option value="nurse">Điều dưỡng</Option>
                  <Option value="caregiver">Người chăm sóc</Option>
                  <Option value="admin">Quản lý</Option>
                  <Option value="supervisor">Giám sát</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="department"
                label="Khoa/Phòng"
                rules={[{ required: true, message: 'Vui lòng nhập khoa/phòng' }]}
              >
                <Input placeholder="Nhập khoa/phòng" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shift"
                label="Ca làm việc"
                rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
              >
                <Select placeholder="Chọn ca làm việc">
                  <Option value="morning">Ca sáng</Option>
                  <Option value="afternoon">Ca chiều</Option>
                  <Option value="night">Ca đêm</Option>
                  <Option value="flexible">Linh hoạt</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="hireDate"
                label="Ngày tuyển dụng"
                rules={[{ required: true, message: 'Vui lòng chọn ngày tuyển dụng' }]}
              >
                <DatePicker className="w-full" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="experience"
                label="Kinh nghiệm (năm)"
                rules={[{ required: true, message: 'Vui lòng nhập kinh nghiệm' }]}
              >
                <Input type="number" placeholder="Nhập số năm kinh nghiệm" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="qualifications"
            label="Bằng cấp/Chứng chỉ"
          >
            <Select
              mode="tags"
              placeholder="Nhập bằng cấp/chứng chỉ"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="specialties"
            label="Chuyên môn"
          >
            <Select
              mode="tags"
              placeholder="Nhập chuyên môn"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi chú"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ghi chú về nhân viên..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStaff ? 'Cập nhật' : 'Thêm mới'}
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

export default StaffManagement;
