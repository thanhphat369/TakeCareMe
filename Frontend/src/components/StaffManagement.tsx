// ========================
//   IMPORT CÁC THƯ VIỆN
// ========================
import React, { useState, useEffect } from "react";
// các hàm xử lý API logic tách riêng ở controller
import {
  fetchStaffController, createStaffController, updateStaffController,
  deleteStaffController, fetchStaffStatisticsController
} from "../controllers/staffController";
import { Staff } from '../types';
import StaffDetailModal from "./modals/StaffDetailModal";// modal hiển thị chi tiết nhân viên
import {
  Card, Table, Button, Modal, Form, Input, Select, Space, Tag,
  Row, Col, Statistic, Avatar, Tabs, message,
} from "antd";// UI components từ Ant Design
import {
  EyeOutlined, UserOutlined, PlusOutlined, EditOutlined,
  DeleteOutlined, TeamOutlined, SafetyOutlined, HeartOutlined,
} from "@ant-design/icons"; // icons đẹp mắt từ Ant Design

const { Option } = Select;
const { TabPane } = Tabs;

// ========================
//  COMPONENT CHÍNH
// ========================
const StaffManagement: React.FC = () => {
  // ========================
  //  STATE QUẢN LÝ DỮ LIỆU
  // ========================
  const [staff, setStaff] = useState<Staff[]>([]);// danh sách nhân viên
  const [stats, setStats] = useState({ total: 0, active: 0, doctors: 0, nurses: 0,});// thống kê tổng, bác sĩ, điều dưỡng 
  const [loading, setLoading] = useState(false);// trạng thái loading bảng
  const [isModalVisible, setIsModalVisible] = useState(false);// modal thêm/sửa nhân viên
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);// nhân viên đang chỉnh sửa
  const [isDetailVisible, setIsDetailVisible] = useState(false);// modal xem chi tiết
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);// nhân viên được chọn để xem chi tiết
  const [form] = Form.useForm();

  // ========================
  //  HÀM GỌI API - DANH SÁCH
  // ========================
  const fetchStaff = async () => {
    try {
      setLoading(true);
      const formatted = await fetchStaffController();// gọi controller để lấy danh sách nhân viên
      setStaff(formatted);// lưu vào state
    } catch (error: any) {
      console.error("Lỗi tải danh sách nhân viên:", error);
      if (error.response?.status === 401) {
        message.error("Phiên đăng nhập hết hạn");
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
      } else {
        message.error("Không thể tải danh sách nhân viên");
      }
    } finally {
      setLoading(false);
    }
  };

  // ========================
  //  HÀM GỌI API - THỐNG KÊ
  // ========================
  const fetchStatistics = async () => {
    try {
      const data = await fetchStaffStatisticsController();// controller trả về tổng hợp dữ liệu
      setStats({
        total: data.total,
        active: data.active,
        doctors: data.byRole?.doctors || 0,
        nurses: data.byRole?.nurses || 0,
      });
    } catch (error) {
      console.error(error);
    }
  };
  // useEffect để gọi API khi component mount lần đầu
  useEffect(() => {
    fetchStaff();
    fetchStatistics();
  }, []);

  // ========================
  //  THÊM NHÂN VIÊN
  // ========================
  const handleAdd = () => {
    setEditingStaff(null);// reset editing
    form.resetFields();// reset form
    setIsModalVisible(true);// mở modal
  };

  // ========================
  //  SỬA NHÂN VIÊN
  // ========================
  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    // đổ dữ liệu vào form
    form.setFieldsValue({
      fullName: staff.fullName,
      email: staff.email,
      phone: staff.phone,
      role: staff.role,
      roleTitle: staff.roleTitle,
      licenseNo: staff.licenseNo,
      department: staff.department,
      shift: staff.shift,
      experienceYears: staff.experienceYears,
      status: staff.status,
      education: staff.education,
      skills: staff.skills,
      notes: staff.notes,
    });
    setIsModalVisible(true);
  };

  // ========================
  //   XEM CHI TIẾT NHÂN VIÊN
  // ========================
  const handleView = (staff: Staff) => {
    setSelectedStaff(staff);// lưu nhân viên được chọn
    setIsDetailVisible(true);// mở modal chi tiết
  };

  // ========================
  //   XÓA NHÂN VIÊN
  // ========================
  const handleDelete = async (id: string) => {
    try {
      await deleteStaffController(id);// gọi API xóa (chuyển sang trạng thái Inactive)
      message.success('Đã xóa (chuyển Inactive)');
      fetchStaff();
      fetchStatistics();
    } catch (error) {
      message.error('Không thể xóa nhân viên');
    }
  };

  // ========================
  //  LƯU (THÊM/SỬA) NHÂN VIÊN
  // ========================
  const handleSubmit = async (values: any) => {
    try {

      if (values.skills && values.skills.length > 255) {
        message.error('Kỹ năng không được vượt quá 255 ký tự');
        return;
      }
      // chuẩn hóa payload
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        role: values.role,
        roleTitle: values.roleTitle,
        licenseNo: values.licenseNo || null,
        department: values.department,
        shift: values.shift,
        experienceYears: Number(values.experienceYears) || 0,
        education: values.education || null,
        skills: values.skills || null,
        notes: values.notes || null,
        status: values.status || 'Active',
      };

      // nếu đang chỉnh sửa
      if (editingStaff) {
        await updateStaffController(editingStaff.id, values);
        message.success('Cập nhật thành công');
        // nếu là thêm mới
      } else {
        await createStaffController(values);
        message.success('Thêm mới thành công');
      }
      // đóng modal, làm mới danh sách
      setIsModalVisible(false);
      form.resetFields();
      fetchStaff();
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

  // ========================
  //  ĐỊNH NGHĨA LABEL, MÀU SẮC, CA LÀM VIỆC
  // ========================
  const roleLabels: Record<string, string> = {
    Doctor: "Bác sĩ",
    Staff: "Điều dưỡng"
  };
  const statusColors: Record<string, string> = {
    Active: "green",
    Inactive: "red",
    OnLeave: "orange"
  };
  const statusLabels: Record<string, string> = {
    Active: "Hoạt động",
    Inactive: "Ngừng",
    OnLeave: "Nghỉ phép"
  };
  const shiftLabels: Record<string, string> = {
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    night: "Ca đêm",
    flexible: "Linh hoạt",
  };

  // ========================
  //  CỘT CỦA BẢNG NHÂN VIÊN
  // ========================
  const columns = [
    {
      title: 'Nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text: string, record: Staff) => (
        <div className="flex items-center">
          <Avatar size="small" icon={<UserOutlined />} className="mr-3" />
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
      render: (role: string) => (
        <Tag color={role === 'Doctor' ? 'blue' : 'green'}>
          {roleLabels[role] || role}
        </Tag>
      ),
    },
    {
      title: 'Chức danh',
      dataIndex: 'roleTitle',
      key: 'roleTitle',
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
      render: (shift: string) => shiftLabels[shift] || shift,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status] || 'default'}>
          {statusLabels[status] || status}
        </Tag>
      ),
    },
    {
      title: 'Kinh nghiệm',
      dataIndex: 'experienceYears',
      key: 'experienceYears',
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
  // ========================
  //  JSX TRẢ VỀ - HIỂN THỊ GIAO DIỆN
  // ========================
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Quản lý nhân viên</h1>
      <p className="text-gray-600">Quản lý thông tin, vai trò và ca làm việc</p>

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

      {/* Staff List */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Thêm nhân viên
          </Button>
        </div>

        <Tabs defaultActiveKey="all">
          <TabPane tab={`Tất cả (${stats.total})`} key="all">
            <Table
              columns={columns}
              dataSource={staff}
              loading={loading}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Đang hoạt động (${stats.active})`} key="active">
            <Table
              columns={columns}
              dataSource={staff.filter((s) => s.status === 'Active')}
              rowKey="id"
            />
          </TabPane>
          <TabPane tab={`Bác sĩ (${stats.doctors})`} key="doctors">
            <Table
              columns={columns}
              dataSource={staff.filter(s => s.role === 'Doctor')}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
          <TabPane tab={`Điều dưỡng (${stats.nurses})`} key="nurses">
            <Table
              columns={columns}
              dataSource={staff.filter(s => s.role === 'Staff')}
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
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
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
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email' },
                  { type: 'email', message: 'Email không hợp lệ' },
                ]}
              >
                <Input />
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
                name="role"
                label="Vai trò"
                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="Doctor">Bác sĩ</Option>
                  <Option value="Staff">Điều dưỡng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleTitle"
                label="Chức danh"
                rules={[{ required: true, message: 'Vui lòng nhập chức danh' }]}
              >
                <Input placeholder="VD: Bác sĩ nội khoa" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="licenseNo" label="Số chứng chỉ hành nghề">
                <Input placeholder="Số giấy phép" />
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
                <Input placeholder="VD: Nội khoa" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="shift"
                label="Ca làm việc"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn ca">
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
                name="experienceYears"
                label="Kinh nghiệm (năm)"
                rules={[{ required: true }]}
              >
                <Input type="number" min={0} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái" initialValue="Active">
                <Select>
                  <Option value="Active">Đang làm việc</Option>
                  <Option value="Inactive">Nghỉ việc</Option>
                  <Option value="OnLeave">Nghỉ phép</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="education" label="Bằng cấp">
            <Input placeholder="VD: Bác sĩ đa khoa" />
          </Form.Item>

          <Form.Item
            name="skills"
            label="Kỹ năng/Chuyên môn"
            rules={[{ max: 255, message: 'Không vượt quá 255 ký tự' }]}
          >
            <Input.TextArea
              rows={2}
              placeholder="VD: Siêu âm tim, Nội soi..."
              maxLength={255}
              showCount
            />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <Input.TextArea rows={3} />
          </Form.Item>

          {!editingStaff && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              extra="Để trống = 123456"
            >
              <Input.Password placeholder="Mật khẩu mặc định: 123456" />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingStaff ? 'Cập nhật' : 'Thêm mới'}
              </Button>
              <Button onClick={() => setIsModalVisible(false)}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <StaffDetailModal
        visible={isDetailVisible}
        staff={selectedStaff}
        onClose={() => setIsDetailVisible(false)}
      />
    </div>
  );
};

export default StaffManagement;